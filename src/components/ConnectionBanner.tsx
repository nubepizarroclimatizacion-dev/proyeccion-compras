'use client';

import { useConnection } from '@/hooks/use-connection';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export function ConnectionBanner() {
  const { isOnline } = useConnection();

  if (isOnline) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Sin conexión a Internet</AlertTitle>
      <AlertDescription>
        No puedes guardar cambios mientras estás desconectado. Revisa tu conexión.
      </AlertDescription>
    </Alert>
  );
}
