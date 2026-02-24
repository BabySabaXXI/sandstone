/**
 * Enhanced SM-2 Spaced Repetition Algorithm
 * Features: FSRS-inspired improvements, difficulty tracking, adaptive intervals
 */

// ============================================================================
// TYPES
// ============================================================================

export interface SM2Card {
  interval: number; // days until next review
  repetitionCount: number; // number of successful reviews (n)
  easeFactor: number; // difficulty factor (EF), starts at 2.5
  difficulty?: number; // 0-1 difficulty rating (FSRS-inspired)
  stability?: number; // memory stability in days (FSRS-inspired)
  lastReview?: Date;
  nextReview?: Date;
  reviewHistory?: ReviewEntry[];
  lapses?: number; // number of times card was forgotten
}

export interface ReviewEntry {
  date: Date;
  quality: number; // 0-5 rating
  interval: number;
  easeFactor: number;
  timeSpent?: number; // milliseconds spent on card
}

export interface SM2Result {
  interval: number;
  repetitionCount: number;
  easeFactor: number;
  difficulty: number;
  stability: number;
  nextReviewDate: Date;
  lapses: number;
}

export interface StudySession {
  id: string;
  deckId: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  correctCount: number;
  ratings: number[];
  totalTimeSpent: number;
}

export interface CardStats {
  totalReviews: number;
  averageRating: number;
  successRate: number;
  averageTimeSpent: number;
  lastReviewed: Date | null;
  nextReview: Date | null;
  status: 'new' | 'learning' | 'review' | 'relearning';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.0;
const DEFAULT_EASE_FACTOR = 2.5;
const DEFAULT_INTERVAL = 1;
const LEARNING_THRESHOLD = 3; // repetitions to graduate from learning
const MASTERY_THRESHOLD = 5; // repetitions to consider mastered

// FSRS-inspired constants
const STABILITY_BASE = 0.5;
const DIFFICULTY_BASE = 0.3;

// ============================================================================
// CORE SM-2 ALGORITHM (Enhanced)
// ============================================================================

/**
 * Calculate next review using enhanced SM-2 algorithm
 * @param quality 0-5 rating (5 = perfect, 0 = complete blackout)
 * @param currentInterval current interval in days
 * @param repetitionCount number of successful reviews
 * @param easeFactor current ease factor
 * @param lapses number of times card was forgotten
 */
export function calculateSM2Enhanced(
  quality: number,
  currentInterval: number = 0,
  repetitionCount: number = 0,
  easeFactor: number = DEFAULT_EASE_FACTOR,
  lapses: number = 0
): SM2Result {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, quality));

  let newInterval: number;
  let newRepetitionCount: number;
  let newEaseFactor: number;
  let newLapses = lapses;
  let stability: number;
  let difficulty: number;

  if (quality < 3) {
    // Failed - card enters/exits relearning phase
    newLapses = lapses + 1;
    newRepetitionCount = 0;
    newInterval = 1; // Reset to 1 day
    
    // Graduated intervals for relearning (shorter than initial learning)
    if (newLapses > 1) {
      newInterval = Math.min(newInterval * Math.pow(0.8, newLapses - 1), 1);
    }
    
    // Reduce ease factor more for repeated failures
    const easePenalty = 0.2 + (newLapses * 0.05);
    newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - easePenalty);
    
    // Calculate difficulty and stability for failed cards
    difficulty = Math.min(1, DIFFICULTY_BASE + (newLapses * 0.1) + ((3 - quality) * 0.1));
    stability = STABILITY_BASE * Math.pow(0.7, newLapses);
  } else {
    // Passed - increase interval
    newRepetitionCount = repetitionCount + 1;

    if (newRepetitionCount === 1) {
      newInterval = 1;
      stability = 1;
    } else if (newRepetitionCount === 2) {
      newInterval = 6;
      stability = 6;
    } else {
      // Enhanced interval calculation with stability factor
      const stabilityBonus = Math.min(1.2, 1 + (newRepetitionCount - 3) * 0.05);
      newInterval = Math.round(currentInterval * easeFactor * stabilityBonus);
      stability = newInterval;
    }

    // Update ease factor with quality adjustment
    // More nuanced formula: better ratings increase EF more, poor ratings decrease it
    const qualityDelta = 5 - quality;
    const easeAdjustment = 0.1 - (qualityDelta * (0.08 + qualityDelta * 0.02));
    newEaseFactor = easeFactor + easeAdjustment;
    
    // Calculate difficulty based on performance
    difficulty = Math.max(0, Math.min(1, 
      DIFFICULTY_BASE + ((5 - quality) * 0.1) - (newRepetitionCount * 0.02)
    ));
  }

  // Clamp ease factor
  newEaseFactor = Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEaseFactor));
  
  // Cap maximum interval at 365 days (1 year)
  newInterval = Math.min(newInterval, 365);

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitionCount: newRepetitionCount,
    easeFactor: newEaseFactor,
    difficulty,
    stability,
    nextReviewDate,
    lapses: newLapses,
  };
}

/**
 * Legacy SM-2 calculation for backwards compatibility
 */
