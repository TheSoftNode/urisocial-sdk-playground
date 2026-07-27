'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { URISocial } from '@urisocial/sdk';
import { useAuth } from '@/lib/auth/auth-context';

const SDKContext = createContext<URISocial | undefined>(undefined);

export function SDKProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [client, setClient] = useState<URISocial | undefined>(undefined);

  useEffect(() => {
    // Don't initialize until auth is done loading
    if (authLoading) return;

    // Prefer environment API key over user's stored API key (for development)
    const apiKey = process.env.NEXT_PUBLIC_URISOCIAL_API_KEY || user?.apiKey;

    if (apiKey && apiKey.trim()) {
      const sdk = new URISocial({
        apiKey: apiKey,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.urisocial.com',
      });
      setClient(sdk);
    }
  }, [user, authLoading]);

  return <SDKContext.Provider value={client}>{children}</SDKContext.Provider>;
}

export function useSDK(): URISocial | undefined {
  return useContext(SDKContext);
}
