"use client";

import { motion } from "framer-motion";

export function GradePageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="h-4 w-96 bg-muted rounded-lg animate-pulse ml-14" />
      </div>

      {/* Form Skeleton */}
      <div className="space-y-6">
        {/* Configuration Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Question Input Skeleton */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
          <div className="h-24 w-full bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Response Input Skeleton */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-4 w-28 bg-muted rounded animate-pulse mb-2" />
          <div className="h-64 w-full bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Diagram Upload Skeleton */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-14 w-full bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
