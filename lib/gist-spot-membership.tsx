"use client";

// Fixes File Map gap #6: the "Join" button on a Gist Spot was UI-only because
// there was no user→spot collection to write to. `follows` is user→user;
// this is the user→spot equivalent, same `{userId}_{spotId}` keying pattern
// as every other join-table in types/entities.ts (Like, Save, Regist,
// Highlight, Vote).

import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

/**
 * Subscribes to whether the given user has joined the given Gist Spot.
 * One doc read (not a query), same as every other per-item interaction
 * check elsewhere in the app.
 */
export function useGistSpotMembership(userId: string | null, spotId: string) {
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(!!userId);

  useEffect(() => {
    if (!userId) {
      setIsMember(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirebaseDb();
    const ref = doc(db, "gistSpotMemberships", `${userId}_${spotId}`);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setIsMember(snap.exists());
        setLoading(false);
      },
      (err) => {
        console.error("useGistSpotMembership snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId, spotId]);

  return { isMember, loading };
}

/**
 * Toggle membership in a Gist Spot. Writes the source-of-truth
 * `gistSpotMemberships/{userId}_{spotId}` doc; a Cloud Function trigger
 * (deployed alongside the ones described in lib/interactions.tsx) keeps
 * `GistSpot.memberCount` in sync — this function never increments/
 * decrements that counter directly, same reasoning as toggleInteraction.
 */
export async function toggleGistSpotMembership(
  userId: string,
  spotId: string,
  currentlyMember: boolean
) {
  const db = getFirebaseDb();
  const ref = doc(db, "gistSpotMemberships", `${userId}_${spotId}`);

  if (currentlyMember) {
    await deleteDoc(ref);
  } else {
    await setDoc(ref, {
      userId,
      spotId,
      createdAt: serverTimestamp(),
    });
  }
}
