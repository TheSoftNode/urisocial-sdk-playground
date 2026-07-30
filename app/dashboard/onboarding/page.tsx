'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Loader2,
  CheckCircle2,
  XCircle,
  Rocket,
  Shirt,
  UtensilsCrossed,
} from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { INDUSTRIES } from '@/lib/constants/industries';
import { useAuth } from '@/lib/auth/auth-context';

type StepId = 'welcome' | 'basics' | 'voice' | 'review' | 'done';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'basics', label: 'Brand Basics' },
  { id: 'voice', label: 'Voice & Colors' },
  { id: 'review', label: 'Save' },
  { id: 'done', label: 'Done' },
];

const VOICE_OPTIONS = [
  { id: 'professional', label: 'Professional', description: 'Formal, authoritative, expert' },
  { id: 'friendly', label: 'Friendly', description: 'Warm, approachable, conversational' },
  { id: 'playful', label: 'Playful', description: 'Fun, energetic, lighthearted' },
  { id: 'inspiring', label: 'Inspiring', description: 'Motivational, uplifting, empowering' },
  { id: 'educational', label: 'Educational', description: 'Informative, teaching-focused' },
  { id: 'luxury', label: 'Luxury', description: 'Sophisticated, premium, exclusive' },
];

const COLOR_PRESETS = [
  '#f93a87',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#0ea5e9',
  '#111827',
];

const BRAND_TEMPLATES = {
  tech: {
    label: 'Tech Startup',
    icon: Rocket,
    brandName: 'TechFlow AI',
    industry: 'Technology',
    description: 'AI-powered developer tools for modern engineering teams.',
    brandVoice: 'professional',
    colors: ['#3b82f6', '#111827'],
  },
  fashion: {
    label: 'Fashion Brand',
    icon: Shirt,
    brandName: 'StyleVibe',
    industry: 'Fashion',
    description: 'Bold, trend-forward apparel for young urban professionals.',
    brandVoice: 'playful',
    colors: ['#f93a87', '#f59e0b'],
  },
  restaurant: {
    label: 'Restaurant',
    icon: UtensilsCrossed,
    brandName: 'The Urban Kitchen',
    industry: 'Food & Beverage',
    description: 'Warm, community-driven neighborhood dining.',
    brandVoice: 'friendly',
    colors: ['#ef4444', '#f59e0b'],
  },
} as const;

function AgentBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-sm"
        style={{ background: 'linear-gradient(135deg, #f93a87, #3b82f6)' }}
      >
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="max-w-xl rounded-2xl rounded-tl-sm border border-pink-100 bg-pink-50/60 px-4 py-3 text-sm leading-relaxed text-gray-700">
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ stepIndex }: { stepIndex: number }) {
  const pct = (stepIndex / (STEPS.length - 1)) * 100;
  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`text-[11px] font-medium transition-colors ${
              i <= stepIndex ? 'text-[#f93a87]' : 'text-gray-400'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f93a87, #3b82f6)' }}
        />
      </div>
    </div>
  );
}

function VoiceCard({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition-all ${
        active ? 'border-[#f93a87] bg-pink-50' : 'border-gray-200 bg-white hover:border-pink-300'
      }`}
    >
      <p className={`text-sm font-semibold ${active ? 'text-[#f93a87]' : 'text-gray-900'}`}>{label}</p>
      <p className="mt-0.5 text-[11px] text-gray-500">{desc}</p>
    </button>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  loading,
  showBack = true,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
  loading?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {showBack && onBack && (
        <Button variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      )}
      <Button
        onClick={onNext}
        disabled={nextDisabled || loading}
        style={{ backgroundColor: '#f93a87' }}
        className="ml-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Working...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const client = useSDK();
  const { user } = useAuth();
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex].id;

  // Brand profile fields
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState(false);
  const [website, setWebsite] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandVoice, setBrandVoice] = useState('professional');
  const [voiceSample, setVoiceSample] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const goNext = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const applyTemplate = (key: keyof typeof BRAND_TEMPLATES) => {
    const t = BRAND_TEMPLATES[key];
    setBrandName(t.brandName);
    setIndustry(t.industry);
    setDescription(t.description);
    setBrandVoice(t.brandVoice);
    setBrandColors([...t.colors]);
  };

  const toggleColor = (c: string) => {
    setBrandColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : prev.length < 3 ? [...prev, c] : prev
    );
  };

  const handleAnalyzeVoice = async () => {
    if (!client || !voiceSample.trim()) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    try {
      const result = await client.brandProfile.analyzeVoiceSamples([voiceSample]);
      if (VOICE_OPTIONS.some((v) => v.id === result.derived_voice)) {
        setBrandVoice(result.derived_voice);
      }
    } catch (err: any) {
      setAnalyzeError(err.message || 'Failed to analyze voice');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!client) {
      setSaveError('SDK client is not ready yet. Please try again in a moment.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      // No end-user id to set here — the SDK provider already scoped this
      // client to the signed-in playground account when it was created.
      await client.brandProfile.update({
        brand_name: brandName,
        industry,
        website,
        region: region || undefined,
        product_description: description,
        brand_colors: brandColors,
        derived_voice: brandVoice,
        voice_sample: voiceSample || undefined,
        onboarding_completed: true,
      });
      goNext();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save brand profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Let&apos;s set up your brand so URI Social can start creating content that sounds like you.
        </p>
      </div>

      <ProgressBar stepIndex={stepIndex} />

      <Card className="border border-gray-200">
        <CardContent className="p-6">
          {/* ══ WELCOME ══ */}
          {step === 'welcome' && (
            <div className="py-2 text-center">
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-md"
                style={{ background: 'linear-gradient(135deg, #f93a87, #3b82f6)' }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Meet your AI social media manager</h2>
              <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-600">
                A few quick steps and I&apos;ll know your brand well enough to write and design posts
                that sound like you wrote them yourself.
              </p>
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {['Brand Basics', 'Voice', 'Colors'].map((label) => (
                  <span
                    key={label}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <Button onClick={goNext} style={{ backgroundColor: '#f93a87' }}>
                Let&apos;s get started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ══ BASICS ══ */}
          {step === 'basics' && (
            <div>
              <AgentBubble>
                First things first — what&apos;s your brand called? Pick a quick-fill template to
                see it in action, or fill it in yourself.
              </AgentBubble>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {(Object.keys(BRAND_TEMPLATES) as (keyof typeof BRAND_TEMPLATES)[]).map((key) => {
                  const t = BRAND_TEMPLATES[key];
                  const Icon = t.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => applyTemplate(key)}
                      className="rounded-xl border-2 border-gray-200 p-3 text-center transition-all hover:border-pink-300"
                    >
                      <Icon className="mx-auto mb-1.5 h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-700">{t.label}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2">Brand Name *</Label>
                  <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Bloom Coffee Roasters" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2">Industry</Label>
                    {customIndustry ? (
                      <div className="flex gap-2">
                        <Input
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="Your industry"
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomIndustry(false);
                            setIndustry('');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                        >
                          Choose from list
                        </button>
                      </div>
                    ) : (
                      <select
                        value={industry}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setCustomIndustry(true);
                            setIndustry('');
                          } else {
                            setIndustry(e.target.value);
                          }
                        }}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <Label className="mb-2">City</Label>
                    <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Austin, TX" />
                  </div>
                </div>
                <div>
                  <Label className="mb-2">Website (optional)</Label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourbrand.com" />
                </div>
                <div>
                  <Label className="mb-2">What does your business do?</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="1-2 sentences about your business..."
                    rows={3}
                  />
                </div>
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Continue" nextDisabled={!brandName.trim()} />
            </div>
          )}

          {/* ══ VOICE & COLORS ══ */}
          {step === 'voice' && (
            <div>
              <AgentBubble>
                Pick a brand voice, or paste a writing sample and let AI detect it for you. Then
                choose up to 3 brand colors — I&apos;ll use these in every post I create.
              </AgentBubble>

              <Label className="mb-2">Brand Voice</Label>
              <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3">
                {VOICE_OPTIONS.map((v) => (
                  <VoiceCard
                    key={v.id}
                    active={brandVoice === v.id}
                    onClick={() => setBrandVoice(v.id)}
                    label={v.label}
                    desc={v.description}
                  />
                ))}
              </div>

              <Label className="mb-2">Or paste a sample and let AI detect the voice</Label>
              <Textarea
                value={voiceSample}
                onChange={(e) => setVoiceSample(e.target.value)}
                placeholder="Paste a caption or paragraph that sounds like your brand..."
                rows={3}
                className="mb-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyzeVoice}
                disabled={analyzing || !voiceSample.trim()}
                style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                    Analyze Voice
                  </>
                )}
              </Button>
              {analyzeError && <p className="mt-2 text-xs text-red-600">{analyzeError}</p>}

              <div className="mt-6">
                <Label className="mb-2">
                  Brand Colors <span className="font-normal text-gray-400">({brandColors.length}/3 selected)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleColor(c)}
                      className="h-8 w-8 rounded-lg transition-all"
                      style={{
                        background: c,
                        border: brandColors.includes(c) ? '3px solid white' : '3px solid transparent',
                        boxShadow: brandColors.includes(c) ? `0 0 0 2px ${c}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Continue" />
            </div>
          )}

          {/* ══ REVIEW & SAVE ══ */}
          {step === 'review' && (
            <div>
              <AgentBubble>
                Here&apos;s what I&apos;ll save to your brand profile. This calls{' '}
                <code className="rounded bg-white/60 px-1 py-0.5">client.brandProfile.update()</code>.
              </AgentBubble>

              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Brand Name</span>
                  <span className="font-medium text-gray-900">{brandName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Industry</span>
                  <span className="font-medium text-gray-900">{industry || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">City</span>
                  <span className="font-medium text-gray-900">{region || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Voice</span>
                  <span className="font-medium capitalize text-gray-900">{brandVoice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Colors</span>
                  <div className="flex gap-1">
                    {brandColors.length > 0 ? (
                      brandColors.map((c) => (
                        <div key={c} className="h-4 w-4 rounded" style={{ background: c }} />
                      ))
                    ) : (
                      <span className="font-medium text-gray-900">—</span>
                    )}
                  </div>
                </div>
              </div>

              {saveError && (
                <Alert variant="destructive" className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <NavButtons onBack={goBack} onNext={handleSaveProfile} nextLabel="Save Brand Profile" loading={saving} />
            </div>
          )}

          {/* ══ DONE ══ */}
          {step === 'done' && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Your brand is set up</h2>
              <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-600">
                {brandName || 'Your brand'} is ready. Head to the Content Generator to create your
                first AI-powered post.
              </p>
              <div className="flex justify-center gap-3">
                <Button style={{ backgroundColor: '#f93a87' }} onClick={() => router.push('/dashboard/content')}>
                  Generate my first post
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Go to dashboard
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
