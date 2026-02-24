"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { QuizAnalytics as QuizAnalyticsType, QuestionAnalytics } from "@/lib/quiz/quiz-types";

interface QuizAnalyticsProps {
  analytics: QuizAnalyticsType;
}

export function QuizAnalytics({ analytics }: QuizAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Quiz Analytics
          </h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for this quiz
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Attempts"
          value={analytics.totalAttempts}
          color="blue"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Average Score"
          value={`${analytics.averageScore}%`}
          color="green"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Pass Rate"
          value={`${analytics.passRate}%`}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Avg Time"
          value={formatTime(analytics.averageTimeSpent)}
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.scoreDistribution.map((dist) => (
                  <div key={dist.range} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{dist.range}</span>
                      <span className="text-muted-foreground">{dist.count} attempts</span>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${analytics.totalAttempts > 0
                            ? (dist.count / analytics.totalAttempts) * 100
                            : 0}%`,
                        }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={cn(
                          "h-full flex items-center justify-end px-2",
                          getScoreRangeColor(dist.range)
                        )}
                      >
                        {dist.count > 0 && (
                          <span className="text-white text-sm font-medium">
                            {Math.round(
                              (dist.count / analytics.totalAttempts) * 100
                            )}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unique Users</span>
                  <span className="font-medium">{analytics.uniqueUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Median Score</span>
                  <span className="font-medium">{analytics.medianScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Time</span>
                  <span className="font-medium">
                    {formatTime(analytics.averageTimeSpent)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pass/Fail Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analytics.passRate}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-green-500"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - analytics.passRate}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-red-500"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-green-600">
                        {analytics.passRate}% Passed
                      </span>
                      <span className="text-red-600">
                        {100 - analytics.passRate}% Failed
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.questionAnalytics.map((qa, index) => (
                  <QuestionAnalyticsCard
                    key={qa.questionId}
                    analytics={qa}
                    questionNumber={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attempts Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.attemptsByDay.length > 0 ? (
                <div className="space-y-3">
                  {analytics.attemptsByDay.map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString()}
                      </span>
                      <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.max(
                              (day.count /
                                Math.max(
                                  ...analytics.attemptsByDay.map((d) => d.count)
                                )) *
                                100,
                              5
                            )}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-primary flex items-center justify-end px-2"
                        >
                          <span className="text-primary-foreground text-sm font-medium">
                            {day.count}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", colorClasses[color])}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Question Analytics Card
function QuestionAnalyticsCard({
  analytics,
  questionNumber,
}: {
  analytics: QuestionAnalytics;
  questionNumber: number;
}) {
  const getDifficultyColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getDifficultyLabel = (rate: number) => {
    if (rate >= 80) return "Easy";
    if (rate >= 60) return "Medium";
    return "Hard";
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
            {questionNumber}
          </span>
          <div>
            <p className="font-medium">Question {questionNumber}</p>
            <p className="text-sm text-muted-foreground">
              Avg time: {formatTime(analytics.averageTimeSpent)}
            </p>
          </div>
        </div>
        <Badge
          variant={analytics.correctRate >= 60 ? "default" : "secondary"}
          className={cn(
            analytics.correctRate >= 60 ? "bg-green-500" : "bg-amber-500"
          )}
        >
          {analytics.correctRate}% Correct
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Correct Rate</span>
          <span className={getDifficultyColor(analytics.correctRate)}>
            {getDifficultyLabel(analytics.correctRate)}
          </span>
        </div>
        <Progress value={analytics.correctRate} className="h-2" />
      </div>

      {analytics.mostCommonWrongAnswer && (
        <p className="text-sm text-red-600">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          Common wrong answer: {analytics.mostCommonWrongAnswer}
        </p>
      )}

      {analytics.discriminationIndex !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <Award className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Discrimination Index: {analytics.discriminationIndex.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper functions
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function getScoreRangeColor(range: string): string {
  if (range.includes("81-100")) return "bg-green-500";
  if (range.includes("61-80")) return "bg-blue-500";
  if (range.includes("41-60")) return "bg-amber-500";
  if (range.includes("21-40")) return "bg-orange-500";
  return "bg-red-500";
}
