# URI Social SDK Playground

A Next.js application demonstrating the usage of URI Social React SDK for AI-powered social media content generation.

## Features

- **Content Generation**: Generate platform-optimized content for Instagram, Facebook, Twitter, LinkedIn, and TikTok
- **Image Support**: Include reference images in your content generation requests
- **Customization Options**: Control hashtags, emojis, tone, and more
- **Real-time Preview**: See generated content for each platform instantly
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A URI Social API key ([Get one here](https://dashboard.urisocial.com))

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.local.example .env.local
```

3. Add your URI Social credentials to `.env.local`:

```env
NEXT_PUBLIC_URISOCIAL_API_KEY=your-api-key-here
NEXT_PUBLIC_URISOCIAL_WORKSPACE_ID=your-workspace-id
```

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## SDK Usage Example

This playground demonstrates how to use the URI Social React SDK in your applications:

```tsx
import { URISocialProvider, useContentGeneration } from '@urisocial/react';

function App() {
  return (
    <URISocialProvider apiKey="your-api-key" workspaceId="your-workspace-id">
      <ContentGenerator />
    </URISocialProvider>
  );
}

function ContentGenerator() {
  const { content, generate, isGenerating } = useContentGeneration();

  const handleGenerate = async () => {
    await generate({
      seedContent: 'Launch our new product tomorrow!',
      platforms: ['instagram', 'facebook', 'twitter'],
      includeHashtags: true,
      includeEmojis: true,
      imageUrl: 'https://example.com/product.jpg',
    });
  };

  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? 'Generating...' : 'Generate Content'}
    </button>
  );
}
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **SDK**: @urisocial/react ^2.0.2
- **Icons**: Lucide React

## Learn More

- [URI Social SDK Documentation](https://docs.urisocial.com)
- [API Reference](https://dashboard.urisocial.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
