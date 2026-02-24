"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store-enhanced";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Flame,
  Award,
  Brain,
  CheckCircle,
  Zap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  formatInterval,
  calculateStreak,
  type StudyMode,
} from "@/lib/flashcards/sm2-enhanced";

// ============================================================================
// TYPES
// ============================================================================

interface ProgressTrackerProps {
  deckId?: string; // If provided, show deck-specific stats
}

interface DailyActivity {
  date: string;
  count: number;
  correct: number;
}

// ============================================================================
// STREAK BADGE COMPONENT
// ============================================================================

interface StreakBadgeProps {
  streak: number;
  isLongest?: boolean;
}

const StreakBadge = memo(function StreakBadge({ streak, isLongest }: StreakBadgeProps) {
  const getStreakColor = () => {
    if (streak >= 30) return "bg-orange-500 text-white";
    if (streak >= 14) return "bg-red-500 text-white";
    if (streak >= 7) return "bg-yellow-500 text-white";
    return "bg-blue-500 text-white";
  };

  const getStreakLabel = () => {
    if (streak >= 30) return "Legendary";
    if (streak >= 14) return "On Fire";
    if (streak >= 7) return "Heating Up";
    return "Building";
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full",
      getStreakColor()
    )}>
      <Flame className="w-4 h-4" />
      <span className="font-bold">{streak}</span>
      <span className="text-sm opacity-90">day{streak !== 1 ? "s" : ""}</span>
      {isLongest && <span className="text-xs opacity-75">(best)</span>}
    </div>
  );
});

// ============================================================================
// ACTIVITY HEATMAP COMPONENT
// ============================================================================

interface ActivityHeatmapProps {
  activity: DailyActivity[];
}

