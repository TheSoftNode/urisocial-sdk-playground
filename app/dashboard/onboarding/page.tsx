'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserPlus, FileText, Layers, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';

export default function OnboardingTestPage() {
  const client = useSDK();
  const [endUserId, setEndUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Brand profile form
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandVoice, setBrandVoice] = useState('');

  // Content generation
  const [contentTopic, setContentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const handleQuickFill = (template: 'tech' | 'fashion' | 'restaurant') => {
    const templates = {
      tech: {
        brandName: 'TechFlow AI',
        industry: 'Technology',
        targetAudience: 'Tech professionals, developers, and AI enthusiasts',
        brandVoice: 'Professional yet approachable, data-driven, innovative',
      },
      fashion: {
        brandName: 'StyleVibe',
        industry: 'Fashion',
        targetAudience: 'Young professionals 25-35, fashion-forward, urban lifestyle',
        brandVoice: 'Trendy, bold, confident, Gen Z slang',
      },
      restaurant: {
        brandName: 'The Urban Kitchen',
        industry: 'Food & Beverage',
        targetAudience: 'Food lovers, families, health-conscious millennials',
        brandVoice: 'Warm, inviting, passionate about food, community-focused',
      },
    };

    const t = templates[template];
    setBrandName(t.brandName);
    setIndustry(t.industry);
    setTargetAudience(t.targetAudience);
    setBrandVoice(t.brandVoice);
  };

  const handleCreateBrandProfile = async () => {
    if (!client) {
      setError('SDK client not initialized');
      return;
    }

    if (!endUserId) {
      setError('End User ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Set the end user context
      client.setEndUserId(endUserId);

      // Update brand profile
      const response = await client.brandProfile.update({
        brand_name: brandName,
        industry: industry,
        target_audience: targetAudience,
        voice_personality: brandVoice,
      });

      setResult({
        message: 'Brand profile created successfully!',
        data: response,
        status: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!client) {
      setError('SDK client not initialized');
      return;
    }

    if (!endUserId || !contentTopic) {
      setError('End User ID and Topic are required');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      client.setEndUserId(endUserId);

      const response = await client.content.generate({
        seedContent: contentTopic,
        platforms: ['instagram'],
      });

      setGeneratedContent(response);
      setResult({
        message: 'Content generated successfully!',
        status: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!client) {
      setError('SDK client not initialized');
      return;
    }

    if (!endUserId) {
      setError('End User ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      client.setEndUserId(endUserId);

      const response = await client.brandProfile.update({
        brand_name: brandName,
        industry: industry,
        target_audience: targetAudience,
        voice_personality: brandVoice,
      });

      setResult({
        message: 'Brand profile updated successfully!',
        data: response,
        status: 'success',
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">End-User Onboarding Flow</CardTitle>
              <CardDescription>
                Test the complete user journey from signup to content generation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Visual Flow */}
      <Card className="bg-white border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            User Flow: Signup → Onboarding → Generate → Update
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-sm">User Signs Up (Tab 1: Simple Onboard)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Quick test with just user ID → <code className="bg-gray-100 px-1 rounded">client.setEndUserId('user_001')</code>
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-sm">User Completes Full Onboarding (Tab 2)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Complete brand setup with templates → <code className="bg-gray-100 px-1 rounded">client.brandProfile.update(...)</code>
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-sm">User Updates Profile Later (Tab 3)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Modify brand settings → <code className="bg-gray-100 px-1 rounded">client.brandProfile.update(...)</code>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <p className="font-semibold text-sm">User Generates Content (Tab 4)</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Create posts using their profile → <code className="bg-gray-100 px-1 rounded">client.content.generate(...)</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-2xl mb-2">🔒</div>
              <p className="font-semibold text-xs text-green-900">Data Isolation</p>
              <p className="text-xs text-green-700 mt-1">Each user sees only their data</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-2xl mb-2">⚡</div>
              <p className="font-semibold text-xs text-blue-900">Zero Setup</p>
              <p className="text-xs text-blue-700 mt-1">No database required</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-2xl mb-2">🎯</div>
              <p className="font-semibold text-xs text-purple-900">Auto Context</p>
              <p className="text-xs text-purple-700 mt-1">Brand profile applied automatically</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Tabs */}
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simple">
            <div className="flex flex-col items-start text-xs">
              <span>1️⃣ Simple Onboard</span>
              <span className="text-[10px] text-gray-500 font-normal">Just ID</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="full">
            <div className="flex flex-col items-start text-xs">
              <span>2️⃣ Full Onboarding</span>
              <span className="text-[10px] text-gray-500 font-normal">Complete setup</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="update">
            <div className="flex flex-col items-start text-xs">
              <span>3️⃣ Update Profile</span>
              <span className="text-[10px] text-gray-500 font-normal">Modify settings</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="generate">
            <div className="flex flex-col items-start text-xs">
              <span>4️⃣ Generate Content</span>
              <span className="text-[10px] text-gray-500 font-normal">Test output</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Simple Onboard */}
        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Simple User Onboard</CardTitle>
              <CardDescription>Quick test - just set end-user ID context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="simpleUserId">End User ID *</Label>
                <Input
                  id="simpleUserId"
                  placeholder="user_001"
                  value={endUserId}
                  onChange={(e) => setEndUserId(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  if (client && endUserId) {
                    client.setEndUserId(endUserId);
                    setResult({ message: `Context set to user: ${endUserId}`, status: 'success' });
                  }
                }}
                disabled={!client || !endUserId}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Set User Context
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Full Onboarding */}
        <TabsContent value="full">
          <Card>
            <CardHeader>
              <CardTitle>Full Brand Onboarding</CardTitle>
              <CardDescription>Complete brand setup with quick-fill templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullUserId">End User ID *</Label>
                <Input
                  id="fullUserId"
                  placeholder="demo_user_001"
                  value={endUserId}
                  onChange={(e) => setEndUserId(e.target.value)}
                />
              </div>

              {/* Quick Fill Templates */}
              <div className="space-y-2">
                <Label>Quick Fill Templates</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickFill('tech')} className="text-xs">
                    🚀 Tech Startup
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickFill('fashion')} className="text-xs">
                    👗 Fashion Brand
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickFill('restaurant')} className="text-xs">
                    🍽️ Restaurant
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Brand Name</Label>
                    <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} className="text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Industry</Label>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} className="text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Target Audience</Label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Brand Voice</Label>
                  <Input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} className="text-sm" />
                </div>
              </div>

              <Button
                onClick={handleCreateBrandProfile}
                disabled={loading || !client || !endUserId}
                className="w-full"
                style={{ backgroundColor: '#0A66C2', color: '#fff' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Create Complete Brand Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Update Profile */}
        <TabsContent value="update">
          <Card>
            <CardHeader>
              <CardTitle>Update Brand Profile</CardTitle>
              <CardDescription>Modify existing user's brand settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="updateUserId">End User ID *</Label>
                <Input
                  id="updateUserId"
                  placeholder="demo_user_001"
                  value={endUserId}
                  onChange={(e) => setEndUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Brand Voice</Label>
                <Input value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} />
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={loading || !client || !endUserId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Update Brand Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Generate Content */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate Content</CardTitle>
              <CardDescription>Test content generation with user's brand profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="genUserId">End User ID *</Label>
                <Input
                  id="genUserId"
                  placeholder="demo_user_001"
                  value={endUserId}
                  onChange={(e) => setEndUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Content Topic *</Label>
                <Input
                  id="topic"
                  placeholder="Summer product launch"
                  value={contentTopic}
                  onChange={(e) => setContentTopic(e.target.value)}
                />
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={loading || !client || !endUserId || !contentTopic}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold mb-2 text-sm">Generated Content:</h4>
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(generatedContent, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.status === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{result.message}</AlertDescription>
        </Alert>
      )}

      {result && result.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Response Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto border border-gray-200">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
