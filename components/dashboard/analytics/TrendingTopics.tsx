'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface TrendingTopic {
  topic: string;
  volume: number;
  growth_rate: number;
}

interface RecommendedHashtag {
  hashtag: string;
  volume: number;
  engagement_potential: number;
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  hashtags: RecommendedHashtag[];
}

export function TrendingTopics({ topics, hashtags }: TrendingTopicsProps) {
  if ((!topics || topics.length === 0) && (!hashtags || hashtags.length === 0)) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending for Your Industry</h3>
        <p className="text-center text-gray-500 py-8">No trend data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" style={{ color: '#f93a87' }} />
        Trending for Your Industry
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Topics</p>
          <div className="space-y-2">
            {topics.map((t) => (
              <div key={t.topic} className="flex items-center justify-between text-sm p-2 border rounded-lg">
                <span className="text-gray-800">{t.topic}</span>
                <span className="text-xs text-gray-500">
                  {t.volume.toLocaleString()} vol · +{t.growth_rate}%
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recommended Hashtags</p>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((h) => (
              <Badge key={h.hashtag} className="bg-pink-50 text-[#f93a87]">
                {h.hashtag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
