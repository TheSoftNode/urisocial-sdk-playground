'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Eye } from 'lucide-react';

interface Blog {
  blog_id: string;
  generated_title: string;
  generated_content: string;
  primary_keyword: string;
  secondary_keywords: string[];
  word_count: number;
  created_at: string;
}

interface BlogPreviewProps {
  blog: Blog;
}

export function BlogPreview({ blog }: BlogPreviewProps) {
  const handleCopy = () => {
    const fullContent = `${blog.generated_title}\n\n${blog.generated_content}`;
    navigator.clipboard.writeText(fullContent);
  };

  const handleExport = () => {
    const fullContent = `${blog.generated_title}\n\n${blog.generated_content}`;
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blog.generated_title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const readingTime = Math.ceil(blog.word_count / 200);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">{blog.word_count}</span>
              <span className="text-gray-500 ml-1">words</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div>
              <span className="font-medium text-gray-900">{readingTime}</span>
              <span className="text-gray-500 ml-1">min read</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-gray-600 hover:text-[#3b82f6]"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-gray-600 hover:text-[#22c55e]"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      <Card className="p-8">
        <article className="prose prose-lg max-w-none">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{blog.generated_title}</h1>

          {/* Keywords */}
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge className="bg-[#f93a87] text-white">
              {blog.primary_keyword}
            </Badge>
            {blog.secondary_keywords && blog.secondary_keywords.length > 0 && (
              <>
                {blog.secondary_keywords.map((keyword, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-700">
                    {keyword}
                  </Badge>
                ))}
              </>
            )}
          </div>

          {/* Content */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {blog.generated_content}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-xs text-gray-400">
            Generated on {new Date(blog.created_at).toLocaleDateString()}
          </div>
        </article>
      </Card>
    </div>
  );
}
