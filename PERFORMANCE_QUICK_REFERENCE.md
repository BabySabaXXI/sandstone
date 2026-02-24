# Performance Quick Reference

Quick reference for using performance optimizations in Sandstone.

## Installation

All performance utilities are available from `@/components/performance`:

```typescript
import { 
  // Dynamic imports
  createDynamicComponent,
  LazyDashboardStats,
  
  // Virtualization
  VirtualList,
  VirtualGrid,
  
  // Images
  OptimizedImage,
  LazyImage,
  
  // Resource hints
  PerformanceResourceHints,
  PrefetchOnHover,
  
  // Hooks
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useWebVitals,
  
  // Monitoring
  PerformanceMonitor,
} from '@/components/performance';
```

## Common Patterns

### 1. Lazy Load a Heavy Component

```typescript
const HeavyChart = createDynamicComponent(
  () => import('@/components/charts/heavy-chart'),
  { prefetch: true }
);

// Use it
<Suspense fallback={<Skeleton />}>
  <HeavyChart data={data} />
</Suspense>
```

### 2. Virtualize a Long List

```typescript
<VirtualList
  items={items}
  renderItem={(item, index) => (
    <div key={item.id}>{item.name}</div>
  )}
  itemHeight={64}
  containerHeight={400}
  keyExtractor={(item) => item.id}
/>
```

### 3. Optimize an Image

```typescript
<OptimizedImage
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  loading="lazy"
/>
```

### 4. Debounce Search Input

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch for API calls
useEffect(() => {
  fetchResults(debouncedSearch);
}, [debouncedSearch]);

<input 
  value={search} 
  onChange={(e) => setSearch(e.target.value)} 
/>
```

### 5. Throttle Scroll Events

```typescript
const handleScroll = useThrottledCallback((e) => {
  // Handle scroll
}, 100);

<div onScroll={handleScroll}>...</div>
```

### 6. Lazy Load on Scroll

```typescript
const [ref, inView] = useIntersectionObserver({ 
  triggerOnce: true 
});

<div ref={ref}>
  {inView && <HeavyComponent />}
</div>
```

### 7. Prefetch on Hover

```typescript
<PrefetchOnHover href="/dashboard">
  <Link href="/dashboard">Dashboard</Link>
</PrefetchOnHover>
```

### 8. Add Resource Hints

```typescript
<PerformanceResourceHints
  preconnectDomains={['https://api.example.com']}
  preloadResources={[
    { url: '/font.woff2', as: 'font', crossOrigin: true }
  ]}
/>
```

### 9. Monitor Web Vitals

```typescript
<PerformanceMonitor
  onMetric={({ name, value, rating }) => {
    // Send to analytics
    gtag('event', 'web_vitals', { name, value, rating });
  }}
/>
```

### 10. Skeleton Loading State

```typescript
import { DashboardSkeleton } from '@/components/performance/skeletons';

<Suspense fallback={<DashboardSkeleton />}>
  <DashboardContent />
</Suspense>
```

## Performance Checklist

- [ ] Use `OptimizedImage` for all images
- [ ] Virtualize lists with >20 items
- [ ] Add skeleton loading states
- [ ] Lazy load below-the-fold content
- [ ] Use `useDebounce` for search inputs
- [ ] Use `useThrottle` for scroll/resize events
- [ ] Add resource hints for external domains
- [ ] Preload critical fonts and images
- [ ] Use dynamic imports for heavy components
- [ ] Monitor Web Vitals in production

## Performance Budget

| Metric | Target |
|--------|--------|
| JavaScript | < 200 KB |
| CSS | < 50 KB |
| Images | < 500 KB |
| Total | < 1 MB |
| FCP | < 1.8s |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

## Troubleshooting

### High Bundle Size
```bash
ANALYZE=true npm run build
```

### Slow List Rendering
Use `VirtualList` instead of regular map

### Images Loading Slowly
Use `OptimizedImage` with blur placeholder

### Layout Shift
Add explicit width/height to images and containers
