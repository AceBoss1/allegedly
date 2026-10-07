// Every trigger file needs the Admin SDK, but initializeApp() must only run
// once per process — calling it twice throws. Centralizing it here (instead
// of each file calling it at module scope, which is what story-cleanup.ts
// used to do alone) means adding a new trigger file never risks a second
// initializeApp() call again.

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();
