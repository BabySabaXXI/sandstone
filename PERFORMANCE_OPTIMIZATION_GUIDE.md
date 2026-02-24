# Sandstone Performance Optimization Guide

This guide documents all the performance optimizations implemented in the Sandstone application.

## Table of Contents

1. [Bundle Size Optimization](#bundle-size-optimization)
2. [Code Splitting](#code-splitting)
3. [Lazy Loading](#lazy-loading)
4. [Image Optimization](#image-optimization)
5. [Resource Hints](#resource-hints)
6. [Virtualization](#virtualization)
7. [Performance Hooks](#performance-hooks)
8. [Monitoring](#monitoring)

---

## Bundle Size Optimization

### Webpack Configuration

The `next.config.performance.js` includes advanced webpack optimizations:

```javascript
webpack: (config, { dev, isServer }) => {
  if (!dev && !isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: { /* third-party libraries */ },
        react: { /* React ecosystem */ },
        ui: { /* UI components */ },
        common: { /* shared code */ },
        styles: { /* CSS */ },
      },
    };
  }
}
```

### Package Import Optimization

Next.js 14's `optimizePackageImports` feature is configured for:

- `lucide-react`
- `framer-motion`
- `date-fns`
- `@supabase/supabase-js`
- `@radix-ui/react-*`
- `recharts`
- `chart.js`

### Tree Shaking

Enabled in production:

```javascript
config.optimization.usedExports = true;
config.optimization.sideEffects = false;
```

---

## Code Splitting

### Route-Based Code Splitting

Components are automatically split by route using Next.js App Router.

### Component-Level Code Splitting

Use the `createDynamicComponent` utility:

```typescript
import { createDynamicComponent } from '@/components/performance';

const HeavyChart = createDynamicComponent(
  () => import('@/components/charts/heavy-chart'),
  { 
    prefetch: true, 
    prefetchDelay: 2000 
  }
);
```

### Pre-configured Lazy Components

```typescript
import { 
  LazyDashboardStats,
  LazyRecentActivity,
  LazyFlashcardsContent,
  // ... etc
} from '@/components/performance';
```

---

## Lazy Loading

### Dynamic Imports

```typescript
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./heavy-component'));

function MyPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Intersection Observer Lazy Loading

```typescript
import { OptimizedImage } from '@/components/performance';

<OptimizedImage
  src="/large-image.jpg"
  alt="Description"
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## Image Optimization

### OptimizedImage Component

Features:
- Automatic WebP/AVIF format detection
- Lazy loading with Intersection Observer
- Blur placeholder support
- Responsive srcset generation
- Priority loading for critical images

```typescript
import { OptimizedImage, ResponsiveImage, LazyImage } from '@/components/performance';

// Basic usage
<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>

// Responsive
<ResponsiveImage
  src="/image.jpg"
  alt="Description"
  breakpoints={[640, 750, 828, 1080, 1200]}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Lazy loaded with skeleton
<LazyImage
  src="/image.jpg"
  alt="Description"
  skeletonClassName="rounded-lg"
/>
```

### Next.js Image Configuration

```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 86400,
}
```

---

## Resource Hints

### PerformanceResourceHints Component

```typescript
import { PerformanceResourceHints } from '@/components/performance';

<PerformanceResourceHints
  preconnectDomains={[
    'https://api.moonshot.cn',
    'https://*.supabase.co',
  ]}
  preloadResources={[
    { url: '/fonts/inter-var.woff2', as: 'font', crossOrigin: true },
    { url: '/critical-image.png', as: 'image' },
  ]}
  prefetchPages={['/dashboard', '/flashcards']}
/>
```

### Individual Hint Components

```typescript
import { 
  DNSPrefetch, 
  Preconnect, 
  Prefetch, 
  Preload, 
  Prerender 
} from '@/components/performance';
```

### Prefetch on Hover

```typescript
import { PrefetchOnHover } from '@/components/performance';

<PrefetchOnHover href="/dashboard">
  <Link href="/dashboard">Dashboard</Link>
</PrefetchOnHover>
```

---

## Virtualization

### VirtualList Component

For long lists, only renders visible items:

```typescript
import { VirtualList } from '@/components/performance';

<VirtualList
  items={largeArray}
  renderItem={(item, index) => <ListItem data={item} />}
  itemHeight={64}
  containerHeight={400}
  overscan={5}
  onEndReached={() => loadMore()}
/>
```

### VirtualGrid Component

For grid layouts:

```typescript
import { VirtualGrid } from '@/components/performance';

<VirtualGrid
  items={largeArray}
  renderItem={(item) => <Card data={item} />}
  itemHeight={280}
  columns={3}
  gap={16}
  containerHeight={600}
/>
```

### WindowScroller

For full-page virtualization:

```typescript
import { WindowScroller } from '@/components/performance';

<WindowScroller
  items={largeArray}
  renderItem={(item, index, style) => (
    <div style={style}><Item data={item} /></div>
  )}
  itemHeight={100}
/>
```

---

## Performance Hooks

### Debounce & Throttle

```typescript
import { 
  useDebounce, 
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback 
} from '@/components/performance';

// Debounce a value
const debouncedSearch = useDebounce(searchQuery, 300);

// Debounce a callback
const debouncedSave = useDebouncedCallback(saveData, 500);

// Throttle scroll events
const throttledScroll = useThrottledCallback(handleScroll, 100);
```

### Intersection Observer

```typescript
import { useIntersectionObserver } from '@/components/performance';

const [ref, entry, hasTriggered] = useIntersectionObserver({
  threshold: 0.5,
  triggerOnce: true,
});

// Use ref on element
<div ref={ref}>Content</div>
```

### Media Queries

```typescript
import { 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop,
  usePrefersReducedMotion,
  usePrefersReducedData
} from '@/components/performance';

const isMobile = useIsMobile();
const prefersReducedMotion = usePrefersReducedMotion();
```

### Network Status

```typescript
import { useNetworkStatus } from '@/components/performance';

const { online, effectiveType, saveData } = useNetworkStatus();

// Adapt to slow connections
if (effectiveType === '2g' || saveData) {
  // Load low-res images
}
```

### Web Vitals

```typescript
import { useWebVitals } from '@/components/performance';

const { fcp, lcp, fid, cls, ttfb } = useWebVitals();
```

---

## Monitoring

### PerformanceMonitor Component

```typescript
import { PerformanceMonitor } from '@/components/performance';

<PerformanceMonitor
  onMetric={(metric) => {
    console.log(metric.name, metric.value, metric.rating);
  }}
  reportToAnalytics={true}
/>
```

### Bundle Size Monitoring

```typescript
import { useBundleMonitor, BundleSizeWarning } from '@/components/performance';

function App() {
  const metrics = useBundleMonitor();
  
  return (
    <>
      {metrics && (
        <div>Total: {(metrics.totalSize / 1024).toFixed(2)} KB</div>
      )}
      <BundleSizeWarning maxSize={500} />
    </>
  );
}
```

---

## Best Practices

### 1. Use Skeletons for Loading States

```typescript
import { DashboardSkeleton } from '@/components/performance/skeletons';

<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>
```

### 2. Preload Critical Resources

```typescript
import { preloadCriticalResources } from '@/components/performance';

useEffect(() => {
  preloadCriticalResources();
}, []);
```

### 3. Lazy Load Below-the-Fold Content

```typescript
import { useIntersectionObserver } from '@/components/performance';

const [ref, inView] = useIntersectionObserver({ triggerOnce: true });

<div ref={ref}>
  {inView && <HeavyComponent />}
</div>
```

### 4. Adapt to User Preferences

```typescript
const prefersReducedMotion = usePrefersReducedMotion();
const { effectiveType } = useNetworkStatus();

<motion.div
  animate={prefersReducedMotion ? {} : { opacity: 1 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
>
  {/* Content */}
</motion.div>
```

### 5. Virtualize Large Lists

Always use virtualization for lists with more than 20 items:

```typescript
// ❌ Bad - renders all items
<div>
  {items.map(item => <Item key={item.id} {...item} />)}
</div>

// ✅ Good - only renders visible items
<VirtualList
  items={items}
  renderItem={(item) => <Item {...item} />}
  itemHeight={64}
  containerHeight={400}
/>
```

---

## Performance Budget

Configured in `PERFORMANCE_BUDGET`:

```typescript
{
  javascript: 200,    // KB
  css: 50,            // KB
  images: 500,        // KB
  total: 1000,        // KB
  requests: 50,
  ttfb: 600,          // ms
  fcp: 1800,          // ms
  lcp: 2500,          // ms
  fid: 100,           // ms
  cls: 0.1,
}
```

---

## Build & Analyze

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true npm run build
```

### Performance Audit

```bash
# Run Lighthouse audit
npm run lighthouse
```

---

## Migration Guide

### Step 1: Update next.config.js

Replace your current `next.config.js` with `next.config.performance.js`.

### Step 2: Update Layout

Replace `app/layout.tsx` with `app/layout-optimized.tsx`.

### Step 3: Add Performance Components

Import and use performance components as needed:

```typescript
import { 
  OptimizedImage,
  VirtualList,
  PerformanceMonitor 
} from '@/components/performance';
```

### Step 4: Virtualize Lists

Replace regular lists with `VirtualList` or `VirtualGrid` for large datasets.

### Step 5: Add Skeletons

Add skeleton loading states for better perceived performance.

---

## Troubleshooting

### High Bundle Size

1. Check for unused dependencies: `npm run analyze`
2. Use dynamic imports for heavy components
3. Enable tree shaking

### Slow Initial Load

1. Add resource hints (preconnect, preload)
2. Inline critical CSS
3. Use skeleton loading states

### Slow List Rendering

1. Use virtualization for lists > 20 items
2. Memoize list items with `React.memo`
3. Use `useCallback` for event handlers

### Image Loading Issues

1. Use `OptimizedImage` component
2. Provide blur placeholders
3. Set appropriate `sizes` attribute
