'use client';

import { useRef } from 'react';
import { UploadCloud, FileVideo, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoFileInputProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VideoFileInput({ file, onFileChange, disabled }: VideoFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileVideo className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-900 truncate">{file.name}</span>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatSize(file.size)}</span>
        </div>
        {!disabled && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      className="w-full flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-8 text-gray-500 hover:border-[#f93a87] hover:text-[#f93a87] transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      <UploadCloud className="h-6 w-6" />
      <span className="text-sm">Click to upload a video</span>
      <span className="text-xs text-gray-400">MP4, MOV, or WebM</span>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
    </button>
  );
}
