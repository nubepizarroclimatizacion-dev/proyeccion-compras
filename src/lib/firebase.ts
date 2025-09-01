// src/lib/firebase.ts
"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

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

  return null; // No hay configuración disponible
}

let firebaseApp: FirebaseApp | null = null;

/**
 * Inicializa y devuelve la instancia de la aplicación de Firebase (singleton).
 * Se asegura de que la inicialización ocurra solo una vez y en el cliente.
 * @returns La instancia de FirebaseApp o null si la configuración no está disponible.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) {
    return firebaseApp;
  }

  const config = getFirebaseConfig();

  if (!config) {
    console.error(
      "Firebase config not found. Please set up NEXT_PUBLIC_FIREBASE_* environment variables or use the Firebase Hosting environment."
    );
    return null;
  }

  // Evitamos inicializaciones duplicadas.
  if (!getApps().length) {
    firebaseApp = initializeApp(config);
  } else {
    firebaseApp = getApp();
  }

  return firebaseApp;
}
