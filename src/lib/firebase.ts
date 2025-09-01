
"use client";

import { getApps, getApp, initializeApp, type FirebaseApp } from "firebase/app";
import { resolveFirebaseClientConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let initError: string | null = null;
let initNotes: string[] = [];

function ensureApp(): FirebaseApp | null {
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
    app = getApps().length ? getApp() : initializeApp(config);
    return app;
  } catch (err) {
    initError = `[Firebase] Failed to initialize app: ${(err as Error).message}`;
    console.error(initError);
    return null;
  }
}

export function getFirebaseApp(): FirebaseApp | null {
  return ensureApp();
}

export function getInitDiagnostics() {
  return { notes: initNotes, error: initError };
}
