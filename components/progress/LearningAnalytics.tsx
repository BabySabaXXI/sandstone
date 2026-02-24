"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/stores/progress-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Target,
  Zap,
  BookOpen,
  Calendar,
  BarChart3,
  Activity,
  Award,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface LearningAnalyticsProps {
  className?: string;
  compact?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
}

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "default",
}: StatCardProps) {
  const colorClasses = {
    default: "bg-card",
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    warning: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
  };

  const iconColors = {
    default: "text-muted-foreground",
    success: "text-green-500",
    warning: "text-yellow-500",
    danger: "text-red-500",
    info: "text-blue-500",
  };

  return (
    <Card className={cn(colorClasses[color])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="p-2 bg-background rounded-lg">
            <Icon className={cn("w-5 h-5", iconColors[color])} />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            <span
              className={cn(
                "text-xs",
                trend === "up"
                  ? "text-green-500"
                  : trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            >
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-muted-foreground">
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const LearningAnalytics = memo(function LearningAnalytics({
  className,
  compact = false,
}: LearningAnalyticsProps) {
  const analytics = useProgressStore((state) => state.analytics);
  const accuracyTrend = useProgressStore((state) => state.getAccuracyTrend(30));
  const dailyStats = useProgressStore((state) => state.dailyStats);

  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Prepare chart data
  const weeklyData = useMemo(() => {
    const data: { day: string; cards: number; correct: number; time: number }[] = [];
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const stats = dailyStats.get(dateKey);

      data.push({
        day: dayNames[date.getDay()],
        cards: stats?.cardsReviewed || 0,
        correct: stats?.correctCount || 0,
        time: Math.round((stats?.timeSpent || 0) / 60),
      });
    }

    return data;
  }, [dailyStats]);

  const accuracyData = useMemo(() => {
    return accuracyTrend.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      accuracy: Math.round(item.accuracy),
    }));
  }, [accuracyTrend]);

  const studyTimeDistribution = useMemo(() => {
    const distribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    // This would be calculated from actual session data
    // For now, using placeholder based on analytics
    return [
      { name: "Morning (5-12)", value: 30, color: "#FCD34D" },
      { name: "Afternoon (12-17)", value: 25, color: "#60A5FA" },
      { name: "Evening (17-22)", value: 35, color: "#A78BFA" },
      { name: "Night (22-5)", value: 10, color: "#374151" },
    ];
  }, []);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Stats</p>
                <p className="text-2xl font-bold">
                  {analytics.totalCardsStudied.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">cards studied</p>
              </div>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  analytics.averageAccuracy >= 80
                    ? "default"
                    : analytics.averageAccuracy >= 60
                    ? "secondary"
                    : "destructive"
                }
              >
                {Math.round(analytics.averageAccuracy)}% accuracy
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Cards Studied"
          value={analytics.totalCardsStudied.toLocaleString()}
          subtitle="Total reviews"
          icon={BookOpen}
          trend="up"
          trendValue="+12% this week"
          color="info"
        />
        <StatCard
          title="Success Rate"
          value={`${Math.round(analytics.averageAccuracy)}%`}
          subtitle={`${analytics.totalCorrect} correct answers`}
          icon={Target}
          color={
            analytics.averageAccuracy >= 80
              ? "success"
              : analytics.averageAccuracy >= 60
              ? "warning"
              : "danger"
          }
        />
        <StatCard
          title="Study Time"
          value={formatTime(analytics.totalTimeSpent)}
          subtitle={`${analytics.totalSessions} sessions`}
          icon={Clock}
          color="info"
        />
        <StatCard
          title="Sessions"
          value={analytics.totalSessions}
          subtitle={`${formatTime(analytics.averageSessionLength)} avg`}
          icon={Calendar}
          color="default"
        />
      </div>

      {/* Weekly activity chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Weekly Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="cards"
                  name="Cards Studied"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="correct"
                  name="Correct Answers"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy trend */}
      {accuracyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Accuracy Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accuracyData}>
                  <defs>
                    <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    name="Accuracy %"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#accuracyGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study time distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Study Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studyTimeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {studyTimeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {studyTimeDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cards per Day</span>
                <span className="font-medium">
                  {analytics.cardsPerDay.toFixed(1)}
                </span>
              </div>
              <Progress value={Math.min(analytics.cardsPerDay * 10, 100)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Retention Rate</span>
                <span className="font-medium">
                  {Math.round(analytics.retentionRate)}%
                </span>
              </div>
              <Progress value={analytics.retentionRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mastery Rate</span>
                <span className="font-medium">
                  {Math.round(analytics.masteryRate)}%
                </span>
              </div>
              <Progress value={analytics.masteryRate} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-muted-foreground">Preferred study time:</span>
                <Badge variant="secondary">
                  {analytics.preferredStudyTime || "Not enough data"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study tips based on analytics */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Study Insights</h3>
              <p className="text-sm text-muted-foreground">
                {analytics.averageAccuracy >= 80
                  ? "Excellent accuracy! You're retaining information very well. Consider increasing your daily card count."
                  : analytics.averageAccuracy >= 60
                  ? "Good progress! Focus on reviewing cards you find difficult to improve your accuracy."
                  : analytics.totalCardsStudied < 50
                  ? "You're just getting started! Consistency is key - try to study a little every day."
                  : "Consider adjusting your study schedule. Reviewing cards more frequently may help improve retention."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default LearningAnalytics;
