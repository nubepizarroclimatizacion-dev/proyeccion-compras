'use client';

import { getApps, initializeApp, type FirebaseApp, getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FBConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

function readConfig(): FBConfig {
  // 1) Fallback a __FIREBASE_DEFAULTS__ de Firebase Studio/Hosting
  const defaults = (globalThis as any).__FIREBASE_DEFAULTS__;
  if (defaults?.config?.projectId) {
    return defaults.config as FBConfig;
  }
  
  // 2) Prioridad: .env
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  if (envConfig.projectId) {
    return envConfig;
  }

  // Si no hay configuración, devuelve un objeto vacío para que la inicialización falle con un error claro.
  return {} as FBConfig;
}

let app: FirebaseApp;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(readConfig());
} else {
  app = getApp();
}
db = getFirestore(app);

export { app, db };
