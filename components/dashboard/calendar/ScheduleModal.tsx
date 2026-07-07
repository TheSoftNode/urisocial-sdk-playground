'use client';

import { useState } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';

interface ScheduleModalProps {
  draftId: string;
  platform: string;
  onClose: () => void;
  onScheduled: () => void;
}

export function ScheduleModal({ draftId, platform, onClose, onScheduled }: ScheduleModalProps) {
  const client = useSDK();
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = async () => {
    if (!client || !scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

      if (scheduledAt <= new Date()) {
        setError('Scheduled time must be in the future');
        setIsScheduling(false);
        return;
      }

      // Schedule via drafts.update - calendar doesn't have direct schedule method
      await client.drafts.update(draftId, {
        scheduled_at: scheduledAt.toISOString(),
      } as any);

      onScheduled();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isScheduling}
              className="flex-1 bg-[#f93a87] hover:bg-[#f93a87]/90 text-white"
            >
              {isScheduling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
