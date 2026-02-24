/**
 * Dynamic Import Components
 * 
 * This file contains lazy-loaded components for code splitting and performance optimization.
 * Each component is loaded only when needed, reducing initial bundle size.
 */

import { lazy, Suspense, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback components
const DefaultFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <Skeleton className="w-full h-full" />
  </div>
);

const CardFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </div>
  </div>
);

const ListFallback = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

// Helper function to create lazy component with suspense
function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  FallbackComponent: ComponentType = DefaultFallback
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy-loaded heavy components
export const LazyDashboardStats = createLazyComponent(
  () => import("@/components/dashboard/dashboard-stats").then(m => ({ default: m.DashboardStats })),
  CardFallback
);

export const LazyRecentActivity = createLazyComponent(
  () => import("@/components/dashboard/recent-activity").then(m => ({ default: m.RecentActivity })),
  ListFallback
);

export const LazyStudyProgress = createLazyComponent(
  () => import("@/components/dashboard/study-progress").then(m => ({ default: m.StudyProgress })),
  CardFallback
);

export const LazyFlashcardsContent = createLazyComponent(
  () => import("@/components/flashcards/flashcards-content").then(m => ({ default: m.FlashcardsContent })),
  CardFallback
);

export const LazyDocumentsContent = createLazyComponent(
  () => import("@/components/documents/documents-content").then(m => ({ default: m.DocumentsContent })),
  CardFallback
);

export const LazyQuizContent = createLazyComponent(
  () => import("@/components/quiz/quiz-content").then(m => ({ default: m.QuizContent })),
  CardFallback
);

// Lazy-loaded modal/dialog components
export const LazySettingsModal = createLazyComponent(
  () => import("@/components/settings/settings-modal").then(m => ({ default: m.SettingsModal })),
  DefaultFallback
);

export const LazyCreateDeckModal = createLazyComponent(
  () => import("@/components/flashcards/create-deck-modal").then(m => ({ default: m.CreateDeckModal })),
  DefaultFallback
);

// Lazy-loaded chart components (heavy dependencies)
export const LazyProgressChart = createLazyComponent(
  () => import("@/components/performance/progress-chart").then(m => ({ default: m.ProgressChart })),
  CardFallback
);

export const LazyActivityChart = createLazyComponent(
  () => import("@/components/performance/activity-chart").then(m => ({ default: m.ActivityChart })),
  CardFallback
);

// Preload function for critical components
export function preloadDashboardComponents() {
  const dashboardModules = [
    import("@/components/dashboard/dashboard-stats"),
    import("@/components/dashboard/recent-activity"),
    import("@/components/dashboard/study-progress"),
  ];
  
  return Promise.all(dashboardModules);
}

export function preloadFlashcardComponents() {
  const flashcardModules = [
    import("@/components/flashcards/flashcards-content"),
    import("@/components/flashcards/decks-list"),
  ];
  
  return Promise.all(flashcardModules);
}
