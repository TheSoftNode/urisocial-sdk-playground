'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (datetime: string) => void;
  isLoading?: boolean;
  platform?: string;
}

export function ScheduleModal({
  open,
  onClose,
  onSchedule,
  isLoading = false,
  platform,
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) return;

    // Combine date and time into ISO string
    const datetime = new Date(`${selectedDate}T${selectedTime}`).toISOString();
    onSchedule(datetime);
  };

  const isValid = selectedDate && selectedTime;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Schedule${platform ? ` for ${platform}` : ''}`}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!isValid || isLoading}
            style={{ backgroundColor: '#f93a87' }}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="schedule-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </Label>
          <input
            id="schedule-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schedule-time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </Label>
          <input
            id="schedule-time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Your post will be automatically published at the scheduled time.
          </p>
        </div>
      </div>
    </Modal>
  );
}
