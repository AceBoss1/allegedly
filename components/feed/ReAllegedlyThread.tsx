"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { useAuth } from "@/lib/use-auth";
import { useLiveRegists } from "@/lib/use-live-regists";
import { getRegistsForGist } from "@/lib/mock-data";

/**
 * Two distinct actions, not one — this used to be conflated:
 *
 * - "Regist" (see the plain toggle button on GistCard) is a bare repost,
 *   no commentary — the X/Twitter Retweet equivalent. Modeled as a boolean
 *   per user per gist via lib/interactions.tsx.
 *
 * - "Re-Allegedly" (this component) is a QUOTE-repost — the X Quote Tweet
 *   equivalent. Each one is its own document with its own "new narrative
 *   layer" commentary, so the same gist can be Re-Allegedly'd multiple
 *   times by different people (or the same person) with different takes.
 *   Not a toggle at all — every submit creates a new Regist doc.
 *
 * regist.userId doubles as the displayed handle — same documented shortcut
 * gist.authorId uses elsewhere; Regist has no denormalized username field
 * either, and this isn't a new inconsistency.
 */
export default function ReAllegedlyThread({ gistId }: { gistId: string }) {
  const { user } = useAuth();
  const liveRegists = useLiveRegists(gistId);
  const isLive = liveRegists !== null;
  const regists = isLive ? liveRegists : getRegistsForGist(gistId);

  const [composing, setComposing] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!user || commentary.trim().length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, "regists"), {
        userId: user.uid,
        gistId,
        commentary: commentary.trim(),
        createdAt: serverTimestamp(),
      });
      setCommentary("");
      setComposing(false);
    } catch (err) {
      console.error("Re-Allegedly failed", err);
      setError("Couldn't post that — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="-mt-1 flex flex-col gap-2 border-l-2 border-lime/30 pl-3">
      {regists.map((regist) => (
        <div key={regist.id} className="rounded-lg border border-lime/20 bg-surface/60 px-3 py-2">
          <p className="font-mono-brand text-[10px] uppercase tracking-widest text-lime">
            ↻ Re-Allegedly · @{regist.userId}
          </p>
          {regist.commentary && (
            <p className="mt-1 text-sm leading-snug text-foreground/90">{regist.commentary}</p>
          )}
        </div>
      ))}

      {user && (
        <div className="pl-1">
          {composing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Add your narrative layer…"
                rows={2}
                className="w-full resize-none rounded-lg border border-lime/30 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-lime"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || commentary.trim().length === 0}
                  className="rounded-full bg-lime px-3 py-1 font-mono-brand text-[10px] font-semibold text-background disabled:opacity-40"
                >
                  {submitting ? "Posting…" : "Post Re-Allegedly"}
                </button>
                <button
                  onClick={() => {
                    setComposing(false);
                    setCommentary("");
                  }}
                  className="font-mono-brand text-[10px] text-muted hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-[10px] text-danger">{error}</p>}
            </div>
          ) : (
            <button
              onClick={() => setComposing(true)}
              className="font-mono-brand text-[10px] uppercase tracking-widest text-lime/80 hover:text-lime"
            >
              ↻ Re-Allegedly this
            </button>
          )}
        </div>
      )}
    </div>
  );
}
