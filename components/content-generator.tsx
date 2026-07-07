'use client';

import { useState, useRef, useEffect } from 'react';
import { useURISocial } from '@urisocial/react';
import type { Platform } from '@urisocial/sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Image as ImageIcon, CheckCircle2, Upload, X, AlertCircle, Copy, Check } from 'lucide-react';

const AVAILABLE_PLATFORMS: { id: Platform; name: string; color: string; icon: string }[] = [
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: '📷' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '👤' },
  { id: 'twitter', name: 'Twitter/X', color: 'bg-black', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: '💼' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
];

interface ConnectedPlatform {
  platform: Platform;
  connected: boolean;
  account_name?: string;
}

export function ContentGenerator() {
  const { client } = useURISocial();
  const [seedContent, setSeedContent] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageName, setReferenceImageName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram']);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectedPlatform[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [pollingDrafts, setPollingDrafts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch connected platforms on mount
  useEffect(() => {
    // For demo purposes, simulate connected platforms
    const mockConnectedPlatforms: ConnectedPlatform[] = AVAILABLE_PLATFORMS.map(p => ({
      platform: p.id,
      connected: true, // All platforms "connected" for demo
      account_name: `@demo_${p.id}`,
    }));

    setConnectedPlatforms(mockConnectedPlatforms);
    setLoadingConnections(false);
  }, []);

  const handlePlatformToggle = (platformId: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be under 10MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReferenceImage(reader.result as string);
      setReferenceImageName(file.name);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageName('');
  };

  // Poll for draft images
  useEffect(() => {
    if (pollingDrafts.size === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      const draftsToCheck = Array.from(pollingDrafts);

      for (const draftId of draftsToCheck) {
        try {
          const updatedDraft = await client.drafts.get(draftId);

          // Check if draft response has the expected structure
          const draftData = (updatedDraft as any)?.responseData || updatedDraft;

          if (draftData?.image_url) {
            // Update the draft in generatedContent
            setGeneratedContent((prev: any) => {
              if (!prev?.responseData?.drafts) return prev;

              return {
                ...prev,
                responseData: {
                  ...prev.responseData,
                  drafts: prev.responseData.drafts.map((d: any) =>
                    d.id === draftId ? { ...d, image_url: draftData.image_url } : d
                  ),
                },
              };
            });

            // Remove from polling set
            setPollingDrafts((prev) => {
              const newSet = new Set(prev);
              newSet.delete(draftId);
              return newSet;
            });
          }
        } catch (error) {
          console.error(`Failed to poll draft ${draftId}:`, error);
        }
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollingDrafts, client.drafts]);

  const handleGenerate = async () => {
    if (!seedContent.trim() || selectedPlatforms.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setPollingDrafts(new Set()); // Clear any previous polling

    try {
      const result = await client.content.generate({
        seedContent: seedContent.trim(),
        platforms: selectedPlatforms,
        referenceImage: referenceImage || undefined,
        include_images: includeImages,
        acknowledged_incomplete_profile: true,
      } as any);

      setGeneratedContent(result);

      // Start polling for drafts with has_image but no image_url
      if (result?.responseData?.drafts) {
        const draftsNeedingImages = result.responseData.drafts
          .filter((d: any) => d.has_image && !d.image_url)
          .map((d: any) => d.id);

        if (draftsNeedingImages.length > 0) {
          setPollingDrafts(new Set(draftsNeedingImages));
        }
      }
    } catch (err: any) {
      setError(err);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const connectedCount = connectedPlatforms.filter(p => p.connected).length;

  const handleLogout = () => {
    localStorage.removeItem('urisocial_api_key');
    localStorage.removeItem('urisocial_email');
    localStorage.removeItem('urisocial_user_id');
    localStorage.removeItem('urisocial_brand_id');
    window.location.reload();
  };

  const userEmail = typeof window !== 'undefined' ? localStorage.getItem('urisocial_email') : null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            URI Social SDK Playground
          </h1>
          <p className="text-muted-foreground text-lg">
            Test content generation with the React SDK
          </p>
        </div>
        {userEmail && (
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Connection Status Banner */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {connectedCount} platform{connectedCount > 1 ? 's' : ''} connected via API
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Using API Key: {process.env.NEXT_PUBLIC_URISOCIAL_API_KEY?.slice(0, 20)}...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="lg:sticky lg:top-6 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Content
            </CardTitle>
            <CardDescription>
              Enter your seed content and customize generation options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seed Content */}
            <div className="space-y-2">
              <Label htmlFor="seed-content">
                What do you want to post about? *
              </Label>
              <Textarea
                id="seed-content"
                placeholder="E.g., 'Launch our new sustainable fashion line with eco-friendly materials'"
                value={seedContent}
                onChange={(e) => setSeedContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {seedContent.length}/5000 characters (min 10)
              </p>
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Reference Image <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>

              {referenceImage ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{referenceImageName}</p>
                    <p className="text-xs text-muted-foreground">AI will use this as visual context</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeReferenceImage}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary hover:bg-accent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging ? 'Drop image here' : 'Click or drag image'}
                    </p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <Label>Target Platforms *</Label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <span className="text-xl">{platform.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{platform.name}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <Label>Generation Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hashtags"
                    checked={includeHashtags}
                    onCheckedChange={(checked) => setIncludeHashtags(checked as boolean)}
                  />
                  <Label htmlFor="hashtags" className="font-normal cursor-pointer">
                    Include hashtags
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emojis"
                    checked={includeEmojis}
                    onCheckedChange={(checked) => setIncludeEmojis(checked as boolean)}
                  />
                  <Label htmlFor="emojis" className="font-normal cursor-pointer">
                    Include emojis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="images"
                    checked={includeImages}
                    onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                  />
                  <Label htmlFor="images" className="font-normal cursor-pointer">
                    Generate AI images
                  </Label>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!seedContent.trim() || seedContent.length < 10 || selectedPlatforms.length === 0 || isGenerating}
              className="w-full"
              size="lg"
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

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <strong>Error:</strong> {error.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Generated Content
              </CardTitle>
              <CardDescription>
                AI-generated content for each platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedContent && !isGenerating && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                  <p className="text-sm mt-2">Fill in the form and click Generate Content</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating content...</p>
                  <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
                </div>
              )}

              {generatedContent && generatedContent.responseData && (
                <div className="space-y-4">
                  {/* Request Info */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                    <code className="text-xs font-mono">{generatedContent.responseData.request_id}</code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generated at: {new Date(generatedContent.responseData.generated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Drafts */}
          {generatedContent?.responseData?.drafts?.map((draft: any, index: number) => (
            <Card key={draft.id || index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {AVAILABLE_PLATFORMS.find(p => p.id === draft.platform)?.icon} {draft.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {draft.word_count} words • {draft.content?.length || 0} characters
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(draft.content || '', draft.platform)}
                  >
                    {copiedPlatform === draft.platform ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Generated Image */}
                  {draft.image_url ? (
                    <div className="rounded-lg overflow-hidden border">
                      <img
                        src={draft.image_url}
                        alt={`Generated image for ${draft.platform}`}
                        className="w-full h-auto"
                      />
                    </div>
                  ) : draft.has_image ? (
                    <div className="rounded-lg border border-dashed p-8 text-center bg-muted/30">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Image is being generated...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pollingDrafts.has(draft.id)
                          ? '✨ Auto-polling for image updates every 3 seconds...'
                          : `Draft ID: ${draft.id}`
                        }
                      </p>
                    </div>
                  ) : includeImages ? (
                    <div className="rounded-lg border border-dashed p-6 text-center bg-amber-50/50">
                      <ImageIcon className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-amber-900">Image generation was requested but not started</p>
                      <p className="text-xs text-amber-700 mt-1">This might happen if image generation failed to initialize</p>
                    </div>
                  ) : null}

                  {/* Generated Text */}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{draft.content}</p>
                  </div>

                  {/* Hashtags */}
                  {draft.hashtags && draft.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t">
                      {draft.hashtags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-primary font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Draft Info */}
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Draft ID:</span>
                        <p className="font-mono truncate">{draft.id}</p>
                      </div>
                      <div>
                        <span className="font-medium">Brand ID:</span>
                        <p className="font-mono truncate">{draft.brand_id}</p>
                      </div>
                      {draft.seed_content && (
                        <div className="col-span-2">
                          <span className="font-medium">Seed:</span>
                          <p className="truncate">{draft.seed_content}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Metadata */}
                  {draft.ai_metadata && (
                    <div className="pt-3 border-t">
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-medium">AI Generation Details</summary>
                        <div className="mt-2 space-y-1">
                          <p><strong>Model:</strong> {draft.ai_metadata.model_used}</p>
                          <p><strong>Temperature:</strong> {draft.ai_metadata.temperature}</p>
                          <p><strong>Generated:</strong> {new Date(draft.ai_metadata.generation_time).toLocaleString()}</p>
                          <p><strong>Seed Length:</strong> {draft.ai_metadata.seed_length} chars</p>
                          <p><strong>Output Length:</strong> {draft.ai_metadata.output_length} chars</p>
                          {draft.ai_metadata.hashtag_count !== undefined && (
                            <p><strong>Hashtags:</strong> {draft.ai_metadata.hashtag_count}</p>
                          )}
                          {draft.ai_metadata.nigerian_context !== undefined && (
                            <p><strong>Nigerian Context:</strong> {draft.ai_metadata.nigerian_context ? 'Yes' : 'No'}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
