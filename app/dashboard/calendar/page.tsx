'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarView } from '@/components/dashboard/calendar/CalendarView';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3b82f6] rounded-lg">
          <CalendarIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-sm text-gray-500">
            View and manage your scheduled posts
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <Card className="p-6">
        <CalendarView key={refreshKey} onPostUpdated={handlePostUpdated} />
      </Card>
    </div>
  );
}
