
"use client";

import { getFirebaseApp } from "./firebase";
import {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    connectFirestoreEmulator,
    Firestore
  } from "firebase/firestore";

let dbInstance: Firestore | null = null;

export async function lazyGetDb() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (dbInstance) {
    return dbInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    console.error("Firebase app not initialized");
    return null;
  }

  const db = getFirestore(app);

  if (process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
    const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
    const port = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
    try {
        connectFirestoreEmulator(db, host, port);
    } catch(e) {
        // already connected
    }
  }

  try {
    initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
  } catch(e) {
    // already initialized
  }

  dbInstance = db;
  return dbInstance;
}
