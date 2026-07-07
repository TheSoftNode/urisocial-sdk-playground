'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  Check,
  Send,
  Calendar,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/modal';
import { ScheduleModal } from '@/components/dashboard/modals/ScheduleModal';
import { EditDraftModal } from '@/components/dashboard/modals/EditDraftModal';
import { ConnectPlatformModal } from '@/components/dashboard/modals/ConnectPlatformModal';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';

interface Draft {
  id: string;
  content: string;
  platform: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'scheduled' | 'published';
  caption?: string;
}

interface DraftCardProps {
  draft: Draft;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Draft>) => Promise<void>;
  onRefresh?: () => void;
}

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-blue-100 text-blue-700',
  twitter: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-blue-100 text-blue-700',
  tiktok: 'bg-gray-100 text-gray-700',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

export function DraftCard({ draft, onDelete, onUpdate, onRefresh }: DraftCardProps) {
  const client = useSDK();
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  // Connection check
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Fetch connected platforms
  useEffect(() => {
    const fetchConnections = async () => {
      if (!client) return;

      try {
        const response = await client.connections.list();
        const platforms = response.connected_platforms?.map((c: any) => c.platform.toLowerCase()) || [];
        setConnectedPlatforms(platforms);
      } catch (error) {
        console.error('Failed to fetch connections:', error);
      }
    };

    fetchConnections();
  }, [client]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(draft.id);
      setDeleteModalOpen(false);
      showToast('Draft deleted successfully', 'success');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
      showToast('Failed to delete draft. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    if (!client) return;

    // Check if platform is connected
    const platformLower = draft.platform.toLowerCase();
    if (!connectedPlatforms.includes(platformLower)) {
      setPublishModalOpen(false);
      setConnectModalOpen(true);
      return;
    }

    setIsPublishing(true);
    try {
      const response = await client.publishing.approve({
        draft_ids: [draft.id],
        schedule_option: 'immediate',
      });

      if (response.success) {
        await onUpdate(draft.id, { status: 'published' });
        setPublishModalOpen(false);
        showToast(`Published to ${draft.platform} successfully! ✅`, 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast('Failed to publish. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Publish failed:', error);
      showToast(error.message || 'Failed to publish. Please try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async (datetime: string) => {
    if (!client) return;

    // Check if platform is connected
    const platformLower = draft.platform.toLowerCase();
    if (!connectedPlatforms.includes(platformLower)) {
      setScheduleModalOpen(false);
      setConnectModalOpen(true);
      return;
    }

    setIsScheduling(true);
    try {
      const response = await client.publishing.approve({
        draft_ids: [draft.id],
        schedule_option: 'schedule',
        scheduled_datetime: datetime,
      });

      if (response.success) {
        await onUpdate(draft.id, { status: 'scheduled' });
        setScheduleModalOpen(false);
        const scheduleDate = new Date(datetime).toLocaleString();
        showToast(`Scheduled for ${scheduleDate} ✅`, 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast('Failed to schedule. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Schedule failed:', error);
      showToast(error.message || 'Failed to schedule. Please try again.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleEdit = async (newContent: string) => {
    if (!client) return;

    setIsEditing(true);
    try {
      await client.drafts.update(draft.id, {
        text_content: [{
          platform: draft.platform as any,
          text: newContent,
          hashtags: [],
          character_count: newContent.length,
        }],
      });

      await onUpdate(draft.id, { content: newContent, caption: newContent });
      setEditModalOpen(false);
      showToast('Draft updated successfully', 'success');
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('Edit failed:', error);
      showToast(error.message || 'Failed to update draft. Please try again.', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft.content || draft.caption || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleDownloadImage = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  const truncateContent = (text: string, maxLength: number = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayContent = draft.content || draft.caption || '';

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200 group">
        {/* Image Preview */}
        {draft.images && draft.images.length > 0 && !imageError && (
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={draft.images[0]}
              alt="Draft preview"
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownloadImage(draft.images![0])}
                className="bg-white/90 hover:bg-white shadow-md"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={platformColors[draft.platform] || 'bg-gray-100 text-gray-700'}>
                {draft.platform}
              </Badge>
              <Badge className={statusColors[draft.status]}>
                {draft.status}
              </Badge>
            </div>

          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {showFullContent ? displayContent : truncateContent(displayContent)}
            </p>

            {displayContent.length > 200 && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-xs text-[#f93a87] hover:underline font-medium"
              >
                {showFullContent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Created {new Date(draft.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Primary Actions - Publish & Schedule */}
          {draft.status === 'draft' && (
            <div className="flex items-center gap-2 pt-3 border-t">
              <Button
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                className="flex-1"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                <Send className="h-4 w-4 mr-1" />
                Publish
              </Button>

              <Button
                size="sm"
                onClick={() => setScheduleModalOpen(true)}
                className="flex-1"
                style={{ backgroundColor: '#3b82f6', color: 'white' }}
              >
                <Clock className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-1 text-gray-600 hover:text-[#f93a87] hover:bg-pink-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="flex-1 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />

      <ConfirmModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handlePublish}
        title="Publish Now"
        message={`Publish this content to ${draft.platform}? It will be posted immediately.`}
        confirmText="Publish"
        cancelText="Cancel"
        isLoading={isPublishing}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
        isLoading={isScheduling}
        platform={draft.platform}
      />

      <EditDraftModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEdit}
        initialContent={displayContent}
        isLoading={isEditing}
        platform={draft.platform}
      />

      <ConnectPlatformModal
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        platform={draft.platform}
      />
    </>
  );
}
