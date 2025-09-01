
"use client";

import { getFirebaseApp } from "./firebase";
import type { User } from "firebase/auth";

export async function lazyGetAuth() {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase app not initialized");

  const { getAuth, browserLocalPersistence, setPersistence, connectAuthEmulator } = await import(
    "firebase/auth"
  );

  const auth = getAuth(app);

  if (process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
    const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
    try {
        connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    } catch (e) {
        // already connected
    }
  }


  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // ignorar en entornos restringidos
  }
  return auth;
}

export async function getCurrentUser(): Promise<User | null> {
  const auth = await lazyGetAuth();
  return auth.currentUser;
}
