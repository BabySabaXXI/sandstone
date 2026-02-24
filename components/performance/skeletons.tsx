/**
 * Skeleton Loading Components
 * 
 * Optimized skeleton loaders for better perceived performance
 * and reduced layout shift during loading states.
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ============================================================================
// Dashboard Skeletons
// ============================================================================

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Welcome Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-5 w-1/2 max-w-sm" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <QuickActionSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Recent Activity & Progress Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitySkeleton />
        <StudyProgressSkeleton />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-12 w-12 rounded-xl mb-4" />
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 w-2 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function StudyProgressSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b">
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="p-6 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Flashcards Skeletons
// ============================================================================

interface FlashcardsSkeletonProps {
  className?: string;
}

export function FlashcardsSkeleton({ className }: FlashcardsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Search Skeleton */}
      <Skeleton className="h-10 w-full" />

      {/* Decks Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DeckCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function DeckCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-1" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-1.5 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="mt-4 pt-4 border-t flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

// ============================================================================
// Documents Skeletons
// ============================================================================

interface DocumentsSkeletonProps {
  className?: string;
}

export function DocumentsSkeleton({ className }: DocumentsSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Folder Tabs Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 flex-shrink-0" />
        ))}
      </div>

      {/* Documents Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function DocumentCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8 rounded opacity-0" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-24 mt-2" />
    </div>
  );
}

// ============================================================================
// Quiz Skeletons
// ============================================================================

interface QuizSkeletonProps {
  className?: string;
}

export function QuizSkeleton({ className }: QuizSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Quiz Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <QuizCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function QuizCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

// ============================================================================
// Grade Skeletons
// ============================================================================

interface GradeSkeletonProps {
  className?: string;
}

export function GradeSkeleton({ className }: GradeSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grade Form Skeleton */}
      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// ============================================================================
// List Skeletons (for virtualized lists)
// ============================================================================

interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
  className?: string;
}

export function ListSkeleton({ 
  count = 10, 
  itemHeight = 64,
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
          style={{ height: itemHeight }}
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Table Skeletons
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-5 flex-1" 
            style={{ maxWidth: `${100 / columns}%` }}
          />
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4 flex-1" 
                style={{ maxWidth: `${100 / columns}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Card Skeletons
// ============================================================================

interface CardSkeletonProps {
  className?: string;
  hasImage?: boolean;
  lines?: number;
}

export function CardSkeleton({ 
  className,
  hasImage = false,
  lines = 3 
}: CardSkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {hasImage && (
        <Skeleton className="h-48 w-full" />
      )}
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-4" 
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Generic Content Skeleton
// ============================================================================

interface ContentSkeletonProps {
  className?: string;
  header?: boolean;
  paragraphs?: number;
}

export function ContentSkeleton({ 
  className,
  header = true,
  paragraphs = 3 
}: ContentSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {header && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: paragraphs }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Image Skeleton
// ============================================================================

interface ImageSkeletonProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  aspectRatio?: string;
}

export function ImageSkeleton({ 
  width = "100%",
  height = 200,
  className,
  aspectRatio
}: ImageSkeletonProps) {
  return (
    <div 
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{ 
        width, 
        height,
        aspectRatio: aspectRatio || undefined
      }}
    >
      <Skeleton className="absolute inset-0" />
    </div>
  );
}

// ============================================================================
// Form Skeleton
// ============================================================================

interface FormSkeletonProps {
  fields?: number;
  className?: string;
  hasSubmit?: boolean;
}

export function FormSkeleton({ 
  fields = 4,
  className,
  hasSubmit = true 
}: FormSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {hasSubmit && (
        <Skeleton className="h-10 w-32" />
      )}
    </div>
  );
}
