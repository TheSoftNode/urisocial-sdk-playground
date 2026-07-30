'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Upload, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';
import type { CustomGuide } from '@urisocial/sdk';

export default function VisualGuidesPage() {
  const client = useSDK();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [guides, setGuides] = useState<CustomGuide[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideName, setGuideName] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadGuides = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const [guidesRes, profileRes] = await Promise.all([
        client.customGuides.listGuides({ status: 'active' }),
        client.brandProfile.get(),
      ]);
      setGuides(guidesRes.guides || []);
      setSelectedIds(profileRes.responseData?.selected_custom_guides || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load visual guides.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const handleFileSelect = async (file: File) => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }
    if (!guideName.trim()) {
      showToast('Give this guide a name first.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }

    setUploading(true);
    try {
      // The SDK's only "upload an image, get a hosted URL back" endpoint is
      // brandProfile.uploadLogo — reused here purely for hosting (we do NOT
      // call brandProfile.update afterward, so the actual brand logo is
      // untouched). uploadReferenceImage itself needs an already-hosted URL,
      // not a raw file.
      const { logo_url } = await client.brandProfile.uploadLogo(file);
      const { guide } = await client.customGuides.uploadReferenceImage({
        image_url: logo_url,
        name: guideName.trim(),
      });
      setGuides((prev) => [guide, ...prev]);
      setGuideName('');
      showToast('Visual guide created — style extracted from your reference image.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create visual guide.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const toggleSelected = async (guideId: string) => {
    if (!client) return;
    const next = selectedIds.includes(guideId)
      ? selectedIds.filter((id) => id !== guideId)
      : [...selectedIds, guideId];
    setSelectedIds(next);
    try {
      await client.brandProfile.update({ selected_custom_guides: next });
      showToast(
        next.includes(guideId) ? 'Guide selected — future generations will rotate through it.' : 'Guide deselected.',
        'success'
      );
    } catch (err: any) {
      setSelectedIds(selectedIds); // revert on failure
      showToast(err.message || 'Failed to update guide selection.', 'error');
    }
  };

  const handleDelete = async (guideId: string) => {
    if (!client) return;
    try {
      await client.customGuides.deleteGuide(guideId);
      setGuides((prev) => prev.filter((g) => g.id !== guideId));
      setSelectedIds((prev) => prev.filter((id) => id !== guideId));
      showToast('Guide archived.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to archive guide.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#f93a87] rounded-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visual Guides</h1>
          <p className="text-sm text-gray-500">
            Upload a reference photo to extract a reusable design style — select it once, and future AI-generated
            posts automatically apply it.
          </p>
        </div>
      </div>

      <Card className="p-4 bg-blue-50 ring-blue-200">
        <p className="text-sm text-blue-800">
          Guides work by <strong>persistent selection</strong>, not per-post attachment: select one or more guides
          below and every future image generation for this brand rotates through them automatically. There's no
          per-request &quot;guide_id&quot; parameter — selection lives on the brand profile.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create a new guide</CardTitle>
          <CardDescription>GPT-4o Vision extracts the aesthetic and typography from your reference image.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="guide-name" className="mb-2">
                Guide name
              </Label>
              <Input
                id="guide-name"
                placeholder="e.g. Weekend Promo Style"
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = '';
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading || !guideName.trim()}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting style...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload reference image
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Your guides ({guides.length})</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading guides...
          </div>
        ) : guides.length === 0 ? (
          <p className="text-sm text-gray-500">No guides yet — create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide) => {
              const isSelected = selectedIds.includes(guide.id);
              return (
                <Card key={guide.id} className={isSelected ? 'ring-2 ring-[#f93a87]' : ''}>
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={guide.original_image_url} alt={guide.name} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">{guide.name}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-[#f93a87]" />}
                    </div>
                    <p className="text-xs text-gray-500">Used {guide.times_used} time{guide.times_used === 1 ? '' : 's'}</p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant={isSelected ? 'outline' : 'default'}
                        onClick={() => toggleSelected(guide.id)}
                        className="flex-1"
                      >
                        {isSelected ? 'Deselect' : 'Select for brand'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(guide.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
