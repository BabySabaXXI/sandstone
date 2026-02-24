"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  RotateCcw,
  Share2,
  Settings,
  ChevronDown,
  Award,
  Zap,
  Crown,
  Star,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";

// Import progress components
import { StudyHeatmap } from "./StudyHeatmap";
import { StreakTracker } from "./StreakTracker";
import { AchievementShowcase } from "./AchievementShowcase";
import { MilestoneTracker } from "./MilestoneTracker";
import { LearningAnalytics } from "./LearningAnalytics";
import { useProgressStore } from "@/stores/progress-store";

interface ProgressDashboardProps {
  className?: string;
  defaultTab?: string;
}

interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: string;
}

const QuickStatCard = memo(function QuickStatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "bg-primary",
}: QuickStatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface LevelBadgeProps {
  points: number;
}

const LevelBadge = memo(function LevelBadge({ points }: LevelBadgeProps) {
  const level = Math.floor(points / 100) + 1;
  const progress = (points % 100);
  const levelNames = [
    "Novice",
    "Apprentice",
    "Scholar",
    "Expert",
    "Master",
    "Grandmaster",
    "Legend",
  ];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">Level {level}</span>
        <span className="text-xs text-muted-foreground">{levelName}</span>
      </div>
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Crown className="w-5 h-5 text-primary" />
        </div>
      </div>
    </div>
  );
});

export const ProgressDashboard = memo(function ProgressDashboard({
  className,
  defaultTab = "overview",
}: ProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const totalPoints = useProgressStore((state) => state.totalPoints);
  const streakData = useProgressStore((state) => state.streakData);
  const analytics = useProgressStore((state) => state.analytics);
  const achievements = useProgressStore((state) => state.achievements);
  const milestones = useProgressStore((state) => state.milestones);

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const completedMilestones = milestones.filter((m) => m.completed);

  const handleExport = () => {
    const data = useProgressStore.getState().exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sandstone-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          useProgressStore.getState().importData(data);
        } catch (error) {
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      useProgressStore.getState().resetProgress();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Progress Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey, achievements, and milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LevelBadge points={totalPoints} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Import Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReset} className="text-red-500">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Progress
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStatCard
          title="Total Points"
          value={totalPoints.toLocaleString()}
          icon={Star}
          color="bg-yellow-500"
        />
        <QuickStatCard
          title="Current Streak"
          value={`${streakData.current} days`}
          icon={Flame}
          trend="Best: " + streakData.longest
          color="bg-orange-500"
        />
        <QuickStatCard
          title="Achievements"
          value={`${unlockedAchievements.length}/${achievements.length}`}
          icon={Trophy}
          trend={`${Math.round((unlockedAchievements.length / achievements.length) * 100)}% complete`}
          color="bg-purple-500"
        />
        <QuickStatCard
          title="Milestones"
          value={`${completedMilestones.length}/${milestones.length}`}
          icon={Target}
          trend={`${Math.round((completedMilestones.length / milestones.length) * 100)}% complete`}
          color="bg-blue-500"
        />
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Study Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Study Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StudyHeatmap days={84} showLegend />
              </CardContent>
            </Card>

            {/* Streak Tracker */}
            <StreakTracker />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Achievement Showcase */}
            <AchievementShowcase />

            {/* Milestone Tracker */}
            <MilestoneTracker />
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {analytics.totalCardsStudied.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Cards Studied</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-green-500">
                    {Math.round(analytics.averageAccuracy)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-blue-500">
                    {analytics.totalSessions}
                  </p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-purple-500">
                    {Math.floor(analytics.totalTimeSpent / 3600)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <LearningAnalytics />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <AchievementShowcase />
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <MilestoneTracker />
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks">
          <div className="grid lg:grid-cols-2 gap-6">
            <StreakTracker />
            <StudyHeatmap days={365} title="Full Year Activity" />
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Progress Data</DialogTitle>
            <DialogDescription>
              Upload a previously exported progress file to restore your data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Warning: Importing will overwrite your current progress data.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ProgressDashboard;
