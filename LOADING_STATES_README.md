# Loading States for Sandstone

A comprehensive loading state system for the Sandstone app, providing beautiful and accessible loading indicators, skeleton screens, progress bars, and more.

## Table of Contents

- [Installation](#installation)
- [Components](#components)
  - [Spinners](#spinners)
  - [Progress Bars](#progress-bars)
  - [Skeletons](#skeletons)
  - [Shimmer Effects](#shimmer-effects)
  - [Loading Overlays](#loading-overlays)
  - [Content Placeholders](#content-placeholders)
- [Skeleton Screens](#skeleton-screens)
- [Hooks](#hooks)
- [CSS Animations](#css-animations)
- [Accessibility](#accessibility)
- [Examples](#examples)

## Installation

The loading states are included in the Sandstone component library. Import them from the components directory:

```tsx
import { 
  Spinner, 
  ProgressBar, 
  Skeleton, 
  DashboardSkeleton,
  useLoading 
} from "@/components";
```

Import the CSS animations in your global styles:

```tsx
import "@/styles/loading-animations.css";
```

## Components

### Spinners

Multiple spinner variants for different use cases:

```tsx
// Classic Spinner
<Spinner size="md" color="default" />

// Dots Spinner
<DotsSpinner size="lg" color="peach" />

// Pulse Ring Spinner
<PulseRingSpinner size="xl" color="sage" />
```

**Props:**
- `size`: `xs` | `sm` | `md` | `lg` | `xl` | `2xl`
- `color`: `default` | `muted` | `white` | `sand` | `peach` | `sage`
- `variant`: `default` | `dots` | `pulse` | `ring`

### Progress Bars

Linear and circular progress indicators:

```tsx
// Linear Progress Bar
<ProgressBar 
  value={75} 
  max={100} 
  size="md" 
  color="success"
  showValue 
  animated 
/>

// Striped Progress Bar
<ProgressBar 
  value={60} 
  variant="striped" 
  color="peach" 
/>

// Circular Progress
<CircularProgress 
  value={75} 
  size={80} 
  strokeWidth={6}
  showValue 
  color="success"
/>
```

**ProgressBar Props:**
- `value`: Current progress value
- `max`: Maximum value (default: 100)
- `size`: `sm` | `md` | `lg` | `xl`
- `variant`: `default` | `striped` | `gradient`
- `color`: `default` | `success` | `warning` | `error` | `info` | `peach` | `sage`
- `showValue`: Show percentage text
- `animated`: Enable animation

### Skeletons

Basic skeleton placeholders:

```tsx
// Default Skeleton
<Skeleton className="h-20 w-full" />

// Variant Skeletons
<Skeleton variant="avatar" />
<Skeleton variant="title" />
<Skeleton variant="text" />
<Skeleton variant="button" />
<Skeleton variant="input" />
<Skeleton variant="image" />
<Skeleton variant="circle" />
```

**Props:**
- `variant`: Predefined skeleton shapes
- `className`: Custom styling

### Shimmer Effects

Animated shimmer loading effect:

```tsx
// Basic Shimmer
<Shimmer className="h-40 w-full" />

// Shimmer with custom duration
<Shimmer className="h-20 w-full" duration={2} />

// Shimmer Text (multiple lines)
<ShimmerText lines={4} />
```

### Loading Overlays

Full and partial loading overlays:

```tsx
// Loading Overlay
<LoadingOverlay isLoading={true} blur text="Loading...">
  <YourContent />
</LoadingOverlay>

// Full Page Loading
<PageLoading 
  text="Loading..." 
  subtext="Please wait"
  variant="dots"
/>
```

### Content Placeholders

Pre-built placeholders for common content types:

```tsx
// Card Placeholder
<CardPlaceholder 
  hasImage 
  hasAvatar 
  lines={3} 
  actions={2}
/>

// List Placeholder
<ListPlaceholder 
  items={5} 
  hasAvatar 
  hasAction 
/>

// Table Placeholder
<TablePlaceholder 
  rows={5} 
  columns={4} 
  hasHeader 
/>

// Form Placeholder
<FormPlaceholder 
  fields={4} 
  hasSubmit 
/>
```

## Skeleton Screens

Specialized skeleton screens for different page types:

```tsx
// Dashboard Skeleton
<DashboardSkeleton 
  statCount={4}
  showChart={true}
  activityCount={5}
/>

// Document Skeleton
<DocumentSkeleton 
  showMeta={true}
  contentLines={10}
/>

// Flashcard Skeleton
<FlashcardSkeleton showProgress />

// Study Session Skeleton
<StudySessionSkeleton showTimer />

// Library Skeleton
<LibrarySkeleton 
  itemCount={8}
  showFilters
/>

// Quiz Skeleton
<QuizSkeleton optionCount={4} />

// Settings Skeleton
<SettingsSkeleton sectionCount={4} />

// Profile Skeleton
<ProfileSkeleton showStats />

// Search Skeleton
<SearchSkeleton 
  resultCount={5}
  showFilters
/>

// Analytics Skeleton
<AnalyticsSkeleton chartCount={3} />

// Sidebar Skeleton
<SidebarSkeleton />

// Chat Skeleton
<ChatSkeleton />

// Notification Skeleton
<NotificationSkeleton />
```

## Hooks

### useLoading

Basic loading state management with delay support:

```tsx
const { isLoading, startLoading, stopLoading, withLoading } = useLoading({
  delay: 200,        // Delay before showing loading (ms)
  minDuration: 500,  // Minimum loading duration (ms)
});

// Use with async operations
const handleSubmit = async () => {
  await withLoading(async () => {
    await api.submit(data);
  });
};
```

### useProgress

Progress tracking for async operations:

```tsx
const { value, increment, complete, isComplete } = useProgress({
  initialValue: 0,
  autoIncrement: true,
  autoIncrementInterval: 100,
  maxAutoIncrement: 90,
});

// Update progress
increment(10);
complete(); // Set to 100%
```

### useSkeleton

Skeleton loading with minimum display time:

```tsx
const { showSkeleton, showContent, startLoading, stopLoading } = useSkeleton({
  minDisplayTime: 500,
  delay: 100,
});

// Use in component
{showSkeleton && <DashboardSkeleton />}
{showContent && <DashboardContent />}
```

### useStaggeredLoading

Staggered loading for lists:

```tsx
const { visibleItems, isComplete } = useStaggeredLoading({
  itemCount: 10,
  staggerDelay: 100,
  initialDelay: 0,
});

// Render items with stagger
{items.map((item, i) => (
  visibleItems[i] && <Item key={i} {...item} />
))}
```

### useLoadingTimeout

Timeout handling for loading states:

```tsx
const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout({
  timeout: 10000,
  onTimeout: () => toast.error("Loading timed out"),
});
```

### useMultiLoading

Manage multiple loading states:

```tsx
const { states, isAnyLoading, startLoading, stopLoading } = useMultiLoading([
  "documents",
  "folders",
  "settings",
]);

startLoading("documents");
stopLoading("documents");
```

### useInfiniteLoading

Infinite scroll loading:

```tsx
const { loaderRef, isLoadingMore } = useInfiniteLoading({
  threshold: 100,
  hasMore: true,
  onLoadMore: loadMoreItems,
  isLoading,
});

// Add loader ref to last element
<div ref={loaderRef} />
```

## CSS Animations

The loading animations CSS provides:

- `animate-shimmer` - Shimmer animation
- `animate-pulse-soft` - Soft pulse
- `animate-pulse-ring` - Ring pulse effect
- `progress-striped` - Striped progress bar
- `skeleton-wave` - Wave effect for skeletons
- `loading-bar` - Indeterminate loading bar
- `typing-indicator` - Chat typing indicator

### Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are disabled */
}
```

## Accessibility

All loading components include proper accessibility features:

- `aria-busy` attribute on loading containers
- `role="status"` for loading announcements
- `aria-live="polite"` for screen reader updates
- `aria-label` for spinner descriptions

```tsx
// Accessible loading state
<div aria-busy={isLoading} role="status" aria-live="polite">
  {isLoading && <Spinner aria-label="Loading content" />}
</div>
```

## Examples

### Basic Loading State

```tsx
import { Spinner, Skeleton } from "@/components";
import { useLoading } from "@/hooks";

function MyComponent() {
  const { isLoading, withLoading } = useLoading();

  const handleLoad = async () => {
    await withLoading(fetchData());
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return <div>{/* Content */}</div>;
}
```

### Dashboard Loading

```tsx
import { DashboardSkeleton, LoadingOverlay } from "@/components";
import { useLoading } from "@/hooks";

function Dashboard() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  return (
    <LoadingOverlay isLoading={isLoading} text="Loading dashboard...">
      {isLoading ? <DashboardSkeleton /> : <DashboardContent />}
    </LoadingOverlay>
  );
}
```

### Progress Tracking

```tsx
import { ProgressBar } from "@/components";
import { useProgress } from "@/hooks";

function FileUpload() {
  const { value, setValue } = useProgress();

  const handleUpload = async (file) => {
    const response = await uploadFile(file, {
      onProgress: (percent) => setValue(percent),
    });
  };

  return <ProgressBar value={value} showValue />;
}
```

### Staggered List Loading

```tsx
import { useStaggeredLoading } from "@/hooks";

function ItemList({ items }) {
  const { visibleItems } = useStaggeredLoading({
    itemCount: items.length,
    staggerDelay: 50,
  });

  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={item.id}
          className={visibleItems[i] ? "animate-fade-in" : "opacity-0"}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

### Custom Skeleton

```tsx
import { Skeleton, Shimmer } from "@/components";

function CustomCardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Shimmer className="h-48 w-full rounded-lg" />
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
```

## File Structure

```
components/
├── loading/
│   ├── index.ts              # Main exports
│   └── skeleton-screens.tsx  # Page-specific skeletons
├── ui/
│   ├── loading.tsx           # Basic loading components
│   └── loading-enhanced.tsx  # Enhanced loading components
hooks/
└── use-loading.ts            # Loading state hooks
styles/
└── loading-animations.css    # CSS animations
```

## Best Practices

1. **Use appropriate loading states**:
   - Spinners for short operations (< 1s)
   - Skeletons for content loading
   - Progress bars for file uploads/downloads

2. **Set minimum display times**:
   - Prevents flickering for fast operations
   - Use `minDuration` in `useLoading`

3. **Respect user preferences**:
   - All animations support `prefers-reduced-motion`

4. **Provide feedback**:
   - Show progress for long operations
   - Use descriptive text with loading states

5. **Accessibility**:
   - Use `aria-busy` on loading containers
   - Provide `aria-label` for spinners
