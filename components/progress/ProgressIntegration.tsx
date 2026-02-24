"use client";

/**
 * Progress Integration Component
 * 
 * This component demonstrates how to integrate the progress tracking system
 * with the existing flashcard study functionality.
 */

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Flame,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";

interface StudySessionTrackerProps {
  deckId: string;
  onSessionComplete?: () => void;
}

interface SessionStats {
  cardsStudied: number;
  correct: number;
  incorrect: number;
  startTime: number;
  qualityRatings: number[];
}

/**
 * Component to track a study session and record progress
 */
export const StudySessionTracker = memo(function StudySessionTracker({
  deckId,
  onSessionComplete,
}: StudySessionTrackerProps) {
  const { recordStudySession, currentStreak, totalPoints, checkAchievements } =
    useProgress({ autoSync: true });

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    cardsStudied: 0,
    correct: 0,
    incorrect: 0,
    startTime: Date.now(),
    qualityRatings: [],
  });

  const [isSessionActive, setIsSessionActive] = useState(false);

  const startSession = useCallback(() => {
    setSessionStats({
      cardsStudied: 0,
      correct: 0,
      incorrect: 0,
      startTime: Date.now(),
      qualityRatings: [],
    });
    setIsSessionActive(true);
    toast.info("Study session started!");
  }, []);

  const recordCardResult = useCallback(
    (quality: number) => {
      setSessionStats((prev) => ({
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
        qualityRatings: [...prev.qualityRatings, quality],
      }));
    },
    [setSessionStats]
  );

  const endSession = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - sessionStats.startTime) / 1000);

    recordStudySession({
      date: new Date().toISOString(),
      deckId,
      cardsStudied: sessionStats.cardsStudied,
      correctAnswers: sessionStats.correct,
      incorrectAnswers: sessionStats.incorrect,
      timeSpent,
      qualityRatings: sessionStats.qualityRatings,
    });

    checkAchievements();

    // Show session summary
    const accuracy =
      sessionStats.cardsStudied > 0
        ? Math.round(
            (sessionStats.correct / sessionStats.cardsStudied) * 100
          )
        : 0;

    toast.success(
      `Session complete! ${sessionStats.cardsStudied} cards studied with ${accuracy}% accuracy`,
      {
        icon: "🎉",
        duration: 5000,
      }
    );

    setIsSessionActive(false);
    onSessionComplete?.();
  }, [
    sessionStats,
    deckId,
    recordStudySession,
    checkAchievements,
    onSessionComplete,
  ]);

  const accuracy =
    sessionStats.cardsStudied > 0
      ? Math.round(
          (sessionStats.correct / sessionStats.cardsStudied) * 100
        )
      : 0;

  if (!isSessionActive) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Study?</h3>
              <p className="text-sm text-muted-foreground">
                Current streak: {currentStreak} days
              </p>
            </div>
            <Button onClick={startSession} size="lg">
              <Zap className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Study Session
          </span>
          <Badge variant="secondary">{sessionStats.cardsStudied} cards</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{sessionStats.correct}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <XCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
            <p className="text-2xl font-bold">{sessionStats.incorrect}</p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Session Progress</span>
            <span className="font-medium">
              {sessionStats.cardsStudied} cards
            </span>
          </div>
          <Progress value={Math.min(sessionStats.cardsStudied * 5, 100)} />
        </div>

        {/* Quick rating buttons */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant={rating >= 3 ? "default" : "destructive"}
              size="sm"
              className="flex-1"
              onClick={() => recordCardResult(rating)}
            >
              {rating}
            </Button>
          ))}
        </div>

        {/* End session button */}
        <Button
          onClick={endSession}
          variant="outline"
          className="w-full"
          disabled={sessionStats.cardsStudied === 0}
        >
          End Session
        </Button>
      </CardContent>
    </Card>
  );
});

/**
 * Mini progress widget for embedding in other components
 */
export const MiniProgressWidget = memo(function MiniProgressWidget() {
  const {
    currentStreak,
    totalPoints,
    unlockedAchievements,
    achievements,
    todayStats,
  } = useProgress();

  const achievementProgress =
    (unlockedAchievements.length / achievements.length) * 100;

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4 space-y-4">
        {/* Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-medium">{currentStreak} day streak</span>
          </div>
          <Badge variant="secondary">{totalPoints} pts</Badge>
        </div>

        {/* Today's progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today</span>
            <span className="font-medium">
              {todayStats?.cardsReviewed || 0} cards
            </span>
          </div>
          <Progress
            value={Math.min((todayStats?.cardsReviewed || 0) * 10, 100)}
            className="h-2"
          />
        </div>

        {/* Achievement progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Achievements</span>
            <span className="font-medium">
              {unlockedAchievements.length}/{achievements.length}
            </span>
          </div>
          <Progress value={achievementProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Achievement notification component
 */
export const AchievementNotification = memo(function AchievementNotification({
  achievement,
  onClose,
}: {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
    points: number;
  };
  onClose: () => void;
}) {
  const tierColors: Record<string, string> = {
    bronze: "from-amber-600 to-amber-700",
    silver: "from-slate-400 to-slate-500",
    gold: "from-yellow-400 to-yellow-500",
    platinum: "from-cyan-400 to-cyan-500",
    diamond: "from-purple-400 via-pink-400 to-red-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={cn(
        "fixed bottom-4 right-4 p-6 rounded-2xl shadow-2xl",
        "bg-gradient-to-br",
        tierColors[achievement.tier] || tierColors.bronze,
        "text-white max-w-sm z-50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <p className="text-sm opacity-80 uppercase tracking-wide">
            Achievement Unlocked
          </p>
          <h3 className="text-xl font-bold">{achievement.name}</h3>
          <p className="text-sm opacity-90 mt-1">{achievement.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-white/20 text-white border-0">
              <Star className="w-3 h-3 mr-1" />
              +{achievement.points}
            </Badge>
            <Badge className="bg-white/20 text-white border-0 capitalize">
              {achievement.tier}
            </Badge>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
});

// Import XCircle for the close button
import { XCircle } from "lucide-react";

/**
 * Progress summary card for dashboard
 */
export const ProgressSummaryCard = memo(function ProgressSummaryCard() {
  const {
    totalCardsStudied,
    averageAccuracy,
    currentStreak,
    totalPoints,
    completedMilestones,
    milestones,
  } = useProgress();

  const milestoneProgress =
    (completedMilestones.length / milestones.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{totalCardsStudied}</p>
            <p className="text-xs text-muted-foreground">Cards Studied</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{Math.round(averageAccuracy)}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Milestones</span>
            <span className="font-medium">
              {completedMilestones.length}/{milestones.length}
            </span>
          </div>
          <Progress value={milestoneProgress} />
        </div>
      </CardContent>
    </Card>
  );
});

export default {
  StudySessionTracker,
  MiniProgressWidget,
  AchievementNotification,
  ProgressSummaryCard,
};
