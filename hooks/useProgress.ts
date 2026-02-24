/**
 * useProgress Hook
 * 
 * A comprehensive hook for tracking and managing user progress in the Sandstone app.
 * Provides easy access to study sessions, achievements, streaks, and analytics.
 */

import { useCallback, useEffect, useMemo } from "react";
import { useProgressStore, type StudySession } from "@/stores/progress-store";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================

interface UseProgressOptions {
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

interface UseProgressReturn {
  // Stats
  totalCardsStudied: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalTimeSpent: number;
  totalSessions: number;
  averageAccuracy: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Points
  totalPoints: number;
  
  // Achievements
  achievements: ReturnType<typeof useProgressStore.getState.achievements>;
  unlockedAchievements: ReturnType<typeof useProgressStore.getState.getUnlockedAchievements>;
  lockedAchievements: ReturnType<typeof useProgressStore.getState.getLockedAchievements>;
  
  // Milestones
  milestones: ReturnType<typeof useProgressStore.getState.milestones>;
  completedMilestones: ReturnType<typeof useProgressStore.getState.getCompletedMilestones>;
  pendingMilestones: ReturnType<typeof useProgressStore.getState.getPendingMilestones>;
  
  // Analytics
  analytics: ReturnType<typeof useProgressStore.getState.analytics>;
  accuracyTrend: ReturnType<typeof useProgressStore.getState.getAccuracyTrend>;
  studyHeatmap: ReturnType<typeof useProgressStore.getState.getStudyHeatmap>;
  
  // Actions
  recordStudySession: (session: Omit<StudySession, "id">) => void;
  recordCardReview: (deckId: string, cardId: string, quality: number, timeSpent: number) => void;
  checkAchievements: () => void;
  checkMilestones: () => void;
  syncWithSupabase: () => Promise<void>;
  exportData: () => object;
  importData: (data: object) => void;
  resetProgress: () => void;
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
}

// ============================================================================
// HOOK
// ============================================================================

export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const { autoSync = false, syncInterval = 5 * 60 * 1000 } = options; // Default 5 minutes

  // Get store state
  const store = useProgressStore();
  
  const {
    analytics,
    streakData,
    achievements,
    unlockedAchievements,
    milestones,
    completedMilestones,
    totalPoints,
    isLoading,
    error,
    lastSyncedAt,
  } = store;

  // Memoized derived values
  const {
    totalCardsStudied,
    totalCorrect,
    totalIncorrect,
    totalTimeSpent,
    totalSessions,
    averageAccuracy,
  } = analytics;

  const { current: currentStreak, longest: longestStreak } = streakData;

  const lockedAchievements = useMemo(
    () => store.getLockedAchievements(),
    [achievements]
  );

