
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
    // Retorna null si no estamos en el navegador
    // Las funciones que lo llamen deben manejar este caso.
    return null;
  }
  
  if (dbInstance) {
    return dbInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    // No lances un error, getFirebaseApp ya loguea el problema.
    return null;
  }

  try {
    // initializeFirestore puede ser llamado múltiples veces sin problema,
    // pero para mayor seguridad lo encapsulamos.
    dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
  } catch(e) {
    // si ya está inicializado, solo obtenemos la instancia
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
