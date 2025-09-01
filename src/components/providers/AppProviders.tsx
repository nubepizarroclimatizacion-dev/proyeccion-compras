
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { lazyGetAuth } from '@/lib/firebase-auth';
import { signInAnonymously } from 'firebase/auth';
import { ConnectionProvider } from '@/hooks/use-connection.tsx';

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const signIn = async () => {
      try {
        const auth = await lazyGetAuth();
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Anonymous sign-in failed:", error);
      }
    };
    signIn();
  }, []);

  return (
    <ConnectionProvider>
      {children}
    </ConnectionProvider>
  );
}
