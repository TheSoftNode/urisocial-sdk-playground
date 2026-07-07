'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, MessageCircle } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  published_at: string;
}

interface TopPostsProps {
  posts: Post[];
}

const platformColors: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700',
  facebook: 'bg-blue-100 text-blue-700',
  twitter: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-blue-100 text-blue-700',
  tiktok: 'bg-gray-100 text-gray-700',
};

export function TopPosts({ posts }: TopPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
        <p className="text-center text-gray-500 py-8">No posts available</p>
      </Card>
    );
  }

  const truncateContent = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
          >
            {/* Rank */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#f93a87] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{index + 1}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={platformColors[post.platform] || 'bg-gray-100 text-gray-700'}>
                  {post.platform}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(post.published_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-700">{truncateContent(post.content)}</p>

              {/* Metrics */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatNumber(post.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  <span>{formatNumber(post.likes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{formatNumber(post.comments)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
