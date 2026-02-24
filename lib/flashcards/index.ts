/**
 * Flashcards Library - Main Export
 * Centralized exports for all flashcard-related functionality
 */

// SM-2 Algorithm
export * from './sm2-enhanced';

// Re-export types
export type {
  SM2Card,
  SM2Result,
  ReviewEntry,
  StudySession,
  CardStats,
  DeckStats,
  ProgressMetrics,
  StudyMode,
  StudyModeConfig,
} from './sm2-enhanced';

// Default export
export { default } from './sm2-enhanced';
