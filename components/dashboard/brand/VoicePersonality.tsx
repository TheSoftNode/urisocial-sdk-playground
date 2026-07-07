'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Sparkles } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';

const VOICE_OPTIONS = [
  { id: 'professional', name: 'Professional', description: 'Formal, authoritative, expert' },
  { id: 'friendly', name: 'Friendly', description: 'Warm, approachable, conversational' },
  { id: 'playful', name: 'Playful', description: 'Fun, energetic, lighthearted' },
  { id: 'inspiring', name: 'Inspiring', description: 'Motivational, uplifting, empowering' },
  { id: 'educational', name: 'Educational', description: 'Informative, teaching-focused' },
  { id: 'luxury', name: 'Luxury', description: 'Sophisticated, premium, exclusive' },
];

export function VoicePersonality() {
  const client = useSDK();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('professional');
  const [voiceSample, setVoiceSample] = useState('');
  const [derivedVoice, setDerivedVoice] = useState('');
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (client && !hasLoaded.current) {
      hasLoaded.current = true;
      loadVoice();
    }
  }, [client]);

  const loadVoice = async () => {
    if (!client) return;

    try {
      setLoading(true);
      const response = await client.brandProfile.get();
      if (response.responseData) {
        setSelectedVoice(response.responseData.derived_voice || 'professional');
        setVoiceSample(response.responseData.voice_sample || '');
        setDerivedVoice(response.responseData.derived_voice || '');
      }
    } catch (error) {
      console.error('Failed to load voice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeVoice = async () => {
    if (!voiceSample.trim()) return;

    try {
      setAnalyzing(true);
      // AI voice analysis - mock for now since SDK method not available
      const mockVoice = 'professional';
      setDerivedVoice(mockVoice);
      setSelectedVoice(mockVoice);
    } catch (error) {
      console.error('Failed to analyze voice:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!client) return;

    try {
      setSaving(true);
      await client.brandProfile.update({
        derived_voice: selectedVoice,
        voice_sample: voiceSample,
      });
    } catch (error) {
      console.error('Failed to save voice:', error);
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
        <CardTitle>Brand Voice & Personality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Options */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select your brand voice:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VOICE_OPTIONS.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedVoice === voice.id
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300'
                }`}
              >
                <p className="font-medium text-gray-900">{voice.name}</p>
                <p className="text-xs text-gray-600 mt-1">{voice.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Sample Analysis */}
        <div className="border-t pt-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Or let AI analyze your brand voice:
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Paste 2-3 paragraphs of your existing content for AI to determine your voice
          </p>
          <Textarea
            value={voiceSample}
            onChange={(e) => setVoiceSample(e.target.value)}
            placeholder="Paste your brand's content here..."
            rows={6}
            className="mb-3"
          />
          <Button
            onClick={handleAnalyzeVoice}
            disabled={analyzing || !voiceSample.trim()}
            variant="outline"
            className="w-full"
            style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Voice
              </>
            )}
          </Button>
          {derivedVoice && (
            <p className="text-sm text-gray-600 mt-2">
              AI detected: <span className="font-medium capitalize">{derivedVoice}</span>
            </p>
          )}
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
              Save Voice Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
