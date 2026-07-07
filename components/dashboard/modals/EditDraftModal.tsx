'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditDraftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
  isLoading?: boolean;
  platform?: string;
}

export function EditDraftModal({
  open,
  onClose,
  onSave,
  initialContent,
  isLoading = false,
  platform,
}: EditDraftModalProps) {
  const [content, setContent] = useState(initialContent);

  // Update content when modal opens with new initialContent
  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [open, initialContent]);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content);
  };

  const characterCount = content.length;
  const maxCharacters = platform === 'twitter' ? 280 : 2200;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Draft${platform ? ` (${platform})` : ''}`}
      size="lg"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || isOverLimit || isLoading}
            style={{ backgroundColor: '#f93a87' }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="draft-content">Content</Label>
          <Textarea
            id="draft-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Enter your content..."
            className="resize-none"
          />
          <div className="flex justify-between text-sm">
            <span className={isOverLimit ? 'text-red-600' : 'text-gray-500'}>
              {characterCount} / {maxCharacters} characters
            </span>
            {isOverLimit && (
              <span className="text-red-600">
                Over limit by {characterCount - maxCharacters}
              </span>
            )}
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Editing will update the draft content. Image and other settings will remain unchanged.
          </p>
        </div>
      </div>
    </Modal>
  );
}
