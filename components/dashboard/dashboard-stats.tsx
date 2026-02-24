/**
 * Dashboard Stats Component
 * 
 * Server Component that displays dashboard statistics.
 * Can be used standalone or within Suspense boundaries.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Clock } from "lucide-react";
import type { DashboardStats as DashboardStatsType } from "@/lib/ssr/data-fetching";

interface DashboardStatsProps {
  data: DashboardStatsType;
}

/**
 * Dashboard Stats Component
 */
export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      label: "Responses Graded",
      value: data.responsesGraded,
      change: "+12%",
      icon: TrendingUp,
    },
    {
      label: "Study Streak",
      value: data.studyStreak,
      change: "days",
      icon: Target,
    },
    {
      label: "Time Studied",
      value: data.timeStudied,
      change: "hours",
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-emerald-500">{stat.change}</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Dashboard Stats Skeleton
 * Used as Suspense fallback
 */
DashboardStats.Skeleton = function StatsSkeleton({ count = 3 }: { count?: number }) {
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
};
