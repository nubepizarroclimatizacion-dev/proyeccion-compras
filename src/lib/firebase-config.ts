
type FirebaseClientConfig = {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

function tryParseJSON(input: unknown): any | null {
  if (!input) return null;
  try {
    const raw = typeof input === "string" ? input : JSON.stringify(input);
    return JSON.parse(raw as string);
  } catch {
    return null;
  }
}

export function resolveFirebaseClientConfig(): {
  config: FirebaseClientConfig | null;
  diagnostics: string[];
} {
  const notes: string[] = [];

  const envDefaults =
    (typeof process !== "undefined" && process.env.__FIREBASE_DEFAULTS__) ||
    (typeof window !== "undefined" && (window as any).__FIREBASE_DEFAULTS__);

  const envConfig =
    (typeof process !== "undefined" && process.env.FIREBASE_CONFIG) ||
    (typeof window !== "undefined" && (window as any).FIREBASE_CONFIG);

  const parsedDefaults = tryParseJSON(envDefaults);
  const parsedConfig = tryParseJSON(envConfig);

  const injected =
    (parsedDefaults && parsedDefaults.config) || parsedConfig || null;

  if (injected?.apiKey && injected?.projectId && injected?.appId) {
    notes.push("Using injected Firebase config (__FIREBASE_DEFAULTS__/FIREBASE_CONFIG).");
    return { config: injected as FirebaseClientConfig, diagnostics: notes };
  }

  const cfg: FirebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  if (cfg.apiKey && cfg.projectId && cfg.appId) {
    notes.push("Using NEXT_PUBLIC_* env variables for Firebase config.");
    return { config: cfg, diagnostics: notes };
  }

  notes.push(
    "Firebase config missing. Provide __FIREBASE_DEFAULTS__/FIREBASE_CONFIG (Studio/Hosting) or NEXT_PUBLIC_* env vars."
  );
  return { config: null, diagnostics: notes };
}
