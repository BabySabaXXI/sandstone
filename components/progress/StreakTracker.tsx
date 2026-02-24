"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/stores/progress-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Zap,
  Star,
  Crown,
} from "lucide-react";

interface StreakTrackerProps {
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

interface StreakBadgeProps {
  streak: number;
  isLongest?: boolean;
  size?: "sm" | "md" | "lg";
}

const StreakBadge = memo(function StreakBadge({
  streak,
  isLongest,
  size = "md",
}: StreakBadgeProps) {
  const getStreakConfig = () => {
    if (streak >= 100)
      return {
        color: "from-purple-500 to-pink-500",
        icon: Crown,
        label: "Legendary",
        glow: "shadow-purple-500/50",
      };
    if (streak >= 30)
      return {
        color: "from-orange-500 to-red-500",
        icon: Star,
        label: "Epic",
        glow: "shadow-orange-500/50",
      };
    if (streak >= 14)
      return {
        color: "from-red-500 to-orange-400",
        icon: Award,
        label: "On Fire",
        glow: "shadow-red-500/50",
      };
    if (streak >= 7)
      return {
        color: "from-yellow-400 to-orange-400",
        icon: Zap,
        label: "Heating Up",
        glow: "shadow-yellow-500/50",
      };
    return {
      color: "from-blue-400 to-cyan-400",
      icon: Flame,
      label: "Building",
      glow: "shadow-blue-500/50",
    };
  };

  const config = getStreakConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center rounded-full text-white font-semibold",
        "bg-gradient-to-r",
        config.color,
        sizeClasses[size],
        streak >= 7 && "shadow-lg " + config.glow
      )}
    >
      <Icon className={cn(iconSizes[size], streak >= 7 && "animate-pulse")} />
      <span>{streak}</span>
      <span className="opacity-90">day{streak !== 1 ? "s" : ""}</span>
      {isLongest && (
        <span className="text-xs opacity-75 ml-1">(best)</span>
      )}
    </motion.div>
  );
});

interface StreakDayProps {
  date: string;
  studied: boolean;
  isToday?: boolean;
}

const StreakDay = memo(function StreakDay({
  date,
  studied,
  isToday,
}: StreakDayProps) {
  const dayName = new Date(date).toLocaleDateString("en-US", {
    weekday: "narrow",
  });

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer",
              studied
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
              isToday && "ring-2 ring-primary"
            )}
          >
            <span className="text-xs font-medium">{dayName}</span>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                studied
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white"
                  : "bg-muted-foreground/20"
              )}
            >
              {studied && <Flame className="w-4 h-4" />}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {studied ? "Studied!" : "No activity"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export const StreakTracker = memo(function StreakTracker({
  className,
  showHistory = true,
  compact = false,
}: StreakTrackerProps) {
  const streakData = useProgressStore((state) => state.streakData);
  const streakHistory = useProgressStore((state) =>
    state.getStreakHistory(14)
  );

  const nextMilestone = useMemo(() => {
    const milestones = [3, 7, 14, 30, 60, 100];
    return milestones.find((m) => m > streakData.current) || 100;
  }, [streakData.current]);

  const progressToNext = useMemo(() => {
    return (streakData.current / nextMilestone) * 100;
  }, [streakData.current, nextMilestone]);

  const weeklyProgress = useMemo(() => {
    const thisWeek = streakHistory.slice(-7);
    const studiedDays = thisWeek.filter((d) => d.studied).length;
    return (studiedDays / 7) * 100;
  }, [streakHistory]);

  if (compact) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{streakData.current} days</p>
              </div>
            </div>
            <StreakBadge streak={streakData.current} size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak
          </span>
          <StreakBadge streak={streakData.current} />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main streak display */}
        <div className="flex items-center justify-center py-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-2xl" />
            <div className="relative flex flex-col items-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {streakData.current}
              </div>
              <p className="text-muted-foreground">day streak</p>
            </div>
          </motion.div>
        </div>

        {/* Progress to next milestone */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Progress to {nextMilestone} days
            </span>
            <span className="font-medium">
              {streakData.current}/{nextMilestone}
            </span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{streakData.longest}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{Math.round(weeklyProgress)}%</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">{nextMilestone - streakData.current}</p>
            <p className="text-xs text-muted-foreground">To Next</p>
          </div>
        </div>

        {/* Recent activity */}
        {showHistory && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Last 14 Days</p>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {streakHistory.map((day, index) => (
                <StreakDay
                  key={day.date}
                  date={day.date}
                  studied={day.studied}
                  isToday={index === streakHistory.length - 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-lg text-center",
            streakData.current === 0
              ? "bg-muted"
              : streakData.current < 3
              ? "bg-blue-50 dark:bg-blue-950/20"
              : streakData.current < 7
              ? "bg-yellow-50 dark:bg-yellow-950/20"
              : streakData.current < 30
              ? "bg-orange-50 dark:bg-orange-950/20"
              : "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
          )}
        >
          <p className="text-sm">
            {streakData.current === 0
              ? "Start a streak today! Consistency is key to long-term retention."
              : streakData.current < 3
              ? "Great start! Keep studying daily to build a strong habit."
              : streakData.current < 7
              ? "You're building momentum! Keep it up to reach a week-long streak."
              : streakData.current < 30
              ? "Amazing dedication! Your consistent study habit is paying off."
              : "Legendary streak! You're a true master of consistency!"}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
});

// Import needed for StreakDay
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default StreakTracker;
