// src/lib/firebase.ts
"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Esta función resuelve la configuración de Firebase de forma segura.
function getFirebaseConfig() {
  // En un entorno de navegador, __FIREBASE_DEFAULTS__ es inyectado por Firebase Hosting/Studio.
  if (typeof window !== "undefined") {
    const injectedConfig = (window as any).__FIREBASE_DEFAULTS__;
    if (injectedConfig?.config?.projectId) {
      return injectedConfig.config;
    }
  }

  // Como fallback para desarrollo local, usamos las variables de entorno.
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
  
  console.error(
    "Firebase config not found. Please set up NEXT_PUBLIC_FIREBASE_* environment variables or use the Firebase Hosting environment."
  );

  return null; 
}


let app: FirebaseApp | null = null;

// Evita inicializaciones duplicadas durante Fast Refresh / RSC.
if (getApps().length === 0) {
  const config = getFirebaseConfig();
  if (config) {
    app = initializeApp(config);
  }
} else {
  app = getApp();
}

// Exposición única de instancias cliente.
const db: Firestore | null = app ? getFirestore(app) : null;
const auth: Auth | null = app ? getAuth(app) : null;

if (auth && process.env.NEXT_PUBLIC_USE_FIRESTORE_EMULATOR === 'true') {
  const host = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
  try {
      connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  } catch (e) {
      // already connected
  }
}

// 👇 Este export es el que faltaba y está pidiendo el resto del código
export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export function getInitDiagnostics() {
  const config = getFirebaseConfig();
  const error = config ? null : "[Firebase] Missing or invalid client config.";
  const notes = config ? ["Using NEXT_PUBLIC_* env variables or injected config."] : ["Provide __FIREBASE_DEFAULTS__ (Studio/Hosting) or NEXT_PUBLIC_* env vars."];
  return { error, notes };
}


export { db, auth };
