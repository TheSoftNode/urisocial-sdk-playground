'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Scissors } from 'lucide-react';
import { SubmagicTab } from '@/components/dashboard/video-editor/SubmagicTab';
import { ZapCapTab } from '@/components/dashboard/video-editor/ZapCapTab';
import { ProductionTab } from '@/components/dashboard/video-editor/ProductionTab';

export default function VideoEditorPage() {
  const client = useSDK();
  const [creditsPerMinute, setCreditsPerMinute] = useState<number | null>(null);

  useEffect(() => {
    if (!client) return;
    client.video
      .getPricing()
      .then((pricing) => setCreditsPerMinute(pricing.credits_per_minute))
      .catch(() => setCreditsPerMinute(null));
  }, [client]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#f93a87] rounded-lg">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Editor</h1>
          <p className="text-sm text-gray-500">
            Upload a raw clip and produce a finished, captioned reel — billed per minute of video.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-gray-50 border-gray-200">
        <p className="text-sm text-gray-700">
          Every job below is charged{' '}
          <strong className="text-gray-900">
            {creditsPerMinute !== null ? `${creditsPerMinute} credits per billable minute` : '…'}
          </strong>{' '}
          before it's submitted for processing, and refunded automatically if the job fails. The
          rate is set server-side, not hard-coded — this page fetches it via{' '}
          <code className="text-xs bg-white px-1 py-0.5 rounded border">client.video.getPricing()</code>.
        </p>
      </Card>

      <Tabs defaultValue="submagic">
        <TabsList>
          <TabsTrigger value="submagic">Submagic</TabsTrigger>
          <TabsTrigger value="zapcap">ZapCap</TabsTrigger>
          <TabsTrigger value="production">Full Production</TabsTrigger>
        </TabsList>

        <TabsContent value="submagic" className="mt-6">
          <SubmagicTab />
        </TabsContent>
        <TabsContent value="zapcap" className="mt-6">
          <ZapCapTab />
        </TabsContent>
        <TabsContent value="production" className="mt-6">
          <ProductionTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
