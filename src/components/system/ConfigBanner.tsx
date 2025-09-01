
"use client";

import { getInitDiagnostics } from "@/lib/firebase";

export default function ConfigBanner() {
  const { error, notes } = getInitDiagnostics();
  if (!error) return null;

  return (
    <div className="bg-red-50 text-red-800 text-sm px-3 py-2">
      {error}
      {notes?.length ? (
        <span className="block opacity-70 mt-1">({notes.join(" • ")})</span>
      ) : null}
    </div>
  );
}
