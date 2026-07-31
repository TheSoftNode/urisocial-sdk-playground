'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SdkCallTag } from '@/components/ui/sdk-call-tag';
import { useToast } from '@/components/ui/toast';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Loader2, Wand2 } from 'lucide-react';
import type { VideoBillingSummary } from '@urisocial/sdk';
import { VideoFileInput } from './VideoFileInput';
import { JobStatusPanel } from './JobStatusPanel';
import { usePollVideoJob } from './usePollVideoJob';

const TEMPLATES = ['Sara', 'Ali', 'Devon', 'Hormozi', 'Karl'];

export function SubmagicTab() {
  const client = useSDK();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('Sara');
  const [magicZooms, setMagicZooms] = useState(true);
  const [magicBrolls, setMagicBrolls] = useState(false);
  const [cleanAudio, setCleanAudio] = useState(false);
  const [removeBadTakes, setRemoveBadTakes] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [billing, setBilling] = useState<VideoBillingSummary | null>(null);

  const { result, error, start, reset } = usePollVideoJob((jobId) => client!.video.getSubmagicJob(jobId));

  const handleSubmit = async () => {
    if (!client || !file) return;
    setSubmitting(true);
    reset();
    setBilling(null);
    try {
      const res = await client.video.submagicProduce({
        video: file,
        templateName,
        magicZooms,
        magicBrolls,
        cleanAudio,
        removeBadTakes,
      });
      setBilling(res.billing);
      start(res.job_id);
    } catch (err: any) {
      showToast(err.message || 'Failed to start Submagic job.', 'error');
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
            <Label htmlFor="submagic-template" className="mb-2">
              Caption template
            </Label>
            <select
              id="submagic-template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              disabled={submitting}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="magic-zooms" checked={magicZooms} onCheckedChange={(c) => setMagicZooms(!!c)} />
              <Label htmlFor="magic-zooms">Magic zooms</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="magic-brolls" checked={magicBrolls} onCheckedChange={(c) => setMagicBrolls(!!c)} />
              <Label htmlFor="magic-brolls">Magic b-roll</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="clean-audio" checked={cleanAudio} onCheckedChange={(c) => setCleanAudio(!!c)} />
              <Label htmlFor="clean-audio">Clean audio</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remove-bad-takes"
                checked={removeBadTakes}
                onCheckedChange={(c) => setRemoveBadTakes(!!c)}
              />
              <Label htmlFor="remove-bad-takes">Remove bad takes</Label>
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
                <Wand2 className="h-4 w-4" /> Produce with Submagic
              </>
            )}
          </Button>

          <SdkCallTag method="client.video.submagicProduce()" />
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
              <Wand2 className="h-8 w-8 mx-auto" />
              <p className="text-sm">Upload a video to see AI captions, zooms, and b-roll applied.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
