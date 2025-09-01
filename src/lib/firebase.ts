
// src/lib/firebase.ts
"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { resolveFirebaseClientConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let initDiagnostics: { error: string | null; notes: string[] } = {
  error: null,
  notes: [],
};

function initializeClientApp() {
  if (app) {
    return;
  }
  
  if (getApps().length > 0) {
    app = getApp();
    return;
  }

  const { config, diagnostics } = resolveFirebaseClientConfig();
  initDiagnostics.notes = diagnostics;
  
  if (!config) {
    const initError =
      "[Firebase] Missing or invalid client config. " +
      diagnostics.join(" | ");
    initDiagnostics.error = initError;
    // No lanzamos error aquí, el banner lo mostrará.
    return;
  }

  try {
    app = initializeApp(config);
  } catch (e: any) {
    initDiagnostics.error = `[Firebase] Error during initializeApp: ${e.message}`;
  }
}

/**
 * Obtiene la instancia de la aplicación Firebase, inicializándola si es necesario.
 * Esta función es segura para llamar en el cliente.
 * Devolverá `null` si la configuración no está disponible o la inicialización falla.
 */
export function getFirebaseApp(): FirebaseApp | null {
  // Aseguramos que la inicialización solo se ejecute en el cliente.
  if (typeof window !== "undefined" && !app) {
    initializeClientApp();
  }
  return app;
}

/**
 * Devuelve los diagnósticos de la inicialización de Firebase.
 * Útil para mostrar errores de configuración en la UI.
 */
export function getInitDiagnostics() {
  return initDiagnostics;
}
