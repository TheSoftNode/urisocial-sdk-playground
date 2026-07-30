'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import type { SdkEndUser, ListEndUsersResponse } from '@urisocial/sdk';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ManageUsersPage() {
  const client = useSDK();
  const { showToast } = useToast();
  const [data, setData] = useState<ListEndUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    setLoading(true);
    client.endUsers
      .list(100, 0)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: any) => {
        if (!cancelled) showToast(err.message || 'Failed to load end-users.', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-800 rounded-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500">
            Every end-user provisioned under your API key — this is your view as the client, not
            something any individual user of your app would ever see.
          </p>
        </div>
      </div>

      <SdkCallTag method="client.endUsers.list()" />

      <Card className="p-4 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-700">
          One API key covers your whole app. Each row below is one person who used it with a
          different <code className="text-xs bg-white px-1 py-0.5 rounded border">X-End-User-ID</code> —
          their own isolated brand, drafts, and connections live behind that ID.
        </p>
      </Card>

      {loading ? (
        <LoadingState label="Loading your end-users…" />
      ) : !data || data.users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No end-users yet"
          description="As soon as someone signs up on your app and you call the SDK with their end-user ID, they'll show up here."
        />
      ) : (
        <>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>
              <strong className="text-gray-900">{data.company_name}</strong> · {data.total_end_users}{' '}
              {data.total_end_users === 1 ? 'user' : 'users'}
            </span>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Brand setup</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Onboarding</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Usage</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.users.map((u: SdkEndUser) => (
                    <tr key={u.end_user_id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {u.external_name || u.external_user_id}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{u.external_user_id}</div>
                        {u.external_email && (
                          <div className="text-xs text-gray-500">{u.external_email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.setup?.brand_name ? (
                          <>
                            <div className="text-gray-900">{u.setup.brand_name}</div>
                            <div className="text-xs text-gray-500">
                              {[u.setup.industry, u.setup.region].filter(Boolean).join(' · ') || '—'}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">Not set up yet</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            u.onboarding_completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {u.onboarding_completed ? 'Complete' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.total_generations} posts · {u.total_images} images
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
