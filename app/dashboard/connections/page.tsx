'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ConnectionsList } from '@/components/dashboard/connections/ConnectionsList';
import { Link2 } from 'lucide-react';

export default function ConnectionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnectionUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#3b82f6] rounded-lg">
          <Link2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
          <p className="text-sm text-gray-500">
            Connect your social media accounts to publish content
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          Connect your social media accounts to enable content publishing directly from the platform.
          You can manage multiple accounts and switch between them easily.
        </p>
      </Card>

      {/* Connections List */}
      <ConnectionsList
        key={refreshKey}
        onConnectionUpdated={handleConnectionUpdated}
      />
    </div>
  );
}
