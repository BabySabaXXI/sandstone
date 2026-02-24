# Sandstone SSR Optimization Guide

This guide documents the Server-Side Rendering (SSR) optimizations implemented in the Sandstone app.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Server Components](#server-components)
4. [Data Fetching](#data-fetching)
5. [Streaming](#streaming)
6. [Caching](#caching)
7. [Hydration](#hydration)
8. [Performance Metrics](#performance-metrics)

## Overview

The Sandstone app has been optimized for Server-Side Rendering with the following goals:

- **Reduce Time to First Byte (TTFB)**: Server-rendered content is delivered faster
- **Minimize Client-Side JavaScript**: Only interactive components ship JS
- **Optimize Data Fetching**: Parallel fetching with intelligent caching
- **Enable Streaming**: Progressive content delivery with Suspense
- **Improve Hydration**: Faster interactivity with optimized hydration

## Architecture

### Component Types

```
app/
├── (app)/                    # App routes group
│   ├── dashboard/
│   │   ├── page.tsx          # Server Component (data fetching)
│   │   └── page-optimized.tsx # Optimized version with streaming
│   ├── documents/
│   │   ├── page.tsx          # Original page
│   │   └── page-optimized.tsx # Optimized version
│   └── layout.tsx            # Server Component layout
├── layout.tsx                # Root layout (Server Component)
└── loading.tsx               # Global loading state

components/
├── ssr/                      # SSR-specific components
│   └── streaming-boundary.tsx # Suspense wrappers & skeletons
├── dashboard/                # Dashboard components
│   ├── dashboard-stats.tsx   # Server Component
│   ├── recent-activity.tsx   # Server Component
│   └── study-progress.tsx    # Server Component
└── documents/                # Document components
    ├── documents-header.tsx  # Server Component
    └── documents-list.tsx    # Client Component (interactivity)

lib/
└── ssr/                      # SSR utilities
    ├── data-fetching.ts      # Server data fetching functions
    └── cache.ts              # Caching utilities
```

### Server vs Client Components

| Component Type | Use Case | Example |
|---------------|----------|---------|
| **Server Component** | Data fetching, static content | `page.tsx`, `layout.tsx` |
| **Client Component** | Interactivity, browser APIs | `documents-list.tsx` |
| **Hybrid** | Server-rendered with client hydration | Components with `use client` |

## Server Components

### Key Principles

1. **Fetch data on the server** - Use Server Components for data fetching
2. **Minimize 'use client'** - Only mark interactive components as client
3. **Pass data as props** - Don't use context for server-fetched data
4. **Use async/await** - Server Components support async directly

### Example: Server Component Page

```tsx
// app/(app)/dashboard/page-optimized.tsx
import { getCurrentUser, fetchDashboardData } from "@/lib/ssr/data-fetching";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";

// Server Component (no 'use client')
export default async function DashboardPage() {
  const user = await getCurrentUser();
  const { stats } = await fetchDashboardData(user.id);
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <DashboardStats data={stats} />
    </div>
  );
}
```

## Data Fetching

### Cached Data Functions

All data fetching functions use React's `cache()` for automatic deduplication:

```tsx
// lib/ssr/data-fetching.ts
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getDashboardStats = cache(async (userId: string) => {
  // Parallel fetching
  const [gradedCount, studySessions, streak] = await Promise.all([
    fetchGradedCount(userId),
    fetchStudySessions(userId),
    fetchStreak(userId),
  ]);
  
  return { gradedCount, studySessions, streak };
});
```

### Parallel Data Fetching

Fetch multiple data sources in parallel for better performance:

```tsx
// Parallel fetching
const [user, documents, flashcards] = await Promise.all([
  getUserProfile(userId),
  getUserDocuments(userId),
  getUserFlashcardDecks(userId),
]);
```

### Error Handling

Use `safeFetch` for graceful error handling:

```tsx
import { safeFetch } from "@/lib/ssr/data-fetching";

const stats = await safeFetch(
  () => getDashboardStats(userId),
  { responsesGraded: 0, studyStreak: 0, timeStudied: 0 }
);
```

## Streaming

### Suspense Boundaries

Wrap async components in Suspense for progressive loading:

```tsx
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ssr/streaming-boundary";

export default async function DashboardPage() {
  return (
    <div>
      {/* Rendered immediately */}
      <WelcomeHeader />
      
      {/* Streamed when ready */}
      <Suspense fallback={<DashboardStats.Skeleton />}>
        <StatsSection userId={user.id} />
      </Suspense>
      
      <Suspense fallback={<RecentActivity.Skeleton />}>
        <ActivitySection userId={user.id} />
      </Suspense>
    </div>
  );
}
```

### Skeleton Components

Each major section has a corresponding skeleton:

```tsx
// components/dashboard/dashboard-stats.tsx
export function DashboardStats({ data }: DashboardStatsProps) {
  // ... component logic
}

// Skeleton for Suspense fallback
DashboardStats.Skeleton = function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-24" />
        </Card>
      ))}
    </div>
  );
};
```

## Caching

### Route Segment Caching

Configure caching per route:

```tsx
// app/(app)/dashboard/page-optimized.tsx
import { routeConfig } from "@/lib/ssr/cache";

export const revalidate = routeConfig.dashboard.revalidate; // 60 seconds
export const dynamic = routeConfig.dashboard.dynamic; // 'auto'
```

### Cache Durations

```ts
// lib/ssr/cache.ts
export const cacheDurations = {
  realtime: 0,      // No cache
  activity: 30,     // 30 seconds
  user: 60,         // 1 minute
  dashboard: 60,    // 1 minute
  medium: 120,      // 2 minutes
  library: 300,     // 5 minutes
  static: 3600,     // 1 hour
};
```

### Cache Revalidation

Invalidate caches after mutations:

```tsx
// Server Action
"use server";

import { invalidateDocumentCache } from "@/lib/ssr/cache";

export async function deleteDocument(documentId: string, userId: string) {
  await db.documents.delete(documentId);
  
  // Invalidate cache
  await invalidateDocumentCache(userId, documentId);
}
```

### unstable_cache

Use `unstable_cache` for function-level caching:

```tsx
import { unstable_cache } from "next/cache";

const getCachedUserData = unstable_cache(
  async (userId: string) => {
    return fetchUserData(userId);
  },
  ["user-data"],
  { revalidate: 60, tags: ["user"] }
);
```

## Hydration

### Optimizing Hydration

1. **Minimize Client Components**: Only hydrate what's necessary
2. **Use `suppressHydrationWarning`**: For theme-related mismatches
3. **Lazy load heavy components**: Use dynamic imports

```tsx
// app/layout.tsx
<html suppressHydrationWarning>
  <body>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </body>
</html>
```

### Dynamic Imports

Lazy load heavy client components:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"), {
  ssr: false, // Disable SSR for browser-only components
  loading: () => <ChartSkeleton />,
});
```

### Provider Optimization

Wrap providers efficiently to minimize re-renders:

```tsx
// contexts/theme-provider.tsx
"use client";

import { memo } from "react";

function ThemeProviderComponent({ children }) {
  // ... provider logic
}

export const ThemeProvider = memo(ThemeProviderComponent);
```

## Performance Metrics

### Key Metrics to Monitor

| Metric | Target | Description |
|--------|--------|-------------|
| TTFB | < 200ms | Time to First Byte |
| FCP | < 1.8s | First Contentful Paint |
| LCP | < 2.5s | Largest Contentful Paint |
| TTI | < 3.8s | Time to Interactive |
| CLS | < 0.1 | Cumulative Layout Shift |

### Measuring Performance

Use Next.js built-in analytics:

```tsx
// next.config.js
module.exports = {
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP', 'TTFB'],
  },
};
```

### Bundle Analysis

Analyze bundle size:

```bash
npm run build
npm run analyze
```

## Migration Guide

### Converting Pages to Optimized SSR

1. **Identify data fetching**: Move data fetching to Server Components
2. **Add Suspense boundaries**: Wrap async components
3. **Create skeletons**: Add loading states
4. **Configure caching**: Set appropriate cache durations
5. **Test thoroughly**: Verify functionality and performance

### Before (Client-Side)

```tsx
// page.tsx (old)
"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);
  
  if (!data) return <Loading />;
  
  return <Dashboard data={data} />;
}
```

### After (Server-Side)

```tsx
// page-optimized.tsx (new)
import { Suspense } from "react";
import { getDashboardData } from "@/lib/ssr/data-fetching";
import { DashboardSkeleton } from "@/components/ssr/streaming-boundary";

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
```

## Best Practices

### Do's

✅ Fetch data in Server Components
✅ Use `cache()` for data deduplication
✅ Implement Suspense boundaries
✅ Create skeleton loading states
✅ Configure appropriate cache durations
✅ Use parallel data fetching with `Promise.all`
✅ Minimize client-side JavaScript

### Don'ts

❌ Fetch data in `useEffect` when possible
❌ Use `use client` unnecessarily
❌ Forget to handle loading states
❌ Cache user-specific data too long
❌ Block rendering with sequential fetches
❌ Ship server code to the client

## Troubleshooting

### Common Issues

**Hydration Mismatch**
```tsx
// Add suppressHydrationWarning to html element
<html suppressHydrationWarning>
```

**Cache Not Updating**
```tsx
// Use revalidateTag after mutations
import { revalidateTag } from "next/cache";
revalidateTag("dashboard");
```

**Data Not Streaming**
```tsx
// Ensure async components are wrapped in Suspense
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

## Resources

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Web Vitals](https://web.dev/vitals/)
