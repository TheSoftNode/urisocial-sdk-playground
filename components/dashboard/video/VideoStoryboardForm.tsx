'use client';

import { useState } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface VideoStoryboardFormProps {
  onGenerated: (storyboard: any) => void;
}

export function VideoStoryboardForm({ onGenerated }: VideoStoryboardFormProps) {
  const client = useSDK();
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('30');
  const [style, setStyle] = useState('modern');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoStyles = [
    { value: 'modern', label: 'Modern' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'energetic', label: 'Energetic' },
    { value: 'professional', label: 'Professional' },
  ];

  const handleGenerate = async () => {
    if (!client || !topic.trim()) {
      setError('Please enter a video topic');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await client.video.generateStoryboard({
        brand_images: [],
        optional_text: topic.trim() + (additionalNotes ? ` - ${additionalNotes}` : ''),
        target_platform: 'instagram_reels',
        target_duration_seconds: parseInt(duration),
        video_style: style,
      });

      onGenerated(response.storyboard);
    } catch (err: any) {
      setError(err.message || 'Failed to generate storyboard');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="topic">Video Topic *</Label>
        <Input
          id="topic"
          type="text"
          placeholder="e.g., Product launch announcement"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          What should the video be about?
        </p>
      </div>

      <div>
        <Label htmlFor="duration">Duration (seconds)</Label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          disabled={isGenerating}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f93a87]"
        >
          <option value="15">15 seconds</option>
          <option value="30">30 seconds</option>
          <option value="60">60 seconds</option>
          <option value="90">90 seconds</option>
        </select>
      </div>

      <div>
        <Label htmlFor="style">Video Style</Label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          disabled={isGenerating}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f93a87]"
        >
          {videoStyles.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any specific requirements or preferences..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          disabled={isGenerating}
          rows={3}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim()}
        className="w-full bg-[#f93a87] hover:bg-[#f93a87]/90 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Storyboard...
          </>
        ) : (
          'Generate Storyboard'
        )}
      </Button>
    </div>
  );
}
