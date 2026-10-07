"use client";

// Sign-in actions live separately from lib/use-auth.tsx (which only tracks
// auth *state*) so components that just need to read "who's signed in" don't
// also pull in Firestore's setDoc/getDoc machinery.

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { SITE_CONFIG } from "@/lib/site-config";

/**
 * Turns "marcus.adams99@gmail.com" into "marcus_adams99" — a reasonable
 * starting handle, not a guarantee of uniqueness. There's no
 * collision-checking transaction here yet (would need a `usernames`
 * reservation collection to do properly); duplicate handles are possible
 * until that's built. Fine for an alpha cohort, worth fixing before a real
 * public launch.
 */
function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] || "gist";
  const cleaned = local.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
  return cleaned || `user_${Date.now().toString(36)}`;
}

/**
 * Ensures a users/{uid} profile doc exists after a successful sign-in.
 * Only sets the tier/anonymity-lock/cohort/createdAt defaults on the FIRST
 * sign-in — later calls just refresh displayName/avatarUrl in case those
 * changed on the Google account, without clobbering anything the user
 * (or a Stripe/Paystack webhook upgrading their tier) has since changed.
 */
async function ensureUserProfile(user: User) {
  const db = getFirebaseDb();
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    await setDoc(
      ref,
      {
        displayName: user.displayName || existing.data().displayName,
        avatarUrl: user.photoURL || existing.data().avatarUrl,
      },
      { merge: true }
    );
    return;
  }

  await setDoc(ref, {
    id: user.uid,
    username: usernameFromEmail(user.email || user.uid),
    displayName: user.displayName || "New user",
    avatarUrl: user.photoURL || undefined,
    tier: "standard",
    // Permanently locked per Tech Debt Report §2 — Standard tier is anonymous
    // by design, not a togglable default. See types/entities.ts.
    isAnonymousLocked: true,
    cohort: SITE_CONFIG.accessCohort,
    authProvider: "google",
    followerCount: 0,
    followingCount: 0,
    createdAt: Date.now(),
  });
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}
