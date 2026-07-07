'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VideoStoryboardForm } from '@/components/dashboard/video/VideoStoryboardForm';
import { VideoSceneEditor } from '@/components/dashboard/video/VideoSceneEditor';
import { VideoPreview } from '@/components/dashboard/video/VideoPreview';
import { Video } from 'lucide-react';

export default function VideoPage() {
  const [storyboard, setStoryboard] = useState<any>(null);

  const handleGenerated = (generatedStoryboard: any) => {
    setStoryboard(generatedStoryboard);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#f93a87] rounded-lg">
          <Video className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Storyboard</h1>
          <p className="text-sm text-gray-500">
            Generate AI-powered video storyboards for your content
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create Storyboard
            </h2>
            <VideoStoryboardForm onGenerated={handleGenerated} />
          </Card>
        </div>

        {/* Preview & Scenes */}
        <div className="lg:col-span-2 space-y-6">
          {storyboard ? (
            <>
              {/* Preview */}
              <VideoPreview storyboard={storyboard} />

              {/* Scenes */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Scene Breakdown
                </h2>
                <VideoSceneEditor scenes={storyboard.scenes || []} />
              </div>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Video className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No storyboard generated yet
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Fill in the form on the left to generate an AI-powered video storyboard
                  with scene breakdowns and narration.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
