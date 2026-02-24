"use client";

import { motion } from "framer-motion";

export function HomePageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-8 w-32 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-12 w-3/4 mx-auto bg-muted rounded-lg animate-pulse mb-4" />
        <div className="h-6 w-1/2 mx-auto bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-4 text-center"
          >
            <div className="w-8 h-8 mx-auto mb-2 bg-muted rounded-lg animate-pulse" />
            <div className="h-8 w-16 mx-auto bg-muted rounded-lg animate-pulse mb-1" />
            <div className="h-4 w-20 mx-auto bg-muted rounded-lg animate-pulse" />
          </motion.div>
        ))}
      </div>

      {/* Features Skeleton */}
      <div className="mb-12">
        <div className="h-6 w-32 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 w-1/3 bg-muted rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Skeleton */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="h-6 w-32 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
