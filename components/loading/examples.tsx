"use client";

/**
 * Loading States Examples for Sandstone
 * 
 * Demonstrates usage of all loading components and hooks.
 * These are example components showing best practices.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  // Spinners
  Spinner,
  DotsSpinner,
  PulseRingSpinner,
  // Progress
  ProgressBar,
  CircularProgress,
  // Skeletons
  Skeleton,
  Shimmer,
  ShimmerText,
  // Overlays
  LoadingOverlay,
  PageLoading,
  // Placeholders
  CardPlaceholder,
  ListPlaceholder,
  TablePlaceholder,
  FormPlaceholder,
  // Skeleton Screens
  DashboardSkeleton,
  DocumentSkeleton,
  FlashcardSkeleton,
  StudySessionSkeleton,
  LibrarySkeleton,
  QuizSkeleton,
  SettingsSkeleton,
  ProfileSkeleton,
  SearchSkeleton,
  AnalyticsSkeleton,
  SidebarSkeleton,
  ChatSkeleton,
  NotificationSkeleton,
  // Hooks
  useLoading,
  useProgress,
  useSkeleton,
  useStaggeredLoading,
} from "./";

// ============================================
// SPINNER EXAMPLES
// ============================================

export function SpinnerExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Spinner Examples</h2>
      
      {/* Size Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Size Variants</h3>
        <div className="flex items-center gap-8">
          <div className="text-center space-y-2">
            <Spinner size="xs" />
            <span className="text-xs text-muted-foreground">xs</span>
          </div>
          <div className="text-center space-y-2">
            <Spinner size="sm" />
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="text-center space-y-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="text-center space-y-2">
            <Spinner size="lg" />
            <span className="text-xs text-muted-foreground">lg</span>
          </div>
          <div className="text-center space-y-2">
            <Spinner size="xl" />
            <span className="text-xs text-muted-foreground">xl</span>
          </div>
        </div>
      </div>

      {/* Color Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Color Variants</h3>
        <div className="flex items-center gap-8">
          <Spinner color="default" />
          <Spinner color="muted" />
          <Spinner color="sand" />
          <Spinner color="peach" />
          <Spinner color="sage" />
          <div className="bg-sand-900 p-4 rounded-lg">
            <Spinner color="white" />
          </div>
        </div>
      </div>

      {/* Dots Spinner */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dots Spinner</h3>
        <div className="flex items-center gap-8">
          <DotsSpinner size="sm" />
          <DotsSpinner size="md" />
          <DotsSpinner size="lg" />
          <DotsSpinner color="peach" />
          <DotsSpinner color="sage" />
        </div>
      </div>

      {/* Pulse Ring Spinner */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pulse Ring Spinner</h3>
        <div className="flex items-center gap-8">
          <PulseRingSpinner size="md" />
          <PulseRingSpinner size="lg" />
          <PulseRingSpinner size="xl" color="peach" />
          <PulseRingSpinner size="xl" color="sage" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROGRESS BAR EXAMPLES
// ============================================

export function ProgressBarExamples() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 5));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Progress Bar Examples</h2>

      {/* Basic Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Progress</h3>
        <ProgressBar value={progress} showValue />
      </div>

      {/* Size Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Size Variants</h3>
        <ProgressBar value={60} size="sm" />
        <ProgressBar value={60} size="md" />
        <ProgressBar value={60} size="lg" />
        <ProgressBar value={60} size="xl" />
      </div>

      {/* Color Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Color Variants</h3>
        <ProgressBar value={75} color="default" showValue />
        <ProgressBar value={75} color="success" showValue />
        <ProgressBar value={75} color="warning" showValue />
        <ProgressBar value={75} color="error" showValue />
        <ProgressBar value={75} color="info" showValue />
        <ProgressBar value={75} color="peach" showValue />
        <ProgressBar value={75} color="sage" showValue />
      </div>

      {/* Striped Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Striped Progress</h3>
        <ProgressBar value={60} variant="striped" />
      </div>

      {/* Gradient Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Gradient Progress</h3>
        <ProgressBar value={60} variant="gradient" />
      </div>

      {/* Circular Progress */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Circular Progress</h3>
        <div className="flex items-center gap-8">
          <CircularProgress value={progress} size={60} />
          <CircularProgress value={75} size={80} strokeWidth={6} />
          <CircularProgress value={50} size={100} strokeWidth={8} color="success" />
          <CircularProgress value={25} size={120} strokeWidth={10} color="peach" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SKELETON EXAMPLES
// ============================================

export function SkeletonExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Skeleton Examples</h2>

      {/* Variant Skeletons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Variant Skeletons</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton variant="avatar" />
          <Skeleton variant="title" />
          <Skeleton variant="text" />
          <Skeleton variant="button" />
          <Skeleton variant="input" />
          <Skeleton variant="image" className="w-40" />
          <Skeleton variant="circle" className="w-12 h-12" />
        </div>
      </div>

      {/* Custom Skeletons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Skeletons</h3>
        <div className="space-y-2 max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Shimmer Effect</h3>
        <div className="space-y-4 max-w-md">
          <Shimmer className="h-32 w-full" />
          <ShimmerText lines={4} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PLACEHOLDER EXAMPLES
// ============================================

export function PlaceholderExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Placeholder Examples</h2>

      {/* Card Placeholder */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Card Placeholder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <CardPlaceholder hasImage hasAvatar lines={2} actions={2} />
          <CardPlaceholder hasAvatar lines={3} />
        </div>
      </div>

      {/* List Placeholder */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">List Placeholder</h3>
        <div className="max-w-xl">
          <ListPlaceholder items={4} hasAvatar hasAction />
        </div>
      </div>

      {/* Table Placeholder */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Table Placeholder</h3>
        <div className="max-w-2xl">
          <TablePlaceholder rows={4} columns={4} hasHeader />
        </div>
      </div>

      {/* Form Placeholder */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Form Placeholder</h3>
        <div className="max-w-md">
          <FormPlaceholder fields={3} hasSubmit />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SKELETON SCREEN EXAMPLES
// ============================================

export function SkeletonScreenExamples() {
  const [activeScreen, setActiveScreen] = React.useState<string | null>(null);

  const screens = [
    { id: "dashboard", name: "Dashboard", component: DashboardSkeleton },
    { id: "document", name: "Document", component: DocumentSkeleton },
    { id: "flashcard", name: "Flashcard", component: FlashcardSkeleton },
    { id: "study", name: "Study Session", component: StudySessionSkeleton },
    { id: "library", name: "Library", component: LibrarySkeleton },
    { id: "quiz", name: "Quiz", component: QuizSkeleton },
    { id: "settings", name: "Settings", component: SettingsSkeleton },
    { id: "profile", name: "Profile", component: ProfileSkeleton },
    { id: "search", name: "Search", component: SearchSkeleton },
    { id: "analytics", name: "Analytics", component: AnalyticsSkeleton },
    { id: "sidebar", name: "Sidebar", component: SidebarSkeleton },
    { id: "chat", name: "Chat", component: ChatSkeleton },
    { id: "notification", name: "Notification", component: NotificationSkeleton },
  ];

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Skeleton Screen Examples</h2>

      {/* Screen Selector */}
      <div className="flex flex-wrap gap-2">
        {screens.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setActiveScreen(activeScreen === screen.id ? null : screen.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeScreen === screen.id
                ? "bg-primary text-primary-foreground"
                : "bg-sand-100 text-sand-700 hover:bg-sand-200"
            )}
          >
            {screen.name}
          </button>
        ))}
      </div>

      {/* Active Screen */}
      {activeScreen && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-sand-100 px-4 py-2 text-sm font-medium text-sand-700 border-b border-border">
            {screens.find((s) => s.id === activeScreen)?.name} Skeleton
          </div>
          <div className="p-6">
            {React.createElement(
              screens.find((s) => s.id === activeScreen)!.component
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// LOADING OVERLAY EXAMPLES
// ============================================

export function LoadingOverlayExamples() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLoad = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Loading Overlay Examples</h2>

      {/* Basic Overlay */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Overlay</h3>
        <LoadingOverlay isLoading={isLoading} text="Loading content...">
          <div className="p-8 bg-card border border-border rounded-xl space-y-4">
            <h4 className="font-medium">Content Area</h4>
            <p className="text-muted-foreground">
              This content will be overlaid when loading.
            </p>
            <button
              onClick={handleLoad}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Trigger Loading
            </button>
          </div>
        </LoadingOverlay>
      </div>

      {/* No Blur Overlay */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">No Blur Overlay</h3>
        <LoadingOverlay isLoading={isLoading} blur={false}>
          <div className="p-8 bg-card border border-border rounded-xl">
            <p>Content without blur effect</p>
          </div>
        </LoadingOverlay>
      </div>

      {/* Custom Spinner */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Custom Spinner</h3>
        <LoadingOverlay
          isLoading={isLoading}
          spinner={<DotsSpinner size="lg" color="peach" />}
          text="Custom spinner..."
        >
          <div className="p-8 bg-card border border-border rounded-xl">
            <p>Content with custom spinner</p>
          </div>
        </LoadingOverlay>
      </div>
    </div>
  );
}

// ============================================
// HOOK EXAMPLES
// ============================================

export function UseLoadingExample() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading({
    delay: 200,
    minDuration: 1000,
  });

  const handleAsyncOperation = async () => {
    await withLoading(
      new Promise((resolve) => setTimeout(resolve, 2000))
    );
  };

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-medium">useLoading Hook</h3>
      <div className="flex items-center gap-4">
        <button
          onClick={handleAsyncOperation}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Start Async Operation"}
        </button>
        <button
          onClick={startLoading}
          className="px-4 py-2 bg-sand-200 text-sand-700 rounded-lg"
        >
          Start Loading
        </button>
        <button
          onClick={stopLoading}
          className="px-4 py-2 bg-sand-200 text-sand-700 rounded-lg"
        >
          Stop Loading
        </button>
      </div>
      {isLoading && (
        <div className="p-4 bg-card border border-border rounded-xl">
          <Spinner size="sm" className="mr-2" />
          <span>Loading state is active</span>
        </div>
      )}
    </div>
  );
}

export function UseProgressExample() {
  const { value, increment, decrement, setValue, complete, reset, isComplete } =
    useProgress({ initialValue: 0 });

  return (
    <div className="space-y-4 p-6 max-w-md">
      <h3 className="text-lg font-medium">useProgress Hook</h3>
      <ProgressBar value={value} showValue />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => increment(10)}
          className="px-3 py-1 bg-sand-200 text-sand-700 rounded text-sm"
        >
          +10%
        </button>
        <button
          onClick={() => decrement(10)}
          className="px-3 py-1 bg-sand-200 text-sand-700 rounded text-sm"
        >
          -10%
        </button>
        <button
          onClick={() => setValue(50)}
          className="px-3 py-1 bg-sand-200 text-sand-700 rounded text-sm"
        >
          Set 50%
        </button>
        <button
          onClick={complete}
          className="px-3 py-1 bg-sand-200 text-sand-700 rounded text-sm"
        >
          Complete
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 bg-sand-200 text-sand-700 rounded text-sm"
        >
          Reset
        </button>
      </div>
      {isComplete && (
        <p className="text-success text-sm">Progress complete!</p>
      )}
    </div>
  );
}

export function UseSkeletonExample() {
  const { showSkeleton, showContent, startLoading, stopLoading } = useSkeleton({
    minDisplayTime: 1500,
    delay: 200,
  });

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-medium">useSkeleton Hook</h3>
      <div className="flex gap-2">
        <button
          onClick={startLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Show Skeleton
        </button>
        <button
          onClick={stopLoading}
          className="px-4 py-2 bg-sand-200 text-sand-700 rounded-lg"
        >
          Show Content
        </button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        {showSkeleton && (
          <div className="p-6">
            <CardPlaceholder hasImage hasAvatar lines={2} />
          </div>
        )}
        {showContent && (
          <div className="p-6 space-y-4">
            <div className="h-40 bg-gradient-to-br from-peach-100 to-sage-100 rounded-lg" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Content Title</p>
                <p className="text-sm text-muted-foreground">Description</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function UseStaggeredLoadingExample() {
  const items = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
  }));

  const { visibleItems, isComplete, reset } = useStaggeredLoading({
    itemCount: items.length,
    staggerDelay: 100,
  });

  return (
    <div className="space-y-4 p-6">
      <h3 className="text-lg font-medium">useStaggeredLoading Hook</h3>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Replay Animation
      </button>
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "p-4 bg-card border border-border rounded-lg text-center transition-all duration-300",
              visibleItems[i]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            {item.name}
          </div>
        ))}
      </div>
      {isComplete && (
        <p className="text-sm text-muted-foreground">All items loaded!</p>
      )}
    </div>
  );
}

// ============================================
// MAIN EXAMPLES PAGE
// ============================================

export function LoadingExamplesPage() {
  return (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Loading States Examples</h1>
        <p className="text-muted-foreground">
          Comprehensive examples of all loading components and hooks
        </p>
      </div>

      <SpinnerExamples />
      <ProgressBarExamples />
      <SkeletonExamples />
      <PlaceholderExamples />
      <SkeletonScreenExamples />
      <LoadingOverlayExamples />

      <div className="space-y-8">
        <h2 className="text-2xl font-bold px-6">Hook Examples</h2>
        <UseLoadingExample />
        <UseProgressExample />
        <UseSkeletonExample />
        <UseStaggeredLoadingExample />
      </div>
    </div>
  );
}

export default LoadingExamplesPage;
