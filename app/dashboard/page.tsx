'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, BarChart3, Palette, ArrowRight, Link2 } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalDrafts: number | null;
  connectedPlatforms: number | null;
  contentGenerated: number | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const client = useSDK();
  const [stats, setStats] = useState<Stats>({
    totalDrafts: null,
    connectedPlatforms: null,
    contentGenerated: null,
  });

  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    const load = async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const [draftsResult, connectionsResult, performanceResult] = await Promise.allSettled([
        client.drafts.list(1, 1),
        client.connections.list(),
        client.analytics.getPerformance(startDate, endDate),
      ]);

      if (cancelled) return;

      setStats({
        totalDrafts: draftsResult.status === 'fulfilled' ? draftsResult.value.total : null,
        connectedPlatforms:
          connectionsResult.status === 'fulfilled'
            ? connectionsResult.value.connected_platforms?.length ?? 0
            : null,
        contentGenerated:
          performanceResult.status === 'fulfilled' ? performanceResult.value.total_posts ?? 0 : null,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [client]);

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'Create AI-powered social media content',
      icon: FileText,
      href: '/dashboard/content',
      color: '#f93a87',
    },
    {
      title: 'Manage Drafts',
      description: 'View and edit your content drafts',
      icon: FileText,
      href: '/dashboard/drafts',
      color: '#3b82f6',
    },
    {
      title: 'View Calendar',
      description: 'Schedule and plan your posts',
      icon: Calendar,
      href: '/dashboard/calendar',
      color: '#22c55e',
    },
    {
      title: 'Brand Profile',
      description: 'Update your brand identity and voice',
      icon: Palette,
      href: '/dashboard/brand',
      color: '#8b5cf6',
    },
    {
      title: 'Connections',
      description: 'Connect your social media accounts',
      icon: Link2,
      href: '/dashboard/connections',
      color: '#0A66C2',
    },
  ];

  const statCards = [
    { label: 'Total Drafts', value: stats.totalDrafts, icon: FileText },
    { label: 'Content Generated', value: stats.contentGenerated, icon: BarChart3, sublabel: 'Last 30 days' },
    { label: 'Platforms Connected', value: stats.connectedPlatforms, icon: Link2 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your content today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <div className="h-8 w-14 rounded bg-gray-100 animate-pulse" aria-label="Loading" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              )}
              {stat.sublabel && <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${action.color}15` }}
                        >
                          <action.icon className="h-5 w-5" style={{ color: action.color }} />
                        </div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* First-post nudge — only shown until they've generated something */}
      {stats.totalDrafts === 0 && (
        <Card className="mt-8" style={{ borderColor: '#f93a87', borderWidth: '2px' }}>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Ready to create your first post?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your brand is set up — generate your first AI-powered post to see it in action.
            </p>
            <Link href="/dashboard/content">
              <Button style={{ backgroundColor: '#f93a87' }}>
                Generate Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
