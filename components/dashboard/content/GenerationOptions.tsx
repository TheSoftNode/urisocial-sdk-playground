'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface GenerationOptionsProps {
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeImages: boolean;
  onOptionsChange: (options: {
    includeHashtags: boolean;
    includeEmojis: boolean;
    includeImages: boolean;
  }) => void;
}

export function GenerationOptions({
  includeHashtags,
  includeEmojis,
  includeImages,
  onOptionsChange,
}: GenerationOptionsProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Generation Options
      </label>
      <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hashtags"
            checked={includeHashtags}
            onCheckedChange={(checked) =>
              onOptionsChange({ includeHashtags: checked as boolean, includeEmojis, includeImages })
            }
          />
          <Label
            htmlFor="hashtags"
            className="text-sm font-normal cursor-pointer"
          >
            Include hashtags
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="emojis"
            checked={includeEmojis}
            onCheckedChange={(checked) =>
              onOptionsChange({ includeHashtags, includeEmojis: checked as boolean, includeImages })
            }
          />
          <Label
            htmlFor="emojis"
            className="text-sm font-normal cursor-pointer"
          >
            Include emojis
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="images"
            checked={includeImages}
            onCheckedChange={(checked) =>
              onOptionsChange({ includeHashtags, includeEmojis, includeImages: checked as boolean })
            }
          />
          <Label
            htmlFor="images"
            className="text-sm font-normal cursor-pointer"
          >
            Generate AI images
          </Label>
        </div>
      </div>
    </div>
  );
}
