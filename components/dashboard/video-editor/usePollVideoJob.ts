'use client';

import { useCallback, useRef, useState } from 'react';
import type { VideoJobStatus } from '@urisocial/sdk';

const TERMINAL = new Set(['completed', 'ready', 'failed']);

/**
 * Polls a billed video job (Submagic/ZapCap shape: status + output_url +
 * failure_reason) every 3s until it reaches a terminal state. Every produce
 * call in the Video Editing pipeline works this way — charge up front,
 * process async, refund automatically on failure — so this one hook covers
 * both the Submagic and ZapCap tabs.
 */
export function usePollVideoJob(poll: (jobId: string) => Promise<VideoJobStatus>) {
  const [result, setResult] = useState<VideoJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const start = useCallback(
    (jobId: string) => {
      cancelledRef.current = false;
      setError(null);
      setResult(null);

      const tick = async () => {
        if (cancelledRef.current) return;
        try {
          const res = await poll(jobId);
          if (cancelledRef.current) return;
          setResult(res);
          if (!TERMINAL.has(res.status)) {
            timeoutRef.current = setTimeout(tick, 3000);
          }
        } catch (err: any) {
          if (!cancelledRef.current) setError(err.message || 'Failed to check job status.');
        }
      };

      tick();
    },
    [poll]
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const reset = useCallback(() => {
    stop();
    setResult(null);
    setError(null);
  }, [stop]);

  return { result, error, start, stop, reset };
}
