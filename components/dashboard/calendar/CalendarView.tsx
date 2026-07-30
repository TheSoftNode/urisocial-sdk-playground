'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { ScheduledPostCard } from './ScheduledPostCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduled_at: string;
  images?: string[];
  status: 'scheduled' | 'published' | 'failed';
}

interface CalendarViewProps {
  onPostUpdated: () => void;
}

export function CalendarView({ onPostUpdated }: CalendarViewProps) {
  const client = useSDK();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadScheduledPosts();
  }, [client, currentMonth]);

  const loadScheduledPosts = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const response = await client.calendar.getContent(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Map drafts to scheduled posts format
      const scheduledPosts = (response.drafts || [])
        .filter((draft: any) => draft.scheduled_at)
        .map((draft: any) => ({
          id: draft.id,
          content: draft.content || draft.caption || '',
          platform: draft.platform || 'instagram',
          scheduled_at: draft.scheduled_at,
          images: draft.images || [],
          status: draft.status || 'scheduled',
        }));

      setPosts(scheduledPosts);
    } catch (err: any) {
      setError(err.message || 'Failed to load scheduled posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    // Calendar doesn't have direct delete - would use drafts.delete
    setPosts(posts.filter(p => p.id !== postId));
    onPostUpdated();
  };

  const handleUpdate = async (postId: string, updates: Partial<ScheduledPost>) => {
    // Calendar doesn't have direct update - would use drafts.update
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updates } : p));
    onPostUpdated();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const groupPostsByDate = () => {
    const grouped: Record<string, ScheduledPost[]> = {};

    posts.forEach(post => {
      const date = new Date(post.scheduled_at).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(post);
    });

    return Object.entries(grouped).sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  };

  if (isLoading) {
    return <LoadingState label="Loading your content calendar…" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const groupedPosts = groupPostsByDate();

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={previousMonth}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>

        <Button
          variant="outline"
          onClick={nextMonth}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Posts by Date */}
      {groupedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No scheduled posts for this month</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedPosts.map(([date, datePosts]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {datePosts.map(post => (
                  <ScheduledPostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
