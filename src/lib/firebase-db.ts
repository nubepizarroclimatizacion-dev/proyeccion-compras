
"use client";

import { getFirebaseApp } from "./firebase";

export async function lazyGetDb() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase app not initialized");

  const {
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    connectFirestoreEmulator,
  } = await import("firebase/firestore");


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


  return db;
}
