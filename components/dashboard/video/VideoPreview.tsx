'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Play } from 'lucide-react';

interface Storyboard {
  id: string;
  title: string;
  duration: number;
  style: string;
  scenes: any[];
  created_at: string;
}

interface VideoPreviewProps {
  storyboard: Storyboard;
}

export function VideoPreview({ storyboard }: VideoPreviewProps) {
  const totalScenes = storyboard.scenes.length;
  const totalDuration = storyboard.duration;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{storyboard.title}</h3>
            <Badge className="bg-[#f93a87] text-white">
              {storyboard.style}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="font-medium">{totalScenes}</span>
              <span>scenes</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <div className="flex items-center gap-1">
              <span className="font-medium">{totalDuration}s</span>
              <span>duration</span>
            </div>
          </div>
        </div>

        {/* Video Placeholder */}
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
              <Play className="h-10 w-10 text-white" />
            </div>
            <p className="text-white text-sm">Video preview will appear here</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalScenes}</p>
            <p className="text-xs text-gray-500">Total Scenes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{totalDuration}s</p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {(totalDuration / totalScenes).toFixed(1)}s
            </p>
            <p className="text-xs text-gray-500">Avg Scene</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button className="flex-1 bg-[#f93a87] hover:bg-[#f93a87]/90 text-white">
            <Play className="h-4 w-4 mr-2" />
            Generate Video
          </Button>
          <Button variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export Storyboard
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 text-center">
          Created on {new Date(storyboard.created_at).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
}
