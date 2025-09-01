// src/lib/firebase.ts
"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";

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
    
    // Solo mostramos el error en el cliente para evitar ruido en el servidor
    if (typeof window !== 'undefined') {
        console.error(
            "Firebase config not found. Please set up NEXT_PUBLIC_FIREBASE_* environment variables or use the Firebase Hosting environment."
        );
    }

    return null; 
}


let app: FirebaseApp | null = null;

/**
 * Obtiene la instancia de la aplicación Firebase, inicializándola si es necesario.
 * Esta función es segura para llamar tanto en el servidor como en el cliente.
 * En el servidor, devolverá null si la configuración no está disponible.
 * En el cliente, inicializará la aplicación si aún no se ha hecho.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (app) {
    return app;
  }

  if (getApps().length > 0) {
    app = getApp();
    return app;
  }
  
  const config = getFirebaseConfig();
  if (config) {
    app = initializeApp(config);
    return app;
  }

  return null;
}

// Para depuración, añadimos una función que muestra si la config está presente
export function getInitDiagnostics() {
  const config = getFirebaseConfig();
  const error = config ? null : "[Firebase] Missing or invalid client config.";
  const notes = config ? ["Using NEXT_PUBLIC_* env variables or injected config."] : ["Provide __FIREBASE_DEFAULTS__ (Studio/Hosting) or NEXT_PUBLIC_* env vars."];
  return { error, notes };
}
