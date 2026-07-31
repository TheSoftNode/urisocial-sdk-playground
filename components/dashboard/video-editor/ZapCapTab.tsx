'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { useToast } from '@/components/ui/toast';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Loader2, Captions } from 'lucide-react';
import type { VideoBillingSummary, ZapCapTemplate } from '@urisocial/sdk';
import { VideoFileInput } from './VideoFileInput';
import { JobStatusPanel } from './JobStatusPanel';
import { usePollVideoJob } from './usePollVideoJob';

const CAPTION_STYLES = ['bold', 'minimal', 'animated'];

export function ZapCapTab() {
  const client = useSDK();
  const { showToast } = useToast();

  const [templates, setTemplates] = useState<ZapCapTemplate[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [templateId, setTemplateId] = useState('beast');
  const [captionStyle, setCaptionStyle] = useState('bold');
  const [enableBroll, setEnableBroll] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [billing, setBilling] = useState<VideoBillingSummary | null>(null);

  const { result, error, start, reset } = usePollVideoJob((jobId) => client!.video.getZapCapJob(jobId));

  useEffect(() => {
    if (!client) return;
    client.video
      .listZapCapTemplates()
      .then((list) => {
        setTemplates(list);
        if (list[0]) setTemplateId(list[0].id);
      })
      .catch(() => {
        // Fall back to the "beast" default already set — templates are a
        // nice-to-have picker, not required to submit a job.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const handleSubmit = async () => {
    if (!client || !file) return;
    setSubmitting(true);
    reset();
    setBilling(null);
    try {
      const res = await client.video.zapcapProduce({
        video: file,
        templateId,
        captionStyle,
        enableBroll,
      });
      setBilling(res.billing);
      start(res.job_id);
    } catch (err: any) {
      showToast(err.message || 'Failed to start ZapCap job.', 'error');
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
            <Label htmlFor="zapcap-template" className="mb-2">
              Caption template
            </Label>
            <select
              id="zapcap-template"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              disabled={submitting}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {templates.length > 0 ? (
                templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              ) : (
                <option value="beast">beast</option>
              )}
            </select>
          </div>

          <div>
            <Label htmlFor="zapcap-caption-style" className="mb-2">
              Caption style
            </Label>
            <select
              id="zapcap-caption-style"
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value)}
              disabled={submitting}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {CAPTION_STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enableBroll}
              onChange={(e) => setEnableBroll(e.target.checked)}
              disabled={submitting}
            />
            Auto b-roll
          </label>

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
                <Captions className="h-4 w-4" /> Produce with ZapCap
              </>
            )}
          </Button>

          <SdkCallTag method="client.video.zapcapProduce()" />
        </Card>
      </div>

      <div className="lg:col-span-2">
        {result || error || billing ? (
          <JobStatusPanel
            status={result?.status ?? (submitting ? 'processing' : null)}
            outputUrl={result?.output_url}
            failureReason={result?.failure_reason}
            billing={billing}
            error={error}
          />
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-2 text-gray-400">
              <Captions className="h-8 w-8 mx-auto" />
              <p className="text-sm">Upload a video to see AI-generated captions applied.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
