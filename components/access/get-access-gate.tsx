'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, XCircle, Palette, Wand2, CalendarClock } from 'lucide-react';
import { useSDK } from '@/lib/sdk/sdk-provider';
import { useAuth } from '@/lib/auth/auth-context';

export function GetAccessGate() {
  const client = useSDK();
  const { user, grantAccess } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAccess = async () => {
    if (!client) {
      setError('Connecting to URI Social... please try again in a moment.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // First real call under this end user's identity — this is the moment
      // their record gets created on URI Social's side, scoped to this client's
      // API key. No data is fabricated here; onboarding right after is where
      // they fill in their actual brand details.
      await client.brandProfile.get();
      await grantAccess();
      router.push('/dashboard/onboarding');
    } catch (err: any) {
      setError(err.message || 'Failed to get access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg border border-gray-200">
        <CardContent className="p-8 text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full shadow-md"
            style={{ background: 'linear-gradient(135deg, #f93a87, #3b82f6)' }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>

          <h1 className="mb-2 text-xl font-bold text-gray-900">
            {user?.firstName ? `Hi ${user.firstName}, one more step` : 'One more step'}
          </h1>
          <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
            Docerity uses URI Social&apos;s AI tools to write and design your posts. Get access to
            create your own space — your brand, your content, kept separate from every other user.
          </p>

          <div className="mb-6 space-y-2 text-left">
            {[
              { icon: Palette, text: 'Your own brand profile — name, voice, colors' },
              { icon: Wand2, text: 'AI-generated content personalized to your brand' },
              { icon: CalendarClock, text: 'Drafts, calendar, and analytics, all private to you' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                <Icon className="h-4 w-4 flex-shrink-0 text-[#f93a87]" />
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 text-left">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGetAccess}
            disabled={loading}
            className="w-full"
            size="lg"
            style={{ backgroundColor: '#f93a87' }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your access...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Access to URI Social Tools
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
