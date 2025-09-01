
"use client";

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { resolveFirebaseClientConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let initError: string | null = null;
let initNotes: string[] = [];

function initializeClientApp(): FirebaseApp | null {
  // Evitar la reinicialización.
  if (app) return app;

  const { config, diagnostics } = resolveFirebaseClientConfig();
  initNotes = diagnostics;

  if (!config) {
    initError =
      "[Firebase] Missing or invalid client config. " +
      diagnostics.join(" | ");
    console.error(initError);
    return null;
  }

  try {
    // Inicializar la app solo una vez.
    app = getApps().length ? getApp() : initializeApp(config);
    return app;
  } catch (err) {
    initError = `[Firebase] Failed to initialize app: ${(err as Error).message}`;
    console.error(initError);
    return null;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  // Esta función solo debe funcionar en el lado del cliente.
  if (typeof window === "undefined") {
    return null;
  }
  return initializeClientApp();
}

export function getInitDiagnostics() {
  // Asegurarse de que los diagnósticos se capturen en la inicialización del cliente.
  if (typeof window !== "undefined" && !app && !initError) {
    getFirebaseApp();
  }
  return { notes: initNotes, error: initError };
}
