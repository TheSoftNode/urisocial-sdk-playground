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

    if (!user) {
      setClient(undefined);
      return;
    }

    // This playground is the "client" app — it holds a single API key (its own
    // URI Social account), the same way any real app built on the SDK would.
    // Every person who signs up on the playground is an END USER of that one
    // client, so their own account id is what scopes their data — never a
    // separate API key per person.
    const apiKey = process.env.NEXT_PUBLIC_URISOCIAL_API_KEY || user.apiKey;

    if (apiKey && apiKey.trim()) {
      const sdk = new URISocial({
        apiKey: apiKey,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.urisocial.com',
      });
      sdk.setEndUserId(user.id);
      setClient(sdk);
    }
  }, [user, authLoading]);

  return <SDKContext.Provider value={client}>{children}</SDKContext.Provider>;
}

export function useSDK(): URISocial | undefined {
  return useContext(SDKContext);
}
