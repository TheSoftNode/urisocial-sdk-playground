'use client';

import { Card } from '@/components/ui/card';

interface ChartData {
  date: string;
  views: number;
  engagement: number;
}

interface PerformanceChartsProps {
  data: ChartData[];
}

export function PerformanceCharts({ data }: PerformanceChartsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No performance data available</p>
      </Card>
    );
  }

  const maxViews = Math.max(...data.map(d => d.views));
  const maxEngagement = Math.max(...data.map(d => d.engagement));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Views Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.views / maxViews) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-gray-900">{item.views}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3b82f6] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Engagement Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.engagement / maxEngagement) * 100;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-medium text-gray-900">{item.engagement}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f93a87] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
