"use client";

// Firebase client SDK init — safe to import from Client Components.
// Values come from NEXT_PUBLIC_* env vars, see Deployment Guide §3.1.
// Never put admin/service-account credentials in this file.

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const REQUIRED_ENV_VARS = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
} as const;

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigured() {
  const missing = Object.entries(REQUIRED_ENV_VARS)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // Names the EXACT var(s) that are empty, rather than a generic "not
    // configured" message — if you've already filled in .env.local and are
    // still hitting this, the most common causes, in order of likelihood:
    //   1. The dev server wasn't restarted after creating/editing
    //      .env.local — Next only reads it at server start, not on save.
    //   2. .env.local isn't in the project ROOT (same folder as
    //      package.json) — a copy inside a subfolder won't be picked up.
    //   3. A typo in the variable name itself (they're case-sensitive and
    //      must keep the NEXT_PUBLIC_ prefix or the browser bundle never
    //      sees them at all, even if the server process does).
    //   4. Editing .env.local.example instead of creating a real
    //      .env.local — the .example file is never read at runtime.
    throw new Error(
      `Firebase client env var(s) missing or empty: ${missing.join(", ")}. ` +
        "If you've already added these to .env.local: (1) restart `npm run dev` — " +
        "env changes aren't picked up by an already-running server, (2) confirm " +
        ".env.local sits next to package.json, not in a subfolder, (3) confirm you " +
        "edited .env.local itself, not .env.local.example. See Deployment Guide §3."
    );
  }
}

// Guard against re-initializing on every hot-reload in dev.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export function getFirebaseAuth() {
  assertConfigured();
  return getAuth(firebaseApp);
}

export function getFirebaseDb() {
  assertConfigured();
  return getFirestore(firebaseApp);
}

export function getFirebaseStorage() {
  assertConfigured();
  return getStorage(firebaseApp);
}
