'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';
import { LoadingState } from '@/components/ui/loading-state';

export function ColorPicker() {
  const client = useSDK();
  const { showToast } = useToast();
  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('#f93a87');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (client && !hasLoaded.current) {
      hasLoaded.current = true;
      loadColors();
    }
  }, [client]);

  const loadColors = async () => {
    if (!client) return;

    try {
      setLoading(true);
      const response = await client.brandProfile.get();
      if (response.responseData?.brand_colors) {
        setColors(response.responseData.brand_colors);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load brand colors.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = () => {
    if (!colors.includes(newColor) && colors.length < 5) {
      setColors([...colors, newColor]);
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setColors(colors.filter((c) => c !== colorToRemove));
  };

  const handleSave = async () => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    try {
      setSaving(true);
      await client.brandProfile.update({ brand_colors: colors });
      showToast('Brand colors saved.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save brand colors.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading brand colors…" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Colors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Add up to 5 colors that represent your brand. These will be used in AI-generated visuals.
        </p>

        {/* Color Grid */}
        <div className="grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <div key={color} className="relative group">
              <div
                className="w-full h-20 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={() => handleRemoveColor(color)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs text-center mt-1 text-gray-600 font-mono">{color}</p>
            </div>
          ))}
        </div>

        {/* Add Color */}
        {colors.length < 5 && (
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2 items-center">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
            <Button
              onClick={handleAddColor}
              variant="outline"
              style={{ borderColor: '#f93a87', color: '#f93a87' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          style={{ backgroundColor: '#f93a87' }}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Colors
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