  const pendingMilestones = useMemo(
    () => store.getPendingMilestones(),
    [milestones]
  );

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync) return;

    const sync = async () => {
      try {
        await store.syncWithSupabase();
      } catch (error) {
        console.error("Auto-sync failed:", error);
      }
    };

    // Initial sync
    sync();

    // Set up interval
    const intervalId = setInterval(sync, syncInterval);

    return () => clearInterval(intervalId);
  }, [autoSync, syncInterval, store]);

  // Wrapped actions with error handling
  const recordStudySession = useCallback(
    (session: Omit<StudySession, "id">) => {
      try {
        store.recordStudySession(session);
        
        // Show toast for significant milestones
        const totalCards = analytics.totalCardsStudied + session.cardsStudied;
        const milestones = [100, 500, 1000, 5000];
        const prevTotal = analytics.totalCardsStudied;
        
        for (const milestone of milestones) {
          if (prevTotal < milestone && totalCards >= milestone) {
            toast.success(`Milestone reached: ${milestone} cards studied!`, {
              icon: "🎉",
            });
            break;
          }
        }
      } catch (error) {
        console.error("Failed to record study session:", error);
        toast.error("Failed to record study session");
      }
    },
    [store, analytics.totalCardsStudied]
  );

  const recordCardReview = useCallback(
    (deckId: string, cardId: string, quality: number, timeSpent: number) => {
      try {
        store.recordCardReview(deckId, cardId, quality, timeSpent);
      } catch (error) {
        console.error("Failed to record card review:", error);
      }
    },
    [store]
  );

  const checkAchievements = useCallback(() => {
    store.checkAchievements();
  }, [store]);

  const checkMilestones = useCallback(() => {
    store.checkMilestones();
  }, [store]);

  const syncWithSupabase = useCallback(async () => {
    try {
      await store.syncWithSupabase();
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to sync progress");
      throw error;
    }
  }, [store]);

  const exportData = useCallback(() => {
    return store.exportData();
  }, [store]);

  const importData = useCallback(
    (data: object) => {
      try {
        store.importData(data);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import progress data");
        throw error;
      }
    },
    [store]
  );

  const resetProgress = useCallback(() => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      );
      if (confirmed) {
        store.resetProgress();
      }
    }
  }, [store]);

  // Analytics getters
  const accuracyTrend = useCallback(
    (days: number) => store.getAccuracyTrend(days),
    [store]
  );

  const studyHeatmap = useCallback(
    (days: number) => store.getStudyHeatmap(days),
    [store]
  );

  return {
    // Stats
    totalCardsStudied,
    totalCorrect,
    totalIncorrect,
    totalTimeSpent,
    totalSessions,
    averageAccuracy,
    
    // Streaks
    currentStreak,
    longestStreak,
    
    // Points
    totalPoints,
    
    // Achievements
    achievements,
    unlockedAchievements,
    lockedAchievements,
    
    // Milestones
    milestones,
    completedMilestones,
    pendingMilestones,
    
    // Analytics
    analytics,
    accuracyTrend,
    studyHeatmap,
    
    // Actions
    recordStudySession,
    recordCardReview,
    checkAchievements,
    checkMilestones,
    syncWithSupabase,
    exportData,
    importData,
    resetProgress,
    
    // Loading state
    isLoading,
    error,
    lastSyncedAt,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for tracking study sessions specifically
 */
export function useStudySessions() {
  const store = useProgressStore();
  const sessions = store.sessions;

  const getSessionsForDateRange = useCallback(
    (startDate: Date, endDate: Date) => {
      return sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    },
    [sessions]
  );

  const getSessionsForDeck = useCallback(
    (deckId: string) => {
      return sessions.filter((session) => session.deckId === deckId);
    },
    [sessions]
  );

  const getTotalStudyTime = useCallback(() => {
    return sessions.reduce((total, session) => total + session.timeSpent, 0);
  }, [sessions]);

  const getAverageSessionLength = useCallback(() => {
    if (sessions.length === 0) return 0;
    return getTotalStudyTime() / sessions.length;
  }, [sessions, getTotalStudyTime]);

  return {
    sessions,
    sessionsCount: sessions.length,
    getSessionsForDateRange,
    getSessionsForDeck,
    getTotalStudyTime,
    getAverageSessionLength,
  };
}

/**
 * Hook for tracking streaks
 */
export function useStreaks() {
  const store = useProgressStore();
  const streakData = store.streakData;

  const streakHistory = useMemo(
    () => store.getStreakHistory(30),
    [store]
  );

  const isStreakActive = useMemo(() => {
    if (!streakData.lastStudyDate) return false;
    const lastStudy = new Date(streakData.lastStudyDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastStudyStr = lastStudy.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    return lastStudyStr === todayStr || lastStudyStr === yesterdayStr;
  }, [streakData.lastStudyDate]);

  const daysUntilStreakBreak = useMemo(() => {
    if (!isStreakActive) return 0;
    const lastStudy = new Date(streakData.lastStudyDate!);
    const today = new Date();
    const lastStudyStr = lastStudy.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];
    
    if (lastStudyStr === todayStr) return 1;
    return 0;
  }, [isStreakActive, streakData.lastStudyDate]);

  return {
    ...streakData,
    streakHistory,
    isStreakActive,
    daysUntilStreakBreak,
  };
}

/**
 * Hook for achievements
 */
export function useAchievements() {
  const store = useProgressStore();
  const { achievements, totalPoints, unlockedAchievements } = store;

  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = (unlockedCount / totalCount) * 100;

  const achievementsByCategory = useCallback(
    (category: Parameters<typeof store.getAchievementsByCategory>[0]) => {
      return store.getAchievementsByCategory(category);
    },
    [store]
  );

  const getNextAchievements = useCallback(
    (limit: number = 3) => {
      return store
        .getLockedAchievements()
        .map((a) => ({
          ...a,
          progressPercentage: (a.progress / a.maxProgress) * 100,
        }))
        .sort((a, b) => b.progressPercentage - a.progressPercentage)
        .slice(0, limit);
    },
    [store]
  );

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements: store.getLockedAchievements(),
    totalPoints,
    unlockedCount,
    totalCount,
    completionPercentage,
    achievementsByCategory,
    getNextAchievements,
  };
}

