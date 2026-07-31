'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { useToast } from '@/components/ui/toast';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Loader2, Clapperboard } from 'lucide-react';
import type { ProductionJob, VideoBillingSummary } from '@urisocial/sdk';
import { VideoFileInput } from './VideoFileInput';
import { JobStatusPanel } from './JobStatusPanel';

const VIDEO_TYPES = ['founder', 'product', 'tiktok'] as const;

/**
 * Full produce-video pipeline: AI composes cuts/zooms/hook text, pauses at
 * "awaiting_review" for approval, then renders. This demo auto-approves the
 * AI's decisions as-is (a real app would show them for editing first, like
 * uri-social-frontend's review step) so the reference flow stays short —
 * the point here is the real charge → poll → render → refund-on-failure
 * lifecycle, not rebuilding a full editing UI.
 */
export function ProductionTab() {
  const client = useSDK();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<(typeof VIDEO_TYPES)[number]>('founder');
  const [enableMusic, setEnableMusic] = useState(true);
  const [enableCaptions, setEnableCaptions] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [billing, setBilling] = useState<VideoBillingSummary | null>(null);
  const [job, setJob] = useState<ProductionJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelledRef = useRef(false);
  const renderStartedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const poll = useCallback(
    async (jobId: string) => {
      if (!client || cancelledRef.current) return;
      try {
        const res = await client.video.getProductionJob(jobId);
        if (cancelledRef.current) return;
        setJob(res);

        if (res.status === 'awaiting_review' && !renderStartedRef.current) {
          renderStartedRef.current = true;
          await client.video.startProductionRender(jobId);
          timeoutRef.current = setTimeout(() => poll(jobId), 2000);
          return;
        }

        if (res.status === 'processing' || res.status === 'awaiting_review') {
          timeoutRef.current = setTimeout(() => poll(jobId), 3000);
        }
      } catch (err: any) {
        if (!cancelledRef.current) setError(err.message || 'Failed to check job status.');
      }
    },
    [client]
  );

  const handleSubmit = async () => {
    if (!client || !file) return;
    setSubmitting(true);
    setError(null);
    setJob(null);
    setBilling(null);
    renderStartedRef.current = false;
    cancelledRef.current = false;
    try {
      const res = await client.video.produceVideo({
        video: file,
        videoType,
        enableMusic,
        enableCaptions,
      });
      setBilling(res.billing);
      poll(res.job_id);
    } catch (err: any) {
      showToast(err.message || 'Failed to start production job.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="p-6 space-y-5">
          <div>
            <Label className="mb-2">Video</Label>
            <VideoFileInput file={file} onFileChange={setFile} disabled={submitting} />
          </div>

          <div>
            <Label htmlFor="production-video-type" className="mb-2">
              Video type
            </Label>
            <select
              id="production-video-type"
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as typeof videoType)}
              disabled={submitting}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {VIDEO_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="production-music" checked={enableMusic} onCheckedChange={(c) => setEnableMusic(!!c)} />
              <Label htmlFor="production-music">Background music</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="production-captions"
                checked={enableCaptions}
                onCheckedChange={(c) => setEnableCaptions(!!c)}
              />
              <Label htmlFor="production-captions">Captions</Label>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || submitting}
            className="w-full bg-[#f93a87] hover:bg-[#e02f78] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Clapperboard className="h-4 w-4" /> Produce video
              </>
            )}
          </Button>

          <SdkCallTag method="client.video.produceVideo()" />
        </Card>
      </div>

      <div className="lg:col-span-2">
        {job || error || billing ? (
          <div className="space-y-3">
            {job?.status_message && (
              <p className="text-sm text-gray-500">
                {job.status_message}
                {typeof job.progress === 'number' && job.status === 'processing' ? ` (${job.progress}%)` : ''}
              </p>
            )}
            <JobStatusPanel
              status={job?.status ?? (submitting ? 'processing' : null)}
              outputUrl={job?.output_url}
              failureReason={job?.status === 'failed' ? job.status_message : null}
              billing={billing}
              error={error}
            />
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-2 text-gray-400">
              <Clapperboard className="h-8 w-8 mx-auto" />
              <p className="text-sm">
                Upload a video to see AI-composed cuts, zooms, and hook text rendered into a finished reel.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
