'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { ConnectionProvider } from '@/hooks/use-connection';

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    signInAnonymously(auth).catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });
  }, []);

  return (
    <ConnectionProvider>
      {children}
    </ConnectionProvider>
  );
}
