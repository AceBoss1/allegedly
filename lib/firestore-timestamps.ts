/**
 * Gist.createdAt/updatedAt (and similar fields elsewhere) are typed as
 * `number`, but anything written with Firestore's `serverTimestamp()`
 * resolves to a Timestamp object (or transiently `null` before the server
 * ack lands) — not a number. See lib/use-live-gists.tsx for the original
 * bug this caused. Shared here so every read path (client SDK hooks,
 * server-side Admin SDK fetches) converts the same way instead of each
 * re-implementing it slightly differently.
 */
export function toMillis(value: unknown): number {
  if (typeof value === "number") return value;
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  // null/undefined — a serverTimestamp() write that hasn't resolved yet.
  return Date.now();
}
