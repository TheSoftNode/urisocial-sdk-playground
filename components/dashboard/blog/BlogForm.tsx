'use client';

import { useState } from 'react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface BlogFormProps {
  onGenerated: (blog: any) => void;
}

export function BlogForm({ onGenerated }: BlogFormProps) {
  const client = useSDK();
  const [topic, setTopic] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [wordCount, setWordCount] = useState('800');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCountOptions = [
    { value: '500', label: 'Short (500 words)' },
    { value: '800', label: 'Medium (800 words)' },
    { value: '1500', label: 'Long (1500 words)' },
    { value: '2500', label: 'Extra Long (2500 words)' },
  ];

  const handleGenerate = async () => {
    if (!client || !topic.trim() || !primaryKeyword.trim()) {
      setError('Please enter both topic and primary keyword');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const keywordsArray = secondaryKeywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k)
        .slice(0, 10);

      const response: any = await client.blog.generate({
        topic: topic.trim(),
        primary_keyword: primaryKeyword.trim(),
        secondary_keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
        word_count: parseInt(wordCount),
      } as any);

      onGenerated(response.blog_post);
    } catch (err: any) {
      setError(err.message || 'Failed to generate blog post');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="topic">Blog Topic *</Label>
        <Input
          id="topic"
          type="text"
          placeholder="e.g., 10 Social Media Marketing Tips"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          What should the blog post be about?
        </p>
      </div>

      <div>
        <Label htmlFor="primaryKeyword">Primary Keyword *</Label>
        <Input
          id="primaryKeyword"
          type="text"
          placeholder="e.g., social media marketing"
          value={primaryKeyword}
          onChange={(e) => setPrimaryKeyword(e.target.value)}
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          Main SEO keyword for the blog post
        </p>
      </div>

      <div>
        <Label htmlFor="secondaryKeywords">Secondary Keywords (Optional)</Label>
        <Input
          id="secondaryKeywords"
          type="text"
          placeholder="marketing, tips, strategy (comma-separated, max 10)"
          value={secondaryKeywords}
          onChange={(e) => setSecondaryKeywords(e.target.value)}
          disabled={isGenerating}
        />
        <p className="text-xs text-gray-500 mt-1">
          Additional keywords for SEO
        </p>
      </div>

      <div>
        <Label htmlFor="wordCount">Word Count</Label>
        <select
          id="wordCount"
          value={wordCount}
          onChange={(e) => setWordCount(e.target.value)}
          disabled={isGenerating}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f93a87]"
        >
          {wordCountOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !topic.trim() || !primaryKeyword.trim()}
        className="w-full bg-[#f93a87] hover:bg-[#f93a87]/90 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Blog...
          </>
        ) : (
          'Generate Blog Post'
        )}
      </Button>
    </div>
  );
}
