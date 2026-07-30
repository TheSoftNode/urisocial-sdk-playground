'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { DraftsList } from '@/components/dashboard/drafts/DraftsList';
import { DraftFilter } from '@/components/dashboard/drafts/DraftFilter';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { FileText } from 'lucide-react';

export default function DraftsPage() {
  const [filters, setFilters] = useState<{
    platform?: string;
    status?: string;
    search?: string;
  }>({});

  const [refreshKey, setRefreshKey] = useState(0);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleDraftUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#f93a87] rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drafts</h1>
          <p className="text-sm text-gray-500">
            Manage your content drafts and scheduled posts
          </p>
        </div>
      </div>

      <SdkCallTag method="client.drafts.list() · .regenerate() · client.publishing.approve()" />

      {/* Filters */}
      <Card className="p-4">
        <DraftFilter onFilterChange={handleFilterChange} />
      </Card>

      {/* Drafts List */}
      <DraftsList
        key={refreshKey}
        filters={filters}
        onDraftUpdated={handleDraftUpdated}
      />
    </div>
  );
}
