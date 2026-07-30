'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, Image as ImageIcon } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/modal';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduled_at: string;
  images?: string[];
  status: 'scheduled' | 'published' | 'failed';
}

interface ScheduledPostCardProps {
  post: ScheduledPost;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<ScheduledPost>) => Promise<void>;
}

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-blue-100 text-blue-700',
  twitter: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-blue-100 text-blue-700',
  tiktok: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export function ScheduledPostCard({ post, onDelete, onUpdate }: ScheduledPostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const truncateContent = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const scheduledTime = new Date(post.scheduled_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className={platformColors[post.platform] || 'bg-gray-100 text-gray-700'}>
            {post.platform}
          </Badge>
          <Badge className={statusColors[post.status]}>
            {post.status}
          </Badge>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{scheduledTime}</span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {truncateContent(post.content)}
          </p>

          {post.images && post.images.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ImageIcon className="h-4 w-4" />
              <span>{post.images.length} image(s)</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            className="flex-1 text-gray-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete scheduled post"
        message="Are you sure you want to delete this scheduled post? This can't be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Card>
  );
}
