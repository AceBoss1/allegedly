"use client";

// Fixes a real bug: AvatarUpload.tsx has always written the uploaded photo
// to Firestore's users/{uid}.avatarUrl, but nothing ever READ that field —
// Nav.tsx and Settings both displayed Firebase Auth's user.photoURL
// directly (the Google account photo), which AvatarUpload never touches and
// can't touch. Result: a custom-uploaded avatar saved successfully but
// never appeared anywhere. This hook is the missing read half.

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import type { AllegedlyUser } from "@/types/entities";

export function useUserProfile(uid: string | null) {
  const [profile, setProfile] = useState<AllegedlyUser | null>(null);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    try {
      const db = getFirebaseDb();
      unsubscribe = onSnapshot(
        doc(db, "users", uid),
        (snap) => setProfile(snap.exists() ? (snap.data() as AllegedlyUser) : null),
        (err) => {
          console.warn("[Allegedly] useUserProfile snapshot error", err);
          setProfile(null);
        }
      );
    } catch (err) {
      // Firebase unconfigured — same graceful-degrade pattern as
      // lib/use-auth.tsx, not a crash.
      console.warn("[Allegedly] useUserProfile unavailable", err instanceof Error ? err.message : err);
      setProfile(null);
    }

    return () => unsubscribe?.();
  }, [uid]);

  return profile;
}
