/**
 * Recent Activity Component
 * 
 * Server Component that displays recent user activity.
 * Can be used standalone or within Suspense boundaries.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RecentActivity as RecentActivityType } from "@/lib/ssr/data-fetching";

interface RecentActivityProps {
  activities: RecentActivityType[];
}

/**
 * Recent Activity Component
 */
export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest learning activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            <Button variant="ghost" className="w-full gap-2" asChild>
              <Link href="/activity">
                View All Activity
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({ activity }: { activity: RecentActivityType }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            activity.type === "graded" && "bg-amber-500",
            activity.type === "created" && "bg-blue-500",
            activity.type === "completed" && "bg-emerald-500",
            activity.type === "studied" && "bg-purple-500"
          )}
        />
        <div>
          <p className="font-medium">{activity.title}</p>
          <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
        </div>
      </div>
      {activity.score !== undefined && (
        <span className="text-sm font-medium text-emerald-500">
          {activity.score}%
        </span>
      )}
      {activity.items !== undefined && (
        <span className="text-sm text-muted-foreground">
          {activity.items} items
        </span>
      )}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No recent activity</p>
      <p className="text-sm text-muted-foreground mt-1">
        Start learning to see your activity here
      </p>
    </div>
  );
}

/**
 * Recent Activity Skeleton
 * Used as Suspense fallback
 */
RecentActivity.Skeleton = function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-2 h-2 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
