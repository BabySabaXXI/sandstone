# Progress Tracking System Guide

A comprehensive progress tracking system for the Sandstone app that includes learning analytics, achievements, streaks, and milestones.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Hooks](#hooks)
- [Store API](#store-api)
- [Database Schema](#database-schema)
- [Customization](#customization)

## Overview

The Progress Tracking System provides a complete solution for tracking user learning progress in the Sandstone app. It includes:

- **Learning Analytics**: Detailed statistics about study sessions, accuracy trends, and performance metrics
- **Achievement System**: Unlockable badges with different tiers (Bronze, Silver, Gold, Platinum, Diamond)
- **Streak Tracking**: Daily, weekly, and monthly streak tracking with visual indicators
- **Milestone System**: Long-term goals with rewards (titles, themes, badges, points)
- **Progress Visualizations**: Heatmaps, charts, and progress indicators

## Features

### Learning Analytics

- Total cards studied, correct/incorrect answers
- Study time tracking (total and per session)
- Accuracy trends over time
- Study frequency analysis
- Preferred study time detection
- Subject performance breakdown

### Achievement System

- 20+ predefined achievements across 5 categories:
  - **Study**: Cards studied, sessions completed
  - **Streak**: Consecutive study days
  - **Mastery**: Cards mastered
  - **Social**: Sharing and community features
  - **Special**: Unique challenges

- 5 achievement tiers with increasing difficulty:
  - Bronze (10 points)
  - Silver (25 points)
  - Gold (50 points)
  - Platinum (100 points)
  - Diamond (250 points)

### Streak Tracking

- Current streak calculation
- Longest streak record
- Streak history visualization
- Weekly and monthly streak tracking
- Streak protection notifications

### Milestone System

- Long-term goals with specific targets
- Category-based milestones (cards, mastery, streak, time, consistency)
- Reward system:
  - Custom titles
  - Unlockable themes
  - Special badges
  - Bonus points

## Installation

### 1. Install Dependencies

```bash
npm install recharts
```

### 2. Run Database Migration

```bash
# Apply the progress tracking schema
psql -d your_database -f supabase/migrations/20240224_progress_tracking.sql
```

### 3. Import Components

```tsx
import { ProgressDashboard } from "@/components/progress";
import { useProgress } from "@/hooks/useProgress";
```

## Usage

### Basic Usage

```tsx
import { ProgressDashboard } from "@/components/progress";

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-8">
      <ProgressDashboard />
    </div>
  );
}
```

### Using the Hook

```tsx
import { useProgress } from "@/hooks/useProgress";

export default function StudySession() {
  const { 
    recordStudySession, 
    currentStreak, 
    totalPoints,
    checkAchievements 
  } = useProgress({
    autoSync: true,
    syncInterval: 5 * 60 * 1000, // 5 minutes
  });

  const handleSessionComplete = (sessionData) => {
    recordStudySession({
      date: new Date().toISOString(),
      cardsStudied: sessionData.cardsReviewed,
      correctAnswers: sessionData.correct,
      incorrectAnswers: sessionData.incorrect,
      timeSpent: sessionData.duration,
      qualityRatings: sessionData.ratings,
    });
    
    checkAchievements();
  };

  return (
    <div>
      <p>Current Streak: {currentStreak} days</p>
      <p>Total Points: {totalPoints}</p>
      {/* Session UI */}
    </div>
  );
}
```

### Recording Card Reviews

```tsx
import { useProgress } from "@/hooks/useProgress";

export default function FlashcardReview({ deckId, cardId }) {
  const { recordCardReview } = useProgress();

  const handleReview = (quality: number) => {
    const startTime = Date.now();
    
    // ... review logic ...
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    recordCardReview(deckId, cardId, quality, timeSpent);
  };

  return (
    // Review UI
  );
}
```

## Components

### ProgressDashboard

The main dashboard component that combines all progress tracking features.

```tsx
<ProgressDashboard 
  defaultTab="overview" // "overview" | "analytics" | "achievements" | "milestones" | "streaks"
/>
```

### StudyHeatmap

GitHub-style activity heatmap showing study patterns.

```tsx
<StudyHeatmap 
  days={84}        // Number of days to show
  showLegend       // Show intensity legend
  title="Activity" // Custom title
/>
```

### StreakTracker

Visual streak tracking with history and statistics.

```tsx
<StreakTracker 
  showHistory  // Show recent activity
  compact      // Compact mode for small spaces
/>
```

### AchievementShowcase

Display and track achievements.

```tsx
<AchievementShowcase 
  compact  // Compact mode
/>
```

### MilestoneTracker

Track progress towards long-term goals.

```tsx
<MilestoneTracker 
  compact  // Compact mode
/>
```

### LearningAnalytics

Detailed analytics with charts and insights.

```tsx
<LearningAnalytics 
  compact  // Compact mode
/>
```

## Hooks

### useProgress

Main hook for accessing all progress features.

```tsx
const {
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
  
  // Actions
  recordStudySession,
  recordCardReview,
  checkAchievements,
  checkMilestones,
  syncWithSupabase,
  exportData,
  importData,
  resetProgress,
} = useProgress(options);
```

### Specialized Hooks

```tsx
// Study sessions
const { sessions, getSessionsForDateRange } = useStudySessions();

// Streaks
const { current, longest, isStreakActive } = useStreaks();

// Achievements
const { achievements, unlockedAchievements, totalPoints } = useAchievements();

// Milestones
const { milestones, completedMilestones, getNextMilestone } = useMilestones();

// Daily stats
const { todayStats, getStatsForLastNDays } = useDailyStats();

// Analytics
const { analytics, accuracyTrend, studyHeatmap } = useLearningAnalytics();
```

## Store API

### State

```typescript
interface ProgressState {
  sessions: StudySession[];
  dailyStats: Map<string, DailyStats>;
  weeklyStats: Map<string, WeeklyStats>;
  monthlyStats: Map<string, MonthlyStats>;
  achievements: Achievement[];
  unlockedAchievements: string[];
  totalPoints: number;
  milestones: Milestone[];
  completedMilestones: string[];
  streakData: StreakData;
  analytics: LearningAnalytics;
}
```

### Actions

```typescript
// Study session management
recordStudySession(session: Omit<StudySession, "id">): void;
recordCardReview(deckId: string, cardId: string, quality: number, timeSpent: number): void;

// Achievement management
checkAchievements(): void;
unlockAchievement(achievementId: string): void;
getUnlockedAchievements(): Achievement[];
getLockedAchievements(): Achievement[];
getAchievementsByCategory(category: Achievement["category"]): Achievement[];

// Milestone management
checkMilestones(): void;
completeMilestone(milestoneId: string): void;
getCompletedMilestones(): Milestone[];
getPendingMilestones(): Milestone[];

// Streak management
updateStreak(): void;
getStreakData(): StreakData;
getStreakHistory(days: number): { date: string; studied: boolean }[];

// Analytics
updateAnalytics(): void;
getAnalytics(): LearningAnalytics;
getAccuracyTrend(days: number): { date: string; accuracy: number }[];
getStudyHeatmap(days: number): { date: string; count: number; intensity: number }[];

// Data management
syncWithSupabase(): Promise<void>;
exportData(): object;
importData(data: object): void;
resetProgress(): void;
```

## Database Schema

### Tables

- `user_progress` - Aggregated user statistics
- `study_sessions` - Individual study session records
- `daily_stats` - Daily aggregated statistics
- `achievements` - Achievement definitions
- `user_achievements` - User unlocked achievements
- `milestones` - Milestone definitions
- `user_milestones` - User milestone progress
- `streak_history` - Daily streak tracking

### Views

- `user_progress_summary` - Combined view of user progress with achievement/milestone counts

### Functions

- `calculate_user_streak(user_id UUID)` - Calculate current and longest streak
- `update_user_stats_after_session()` - Trigger function to update stats after each session

## Customization

### Adding Custom Achievements

```typescript
// In your component or initialization
const customAchievements: Achievement[] = [
  {
    id: "custom-achievement",
    name: "Custom Achievement",
    description: "Description of the achievement",
    icon: "Star",
    category: "special",
    tier: "gold",
    requirement: {
      type: "cards_studied",
      value: 100,
    },
    progress: 0,
    maxProgress: 100,
    points: 50,
  },
];

// Add to store
useProgressStore.setState((state) => ({
  achievements: [...state.achievements, ...customAchievements],
}));
```

### Adding Custom Milestones

```typescript
const customMilestones: Milestone[] = [
  {
    id: "custom-milestone",
    name: "Custom Milestone",
    description: "Description of the milestone",
    category: "cards",
    target: 1000,
    current: 0,
    completed: false,
    reward: {
      type: "title",
      value: "Custom Title",
    },
  },
];

useProgressStore.setState((state) => ({
  milestones: [...state.milestones, ...customMilestones],
}));
```

### Customizing Visualizations

```tsx
// Custom heatmap colors
const customColors = [
  "bg-gray-100",
  "bg-blue-200",
  "bg-blue-300",
  "bg-blue-400",
  "bg-blue-500",
  "bg-blue-600",
];

// Custom achievement tiers
const customTierConfig = {
  ruby: {
    color: "from-red-500 to-pink-500",
    points: 500,
  },
};
```

## Best Practices

1. **Auto-sync**: Enable auto-sync for real-time progress tracking across devices
2. **Session Recording**: Record study sessions immediately after completion
3. **Card Reviews**: Record individual card reviews for more accurate analytics
4. **Error Handling**: Always handle errors from sync operations gracefully
5. **Performance**: Use selector hooks to prevent unnecessary re-renders

## Troubleshooting

### Common Issues

1. **Progress not syncing**: Check Supabase connection and RLS policies
2. **Achievements not unlocking**: Ensure `checkAchievements()` is called after recording sessions
3. **Streak not updating**: Verify `updateStreak()` is called daily
4. **Storage quota exceeded**: Implement data cleanup for old sessions

### Debug Mode

```tsx
// Enable debug logging
if (process.env.NODE_ENV === "development") {
  useProgressStore.subscribe((state) => {
    console.log("Progress state:", state);
  });
}
```

## License

MIT License - Part of the Sandstone App
