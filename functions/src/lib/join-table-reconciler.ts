// Shared factory for the four collections that share the exact
// {userId, gistId, createdAt} shape and access pattern per firestore.rules'
// "source-of-truth join tables" comment: likes, saves, regists, highlights.
// Each needs the identical fan-out on write — bump (or drop) the matching
// UserInteractions array field, and (except highlights, which has no
// denormalized Gist counter) bump the matching Gist count field — so this
// generates both triggers from one config object instead of writing the
// same create/delete pair four times.

import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin";

// Deliberately NOT importing types/entities.ts from the Next.js app: `firebase
// deploy` only zips up the functions/ directory as its own package (see
// functions/tsconfig.json's rootDir: "src"), so a relative import reaching
// outside functions/ would compile locally but silently be missing from the
// deployed bundle. This is the same field-name subset duplicated here on
// purpose — keep it in sync with types/entities.ts's UserInteractions if
// that shape ever changes.
type InteractionArrayField =
  | "likedGistIds"
  | "savedGistIds"
  | "registedGistIds"
  | "highlightedGistIds";

interface JoinTableConfig {
  /** Firestore collection name, e.g. "likes". */
  collection: string;
  /** Field on UserInteractions to arrayUnion/arrayRemove the gistId into. */
  interactionField: InteractionArrayField;
  /** Field on the Gist doc to increment/decrement. Omit for highlights,
   * which has no denormalized counter on Gist. */
  gistCountField?: "likeCount" | "saveCount" | "registCount";
}

async function applyDelta(
  config: JoinTableConfig,
  userId: string,
  gistId: string,
  delta: 1 | -1
) {
  const userInteractionsRef = db.collection("userInteractions").doc(userId);
  const arrayOp = delta === 1 ? FieldValue.arrayUnion(gistId) : FieldValue.arrayRemove(gistId);

  const writes: Promise<unknown>[] = [
    // set(..., merge) rather than update() — a brand-new user's very first
    // like/save/regist/highlight won't have a userInteractions doc yet, and
    // update() would throw NOT_FOUND on that first write.
    userInteractionsRef.set(
      { userId, [config.interactionField]: arrayOp, updatedAt: Date.now() },
      { merge: true }
    ),
  ];

  if (config.gistCountField) {
    writes.push(
      db
        .collection("gists")
        .doc(gistId)
        .update({ [config.gistCountField]: FieldValue.increment(delta) })
        // A like on a since-deleted gist is a harmless race (delete + unlike
        // arriving out of order), not a real failure — log and move on
        // rather than letting it fail the whole trigger and retry forever.
        .catch((err) =>
          console.warn(`[${config.collection}] gist ${gistId} count update failed`, err)
        )
    );
  }

  await Promise.all(writes);
}

/** Registers the onCreate/onDelete pair for one join-table collection. */
export function registerJoinTableReconciler(config: JoinTableConfig) {
  const onCreate = onDocumentCreated(`${config.collection}/{docId}`, async (event) => {
    const data = event.data?.data();
    if (!data) return;
    await applyDelta(config, data.userId, data.gistId, 1);
  });

  const onDelete = onDocumentDeleted(`${config.collection}/{docId}`, async (event) => {
    const data = event.data?.data();
    if (!data) return;
    await applyDelta(config, data.userId, data.gistId, -1);
  });

  return { onCreate, onDelete };
}
