/**
 * Progress Tracking Components
 * 
 * A comprehensive collection of components for tracking and visualizing
 * learning progress, achievements, streaks, and milestones.
 */

// Main dashboard
export { ProgressDashboard } from "./ProgressDashboard";

// Visualization components
export { StudyHeatmap } from "./StudyHeatmap";
export { StreakTracker } from "./StreakTracker";
export { AchievementShowcase } from "./AchievementShowcase";
export { MilestoneTracker } from "./MilestoneTracker";
export { LearningAnalytics } from "./LearningAnalytics";

// Re-export types from store
export type {
  StudySession,
  DailyStats,
  WeeklyStats,
  MonthlyStats,
  Achievement,
  Milestone,
  StreakData,
  LearningAnalytics,
} from "@/stores/progress-store";
