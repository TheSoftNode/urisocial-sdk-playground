'use client';

import { useEffect, useState } from 'react';
import { Plug } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';

function mask(key: string | undefined): string {
  if (!key) return '—';
  if (key.length <= 14) return key;
  return `${key.slice(0, 10)}••••${key.slice(-4)}`;
}

/**
 * Persistent, live proof that this screen is running through the real SDK —
 * not hardcoded copy. Both values are read directly off the actual client
 * instance for whoever is currently signed in, so they change for every
 * different playground user exactly like they would for two different
 * vendors on a real client's platform.
 */
export function SdkConnectionPanel() {
  const client = useSDK();
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [brandName, setBrandName] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    setStatus('loading');
    client.brandProfile
      .get()
      .then((res) => {
        setBrandName(res.responseData?.brand_name || null);
        setStatus('loaded');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [client]);

  const apiKey = process.env.NEXT_PUBLIC_URISOCIAL_API_KEY;
  const endUserId = client?.getEndUserId();

  return (
    <div className="mx-3 mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Plug className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Live SDK connection
        </span>
      </div>
      <dl className="space-y-1 font-mono text-[11px] leading-tight">
        <div className="flex justify-between gap-2">
          <dt className="text-gray-400">API key</dt>
          <dd className="text-gray-700 truncate" title={apiKey}>
            {mask(apiKey)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-400">End-user ID</dt>
          <dd className="text-gray-700 truncate" title={endUserId}>
            {endUserId ? `${endUserId.slice(0, 8)}…` : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-gray-400">Workspace</dt>
          <dd className="text-gray-700 truncate">
            {status === 'loading' ? (
              <span className="inline-block h-3 w-16 rounded bg-gray-200 animate-pulse align-middle" />
            ) : status === 'error' ? (
              '—'
            ) : (
              brandName || '—'
            )}
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[10px] leading-snug text-gray-400">
        One API key, shared by every user of this app — isolated per person by end-user ID.
      </p>
    </div>
  );
}
