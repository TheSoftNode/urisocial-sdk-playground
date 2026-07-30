'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PlatformSelector, type Platform } from '@/components/dashboard/content/PlatformSelector';
import { ImageUpload } from '@/components/dashboard/content/ImageUpload';
import { GenerationOptions } from '@/components/dashboard/content/GenerationOptions';
import { GeneratedPreview } from '@/components/dashboard/content/GeneratedPreview';
import { Input } from '@/components/ui/input';
import { useSDK } from '@/lib/sdk/sdk-provider';

export default function ContentGenerationPage() {
  const client = useSDK();
  const [seedContent, setSeedContent] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [productName, setProductName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedGuideCount, setSelectedGuideCount] = useState<number | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guide selection lives on the brand profile, not this form — surface the
  // current state so it's clear generation will pick it up automatically.
  useEffect(() => {
    if (!client) return;
    client.brandProfile
      .get()
      .then((res) => {
        const v1 = res.responseData?.selected_custom_guides || [];
        const v2 = res.responseData?.selected_custom_guides_v2 || [];
        setSelectedGuideCount(v1.length + v2.length);
      })
      .catch(() => setSelectedGuideCount(null));
  }, [client]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  // Poll for image updates
  const startPollingForImages = (draftIds: string[]) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    console.log('Starting image polling for drafts:', draftIds);

    // Poll function
    const pollForImages = async () => {
      if (!client) return;

      try {
        // Fetch latest draft data
        const response = await client.drafts.list(1, 50);

        console.log('📊 Polling response:', {
          hasData: !!response?.data,
          dataLength: response?.data?.length,
          draftIds: draftIds,
        });

        if (response?.data) {
          const updatedDrafts = response.data.filter((d: any) =>
            draftIds.includes(d.id)
          );

          console.log('📊 Filtered drafts:', updatedDrafts.map((d: any) => ({
            id: d.id,
            has_image: d.has_image,
            image_url: d.image_url ? d.image_url.substring(0, 50) + '...' : null,
          })));

          // Update drafts state with latest data (including images)
          setDrafts(prevDrafts => {
            return prevDrafts.map(draft => {
              const updated = updatedDrafts.find((d: any) => d.id === draft.id);
              return updated || draft;
            });
          });

          // Check if all images are loaded
          // Only stop polling if we actually found the drafts AND they have images
          const allImagesLoaded = updatedDrafts.length > 0 && updatedDrafts.every((d: any) =>
            !d.has_image || (d.has_image && d.image_url)
          );

          console.log('📊 All images loaded?', allImagesLoaded, '(found', updatedDrafts.length, 'drafts)');

          if (allImagesLoaded) {
            console.log('All images loaded, stopping polling');
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Poll immediately first, then every 3 seconds
    pollForImages();
    pollingIntervalRef.current = setInterval(pollForImages, 3000);

    // Stop polling after 60 seconds
    pollingTimeoutRef.current = setTimeout(() => {
      console.log('Polling timeout reached, stopping');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }, 60000);
  };

  const handleGenerate = async () => {
    if (!seedContent.trim() || platforms.length === 0) {
      setError('Please enter seed content and select at least one platform');
      return;
    }

    if (!client) {
      setError('SDK client is not ready yet. Please try again in a moment.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDrafts([]);

    try {
      const result = await client.content.generate({
        seedContent: seedContent.trim(),
        platforms,
        referenceImage: referenceImage || undefined,
        include_images: includeImages,
        acknowledged_incomplete_profile: true,
        // One-time override for this generation only — not saved to the
        // brand's playbook. This is how an attached product/service name
        // gets folded into the AI's context per-request.
        brand_context: productName.trim() ? { key_products_services: [productName.trim()] } : undefined,
      } as any);

      if (result.responseData?.drafts) {
        setDrafts(result.responseData.drafts);

        // If images are being generated, start polling
        const hasImagesGenerating = result.responseData.drafts.some(
          (d: any) => d.has_image && !d.image_url
        );

        console.log('🎯 Generation result:', {
          drafts: result.responseData.drafts.map((d: any) => ({
            id: d.id,
            has_image: d.has_image,
            image_url: d.image_url,
          })),
          hasImagesGenerating,
        });

        if (hasImagesGenerating) {
          const draftIds = result.responseData.drafts.map((d: any) => d.id);
          console.log('🎯 Starting polling for draft IDs:', draftIds);
          startPollingForImages(draftIds);
        }
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Generator</h1>
        <p className="text-gray-600">
          Create AI-powered social media content for multiple platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: '#f93a87' }} />
                Generate Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seed Content */}
              <div>
                <Label htmlFor="seedContent">
                  What do you want to post about? *
                </Label>
                <Textarea
                  id="seedContent"
                  value={seedContent}
                  onChange={(e) => setSeedContent(e.target.value)}
                  placeholder="E.g., 'Launch our new sustainable fashion line with eco-friendly materials'"
                  rows={5}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {seedContent.length}/5000 characters (min 10)
                </p>
              </div>

              {/* Attached product/service — one-time context override, not saved to the brand profile */}
              <div>
                <Label htmlFor="productName">Attached product / service (optional)</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="E.g., 'Weekend Brunch Special'"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Folded into this generation's brand context only — won't change your saved brand profile.
                </p>
              </div>

              {/* Platform Selection */}
              <PlatformSelector selected={platforms} onChange={setPlatforms} />

              {/* Reference Image */}
              <ImageUpload image={referenceImage} onImageChange={setReferenceImage} />

              {/* Visual Guide status — attachment is persistent on the brand profile, not per-request */}
              {selectedGuideCount !== null && (
                <div className="p-3 rounded-lg bg-purple-50 text-purple-800 text-sm flex items-center justify-between gap-3">
                  <span>
                    {selectedGuideCount > 0
                      ? `${selectedGuideCount} Visual Guide${selectedGuideCount === 1 ? '' : 's'} selected — this generation will rotate through ${selectedGuideCount === 1 ? 'it' : 'them'} automatically.`
                      : 'No Visual Guide selected for this brand yet — generation uses your default style.'}
                  </span>
                  <Link href="/dashboard/visual-guides" className="underline whitespace-nowrap">
                    Manage
                  </Link>
                </div>
              )}

              {/* Options */}
              <GenerationOptions
                includeHashtags={includeHashtags}
                includeEmojis={includeEmojis}
                includeImages={includeImages}
                onOptionsChange={({ includeHashtags, includeEmojis, includeImages }) => {
                  setIncludeHashtags(includeHashtags);
                  setIncludeEmojis(includeEmojis);
                  setIncludeImages(includeImages);
                }}
              />

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !seedContent.trim() || platforms.length === 0}
                className="w-full"
                size="lg"
                style={{ backgroundColor: '#f93a87' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Generated Content</h2>
          <GeneratedPreview drafts={drafts} isGenerating={isGenerating} />
        </div>
      </div>
    </div>
  );
}
