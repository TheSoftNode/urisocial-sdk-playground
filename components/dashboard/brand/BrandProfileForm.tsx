'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useToast } from '@/components/ui/toast';
import { INDUSTRIES } from '@/lib/constants/industries';
import { LoadingState } from '@/components/ui/loading-state';

interface BrandBasics {
  brand_name?: string;
  industry?: string;
  website?: string;
  tagline?: string;
  product_description?: string;
}

export function BrandProfileForm() {
  const client = useSDK();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BrandBasics>({
    brand_name: '',
    industry: '',
    website: '',
    tagline: '',
    product_description: '',
  });
  // True once the user picks "Other" (or the loaded value isn't in the
  // preset list) — shows a free-text field instead of the dropdown.
  const [customIndustry, setCustomIndustry] = useState(false);

  const loadProfile = async () => {
    if (!client) {
      console.error('SDK client not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await client.brandProfile.get();
      if (response.responseData) {
        const industry = response.responseData.industry || '';
        setFormData({
          brand_name: response.responseData.brand_name || '',
          industry,
          website: response.responseData.website || '',
          tagline: response.responseData.tagline || '',
          product_description: response.responseData.product_description || '',
        });
        setCustomIndustry(!!industry && !(INDUSTRIES as readonly string[]).includes(industry));
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to load brand profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const handleSave = async () => {
    if (!client) {
      showToast('SDK client is not ready yet. Please try again in a moment.', 'error');
      return;
    }

    try {
      setSaving(true);
      await client.brandProfile.update(formData);
      showToast('Brand basics saved.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save brand basics.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading brand basics…" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Basics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="brand_name">Brand Name *</Label>
          <Input
            id="brand_name"
            value={formData.brand_name}
            onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
            placeholder="Your brand name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="industry">Industry *</Label>
          {customIndustry ? (
            <div className="mt-1 flex gap-2">
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Your industry"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomIndustry(false);
                  setFormData({ ...formData, industry: '' });
                }}
                className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Choose from list
              </button>
            </div>
          ) : (
            <select
              id="industry"
              value={formData.industry || ''}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  setCustomIndustry(true);
                  setFormData({ ...formData, industry: '' });
                } else {
                  setFormData({ ...formData, industry: e.target.value });
                }
              }}
              className="w-full mt-1 h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://yourbrand.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="Your brand's catchy tagline"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="product_description">Product Description *</Label>
          <Textarea
            id="product_description"
            value={formData.product_description}
            onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
            placeholder="Describe what your brand offers..."
            rows={4}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Be specific about your products/services for better AI content generation
          </p>
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
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
