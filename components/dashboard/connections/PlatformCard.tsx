'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2 } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  color: string;
}

interface Connection {
  id: string;
  platform: string;
  account_name: string;
  is_connected: boolean;
  connected_at?: string;
}

interface PlatformCardProps {
  platform: Platform;
  connection?: Connection;
  onConnect: (platform: string) => Promise<void>;
  onDisconnect: (connectionId: string) => void;
}

export function PlatformCard({
  platform,
  connection,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConnect = async () => {
    setIsProcessing(true);
    try {
      await onConnect(platform.id);
      // Don't reset isProcessing if redirect happened
      // The page will redirect before this line executes
    } catch (error) {
      console.error('Connection failed:', error);
      setIsProcessing(false);
    }
  };

  const handleDisconnect = () => {
    if (!connection) return;
    // Opens a confirmation modal upstream — the actual disconnect (and its
    // own loading state) happens after the user confirms, not here.
    onDisconnect(connection.id);
  };

  const isConnected = connection?.is_connected || false;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: platform.color }}
            >
              {platform.name[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{platform.name}</h3>
              {connection?.account_name && (
                <p className="text-sm text-gray-500">@{connection.account_name}</p>
              )}
            </div>
          </div>

          {isConnected ? (
            <Badge className="bg-green-100 text-green-700">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-700">
              <X className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>

        {/* Connected Info */}
        {isConnected && connection?.connected_at && (
          <div className="text-xs text-gray-400">
            Connected on {new Date(connection.connected_at).toLocaleDateString()}
          </div>
        )}

        {/* Actions */}
        <div>
          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              disabled={isProcessing}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isProcessing}
              className="w-full text-white"
              style={{ backgroundColor: platform.color }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
