'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { PlatformCard } from './PlatformCard';
import { Loader2 } from 'lucide-react';

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
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      console.error('No SDK client available');
      return;
    }

    console.log('🔗 Initiating connection for:', platform);

    try {
      // Use initiate method with array of platforms
      const response = await client.connections.initiate({
        platforms: [platform as any],
        source: 'settings',
      });

      console.log('✅ Connection response:', response);
      console.log('📦 Response data:', response.responseData);
      console.log('🔑 Auth URLs (direct):', response.auth_urls);
      console.log('🔑 Auth URLs (in data):', response.responseData?.auth_urls);

      // Check both locations for auth_urls
      const authUrls = response.auth_urls || response.responseData?.auth_urls;

      if (authUrls && authUrls[platform]) {
        const authUrl = authUrls[platform];
        console.log('🚀 Redirecting to:', authUrl);

        // Redirect directly to OAuth URL - don't execute code after this
        window.location.href = authUrl;
        return; // Stop execution here
      } else {
        console.error('❌ No auth URL found for platform:', platform);
        console.error('Available auth URLs:', authUrls);
        setError(`No authorization URL received for ${platform}`);
      }

      // Only refresh if redirect didn't happen
      await loadConnections();
      onConnectionUpdated();
    } catch (err: any) {
      console.error('❌ Connection error:', err);
      setError(err.message || 'Failed to connect platform');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!client) return;

    if (!confirm('Are you sure you want to disconnect this platform?')) return;

    try {
      await client.connections.disconnect(connectionId);
      await loadConnections();
      onConnectionUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect platform');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#f93a87]" />
      </div>
    );
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
  );
}
