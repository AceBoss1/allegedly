"use client";

// Same pattern as useLiveGists/useLiveStories: don't ship a write path
// without its matching read path this time. Every previous "why doesn't
// this appear" bug this project hit (Feed, avatars, Stories) was exactly
// that gap — a real write with nothing reading it back.

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { Regist } from "@/types/entities";

/** null = Firestore unconfigured/unreachable, caller should fall back to
 * mock data. [] = configured, genuinely zero Re-Allegedly replies yet. */
export function useLiveRegists(gistId: string): Regist[] | null {
  const [regists, setRegists] = useState<Regist[] | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, "regists"),
        where("gistId", "==", gistId),
        orderBy("createdAt", "desc")
      );
      unsubscribe = onSnapshot(
        q,
        (snap) => setRegists(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Regist)),
        (err) => {
          console.warn("[Allegedly] useLiveRegists snapshot error", err);
          setRegists(null);
        }
      );
    } catch (err) {
      console.warn("[Allegedly] useLiveRegists unavailable", err instanceof Error ? err.message : err);
      setRegists(null);
    }
    return () => unsubscribe?.();
  }, [gistId]);

  return regists;
}
