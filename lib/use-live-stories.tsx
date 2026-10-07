"use client";

// Same missing-read-half bug as useLiveGists.tsx: StoryBar has always
// written real Story docs to Firestore, but only ever displayed
// lib/mock-data.ts's hardcoded MOCK_STORIES. This is the read half.

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Story } from "@/types/entities";

/** null = Firestore unconfigured/unreachable, fall back to mock data.
 * [] = configured, genuinely zero active stories right now. */
export function useLiveStories(): Story[] | null {
  const [stories, setStories] = useState<Story[] | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "stories"), where("expiresAt", ">", Date.now()));
      unsubscribe = onSnapshot(
        q,
        (snap) => setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Story)),
        (err) => {
          console.warn("[Allegedly] useLiveStories snapshot error", err);
          setStories(null);
        }
      );
    } catch (err) {
      console.warn("[Allegedly] useLiveStories unavailable", err instanceof Error ? err.message : err);
      setStories(null);
    }
    return () => unsubscribe?.();
  }, []);

  return stories;
}
