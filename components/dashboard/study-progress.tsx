/**
 * Study Progress Component
 * 
 * Server Component that displays study progress by subject.
 * Can be used standalone or within Suspense boundaries.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { StudyProgress as StudyProgressType } from "@/lib/ssr/data-fetching";

interface StudyProgressProps {
  progress: StudyProgressType[];
}

/**
 * Study Progress Component
 */
export function StudyProgress({ progress }: StudyProgressProps) {
  const totalTopics = progress.reduce((acc, p) => acc + p.totalTopics, 0);
  const completedTopics = progress.reduce((acc, p) => acc + p.completedTopics, 0);
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Progress</CardTitle>
        <CardDescription>Your progress this week</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subject Progress */}
        {progress.length === 0 ? (
          <EmptyState />
        ) : (
          progress.map((item) => (
            <div key={item.subject} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.subject}</span>
                <span className="text-muted-foreground">{Math.round(item.progress)}%</span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>
          ))
        )}

        {/* Overall Progress */}
        {progress.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Overall Progress</p>
                <p className="text-sm text-muted-foreground">
                  {completedTopics} of {totalTopics} topics completed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2 mt-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">No progress data yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        Complete topics to track your progress
      </p>
    </div>
  );
}

/**
 * Study Progress Skeleton
 * Used as Suspense fallback
 */
StudyProgress.Skeleton = function ProgressSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="space-y-6">
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
            <div className="space-y-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-2 w-full mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};
