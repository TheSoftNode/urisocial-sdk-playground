'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';

export function LogoUpload({ logoUrl }: { logoUrl?: string }) {
  const client = useSDK();
  const { showToast } = useToast();
  const [logo, setLogo] = useState<string | undefined>(logoUrl);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'error');
      return;
    }

    try {
      setUploading(true);
      const response = await client.brandProfile.uploadLogo(file);
      setLogo(response.logo_url);
      await client.brandProfile.update({ logo_url: response.logo_url });
      showToast('Logo uploaded.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to upload logo.', 'error');
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
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    const previousLogo = logo;
    try {
      setLogo(undefined);
      // An empty string (not undefined) is what actually clears the field —
      // undefined gets dropped by JSON serialization and the update is a no-op.
      await client.brandProfile.update({ logo_url: '' });
      showToast('Logo removed.', 'success');
    } catch (error: any) {
      setLogo(previousLogo);
      showToast(error.message || 'Failed to remove logo.', 'error');
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