/**
 * Hook for milestones
 */
export function useMilestones() {
  const store = useProgressStore();
  const { milestones, completedMilestones } = store;

  const completedCount = completedMilestones.length;
  const totalCount = milestones.length;
  const completionPercentage = (completedCount / totalCount) * 100;

  const getNextMilestone = useCallback(() => {
    return store
      .getPendingMilestones()
      .map((m) => ({
        ...m,
        progressPercentage: (m.current / m.target) * 100,
      }))
      .sort((a, b) => b.progressPercentage - a.progressPercentage)[0];
  }, [store]);

  const getMilestonesByCategory = useCallback(
    (category: Parameters<typeof store.milestones>[0]["category"]) => {
      return milestones.filter((m) => m.category === category);
    },
    [milestones]
  );

  return {
    milestones,
    completedMilestones,
    pendingMilestones: store.getPendingMilestones(),
    completedCount,
    totalCount,
    completionPercentage,
    getNextMilestone,
    getMilestonesByCategory,
  };
}

/**
 * Hook for daily stats
 */
export function useDailyStats() {
  const store = useProgressStore();
  const dailyStats = store.dailyStats;

  const todayStats = useMemo(
    () => store.getDailyStats(),
    [store, dailyStats]
  );

  const getStatsForLastNDays = useCallback(
    (days: number) => {
      const result: ReturnType<typeof store.getDailyStats>[] = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        const stats = store.getDailyStats(dateKey);
        if (stats) {
          result.push(stats);
        }
      }
      
      return result;
    },
    [store]
  );

  const getStudyDaysCount = useCallback(
    (days: number) => {
      const stats = getStatsForLastNDays(days);
      return stats.filter((s) => s && s.cardsReviewed > 0).length;
    },
    [getStatsForLastNDays]
  );

  const getTotalCardsForPeriod = useCallback(
    (days: number) => {
      const stats = getStatsForLastNDays(days);
      return stats.reduce((total, s) => total + (s?.cardsReviewed || 0), 0);
    },
    [getStatsForLastNDays]
  );

  return {
    dailyStats,
    todayStats,
    getStatsForLastNDays,
    getStudyDaysCount,
    getTotalCardsForPeriod,
  };
}

/**
 * Hook for learning analytics
 */
export function useLearningAnalytics() {
  const store = useProgressStore();
  const { analytics } = store;

  const accuracyTrend = useCallback(
    (days: number) => store.getAccuracyTrend(days),
    [store]
  );

  const studyHeatmap = useCallback(
    (days: number) => store.getStudyHeatmap(days),
    [store]
  );

  const subjectPerformance = useMemo(
    () => analytics.subjectPerformance,
    [analytics.subjectPerformance]
  );

  const getPerformanceInsight = useCallback(() => {
    const { averageAccuracy, totalCardsStudied, cardsPerDay } = analytics;

    if (averageAccuracy >= 80) {
      return {
        type: "success" as const,
        message:
          "Excellent accuracy! You're retaining information very well. Consider increasing your daily card count.",
      };
    } else if (averageAccuracy >= 60) {
      return {
        type: "info" as const,
        message:
          "Good progress! Focus on reviewing cards you find difficult to improve your accuracy.",
      };
    } else if (totalCardsStudied < 50) {
      return {
        type: "info" as const,
        message:
          "You're just getting started! Consistency is key - try to study a little every day.",
      };
    } else {
      return {
        type: "warning" as const,
        message:
          "Consider adjusting your study schedule. Reviewing cards more frequently may help improve retention.",
      };
    }
  }, [analytics]);

  return {
    analytics,
    accuracyTrend,
    studyHeatmap,
    subjectPerformance,
    getPerformanceInsight,
  };
}

export default useProgress;
