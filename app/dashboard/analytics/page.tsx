'use client';

import { useState, useEffect } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Card } from '@/components/ui/card';
import { AnalyticsOverview } from '@/components/dashboard/analytics/AnalyticsOverview';
import { PerformanceCharts } from '@/components/dashboard/analytics/PerformanceCharts';
import { TopPosts } from '@/components/dashboard/analytics/TopPosts';
import { AudienceInsights } from '@/components/dashboard/analytics/AudienceInsights';
import { BarChart3, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const client = useSDK();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [client]);

  const loadAnalytics = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const performance = await client.analytics.getPerformance(startDate, endDate);

      setAnalyticsData({
        overview: {
          total_views: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
          views_change: 0,
          likes_change: 0,
          comments_change: 0,
          shares_change: 0,
        },
        charts: [],
        topPosts: [],
        audience: {
          total_followers: 0,
          follower_growth: 0,
          demographics: {
            age_groups: [],
            top_countries: [],
          },
          best_posting_times: [],
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#f93a87]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#22c55e] rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">
              Track your content performance and audience insights
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#22c55e] rounded-lg">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">
            Track your content performance and audience insights
          </p>
        </div>
      </div>

      {/* Overview */}
      <AnalyticsOverview data={analyticsData.overview} />

      {/* Performance Charts */}
      <PerformanceCharts data={analyticsData.charts} />

      {/* Top Posts */}
      <TopPosts posts={analyticsData.topPosts} />

      {/* Audience Insights */}
      <AudienceInsights data={analyticsData.audience} />
    </div>
  );
}
