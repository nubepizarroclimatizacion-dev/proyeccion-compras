'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

type ConnectionContextType = {
  isOnline: boolean;
};

const ConnectionContext = createContext<ConnectionContextType>({ isOnline: true });

export const ConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline',handleOffline);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isOnline }}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};
