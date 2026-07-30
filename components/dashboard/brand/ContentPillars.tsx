'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Save, Loader2 } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';

export function ContentPillars() {
  const client = useSDK();
  const { showToast } = useToast();
  const [pillars, setPillars] = useState<string[]>([]);
  const [newPillar, setNewPillar] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (client && !hasLoaded.current) {
      hasLoaded.current = true;
      loadPillars();
    }
  }, [client]);

  const loadPillars = async () => {
    if (!client) return;

    try {
      setLoading(true);
      const response = await client.brandProfile.get();
      if (response.responseData?.content_pillars) {
        setPillars(response.responseData.content_pillars);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load content pillars.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()]);
      setNewPillar('');
    }
  };

  const handleRemovePillar = (pillar: string) => {
    setPillars(pillars.filter((p) => p !== pillar));
  };

  const handleSave = async () => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    try {
      setSaving(true);
      await client.brandProfile.update({ content_pillars: pillars });
      showToast('Content pillars saved.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save content pillars.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#f93a87' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Pillars</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Define 3-5 main topics your brand focuses on. AI will create content around these themes.
        </p>

        {/* Pillars List */}
        <div className="flex flex-wrap gap-2">
          {pillars.map((pillar) => (
            <div
              key={pillar}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-full"
            >
              <span className="text-sm font-medium text-blue-900">{pillar}</span>
              <button
                onClick={() => handleRemovePillar(pillar)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Pillar */}
        <div className="flex gap-2">
          <Input
            value={newPillar}
            onChange={(e) => setNewPillar(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPillar()}
            placeholder="e.g., Product Updates, Industry News"
            className="flex-1"
          />
          <Button
            onClick={handleAddPillar}
            disabled={!newPillar.trim()}
            variant="outline"
            style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

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
              Save Pillars
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
