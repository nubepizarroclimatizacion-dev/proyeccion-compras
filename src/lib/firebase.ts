
"use client";

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { resolveFirebaseClientConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let initError: string | null = null;
let initNotes: string[] = [];

function initializeClientApp(): FirebaseApp | null {
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
    // Initialize app only on the client
    app = getApps().length ? getApp() : initializeApp(config);
    return app;
  } catch (err) {
    initError = `[Firebase] Failed to initialize app: ${(err as Error).message}`;
    console.error(initError);
    return null;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  // This function can be called from anywhere, but it will only
  // initialize the app on the client-side.
  if (typeof window === "undefined") {
    return null; // Return null on the server
  }
  return initializeClientApp();
}

export function getInitDiagnostics() {
  // Ensure diagnostics are captured on client-side initialization
  if (typeof window !== "undefined" && !app && !initError) {
    getFirebaseApp();
  }
  return { notes: initNotes, error: initError };
}
