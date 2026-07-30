'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';

const ONBOARDING_PATH = '/dashboard/onboarding';

/**
 * Blocks access to the rest of the dashboard until the brand profile is
 * marked onboarding_completed. Never redirects AWAY from onboarding once
 * complete — revisiting it later to redo brand setup is allowed.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const client = useSDK();
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!client) return;

    if (pathname === ONBOARDING_PATH) {
      setChecked(true);
      return;
    }

    let cancelled = false;
    client.brandProfile
      .get()
      .then((response) => {
        if (cancelled) return;
        const completed = !!response?.responseData?.onboarding_completed;
        if (!completed) {
          router.replace(ONBOARDING_PATH);
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        // Don't trap the user behind a spinner if the check itself fails.
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [client, pathname, router]);

  if (!checked && pathname !== ONBOARDING_PATH) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f93a87]" />
      </div>
    );
  }

  return <>{children}</>;
}
