'use client';

import { Card } from '@/components/ui/card';
import { Users, Globe, Clock } from 'lucide-react';

interface AudienceData {
  total_followers: number;
  follower_growth: number;
  demographics: {
    age_groups: { range: string; percentage: number }[];
    top_countries: { country: string; percentage: number }[];
  };
  best_posting_times: { time: string; engagement_score: number }[];
}

interface AudienceInsightsProps {
  data: AudienceData;
}

export function AudienceInsights({ data }: AudienceInsightsProps) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Follower Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Audience Size</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(data.total_followers)}
            </p>
            <p className="text-sm text-gray-500">Total Followers</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">+{data.follower_growth}%</span>
            <span className="text-sm text-gray-500">growth this month</span>
          </div>

          {data.demographics.age_groups.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">Age Groups</p>
              <div className="space-y-2">
                {data.demographics.age_groups.slice(0, 3).map((group, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{group.range}</span>
                      <span className="font-medium text-gray-900">{group.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3b82f6] rounded-full"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Top Countries */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Globe className="h-5 w-5 text-[#22c55e]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Top Countries</h3>
        </div>

        {data.demographics.top_countries.length > 0 ? (
          <div className="space-y-3">
            {data.demographics.top_countries.slice(0, 5).map((country, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{country.country}</span>
                  <span className="font-medium text-gray-900">{country.percentage}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#22c55e] rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No data available</p>
        )}
      </Card>

      {/* Best Posting Times */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-100 rounded-lg">
            <Clock className="h-5 w-5 text-[#f93a87]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Best Times to Post</h3>
        </div>

        {data.best_posting_times.length > 0 ? (
          <div className="space-y-3">
            {data.best_posting_times.slice(0, 5).map((time, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{time.time}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f93a87] rounded-full"
                      style={{ width: `${time.engagement_score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{time.engagement_score}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No data available</p>
        )}
      </Card>
    </div>
  );
}
