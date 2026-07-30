import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

/**
 * Standardizes what a page shows while waiting on a real API call — always
 * a labeled spinner, never a bare icon with no text. A bare spinner is
 * indistinguishable from a hung page; naming what's loading tells the user
 * (and anyone new to this app) that a real network request is in flight.
 */
export function LoadingState({ label }: { label: string }) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#f93a87]" />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </Card>
  );
}
