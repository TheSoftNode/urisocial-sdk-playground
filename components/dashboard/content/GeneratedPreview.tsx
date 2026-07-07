'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface Draft {
  id: string;
  platform: string;
  content: string;
  hashtags?: string[];
  image_url?: string;
  has_image?: boolean;
  word_count?: number;
}

interface GeneratedPreviewProps {
  drafts: Draft[];
  isGenerating: boolean;
}

export function GeneratedPreview({ drafts, isGenerating }: GeneratedPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isGenerating) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#f93a87' }} />
          <p className="text-gray-600">Generating your content...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </CardContent>
      </Card>
    );
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Generated content will appear here</p>
          <p className="text-sm text-gray-500 mt-2">Fill in the form and click Generate</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {draft.platform}
                </Badge>
                {draft.word_count && (
                  <span className="text-xs text-gray-500">{draft.word_count} words</span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(draft.content, draft.id)}
              >
                {copiedId === draft.id ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Image */}
              {draft.image_url ? (
                <img
                  src={draft.image_url}
                  alt={`Generated for ${draft.platform}`}
                  className="w-full rounded-lg border"
                />
              ) : draft.has_image ? (
                <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Generating image...</p>
                </div>
              ) : null}

              {/* Text */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-900">{draft.content}</p>
              </div>

              {/* Hashtags */}
              {draft.hashtags && draft.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t">
                  {draft.hashtags.map((tag, i) => (
                    <span key={i} className="text-sm font-medium" style={{ color: '#3b82f6' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Add missing import
import { FileText } from 'lucide-react';
