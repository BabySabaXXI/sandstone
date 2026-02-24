"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Shimmer, Skeleton, ProgressBar, CircularProgress } from "@/components/ui/loading-enhanced";

/**
 * Specialized Skeleton Screens for Sandstone
 * 
 * Pre-built skeleton screens for different page types:
 * - DashboardSkeleton
 * - DocumentSkeleton
 * - FlashcardSkeleton
 * - StudySessionSkeleton
 * - LibrarySkeleton
 * - QuizSkeleton
 * - SettingsSkeleton
 * - ProfileSkeleton
 * - SearchSkeleton
 * - AnalyticsSkeleton
 */

// ============================================
// DASHBOARD SKELETON
// ============================================

interface DashboardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  statCount?: number;
  showChart?: boolean;
  activityCount?: number;
}

export const DashboardSkeleton = React.forwardRef<HTMLDivElement, DashboardSkeletonProps>(
  ({ className, statCount = 4, showChart = true, activityCount = 5, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-8", className)} {...props}>
      {/* Welcome Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        {showChart && (
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Shimmer className="h-64 w-full rounded-lg" />
            <div className="flex justify-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
              ))}
            </div>
          </div>
        )}

        {/* Activity Section */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: activityCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="avatar" className="w-8 h-8" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
          >
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
);
DashboardSkeleton.displayName = "DashboardSkeleton";

// ============================================
// DOCUMENT SKELETON
// ============================================

interface DocumentSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showMeta?: boolean;
  contentLines?: number;
}

export const DocumentSkeleton = React.forwardRef<HTMLDivElement, DocumentSkeletonProps>(
  ({ className, showMeta = true, contentLines = 10, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-4xl mx-auto space-y-6", className)} {...props}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <React.Fragment key={i}>
            <Skeleton className="h-4 w-20" />
            {i < 2 && <Skeleton className="h-4 w-4" />}
          </React.Fragment>
        ))}
      </div>

      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="ml-auto flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <Shimmer className="h-64 w-full rounded-xl" />

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4",
              i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-5/6" : "w-4/5"
            )}
          />
        ))}
      </div>

      {/* Meta Tags */}
      {showMeta && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
      )}
    </div>
  )
);
DocumentSkeleton.displayName = "DocumentSkeleton";

// ============================================
// FLASHCARD SKELETON
// ============================================

interface FlashcardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showProgress?: boolean;
}

export const FlashcardSkeleton = React.forwardRef<HTMLDivElement, FlashcardSkeletonProps>(
  ({ className, showProgress = true, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-2xl mx-auto space-y-6", className)} {...props}>
      {/* Progress */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          <ProgressBar value={0} size="sm" />
        </div>
      )}

      {/* Card */}
      <div className="aspect-[4/3]">
        <Shimmer className="h-full w-full rounded-2xl" />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-12 rounded-lg",
              i === 1 ? "w-32" : "w-24"
            )}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
);
FlashcardSkeleton.displayName = "FlashcardSkeleton";

// ============================================
// STUDY SESSION SKELETON
// ============================================

interface StudySessionSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showTimer?: boolean;
}

export const StudySessionSkeleton = React.forwardRef<HTMLDivElement, StudySessionSkeletonProps>(
  ({ className, showTimer = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {showTimer && (
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-16 h-16" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        )}
        <CircularProgress value={0} size={60} />
      </div>

      {/* Subject Badge */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === 3 ? "w-2/3" : "w-full")}
            />
          ))}
        </div>
        <Shimmer className="h-48 w-full rounded-xl" />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Skeleton variant="button" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-3 h-3 rounded-full" />
          ))}
        </div>
        <Skeleton variant="button" />
      </div>
    </div>
  )
);
StudySessionSkeleton.displayName = "StudySessionSkeleton";

// ============================================
// LIBRARY SKELETON
// ============================================

interface LibrarySkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  itemCount?: number;
  showFilters?: boolean;
}

