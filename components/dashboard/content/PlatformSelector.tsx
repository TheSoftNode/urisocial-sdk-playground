'use client';

import { CheckCircle2 } from 'lucide-react';

export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';

interface PlatformOption {
  id: Platform;
  name: string;
  icon: string;
  color: string;
}

const PLATFORMS: PlatformOption[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: '👤', color: '#1877F2' },
  { id: 'twitter', name: 'X/Twitter', icon: '𝕏', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
];

interface PlatformSelectorProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Target Platforms *
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <span className="font-medium text-gray-900 text-sm">{platform.name}</span>
              </div>
              {isSelected && (
                <CheckCircle2
                  className="absolute top-2 right-2 h-5 w-5"
                  style={{ color: '#f93a87' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
