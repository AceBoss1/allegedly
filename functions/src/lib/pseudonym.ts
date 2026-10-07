// Closes the gap types/entities.ts flagged and never filled: "Real
// generation is a deterministic per-user hash, computed server-side — mock
// data below just hardcodes an example code." Nothing computed that hash.
// The result: every real anonymous gist shipped with `anonymousPseudonym`
// undefined, which meant (a) GistCard rendered a bare "Anonymous" instead of
// a stable code, and (b) the watermark text layer in
// lib/cloudinary.ts's buildWatermarkLayers() was silently skipped entirely
// for every real anonymous post — the "@username_hash" that was supposed to
// go on the image never existed to begin with. This file is the fix.
//
// Design constraints, in order of importance:
//   1. Deterministic per authorId — the whole point (per types/entities.ts's
//      doc comment) is that the SAME anonymous source posting multiple gists
//      shows the SAME code each time, which is itself a credibility signal
//      for the Truth Meter. A random code per-post would defeat that.
//   2. Not trivially reversible by an outside observer. SHA-256 with a
//      server-only salt (never shipped to the client, unlike everything in
//      lib/cloudinary.ts which IS client-exposed by design) means someone
//      can't brute-force "does this code belong to @known_handle" just by
//      hashing candidate usernames themselves — they'd need the salt too.
//      This is defense-in-depth, not a cryptographic anonymity guarantee;
//      Firestore admin access (or a salt leak) still de-anonymizes. That's
//      the same threat model every other "anonymous" claim in this codebase
//      already accepts (see the isAnonymousLocked / creatorAnonymousMode
//      doc comments in types/entities.ts).
//   3. Short and glanceable — 4 uppercase hex chars, matching the mock
//      data's "4F2C" so nothing else (GistCard's `#{pseudonym}` rendering,
//      the watermark text layout) needs to change shape.

import { createHash } from "crypto";

const SALT = process.env.ANONYMOUS_PSEUDONYM_SALT;

if (!SALT) {
  // Fail loud at deploy/cold-start time rather than silently falling back to
  // an unsalted (trivially guessable) hash — same "name the exact missing
  // var" philosophy as lib/firebase/client.ts's assertConfigured().
  throw new Error(
    "ANONYMOUS_PSEUDONYM_SALT is not set. Generate one (e.g. `openssl rand -hex 32`) " +
      "and set it with `firebase functions:secrets:set ANONYMOUS_PSEUDONYM_SALT` " +
      "— see Allegedly_Deployment_Guide.md §5."
  );
}

/** Deterministic 4-char uppercase hex pseudonym for a given authorId. Same
 * authorId always produces the same code; different authorIds essentially
 * never collide in a way that matters at this app's scale (this is a
 * glanceable credibility signal, not a uniqueness guarantee — a shared code
 * between two different anonymous posters is a cosmetic false-positive, not
 * a security bug, since neither the code nor authorId is ever cross-exposed
 * anywhere the collision would be actionable). */
export function computeAnonymousPseudonym(authorId: string): string {
  const hash = createHash("sha256")
    .update(`${SALT}:${authorId}`)
    .digest("hex");
  return hash.slice(0, 4).toUpperCase();
}
