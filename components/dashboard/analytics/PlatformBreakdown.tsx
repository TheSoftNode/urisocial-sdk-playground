'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PlatformRow {
  platform: string;
  posts_count: number;
  impressions: number;
  engagements: number;
  reach: number;
  engagement_rate: number;
}

interface PlatformBreakdownProps {
  platforms: PlatformRow[];
}

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-blue-100 text-blue-700',
  twitter: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-blue-100 text-blue-700',
  tiktok: 'bg-gray-100 text-gray-700',
};

export function PlatformBreakdown({ platforms }: PlatformBreakdownProps) {
  if (!platforms || platforms.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Platform</h3>
        <p className="text-center text-gray-500 py-8">No platform data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Platform</h3>
      <div className="space-y-3">
        {platforms.map((p) => (
          <div key={p.platform} className="flex items-center justify-between p-3 border rounded-lg">
            <Badge className={platformColors[p.platform] || 'bg-gray-100 text-gray-700'}>{p.platform}</Badge>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>{p.posts_count} posts</span>
              <span>{p.impressions.toLocaleString()} impressions</span>
              <span>{p.engagements.toLocaleString()} engagements</span>
              <span className="font-medium text-gray-900">{p.engagement_rate.toFixed(2)}% ER</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
