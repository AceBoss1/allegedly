"use client";

// Fixes the actual "posting a gist doesn't appear anywhere" bug: Create
// (PostComposer.tsx) has always written real docs to Firestore's `gists`
// collection, but the Feed page only ever called getFeedGists() from
// lib/mock-data.ts — nothing read Firestore at all. This is the missing
// read half.

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { toMillis } from "@/lib/firestore-timestamps";
import type { Gist } from "@/types/entities";

/**
 * Live-subscribes to the `gists` collection, newest first. Returns `null`
 * (not `[]`) when Firestore is unconfigured/unreachable, so callers can
 * distinguish "fall back to mock data" from "configured, but genuinely zero
 * posts yet" — see the Feed page for how that distinction is used.
 */
export function useLiveGists(max: number = 50): Gist[] | null {
  const [gists, setGists] = useState<Gist[] | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "gists"), orderBy("createdAt", "desc"), limit(max));
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          const docs = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              createdAt: toMillis(data.createdAt),
              updatedAt: toMillis(data.updatedAt),
            } as Gist;
          });
          setGists(docs);
        },
        (err) => {
          console.warn("[Allegedly] useLiveGists snapshot error", err);
          setGists(null);
        }
      );
    } catch (err) {
      console.warn("[Allegedly] useLiveGists unavailable", err instanceof Error ? err.message : err);
      setGists(null);
    }
    return () => unsubscribe?.();
  }, [max]);

  return gists;
}
