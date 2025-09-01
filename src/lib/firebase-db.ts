
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

export function lazyGetDb(): Firestore | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (dbInstance) {
    return dbInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    // La app no se pudo inicializar (falta config), no continuar.
    return null;
  }

  try {
    // Usar initializeFirestore para habilitar el cache offline.
    dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
  } catch(e) {
    // Si ya está inicializado (puede pasar con Fast Refresh), obtener la instancia existente.
    dbInstance = getFirestore(app);
  }

  if (process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
    const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
    const port = parseInt(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080', 10);
    try {
        connectFirestoreEmulator(dbInstance, host, port);
    } catch(e) {
        // ya está conectado
    }
  }

  return dbInstance;
}
