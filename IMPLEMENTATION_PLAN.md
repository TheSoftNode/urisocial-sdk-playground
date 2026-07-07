# URI Social SDK Playground - Implementation Plan

## Overview
A complete client application that integrates all URI Social SDK features in a modern, professional dashboard.

## Design System
- **Colors**: Pink (#f93a87), Blue (#3b82f6), Green (#22c55e), Gray (white to dark #171717)
- **NO Gradients**: Solid colors only
- **Modern & Clean**: Minimalist design with proper spacing
- **Responsive**: Mobile-first approach
- **Collapsible Sidebar**: Desktop navigation

## Architecture

### Authentication Flow
1. User visits playground
2. Sign up / Login (stored in localStorage for demo)
3. Each user gets API key (from env for demo, or from their backend in production)
4. SDK initialized with user's API key

### Pages Structure

#### 1. Auth Pages (`app/(auth)/`)
- `/login` - Login form
- `/signup` - Signup form
- Simple, clean forms with pink CTA buttons

#### 2. Dashboard Pages (`app/dashboard/`)

##### a. Overview (`/dashboard`)
- Welcome message
- Quick stats (drafts count, content generated, etc.)
- Recent activity
- Quick actions (Generate Content, Create Draft, etc.)

##### b. Brand Profile (`/dashboard/brand`)
Components:
- `BrandProfileForm.tsx` - Main profile editing
- `LogoUpload.tsx` - Logo upload with preview
- `ColorPicker.tsx` - Brand colors selection
- `VoicePersonality.tsx` - Brand voice quiz/settings
- `ContentPillars.tsx` - Content strategy
- `TargetAudience.tsx` - Audience settings

SDK Methods Used:
- `client.brandProfile.get()`
- `client.brandProfile.update()`
- `client.brandProfile.uploadLogo()`
- `client.brandProfile.analyzeVoice()`

##### c. Content Generator (`/dashboard/content`)
Components:
- `ContentForm.tsx` - Seed content input, platform selection
- `PlatformSelector.tsx` - Multi-select platforms
- `ImageUpload.tsx` - Reference image upload
- `GenerationOptions.tsx` - Hashtags, emojis, etc.
- `GeneratedPreview.tsx` - Preview generated content

SDK Methods:
- `client.content.generate()`
- `client.images.generate()`

##### d. Drafts Management (`/dashboard/drafts`)
Components:
- `DraftsList.tsx` - Table/grid of all drafts
- `DraftCard.tsx` - Individual draft display
- `DraftFilter.tsx` - Filter by platform, date, etc.
- `DraftActions.tsx` - Edit, Delete, Schedule, Publish

SDK Methods:
- `client.drafts.list()`
- `client.drafts.get()`
- `client.drafts.update()`
- `client.drafts.delete()`
- `client.drafts.schedule()`

##### e. Calendar (`/dashboard/calendar`)
Components:
- `CalendarView.tsx` - Monthly/Weekly view
- `ScheduledPostCard.tsx` - Posts on calendar
- `AddToCalendar.tsx` - Schedule new post
- `BulkSchedule.tsx` - Bulk scheduling

SDK Methods:
- `client.calendar.list()`
- `client.calendar.schedule()`
- `client.calendar.update()`
- `client.calendar.delete()`

##### f. Analytics (`/dashboard/analytics`)
Components:
- `AnalyticsOverview.tsx` - Key metrics dashboard
- `PerformanceCharts.tsx` - Engagement charts
- `TopPosts.tsx` - Best performing posts
- `AudienceInsights.tsx` - Audience demographics
- `CompetitorAnalysis.tsx` - Competitor tracking

SDK Methods:
- `client.analytics.getPerformance()`
- `client.analytics.getInsights()`
- `client.analytics.getCompetitors()`

##### g. Connections (`/dashboard/connections`)
Components:
- `ConnectionsList.tsx` - All connected platforms
- `ConnectPlatform.tsx` - OAuth connection flow
- `PlatformCard.tsx` - Platform status card
- `ConnectionSettings.tsx` - Per-platform settings

SDK Methods:
- `client.connections.list()`
- `client.connections.connect()`
- `client.connections.disconnect()`
- `client.connections.getStatus()`

##### h. Video Generation (`/dashboard/video`)
Components:
- `VideoStoryboardForm.tsx` - Create storyboard
- `VideoSceneEditor.tsx` - Edit scenes
- `VideoPreview.tsx` - Preview video
- `VideoExport.tsx` - Export options

SDK Methods:
- `client.video.generateStoryboard()`
- `client.video.generateScript()`
- `client.video.list()`

##### i. Blog Generator (`/dashboard/blog`)
Components:
- `BlogForm.tsx` - Topic, keywords, length
- `BlogOutline.tsx` - Structure editor
- `BlogPreview.tsx` - Formatted preview
- `BlogExport.tsx` - Export as HTML/Markdown

SDK Methods:
- `client.blog.generate()`
- `client.blog.generateOutline()`

##### j. Auto-Generate (`/dashboard/auto-generate`)
Components:
- `AutoGenerateSettings.tsx` - Configure automation
- `ContentPillarRules.tsx` - Rules per pillar
- `ScheduleConfig.tsx` - Posting schedule
- `AutoGenerateHistory.tsx` - Generated content log

SDK Methods:
- `client.autoGenerate.enable()`
- `client.autoGenerate.disable()`
- `client.autoGenerate.getConfig()`

### SDK Integration (`lib/sdk/`)

#### `client.ts`
```typescript
import { URISocial } from '@urisocial/sdk';

let client: URISocial | null = null;

export function initializeSDK(apiKey: string, endUserId?: string) {
  client = new URISocial({
    apiKey,
    endUserId,
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  });
  return client;
}

export function getSDKClient() {
  if (!client) {
    throw new Error('SDK not initialized');
  }
  return client;
}
```

#### SDK Provider (`lib/sdk/sdk-provider.tsx`)
```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { URISocial } from '@urisocial/sdk';
import { useAuth } from '@/lib/auth/auth-context';
import { initializeSDK } from './client';

const SDKContext = createContext<URISocial | null>(null);

export function SDKProvider({ children }) {
  const { user } = useAuth();
  const [client, setClient] = useState<URISocial | null>(null);

  useEffect(() => {
    if (user?.apiKey) {
      const sdk = initializeSDK(user.apiKey, user.id);
      setClient(sdk);
    }
  }, [user]);

  return <SDKContext.Provider value={client}>{children}</SDKContext.Provider>;
}

export function useSDK() {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within SDKProvider');
  }
  return context;
}
```

## Implementation Steps

1. ✅ Create auth system
2. ✅ Create dashboard layout
3. Create brand profile page
4. Create content generator
5. Create drafts management
6. Create calendar
7. Create analytics
8. Create connections
9. Create video generation
10. Create blog generation
11. Add auto-generate
12. Polish UI/UX
13. Add loading states
14. Add error handling
15. Test all SDK methods
16. Document usage

## Next Steps
Review this plan and confirm before I proceed with full implementation.
