'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Image as ImageIcon, Type } from 'lucide-react';

interface Scene {
  scene_number: number;
  duration: number;
  visual_description: string;
  narration: string;
  transitions?: string;
}

interface VideoSceneEditorProps {
  scenes: Scene[];
}

export function VideoSceneEditor({ scenes }: VideoSceneEditorProps) {
  if (!scenes || scenes.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">No scenes available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scenes.map((scene) => (
        <Card key={scene.scene_number} className="p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f93a87] flex items-center justify-center">
                  <span className="text-white font-bold">{scene.scene_number}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Scene {scene.scene_number}
                </h3>
              </div>

              <Badge className="bg-blue-100 text-blue-700">
                <Clock className="h-3 w-3 mr-1" />
                {scene.duration}s
              </Badge>
            </div>

            {/* Visual Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon className="h-4 w-4 text-[#3b82f6]" />
                Visual
              </div>
              <p className="text-sm text-gray-600 pl-6">{scene.visual_description}</p>
            </div>

            {/* Narration */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Type className="h-4 w-4 text-[#22c55e]" />
                Narration
              </div>
              <p className="text-sm text-gray-600 pl-6 italic">&quot;{scene.narration}&quot;</p>
            </div>

            {/* Transition */}
            {scene.transitions && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Transition: <span className="font-medium">{scene.transitions}</span>
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
