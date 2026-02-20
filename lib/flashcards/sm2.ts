// SM-2 Spaced Repetition Algorithm Implementation

export interface SM2Card {
  interval: number; // days until next review
  repetitionCount: number; // number of successful reviews
  easeFactor: number; // difficulty factor (starts at 2.5)
}

export interface SM2Result {
  interval: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: Date;
}

/**
 * Calculate next review using SM-2 algorithm
 * @param quality 0-5 rating (5 = perfect, 0 = complete blackout)
 * @param currentInterval current interval in days
 * @param repetitionCount number of successful reviews
 * @param easeFactor current ease factor
 */
export function calculateSM2(
  quality: number,
  currentInterval: number = 0,
  repetitionCount: number = 0,
  easeFactor: number = 2.5
): SM2Result {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, quality));

  let newInterval: number;
  let newRepetitionCount: number;
  let newEaseFactor: number;

  if (quality < 3) {
    // Failed - reset repetition count, keep interval small
    newRepetitionCount = 0;
    newInterval = 1;
  } else {
    // Passed - increase interval
    newRepetitionCount = repetitionCount + 1;

    if (newRepetitionCount === 1) {
      newInterval = 1;
    } else if (newRepetitionCount === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * easeFactor);
    }
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum ease factor

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitionCount: newRepetitionCount,
    easeFactor: newEaseFactor,
    nextReviewDate,
  };
}

/**
 * Get cards due for review
 */
export function getDueCards<T extends { nextReview?: Date }>(cards: T[]): T[] {
  const now = new Date();
  return cards.filter((card) => !card.nextReview || card.nextReview <= now);
}

/**
 * Calculate study progress
 */
export function calculateProgress<T extends { repetitionCount: number }>(cards: T[]): {
  mastered: number;
  learning: number;
  new: number;
} {
  return {
    mastered: cards.filter((c) => c.repetitionCount >= 3).length,
    learning: cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 3).length,
    new: cards.filter((c) => c.repetitionCount === 0).length,
  };
}
