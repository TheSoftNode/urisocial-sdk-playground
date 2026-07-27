'use client';

import { Card } from '@/components/ui/card';
import { FileText, Eye, Heart, Radar, Percent } from 'lucide-react';

// Mirrors the SDK's actual PerformanceMetrics shape (client.analytics.getPerformance()).
// The SDK doesn't return a views/likes/comments/shares breakdown or period-over-period
// deltas — showing those anyway would mean fabricating numbers with no real source, so
// this reflects only what the API genuinely provides.
interface AnalyticsData {
  total_posts?: number;
  total_impressions?: number;
  total_engagements?: number;
  total_reach?: number;
  engagement_rate?: number;
  best_performing_platform?: string;
}

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const metrics = [
    {
      label: 'Total Posts',
      value: data.total_posts,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      label: 'Total Impressions',
      value: data.total_impressions,
      icon: Eye,
      color: 'text-[#3b82f6]',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Engagements',
      value: data.total_engagements,
      icon: Heart,
      color: 'text-[#f93a87]',
      bgColor: 'bg-pink-100',
    },
    {
      label: 'Total Reach',
      value: data.total_reach,
      icon: Radar,
      color: 'text-[#22c55e]',
      bgColor: 'bg-green-100',
    },
  ];

  const formatNumber = (num: number | undefined | null) => {
    const n = num ?? 0;
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M';
    }
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K';
    }
    return n.toString();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.label} className="p-6">
              <div className={`p-3 rounded-lg w-fit mb-4 ${metric.bgColor}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(metric.value)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 w-fit">
              <Percent className="h-6 w-6 text-[#8b5cf6]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {(data.engagement_rate ?? 0).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500">Engagement Rate</p>
            </div>
          </div>

          {data.best_performing_platform && (
            <p className="text-sm text-gray-500">
              Best performing platform:{' '}
              <span className="font-semibold text-gray-900 capitalize">
                {data.best_performing_platform}
              </span>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
