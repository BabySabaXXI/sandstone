# Sandstone Next.js 14 Optimization Guide

This document outlines the optimizations made to the Sandstone app's Next.js 14 implementation.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Server Components Optimization](#server-components-optimization)
3. [Client Components Optimization](#client-components-optimization)
4. [API Routes & Route Handlers](#api-routes--route-handlers)
5. [Caching Strategies](#caching-strategies)
6. [Build Configuration](#build-configuration)
7. [Performance Optimizations](#performance-optimizations)
8. [Security Enhancements](#security-enhancements)

---

## Architecture Overview

### App Router Structure

```
app/
├── layout.tsx          # Root layout with metadata, fonts, providers
├── page.tsx            # Dashboard (Server Component with streaming)
├── loading.tsx         # Global loading state
├── error.tsx           # Global error boundary
├── not-found.tsx       # 404 page
├── sitemap.ts          # Dynamic sitemap generation
├── grade/
│   └── page.tsx        # Grade page (Server Component)
├── api/
│   ├── chat/route.ts   # Chat API with rate limiting
│   └── grade/route.ts  # Grading API with parallel processing
└── ...
```

### Component Architecture

- **Server Components**: Default for all pages, fetch data server-side
- **Client Components**: Only when interactivity is needed (marked with `"use client"`)
- **Streaming**: Using `Suspense` boundaries for progressive loading

---

## Server Components Optimization

### 1. Root Layout (`app/layout.tsx`)

- **Font Optimization**: Google Fonts with `display: swap` and preload
- **Metadata**: Comprehensive SEO metadata with OpenGraph, Twitter cards
- **Viewport**: Separate viewport export for Next.js 14
- **Preconnect**: DNS preconnect to external APIs for faster loading

```typescript
// Font configuration with performance optimizations
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",      // Prevents FOIT
  preload: true,        // Preloads critical fonts
  fallback: ["system-ui", "sans-serif"],
});
```

### 2. Page Components

- **Server-side data fetching**: Using `createClient()` from supabase/server
- **Authentication checks**: Done server-side before rendering
- **Streaming**: Suspense boundaries with skeleton loaders

```typescript
// Server Component pattern
export default async function HomePage() {
  const user = await getUserData();
  if (!user) redirect("/login");
  
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent user={user} />
    </Suspense>
  );
}
```

### 3. Dynamic Rendering

```typescript
// Force dynamic rendering for user-specific content
export const dynamic = "force-dynamic";

// ISR with revalidation
export const revalidate = 60; // Revalidate every 60 seconds
```

---

## Client Components Optimization

### 1. Code Splitting

- Components are automatically code-split by Next.js
- Dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />,
  ssr: false, // Disable SSR if not needed
});
```

### 2. State Management

- Use Zustand for global state (already in place)
- Keep state close to where it's used
- Use `useCallback` for event handlers passed to children

### 3. Memoization

```typescript
// Memoize expensive computations
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

---

## API Routes & Route Handlers

### 1. Chat API (`app/api/chat/route.ts`)

**Optimizations:**
- Request validation with Zod
- Rate limiting (30 requests/minute per user)
- Timeout handling (30 seconds)
- Proper error handling with status codes
- Context window management (last 6 messages)

```typescript
// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  // Implementation
}
```

### 2. Grade API (`app/api/grade/route.ts`)

**Optimizations:**
- Parallel examiner processing with `Promise.allSettled()`
- Individual timeouts per examiner (25 seconds)
- JSON response format for structured output
- Comprehensive error handling with fallbacks

```typescript
// Parallel processing
const examinerPromises = economicsExaminers.map(async (examiner) => {
  // Process each examiner independently
});

const results = await Promise.allSettled(examinerPromises);
```

### 3. Response Caching Headers

```typescript
return NextResponse.json(data, {
  headers: {
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  },
});
```

---

## Caching Strategies

### 1. Static Asset Caching

```javascript
// next.config.js
{
  source: '/_next/static/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

### 2. API Route Caching

- Chat/Grade APIs: No caching (private, real-time)
- User stats: Short cache (60 seconds)

### 3. Page Caching

```typescript
// ISR for semi-static content
export const revalidate = 60;

// Dynamic for user-specific content
export const dynamic = "force-dynamic";
```

### 4. Data Fetching Caching

```typescript
// Server-side fetch with caching
const response = await fetch(url, {
  next: { revalidate: 60 }, // Cache for 60 seconds
});
```

---

## Build Configuration

### 1. next.config.js

**Key Optimizations:**

```javascript
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Experimental features
  experimental: {
    ppr: true,  // Partial Prerendering
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

### 2. TypeScript Configuration

- Strict mode enabled
- Path aliases for cleaner imports
- Source maps for debugging

---

## Performance Optimizations

### 1. Font Loading

- Google Fonts with `display: swap`
- Preload critical fonts
- System font fallbacks

### 2. Image Optimization

- Use Next.js `<Image>` component
- WebP/AVIF formats
- Responsive sizes

### 3. Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Vendor chunk separation

### 4. Streaming

- Suspense boundaries for progressive loading
- Skeleton screens for better UX
- Server Components for initial render

### 5. Bundle Size

```javascript
// Optimize package imports
experimental: {
  optimizePackageImports: [
    'lucide-react',  // Tree-shake icons
    'framer-motion', // Tree-shake animations
    'date-fns',      // Tree-shake date utilities
  ],
}
```

---

## Security Enhancements

### 1. Middleware (`middleware.ts`)

- Authentication checks
- Route protection
- Security headers

```typescript
// Security headers
response.headers.set("X-Frame-Options", "DENY");
response.headers.set("X-Content-Type-Options", "nosniff");
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
```

### 2. next.config.js Headers

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
      ],
    },
  ];
}
```

### 3. Rate Limiting

- Implemented in API routes
- Per-user rate limits
- Configurable windows

---

## SEO & Metadata

### 1. Dynamic Metadata

```typescript
export const metadata: Metadata = {
  title: {
    default: "Sandstone - AI-Powered Learning",
    template: "%s | Sandstone",
  },
  description: "AI-powered A-Level response grading...",
  openGraph: {
    // OpenGraph configuration
  },
  twitter: {
    // Twitter card configuration
  },
};
```

### 2. Sitemap

- Dynamic sitemap generation
- Automatic route discovery
- Configurable change frequencies

### 3. Robots.txt

- Search engine crawling rules
- API route exclusions

---

## Monitoring & Debugging

### 1. Error Handling

- Global error boundary (`error.tsx`)
- API error responses with status codes
- Console logging in development

### 2. Performance Monitoring

```typescript
// Log API response times
const startTime = Date.now();
// ... API call
const duration = Date.now() - startTime;
console.log(`API success: ${duration}ms`);
```

### 3. Development Features

- Source maps enabled
- Strict TypeScript checking
- React Strict Mode

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase credentials set
- [ ] Kimi API key configured
- [ ] Build passes without errors
- [ ] TypeScript checks pass
- [ ] ESLint checks pass
- [ ] All tests pass
- [ ] Performance audit completed
- [ ] Security headers verified
- [ ] SEO metadata validated

---

## Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
