'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';

export function LogoUpload({ logoUrl }: { logoUrl?: string }) {
  const client = useSDK();
  const [logo, setLogo] = useState<string | undefined>(logoUrl);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!client) {
      console.error('SDK client not initialized');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await client.brandProfile.uploadLogo(file);
      setLogo(response.logo_url);
      await client.brandProfile.update({ logo_url: response.logo_url });
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleRemove = async () => {
    if (!client) {
      console.error('SDK client not initialized');
      return;
    }

    try {
      setLogo(undefined);
      await client.brandProfile.update({ logo_url: undefined });
    } catch (error) {
      console.error('Failed to remove logo:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Logo</CardTitle>
      </CardHeader>
      <CardContent>
        {logo ? (
          <div className="space-y-4">
            <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
              <img src={logo} alt="Brand logo" className="max-w-full max-h-full object-contain" />
            </div>
            <Button
              onClick={handleRemove}
              variant="outline"
              className="w-full"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              <X className="mr-2 h-4 w-4" />
              Remove Logo
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-500 hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#f93a87' }} />
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop logo here' : 'Click or drag to upload'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 5MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
