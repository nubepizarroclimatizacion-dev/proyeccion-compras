// src/lib/firebase-db.ts
"use client";

import { getFirebaseApp } from "./firebase";
import {
  Firestore,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";

let db: Firestore | null = null;

/**
 * Returns a "lazy" instance of the Firestore database.
 *
 * This function will initialize the Firestore instance only once,
 * and only on the client-side. This is to avoid server-side
 * execution errors in Next.js.
 *
 * @returns A Firestore instance or null if initialization fails.
 */
export function lazyGetDb(): Firestore | null {
  if (db) {
    return db;
  }

  const app = getFirebaseApp();
  if (!app) {
    // App is not yet initialized. This can happen on first render.
    // Components should handle this case gracefully (e.g. show a loading state).
    return null;
  }

  // Initialize Firestore with experimental settings for better offline support.
  // Using initializeFirestore instead of getFirestore to pass settings.
  db = initializeFirestore(app, {
    localCache: {
      kind: "persistent",
    },
  });

  return db;
}
