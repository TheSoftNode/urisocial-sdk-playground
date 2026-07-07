'use client';

import { useState, useEffect, useRef } from 'react';
import { BrandProfileForm } from '@/components/dashboard/brand/BrandProfileForm';
import { LogoUpload } from '@/components/dashboard/brand/LogoUpload';
import { ColorPicker } from '@/components/dashboard/brand/ColorPicker';
import { VoicePersonality } from '@/components/dashboard/brand/VoicePersonality';
import { ContentPillars } from '@/components/dashboard/brand/ContentPillars';
import { useSDK } from '@/lib/sdk/sdk-provider';

export default function BrandProfilePage() {
  const client = useSDK();
  const [logoUrl, setLogoUrl] = useState<string>();
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (client && !hasLoaded.current) {
      hasLoaded.current = true;
      loadProfile();
    }
  }, [client]);

  const loadProfile = async () => {
    if (!client) return;

    try {
      const response = await client.brandProfile.get();
      setLogoUrl(response.responseData?.logo_url);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Profile</h1>
        <p className="text-gray-600">
          Configure your brand identity to get personalized AI-generated content
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <BrandProfileForm />
          <ColorPicker />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <LogoUpload logoUrl={logoUrl} />
          <VoicePersonality />
          <ContentPillars />
        </div>
      </div>
    </div>
  );
}
