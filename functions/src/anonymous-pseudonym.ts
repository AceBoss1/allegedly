// Assigns Gist.anonymousPseudonym at creation time for anonymous gists.
// See lib/pseudonym.ts for why this has to be server-side and salted rather
// than computed client-side in PostComposer.

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "./lib/admin";
import { computeAnonymousPseudonym } from "./lib/pseudonym";

export const assignAnonymousPseudonym = onDocumentCreated("gists/{gistId}", async (event) => {
  const snap = event.data;
  if (!snap) return;

  const gist = snap.data();

  // Only anonymous gists need a pseudonym, and only if the client didn't
  // somehow already send one (it shouldn't — PostComposer never sets this
  // field — but a defensive check costs nothing and means re-running this
  // trigger, e.g. after a schema migration, is a no-op for gists that
  // already have one).
  if (!gist.isAnonymous || gist.anonymousPseudonym) return;

  const pseudonym = computeAnonymousPseudonym(gist.authorId as string);
  await snap.ref.update({ anonymousPseudonym: pseudonym });
});