export function calculateSM2(
  quality: number,
  currentInterval: number = 0,
  repetitionCount: number = 0,
  easeFactor: number = DEFAULT_EASE_FACTOR
): Omit<SM2Result, 'difficulty' | 'stability' | 'lapses'> {
  const result = calculateSM2Enhanced(quality, currentInterval, repetitionCount, easeFactor, 0);
  return {
    interval: result.interval,
    repetitionCount: result.repetitionCount,
    easeFactor: result.easeFactor,
    nextReviewDate: result.nextReviewDate,
  };
}

// ============================================================================
// CARD STATUS & PROGRESS
// ============================================================================

/**
 * Get card status based on repetition count and lapses
 */
export function getCardStatus(card: Partial<SM2Card>): 'new' | 'learning' | 'review' | 'relearning' {
  if (!card.repetitionCount || card.repetitionCount === 0) {
    return card.lapses && card.lapses > 0 ? 'relearning' : 'new';
  }
  if (card.repetitionCount < LEARNING_THRESHOLD) {
    return 'learning';
  }
  return 'review';
}

/**
 * Check if card is mastered
 */
export function isCardMastered(card: Partial<SM2Card>): boolean {
  return (card.repetitionCount || 0) >= MASTERY_THRESHOLD && (card.lapses || 0) === 0;
}

/**
 * Calculate card difficulty label
 */
export function getDifficultyLabel(easeFactor: number): 'easy' | 'medium' | 'hard' {
  if (easeFactor >= 2.3) return 'easy';
  if (easeFactor >= 1.8) return 'medium';
  return 'hard';
}

// ============================================================================
// DECK STATISTICS
// ============================================================================

export interface DeckStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  due: number;
  mastered: number;
  averageEaseFactor: number;
  averageDifficulty: number;
  totalLapses: number;
}

/**
 * Calculate comprehensive deck statistics
 */
export function calculateDeckStats<T extends SM2Card>(cards: T[]): DeckStats {
  const now = new Date();
  
  const stats: DeckStats = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    due: 0,
    mastered: 0,
    averageEaseFactor: 0,
    averageDifficulty: 0,
    totalLapses: 0,
  };

  let totalEaseFactor = 0;
  let totalDifficulty = 0;
  let cardsWithEase = 0;

  for (const card of cards) {
    const status = getCardStatus(card);
    stats[status]++;

    if (!card.nextReview || card.nextReview <= now) {
      stats.due++;
    }

    if (isCardMastered(card)) {
      stats.mastered++;
    }

    if (card.easeFactor) {
      totalEaseFactor += card.easeFactor;
      cardsWithEase++;
    }

    if (card.difficulty !== undefined) {
      totalDifficulty += card.difficulty;
    }

    if (card.lapses) {
      stats.totalLapses += card.lapses;
    }
  }

  stats.averageEaseFactor = cardsWithEase > 0 ? totalEaseFactor / cardsWithEase : DEFAULT_EASE_FACTOR;
  stats.averageDifficulty = cards.length > 0 ? totalDifficulty / cards.length : DIFFICULTY_BASE;

  return stats;
}

// ============================================================================
// DUE CARDS & SCHEDULING
// ============================================================================

/**
 * Get cards due for review
 */
export function getDueCards<T extends { nextReview?: Date | null }>(cards: T[]): T[] {
  const now = new Date();
  return cards.filter((card) => !card.nextReview || card.nextReview <= now);
}

/**
 * Get cards due on a specific date
 */
export function getCardsDueOnDate<T extends { nextReview?: Date | null }>(
  cards: T[],
  date: Date
): T[] {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return cards.filter((card) => {
    if (!card.nextReview) return false;
    return card.nextReview >= startOfDay && card.nextReview <= endOfDay;
  });
}

/**
 * Get upcoming reviews for the next N days
 */
export function getUpcomingReviews<T extends { nextReview?: Date | null }>(
  cards: T[],
  days: number
): Map<string, T[]> {
  const reviews = new Map<string, T[]>();
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    reviews.set(dateKey, []);
  }

  for (const card of cards) {
    if (!card.nextReview) continue;
    
    const dateKey = card.nextReview.toISOString().split('T')[0];
    if (reviews.has(dateKey)) {
      reviews.get(dateKey)!.push(card);
    }
  }

  return reviews;
}

// ============================================================================
// STUDY SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new study session
 */
export function createStudySession(deckId: string): StudySession {
  return {
    id: crypto.randomUUID(),
    deckId,
    startTime: new Date(),
    cardsReviewed: 0,
    correctCount: 0,
    ratings: [],
    totalTimeSpent: 0,
  };
}

/**
 * End a study session and calculate final stats
 */
export function endStudySession(session: StudySession): StudySession {
  return {
    ...session,
    endTime: new Date(),
  };
}

/**
 * Calculate session accuracy
 */
export function calculateSessionAccuracy(session: StudySession): number {
  if (session.cardsReviewed === 0) return 0;
  return Math.round((session.correctCount / session.cardsReviewed) * 100);
}

/**
 * Calculate average rating for a session
 */
