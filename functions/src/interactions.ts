// Builds the UserInteractions reconciliation this was missing entirely:
// lib/interactions.tsx (client) already reads one userInteractions/{uid}
// doc via a live listener and expects a Cloud Function trigger to keep it
// (and the denormalized Gist counters) in sync with the real
// likes/saves/regists/highlights/votes/comments collections. Nothing wrote
// that doc server-side until this file.

import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./lib/admin";
import { registerJoinTableReconciler } from "./lib/join-table-reconciler";

// ---- likes / saves / regists / highlights ----
// Same {userId, gistId, createdAt} shape, same toggle-via-delete-then-create
// pattern, same fan-out — see join-table-reconciler.ts.

const likes = registerJoinTableReconciler({
  collection: "likes",
  interactionField: "likedGistIds",
  gistCountField: "likeCount",
});
export const onLikeCreated = likes.onCreate;
export const onLikeDeleted = likes.onDelete;

const saves = registerJoinTableReconciler({
  collection: "saves",
  interactionField: "savedGistIds",
  gistCountField: "saveCount",
});
export const onSaveCreated = saves.onCreate;
export const onSaveDeleted = saves.onDelete;

const regists = registerJoinTableReconciler({
  collection: "regists",
  interactionField: "registedGistIds",
  gistCountField: "registCount",
});
export const onRegistCreated = regists.onCreate;
export const onRegistDeleted = regists.onDelete;

// Highlights have no denormalized Gist counter (see types/entities.ts —
// likeCount/saveCount/registCount/commentCount/viewCount exist, no
// highlightCount) — omitting gistCountField makes this a no-op on the Gist
// side, updating only userInteractions.highlightedGistIds.
const highlights = registerJoinTableReconciler({
  collection: "highlights",
  interactionField: "highlightedGistIds",
});
export const onHighlightCreated = highlights.onCreate;
export const onHighlightDeleted = highlights.onDelete;

// ---- votes ----
// Different shape from the four above (carries a `value`, not just
// userId+gistId) and immutable per firestore.rules (`allow update, delete:
// if false`) — one-directional, create-only reconciliation. Fans out to
// TWO places: the Gist's consensus counters (source: types/entities.ts's
// Vote doc comment says `votes` is truth, `Gist.consensusTrue/False/
// NeedsMore` are counters kept in sync from it) and
// userInteractions.votedGistIds, which is a MAP field (gistId -> value),
// not an array like the other four — see UserInteractions's type.
const CONSENSUS_FIELD: Record<string, "consensusTrue" | "consensusFalse" | "consensusNeedsMore"> = {
  true: "consensusTrue",
  false: "consensusFalse",
  needs_more_gist: "consensusNeedsMore",
};

export const onVoteCreated = onDocumentCreated("votes/{docId}", async (event) => {
  const vote = event.data?.data();
  if (!vote) return;

  const consensusField = CONSENSUS_FIELD[vote.value as string];
  const writes: Promise<unknown>[] = [
    db
      .collection("userInteractions")
      .doc(vote.userId)
      .set(
        {
          userId: vote.userId,
          [`votedGistIds.${vote.gistId}`]: vote.value,
          updatedAt: Date.now(),
        },
        { merge: true }
      ),
  ];

  if (consensusField) {
    writes.push(
      db
        .collection("gists")
        .doc(vote.gistId)
        .update({ [consensusField]: FieldValue.increment(1) })
        .catch((err) => console.warn(`[votes] gist ${vote.gistId} consensus update failed`, err))
    );
  }

  await Promise.all(writes);
});

// ---- comments ----
// Not a userInteractions field (comments aren't in UserInteractions's
// shape) — this only keeps Gist.commentCount in sync. firestore.rules
// allows an author to delete their own comment, so both directions matter
// here, unlike votes.
export const onCommentCreated = onDocumentCreated("comments/{commentId}", async (event) => {
  const comment = event.data?.data();
  if (!comment) return;
  await db
    .collection("gists")
    .doc(comment.gistId)
    .update({ commentCount: FieldValue.increment(1) })
    .catch((err) => console.warn(`[comments] gist ${comment.gistId} count update failed`, err));
});

export const onCommentDeleted = onDocumentDeleted("comments/{commentId}", async (event) => {
  const comment = event.data?.data();
  if (!comment) return;
  await db
    .collection("gists")
    .doc(comment.gistId)
    .update({ commentCount: FieldValue.increment(-1) })
    .catch((err) => console.warn(`[comments] gist ${comment.gistId} count update failed`, err));
});
