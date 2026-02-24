"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Marketing route group loading component.
 * Shows a marketing page skeleton while content loads.
 */
export default function MarketingLoading() {
  return (
    <div className="space-y-12 py-12">
      {/* Hero Section Skeleton */}
      <section className="container">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-full mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="container">
        <div className="grid md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-4"
            >
              <Skeleton className="h-16 w-16 mx-auto rounded-xl" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-32 mt-4" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </section>
    </div>
  );
}
