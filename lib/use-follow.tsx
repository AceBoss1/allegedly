"use client";

// Same pattern as lib/gist-spot-membership.tsx, user→user instead of
// user→spot. `follows` and its rules already existed (Session 4) — this is
// the first thing that actually calls them.

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export function useIsFollowing(followerId: string | null, followeeId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(!!followerId);

  useEffect(() => {
    if (!followerId || followerId === followeeId) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirebaseDb();
    const ref = doc(db, "follows", `${followerId}_${followeeId}`);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setIsFollowing(snap.exists());
        setLoading(false);
      },
      (err) => {
        console.warn("[Allegedly] useIsFollowing snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [followerId, followeeId]);

  return { isFollowing, loading };
}

/**
 * Toggles a follow relationship. Writes the source-of-truth
 * `follows/{followerId}_{followeeId}` doc — `AllegedlyUser.followerCount`/
 * `followingCount` are denormalized counters that a Cloud Function trigger
 * should keep in sync (not built yet, same "counter drifts until that
 * function exists" caveat as GistSpot.memberCount).
 */
export async function toggleFollow(followerId: string, followeeId: string, currentlyFollowing: boolean) {
  const db = getFirebaseDb();
  const ref = doc(db, "follows", `${followerId}_${followeeId}`);

  if (currentlyFollowing) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      followerId,
      followeeId,
      createdAt: serverTimestamp(),
    });
  }
}