const ActivityHeatmap = memo(function ActivityHeatmap({ activity }: ActivityHeatmapProps) {
  // Generate last 84 days (12 weeks)
  const days = useMemo(() => {
    const result: { date: Date; count: number; intensity: number }[] = [];
    const today = new Date();
    const activityMap = new Map(activity.map((a) => [a.date, a.count]));
    
    const maxCount = Math.max(...activity.map((a) => a.count), 1);

    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const count = activityMap.get(dateKey) || 0;
      
      result.push({
        date,
        count,
        intensity: count > 0 ? Math.ceil((count / maxCount) * 4) : 0,
      });
    }

    return result;
  }, [activity]);

  const getIntensityColor = (intensity: number): string => {
    const colors = [
      "bg-muted",
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary",
    ];
    return colors[intensity] || colors[0];
  };

  // Group by weeks
  const weeks = useMemo(() => {
    const result: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Activity (last 12 weeks)</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn("w-3 h-3 rounded-sm", getIntensityColor(i))}
            />
          ))}
          <span>More</span>
        </div>
      </div>
      
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "w-3 h-3 rounded-sm transition-colors",
                  getIntensityColor(day.intensity)
                )}
                title={`${day.date.toLocaleDateString()}: ${day.count} cards`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "default" | "success" | "warning" | "danger";
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
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    danger: "bg-red-50 border-red-200",
  };

  return (
    <Card className={cn(colorClasses[color])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 bg-background rounded-lg">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : null}
            <span className={cn(
              "text-xs",
              trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// ============================================================================
// ACHIEVEMENT BADGE COMPONENT
// ============================================================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

const AchievementBadge = memo(function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = achievement.icon;
  
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        achievement.unlocked
          ? "bg-primary/5 border-primary/20"
          : "bg-muted/50 border-muted opacity-60"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium", !achievement.unlocked && "text-muted-foreground")}>
          {achievement.name}
        </p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
        {achievement.progress !== undefined && achievement.maxProgress && (
          <div className="mt-2">
            <Progress
              value={(achievement.progress / achievement.maxProgress) * 100}
              className="h-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {achievement.progress} / {achievement.maxProgress}
            </p>
          </div>
        )}
      </div>
      {achievement.unlocked && (
        <Badge variant="default" className="bg-primary">
          Unlocked
        </Badge>
      )}
    </div>
  );
});

// ============================================================================
// MAIN PROGRESS TRACKER COMPONENT
// ============================================================================

export const ProgressTracker = memo(function ProgressTracker({ deckId }: ProgressTrackerProps) {
  const { decks, studyProgress, getDeckStats, getGlobalStats } = useFlashcardStore();

  // Get stats
  const stats = useMemo(() => {
    if (deckId) {
      return getDeckStats(deckId);
    }
    return getGlobalStats();
  }, [deckId, getDeckStats, getGlobalStats]);

  // Get deck-specific data
  const deck = useMemo(() => {
    if (deckId) {
      return decks.find((d) => d.id === deckId);
    }
    return null;
  }, [deckId, decks]);

  // Calculate achievements
  const achievements = useMemo((): Achievement[] => {
    const totalCards = stats.totalCards || stats.total || 0;
    const mastered = stats.mastered || 0;
    const sessionsCompleted = studyProgress.sessionsCompleted;
    const streakDays = studyProgress.streakDays;

    return [
      {
        id: "first-steps",
        name: "First Steps",
        description: "Review your first 10 cards",
        icon: BookOpen,
        unlocked: studyProgress.totalCardsStudied >= 10,
        progress: Math.min(studyProgress.totalCardsStudied, 10),
        maxProgress: 10,
      },
      {
        id: "dedicated-learner",
        name: "Dedicated Learner",
        description: "Complete 10 study sessions",
        icon: Brain,
        unlocked: sessionsCompleted >= 10,
        progress: Math.min(sessionsCompleted, 10),
        maxProgress: 10,
      },
      {
        id: "streak-master",
        name: "Streak Master",
        description: "Maintain a 7-day study streak",
        icon: Flame,
        unlocked: streakDays >= 7,
        progress: Math.min(streakDays, 7),
        maxProgress: 7,
      },
      {
        id: "card-collector",
        name: "Card Collector",
        description: "Create 50 flashcards",
        icon: Zap,
        unlocked: totalCards >= 50,
        progress: Math.min(totalCards, 50),
        maxProgress: 50,
      },
      {
        id: "mastery",
        name: "Mastery",
        description: "Master 100 cards",
        icon: Award,
        unlocked: mastered >= 100,
        progress: Math.min(mastered, 100),
        maxProgress: 100,
      },
    ];
  }, [stats, studyProgress]);

  // Calculate daily activity
  const dailyActivity = useMemo((): DailyActivity[] => {
    return Array.from(studyProgress.dailyStats.entries()).map(([date, stats]) => ({
      date,
      count: stats.cardsReviewed,
      correct: stats.correctCount,
    }));
  }, [studyProgress.dailyStats]);

  // Calculate success rate
  const successRate = useMemo(() => {
    if (studyProgress.totalCardsStudied === 0) return 0;
    return Math.round((studyProgress.totalCorrect / studyProgress.totalCardsStudied) * 100);
  }, [studyProgress]);

  // Calculate average session time
  const avgSessionTime = useMemo(() => {
    if (studyProgress.sessionsCompleted === 0) return 0;
    return Math.round(studyProgress.totalTimeSpent / studyProgress.sessionsCompleted / 60000);
  }, [studyProgress]);

  // Calculate study dates for streak
  const studyDates = useMemo(() => {
    return Array.from(studyProgress.dailyStats.values())
      .filter((s) => s.cardsReviewed > 0)
      .map((s) => new Date(s.date));
  }, [studyProgress.dailyStats]);

  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => calculateStreak(studyDates),
    [studyDates]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {deck ? `${deck.name} Progress` : "Study Progress"}
          </h2>
          <p className="text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>
        <StreakBadge streak={currentStreak} />
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Cards Studied"
          value={studyProgress.totalCardsStudied.toLocaleString()}
          subtitle="Total reviews"
          icon={BookOpen}
          trend="up"
          trendValue="+12% this week"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${studyProgress.totalCorrect} correct`}
          icon={Target}
          color={successRate >= 80 ? "success" : successRate >= 60 ? "warning" : "danger"}
        />
        <StatCard
          title="Sessions"
          value={studyProgress.sessionsCompleted}
          subtitle={`${avgSessionTime}min avg`}
          icon={Calendar}
        />
        <StatCard
          title="Mastered"
          value={stats.mastered || 0}
          subtitle={`of ${stats.total || stats.totalCards || 0} cards`}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Study Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap activity={dailyActivity} />
        </CardContent>
      </Card>

      {/* Deck Progress (if viewing specific deck) */}
      {deck && (
        <Card>
          <CardHeader>
            <CardTitle>Deck Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">
                  {Math.round(((stats.mastered || 0) / (stats.total || 1)) * 100)}%
                </span>
              </div>
              <Progress
                value={((stats.mastered || 0) / (stats.total || 1)) * 100}
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
                <div className="text-xs text-muted-foreground">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.learning}</div>
                <div className="text-xs text-muted-foreground">Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.review}</div>
                <div className="text-xs text-muted-foreground">Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.mastered}</div>
                <div className="text-xs text-muted-foreground">Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Tips */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Study Tip</h3>
              <p className="text-sm text-muted-foreground">
                {currentStreak === 0
                  ? "Start a study streak today! Consistency is key to long-term retention."
                  : currentStreak < 3
                  ? "Great start! Keep studying daily to build a strong habit."
                  : currentStreak < 7
                  ? "You're building momentum! Keep it up to reach a week-long streak."
                  : "Amazing dedication! Your consistent study habit is paying off."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ProgressTracker;
