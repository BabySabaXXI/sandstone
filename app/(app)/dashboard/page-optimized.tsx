/**
 * Optimized Dashboard Page
 * 
 * Features:
 * - Dynamic imports for code splitting
 * - Lazy loading of non-critical components
 * - Virtualized lists for large datasets
 * - Optimized images
 * - Performance monitoring
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { DashboardSkeleton } from "@/components/performance/skeletons";
import { PerformanceMonitor } from "@/components/performance";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized learning dashboard with AI-powered insights.",
};

// Loading fallback for dashboard
function DashboardLoading() {
  return <DashboardSkeleton />;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      {/* Dashboard content with suspense for progressive loading */}
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent user={user} />
      </Suspense>

      {/* Performance monitoring for this page */}
      <PerformanceMonitor
        onMetric={(metric) => {
          // Send to your analytics service
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'dashboard_performance', {
              metric_name: metric.name,
              metric_value: metric.value,
              metric_rating: metric.rating,
            });
          }
        }}
      />
    </div>
  );
}