export const LibrarySkeleton = React.forwardRef<HTMLDivElement, LibrarySkeletonProps>(
  ({ className, itemCount = 8, showFilters = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="button" className="w-32" />
          <Skeleton variant="button" className="w-24" />
        </div>
      </div>

      {/* Search & Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton variant="input" className="flex-1" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <Shimmer className="h-40 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton variant="avatar" className="w-6 h-6" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-10 h-10 rounded-lg" />
        ))}
      </div>
    </div>
  )
);
LibrarySkeleton.displayName = "LibrarySkeleton";

// ============================================
// QUIZ SKELETON
// ============================================

interface QuizSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  optionCount?: number;
}

export const QuizSkeleton = React.forwardRef<HTMLDivElement, QuizSkeletonProps>(
  ({ className, optionCount = 4, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-3xl mx-auto space-y-6", className)} {...props}>
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <ProgressBar value={0} size="sm" />
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Shimmer className="h-48 w-full rounded-lg" />
      </div>

      {/* Options */}
      <div className="space-y-3">
        {Array.from({ length: optionCount }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
          >
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Skeleton variant="button" />
        <Skeleton variant="button" className="w-32" />
      </div>
    </div>
  )
);
QuizSkeleton.displayName = "QuizSkeleton";

// ============================================
// SETTINGS SKELETON
// ============================================

interface SettingsSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  sectionCount?: number;
}

export const SettingsSkeleton = React.forwardRef<HTMLDivElement, SettingsSkeletonProps>(
  ({ className, sectionCount = 4, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-3xl space-y-8", className)} {...props}>
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Sections */}
      {Array.from({ length: sectionCount }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="space-y-1">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4 pt-2">
            {Array.from({ length: 2 + (sectionIndex % 2) }).map((_, fieldIndex) => (
              <div key={fieldIndex} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton variant="input" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-32" />
      </div>
    </div>
  )
);
SettingsSkeleton.displayName = "SettingsSkeleton";

// ============================================
// PROFILE SKELETON
// ============================================

interface ProfileSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  showStats?: boolean;
}

export const ProfileSkeleton = React.forwardRef<HTMLDivElement, ProfileSkeletonProps>(
  ({ className, showStats = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Cover & Avatar */}
      <div className="relative">
        <Shimmer className="h-48 w-full rounded-xl" />
        <div className="absolute -bottom-12 left-6">
          <Skeleton
            variant="circle"
            className="w-24 h-24 border-4 border-background"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-14 px-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton variant="button" />
            <Skeleton variant="button" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex gap-8 px-6 py-4 border-y border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Tabs & Content */}
      <div className="px-6 space-y-4">
        <div className="flex gap-4 border-b border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <Shimmer className="h-32 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
);
ProfileSkeleton.displayName = "ProfileSkeleton";

// ============================================
// SEARCH SKELETON
// ============================================

interface SearchSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  resultCount?: number;
  showFilters?: boolean;
}

export const SearchSkeleton = React.forwardRef<HTMLDivElement, SearchSkeletonProps>(
  ({ className, resultCount = 5, showFilters = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Search Bar */}
      <Skeleton variant="input" className="h-14" />

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {Array.from({ length: resultCount }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 bg-card border border-border rounded-xl"
          >
            <Shimmer className="w-24 h-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
);
SearchSkeleton.displayName = "SearchSkeleton";

// ============================================
// ANALYTICS SKELETON
// ============================================

interface AnalyticsSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  chartCount?: number;
}

export const AnalyticsSkeleton = React.forwardRef<HTMLDivElement, AnalyticsSkeletonProps>(
  ({ className, chartCount = 3, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-8", className)} {...props}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <div className="flex items-end justify-between">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: chartCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-card border border-border rounded-xl p-5 space-y-4",
              i === 0 && "lg:col-span-2"
            )}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Shimmer
              className={cn(
                "w-full rounded-lg",
                i === 0 ? "h-80" : "h-64"
              )}
            />
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton variant="avatar" />
              <div className="flex-1 grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
);
AnalyticsSkeleton.displayName = "AnalyticsSkeleton";

// ============================================
// SIDEBAR SKELETON
// ============================================

export const SidebarSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("w-64 h-full p-4 space-y-6 bg-card border-r border-border", className)}
      {...props}
    >
      {/* Logo */}
      <Skeleton className="h-10 w-32" />

      {/* Navigation Groups */}
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 + groupIndex }).map((_, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-3 p-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ))}

      {/* User */}
      <div className="pt-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
);
SidebarSkeleton.displayName = "SidebarSkeleton";

// ============================================
// CHAT SKELETON
// ============================================

export const ChatSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-full flex flex-col", className)} {...props}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="ml-auto flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-8 h-8 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            )}
          >
            <Skeleton variant="avatar" className="w-8 h-8" />
            <div
              className={cn(
                "space-y-1 max-w-[70%]",
                i % 2 === 0 ? "items-start" : "items-end"
              )}
            >
              <Shimmer
                className={cn(
                  "h-16 rounded-2xl",
                  i % 2 === 0 ? "rounded-tl-sm" : "rounded-tr-sm"
                )}
              />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Skeleton variant="input" className="h-12 flex-1" />
          <Skeleton className="w-12 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  )
);
ChatSkeleton.displayName = "ChatSkeleton";

// ============================================
// NOTIFICATION SKELETON
// ============================================

export const NotificationSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-80 space-y-2", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Notifications */}
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 hover:bg-sand-100/50 rounded-lg"
          >
            <Skeleton
              variant="circle"
              className={cn(
                "w-8 h-8 flex-shrink-0",
                i % 3 === 0 && "bg-primary/20",
                i % 3 === 1 && "bg-success/20",
                i % 3 === 2 && "bg-warning/20"
              )}
            />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
);
NotificationSkeleton.displayName = "NotificationSkeleton";
