
"use client";

import { useState, useEffect } from "react";
import { getInitDiagnostics } from "@/lib/firebase";

export default function ConfigBanner() {
  const [diagnostics, setDiagnostics] = useState<{ error: string | null; notes: string[] }>({ error: null, notes: [] });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This ensures the component only renders its content on the client side,
    // after the initial hydration is complete.
    setIsClient(true);
    setDiagnostics(getInitDiagnostics());
  }, []);

  // On the server or during initial client render, render nothing to avoid mismatch.
  if (!isClient) {
    return null;
  }

  const { error, notes } = diagnostics;

  if (!error) {
    return null;
  }

  return (
    <div className="bg-red-50 text-red-800 text-sm px-3 py-2">
      {error}
      {notes?.length ? (
        <span className="block opacity-70 mt-1">({notes.join(" • ")})</span>
      ) : null}
    </div>
  );
}