export function calculateAverageRating(session: StudySession): number {
  if (session.ratings.length === 0) return 0;
  const sum = session.ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / session.ratings.length) * 10) / 10;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export interface ProgressMetrics {
  daily: {
    date: string;
    cardsReviewed: number;
    correctCount: number;
    averageRating: number;
    timeSpent: number;
  }[];
  weekly: {
    week: string;
    cardsReviewed: number;
    correctCount: number;
    averageRating: number;
  }[];
  monthly: {
    month: string;
    cardsReviewed: number;
    correctCount: number;
    streak: number;
  }[];
  streak: {
    current: number;
    longest: number;
    lastStudyDate: Date | null;
  };
}

/**
 * Calculate study streak
 */
export function calculateStreak(studyDates: Date[]): { current: number; longest: number } {
  if (studyDates.length === 0) return { current: 0, longest: 0 };

  // Sort dates in descending order
  const sortedDates = studyDates
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  // Remove duplicates
  const uniqueDates = [...new Set(sortedDates)];

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = uniqueDates[i - 1] - 24 * 60 * 60 * 1000;
      if (uniqueDates[i] === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let currentRun = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const expectedDate = uniqueDates[i - 1] - 24 * 60 * 60 * 1000;
    if (uniqueDates[i] === expectedDate) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

// ============================================================================
// STUDY MODES
// ============================================================================

export type StudyMode = 'standard' | 'cram' | 'review' | 'learn' | 'custom';

export interface StudyModeConfig {
  mode: StudyMode;
  cardLimit?: number;
  timeLimit?: number; // minutes
  includeNew?: boolean;
  includeReview?: boolean;
  includeLearning?: boolean;
  shuffle?: boolean;
  focusOnWeak?: boolean;
}

/**
 * Filter cards based on study mode configuration
 */
export function filterCardsForStudyMode<T extends SM2Card>(
  cards: T[],
  config: StudyModeConfig
): T[] {
  let filtered = [...cards];

  // Filter by card type
  filtered = filtered.filter((card) => {
    const status = getCardStatus(card);
    if (status === 'new' && config.includeNew === false) return false;
    if (status === 'review' && config.includeReview === false) return false;
    if ((status === 'learning' || status === 'relearning') && config.includeLearning === false) return false;
    return true;
  });

  // Focus on weak cards (low ease factor or high lapses)
  if (config.focusOnWeak) {
    filtered.sort((a, b) => {
      const weaknessA = (a.lapses || 0) * 2 + (3 - (a.easeFactor || 2.5));
      const weaknessB = (b.lapses || 0) * 2 + (3 - (b.easeFactor || 2.5));
      return weaknessB - weaknessA;
    });
  }

  // Shuffle if requested
  if (config.shuffle) {
    filtered = shuffleArray(filtered);
  }

  // Apply card limit
  if (config.cardLimit && config.cardLimit > 0) {
    filtered = filtered.slice(0, config.cardLimit);
  }

  return filtered;
}

/**
 * Get default study mode configuration
 */
export function getDefaultStudyModeConfig(mode: StudyMode): StudyModeConfig {
  const configs: Record<StudyMode, StudyModeConfig> = {
    standard: {
      mode: 'standard',
      includeNew: true,
      includeReview: true,
      includeLearning: true,
      shuffle: false,
    },
    cram: {
      mode: 'cram',
      cardLimit: 50,
      includeNew: false,
      includeReview: true,
      includeLearning: true,
      shuffle: true,
      focusOnWeak: true,
    },
    review: {
      mode: 'review',
      includeNew: false,
      includeReview: true,
      includeLearning: false,
      shuffle: false,
    },
    learn: {
      mode: 'learn',
      cardLimit: 20,
      includeNew: true,
      includeReview: false,
      includeLearning: false,
      shuffle: true,
    },
    custom: {
      mode: 'custom',
      includeNew: true,
      includeReview: true,
      includeLearning: true,
    },
  };

  return configs[mode];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format interval for display
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  const years = Math.round(days / 365);
  return `${years} year${years > 1 ? 's' : ''}`;
}

/**
 * Get rating label
 */
export function getRatingLabel(rating: number): string {
  const labels: Record<number, string> = {
    0: 'Blackout',
    1: 'Again',
    2: 'Hard',
    3: 'Good',
    4: 'Easy',
    5: 'Perfect',
  };
  return labels[rating] || 'Unknown';
}

/**
 * Get rating color
 */
export function getRatingColor(rating: number): string {
  if (rating <= 1) return '#D4A8A8'; // Red-ish
  if (rating === 2) return '#E5D4A8'; // Yellow-ish
  if (rating === 3) return '#A8C5D4'; // Blue-ish
  return '#A8C5A8'; // Green-ish
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  calculateSM2,
  calculateSM2Enhanced,
  getCardStatus,
  isCardMastered,
  getDifficultyLabel,
  calculateDeckStats,
  getDueCards,
  getCardsDueOnDate,
  getUpcomingReviews,
  createStudySession,
  endStudySession,
  calculateSessionAccuracy,
  calculateAverageRating,
  calculateStreak,
  filterCardsForStudyMode,
  getDefaultStudyModeConfig,
  formatInterval,
  getRatingLabel,
  getRatingColor,
};
