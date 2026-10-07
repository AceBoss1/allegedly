// Firebase Admin SDK init — SERVER ONLY. Never import this from a Client
// Component or anything bundled to the browser; it holds a service-account
// private key. Safe to import from Route Handlers (app/api/**/route.ts)
// and Server Components.

import "server-only";
import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function buildAdminApp(): App {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Private keys from env vars typically arrive with literal "\n" sequences —
  // they need to be converted back to real newlines before use.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase admin env vars are missing (FIREBASE_ADMIN_PROJECT_ID / " +
        "FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY). These come " +
        "from the service account JSON generated in Deployment Guide §3, step 5. " +
        "Set them in Vercel Project Settings, not just .env.local."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminApp(): App {
  return getApps().length ? getApp() : buildAdminApp();
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
