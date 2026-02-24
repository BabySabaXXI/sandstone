/**
 * Streaming Boundary Components
 * 
 * These components enable React's streaming SSR with Suspense boundaries.
 * They provide loading states while server components fetch data.
 */

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface StreamingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

interface SkeletonGridProps {
  rows?: number;
  cols?: number;
  className?: string;
}

interface SkeletonListProps {
  items?: number;
  className?: string;
}

interface SkeletonCardProps {
  header?: boolean;
  content?: boolean;
  footer?: boolean;
  className?: string;
}

// ============================================================================
// Streaming Boundary Component
// ============================================================================

/**
 * Wrapper component that enables streaming with Suspense
 * Use this to wrap async server components that fetch data
 */
export function StreamingBoundary({
  children,
  fallback,
  className,
}: StreamingBoundaryProps) {
  return (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      <div className={className}>{children}</div>
    </Suspense>
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

/**
 * Default skeleton for general loading states
 */
export function DefaultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton grid for card layouts
 */
export function SkeletonGrid({ rows = 2, cols = 3, className }: SkeletonGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton list for list layouts
 */
export function SkeletonList({ items = 5, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton card for card layouts
 */
export function SkeletonCard({
  header = true,
  content = true,
  footer = false,
  className,
}: SkeletonCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {header && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      {content && (
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </CardContent>
      )}
      {footer && (
        <div className="p-4 border-t">
          <Skeleton className="h-9 w-full" />
        </div>
      )}
    </Card>
  );
}

/**
 * Stats skeleton for dashboard stats
 */
export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Table skeleton for data tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton for form loading states
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

// ============================================================================
// Page-Level Skeletons
// ============================================================================

/**
 * Dashboard page skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      
      {/* Stats */}
      <StatsSkeleton count={3} />
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <SkeletonGrid rows={1} cols={5} />
      </div>
      
      {/* Activity & Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard header content />
        <SkeletonCard header content />
      </div>
    </div>
  );
}

/**
 * Documents page skeleton
 */
export function DocumentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Documents Grid */}
      <SkeletonGrid rows={2} cols={4} />
    </div>
  );
}

/**
 * Flashcards page skeleton
 */
export function FlashcardsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      
      {/* Stats */}
      <StatsSkeleton count={3} />
      
      {/* Progress */}
      <SkeletonCard header content />
      
      {/* Search */}
      <Skeleton className="h-10 w-full" />
      
      {/* Decks */}
      <SkeletonGrid rows={2} cols={3} />
    </div>
  );
}

/**
 * Library page skeleton
 */
export function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Resources */}
      <SkeletonGrid rows={3} cols={3} />
    </div>
  );
}

/**
 * Quiz page skeleton
 */
export function QuizSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>
      
      {/* Quiz Cards */}
      <SkeletonGrid rows={2} cols={3} />
    </div>
  );
}

// ============================================================================
// Error Boundary for Streaming
// ============================================================================

/**
 * Error fallback component for streaming errors
 */
export function StreamingError({
  message = "Failed to load content",
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-rose-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
