'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface AnalyticsData {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  views_change: number;
  likes_change: number;
  comments_change: number;
  shares_change: number;
}

interface AnalyticsOverviewProps {
  data: AnalyticsData;
}

export function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const metrics = [
    {
      label: 'Total Views',
      value: data.total_views,
      change: data.views_change,
      icon: Eye,
      color: 'text-[#3b82f6]',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Likes',
      value: data.total_likes,
      change: data.likes_change,
      icon: Heart,
      color: 'text-[#f93a87]',
      bgColor: 'bg-pink-100',
    },
    {
      label: 'Total Comments',
      value: data.total_comments,
      change: data.comments_change,
      icon: MessageCircle,
      color: 'text-[#22c55e]',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Shares',
      value: data.total_shares,
      change: data.shares_change,
      icon: Share2,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;

        return (
          <Card key={metric.label} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(metric.change)}%</span>
              </div>
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
  );
}
