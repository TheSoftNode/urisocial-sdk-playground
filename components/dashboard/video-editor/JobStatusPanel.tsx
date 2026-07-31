import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CircleCheck, CircleX } from 'lucide-react';
import type { VideoBillingSummary } from '@urisocial/sdk';

interface JobStatusPanelProps {
  status: string | null;
  outputUrl?: string | null;
  failureReason?: string | null;
  billing?: VideoBillingSummary | null;
  error?: string | null;
}

const TERMINAL_SUCCESS = new Set(['completed', 'ready']);
const TERMINAL_FAILURE = new Set(['failed']);

function statusBadgeClass(status: string): string {
  if (TERMINAL_SUCCESS.has(status)) return 'bg-green-100 text-green-700';
  if (TERMINAL_FAILURE.has(status)) return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}

/**
 * Shared "what happened" panel for every billed video pipeline (produce,
 * Submagic, ZapCap) — status, the exact billing charge returned by the
 * API, and the output player once it's ready. One component so the three
 * tabs stay visually consistent instead of drifting.
 */
export function JobStatusPanel({ status, outputUrl, failureReason, billing, error }: JobStatusPanelProps) {
  if (error) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <p className="text-sm text-red-700">{error}</p>
      </Card>
    );
  }

  if (!status) return null;

  const isDone = TERMINAL_SUCCESS.has(status);
  const isFailed = TERMINAL_FAILURE.has(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge className={statusBadgeClass(status)}>
          {!isDone && !isFailed && <Loader2 className="h-3 w-3 animate-spin" />}
          {isDone && <CircleCheck className="h-3 w-3" />}
          {isFailed && <CircleX className="h-3 w-3" />}
          {status}
        </Badge>
        {billing && (
          <span className="text-sm text-gray-500">
            Charged <strong className="text-gray-900">{billing.credits_charged}</strong>{' '}
            {billing.credits_charged === 1 ? 'credit' : 'credits'}
            {billing.is_trial ? ' (trial)' : ''} for {billing.duration_seconds}s of video (
            {billing.billable_minutes} billable {billing.billable_minutes === 1 ? 'minute' : 'minutes'})
          </span>
        )}
      </div>

      {isFailed && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-700">
            {failureReason || 'The job failed.'}
            {billing && ' Your credits for this job were automatically refunded.'}
          </p>
        </Card>
      )}

      {isDone && outputUrl && (
        <Card className="p-4">
          <video src={outputUrl} controls className="w-full rounded-lg bg-black max-h-[480px]" />
        </Card>
      )}
    </div>
  );
}
