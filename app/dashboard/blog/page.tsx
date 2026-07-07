'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BlogForm } from '@/components/dashboard/blog/BlogForm';
import { BlogOutline } from '@/components/dashboard/blog/BlogOutline';
import { BlogPreview } from '@/components/dashboard/blog/BlogPreview';
import { FileText } from 'lucide-react';

export default function BlogPage() {
  const [blog, setBlog] = useState<any>(null);

  const handleGenerated = (generatedBlog: any) => {
    setBlog(generatedBlog);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#22c55e] rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Generator</h1>
          <p className="text-sm text-gray-500">
            Generate AI-powered blog posts with SEO optimization
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create Blog Post
            </h2>
            <BlogForm onGenerated={handleGenerated} />
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-6">
          {blog ? (
            <>
              {/* Outline */}
              {blog.outline && (
                <BlogOutline
                  outline={blog.outline}
                  wordCount={blog.word_count}
                />
              )}

              {/* Preview */}
              <BlogPreview blog={blog} />
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No blog post generated yet
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Fill in the form on the left to generate an AI-powered blog post
                  with SEO optimization and keyword targeting.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
