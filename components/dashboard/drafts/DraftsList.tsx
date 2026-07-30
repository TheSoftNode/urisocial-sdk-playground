'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { DraftCard } from './DraftCard';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

interface Draft {
  id: string;
  content: string;
  platform: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'scheduled' | 'published';
}

interface DraftsListProps {
  filters: {
    platform?: string;
    status?: string;
    search?: string;
  };
  onDraftUpdated: () => void;
}

export function DraftsList({ filters, onDraftUpdated }: DraftsListProps) {
  const client = useSDK();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, [client, filters]);

  const loadDrafts = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await client.drafts.list(1, 100);

      let filteredDrafts = (response.data || []).map((draft: any) => ({
        id: draft.id,
        content: draft.caption || draft.content || '',
        platform: draft.platform || 'instagram',
        images: draft.image_url ? [draft.image_url] : (draft.images || []),
        created_at: draft.created_at,
        updated_at: draft.updated_at,
        status: draft.status || 'draft',
      }));

      // Apply filters
      if (filters.platform) {
        filteredDrafts = filteredDrafts.filter(d => d.platform === filters.platform);
      }
      if (filters.status) {
        filteredDrafts = filteredDrafts.filter(d => d.status === filters.status);
      }
      if (filters.search) {
        filteredDrafts = filteredDrafts.filter(d =>
          d.content.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      setDrafts(filteredDrafts);
    } catch (err: any) {
      setError(err.message || 'Failed to load drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!client) return;

    try {
      await client.drafts.delete(draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
      onDraftUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete draft');
    }
  };

  const handleUpdate = async (draftId: string, updates: Partial<Draft>) => {
    if (!client) return;

    try {
      await client.drafts.update(draftId, updates as any);
      setDrafts(drafts.map(d => d.id === draftId ? { ...d, ...updates } : d));
      onDraftUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update draft');
    }
  };

  if (isLoading) {
    return <LoadingState label="Loading your drafts…" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No drafts yet"
        description="Generate your first post from the Content Generator and it'll show up here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onRefresh={loadDrafts}
        />
      ))}
    </div>
  );
}
