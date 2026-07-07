'use client';

import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

interface ConnectPlatformModalProps {
  open: boolean;
  onClose: () => void;
  platform: string;
}

export function ConnectPlatformModal({
  open,
  onClose,
  platform,
}: ConnectPlatformModalProps) {
  const router = useRouter();

  const handleConnect = () => {
    onClose();
    router.push('/dashboard/connections');
  };

  const platformInfo: Record<string, { name: string; color: string; icon: string }> = {
    instagram: { name: 'Instagram', color: '#f93a87', icon: '📸' },
    facebook: { name: 'Facebook', color: '#3b82f6', icon: '👥' },
    twitter: { name: 'Twitter', color: '#1DA1F2', icon: '🐦' },
    linkedin: { name: 'LinkedIn', color: '#0077b5', icon: '💼' },
    tiktok: { name: 'TikTok', color: '#000000', icon: '🎵' },
  };

  const info = platformInfo[platform.toLowerCase()] || { name: platform, color: '#666', icon: '🔗' };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Connect ${info.name}`}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            style={{ backgroundColor: info.color, color: 'white' }}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: `${info.color}20` }}
          >
            {info.icon}
          </div>
        </div>

        <div className="space-y-3 text-center">
          <h3 className="font-semibold text-gray-900">
            Connect your {info.name} account
          </h3>
          <p className="text-sm text-gray-600">
            Your <strong>{info.name}</strong> account is not connected. Connect it to publish or schedule posts.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Link2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to connect</p>
              <ul className="space-y-1 text-xs">
                <li>• Click "Connect Account" to go to the Connections page</li>
                <li>• Find {info.name} and click Connect</li>
                <li>• Authorize URI Social to publish on your behalf</li>
                <li>• Return here to publish your content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
