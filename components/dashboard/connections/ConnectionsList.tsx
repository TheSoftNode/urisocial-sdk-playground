'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { PlatformCard } from './PlatformCard';
import { Loader2 } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { ConfirmModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface Connection {
  id: string;
  platform: string;
  account_name: string;
  is_connected: boolean;
  connected_at?: string;
}

interface ConnectionsListProps {
  onConnectionUpdated: () => void;
}

export function ConnectionsList({ onConnectionUpdated }: ConnectionsListProps) {
  const client = useSDK();
  const { showToast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [client]);

  const loadConnections = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await client.connections.list();
      const platforms = (response.connected_platforms || []).map((conn: any) => ({
        id: conn.connection_id || conn.platform,
        platform: conn.platform,
        account_name: conn.username || conn.account_name || '',
        is_connected: conn.is_active || true,
        connected_at: conn.connected_at,
      }));
      setConnections(platforms);
    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    try {
      const response = await client.connections.initiate({
        platforms: [platform as any],
        source: 'settings',
      });

      const authUrls = response.auth_urls;

      if (authUrls && authUrls[platform]) {
        // Redirect directly to OAuth URL - don't execute code after this
        window.location.href = authUrls[platform];
        return;
      }

      showToast(`No authorization URL received for ${platform}.`, 'error');

      // Only refresh if redirect didn't happen
      await loadConnections();
      onConnectionUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to connect platform.', 'error');
    }
  };

  const handleDisconnect = (connectionId: string) => {
    setDisconnectTarget(connectionId);
  };

  const confirmDisconnect = async () => {
    if (!client || !disconnectTarget) return;

    setDisconnecting(true);
    try {
      await client.connections.disconnect(disconnectTarget);
      await loadConnections();
      onConnectionUpdated();
      showToast('Platform disconnected.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect platform.', 'error');
    } finally {
      setDisconnecting(false);
      setDisconnectTarget(null);
    }
  };

  if (isLoading) {
    return <LoadingState label="Checking connected accounts…" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const availablePlatforms = [
    { id: 'instagram', name: 'Instagram', color: '#f93a87' },
    { id: 'facebook', name: 'Facebook', color: '#3b82f6' },
    { id: 'twitter', name: 'Twitter', color: '#3b82f6' },
    { id: 'linkedin', name: 'LinkedIn', color: '#3b82f6' },
    { id: 'tiktok', name: 'TikTok', color: '#171717' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePlatforms.map((platform) => {
          const connection = connections.find((c) => c.platform === platform.id);

          return (
            <PlatformCard
              key={platform.id}
              platform={platform}
              connection={connection}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          );
        })}
      </div>

      <ConfirmModal
        open={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={confirmDisconnect}
        title="Disconnect platform"
        message="Are you sure you want to disconnect this platform? You'll need to reconnect it to publish there again."
        confirmText="Disconnect"
        variant="destructive"
        isLoading={disconnecting}
      />
    </>
  );
}
