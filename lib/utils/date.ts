/**
 * Date Formatting Utilities
 * 
 * Helper functions for formatting dates, times, and durations.
 * Uses date-fns for consistent formatting across the app.
 */

import {
  format,
  formatDistance,
  formatDistanceToNow,
  formatRelative,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  startOfDay,
  endOfDay,
} from 'date-fns';

// ============================================================================
// Types
// ============================================================================

export type DateFormatPreset = 
  | 'short'      // Jan 1, 2024
  | 'long'       // January 1, 2024
  | 'full'       // Monday, January 1, 2024
  | 'time'       // 2:30 PM
  | 'datetime'   // Jan 1, 2024 at 2:30 PM
  | 'iso'        // 2024-01-01
  | 'relative';  // 2 hours ago

export interface FormatDateOptions {
  preset?: DateFormatPreset;
  format?: string;
  includeTime?: boolean;
  relative?: boolean;
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Safely parse a date string or Date object
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;
  
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Format a date with various preset options
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  const { preset = 'short', format: customFormat, includeTime = false } = options;
  
  const parsedDate = parseDate(date);
  if (!parsedDate) return 'Invalid date';

  // Use custom format if provided
  if (customFormat) {
    return format(parsedDate, customFormat);
  }

  // Use preset formats
  switch (preset) {
    case 'short':
      return includeTime 
        ? format(parsedDate, 'MMM d, yyyy h:mm a')
        : format(parsedDate, 'MMM d, yyyy');
    
    case 'long':
      return includeTime
        ? format(parsedDate, 'MMMM d, yyyy h:mm a')
        : format(parsedDate, 'MMMM d, yyyy');
    
    case 'full':
      return includeTime
        ? format(parsedDate, 'EEEE, MMMM d, yyyy h:mm a')
        : format(parsedDate, 'EEEE, MMMM d, yyyy');
    
    case 'time':
      return format(parsedDate, 'h:mm a');
    
    case 'datetime':
      return format(parsedDate, "MMM d, yyyy 'at' h:mm a");
    
    case 'iso':
      return format(parsedDate, 'yyyy-MM-dd');
    
    case 'relative':
      return formatDistanceToNow(parsedDate, { addSuffix: true });
    
    default:
      return format(parsedDate, 'MMM d, yyyy');
  }
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "yesterday")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return 'Invalid date';

  if (isToday(parsedDate)) {
    const hoursAgo = differenceInHours(new Date(), parsedDate);
    if (hoursAgo < 1) {
      const minutesAgo = differenceInMinutes(new Date(), parsedDate);
      return minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`;
    }
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  }

  if (isYesterday(parsedDate)) {
    return `Yesterday at ${format(parsedDate, 'h:mm a')}`;
  }

  if (isThisWeek(parsedDate)) {
    return format(parsedDate, 'EEEE h:mm a');
  }

  if (isThisYear(parsedDate)) {
    return format(parsedDate, 'MMM d h:mm a');
  }

  return format(parsedDate, 'MMM d, yyyy');
}

/**
 * Format a date range (e.g., "Jan 1 - Jan 5, 2024")
 */
export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end) return 'Invalid date range';

  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
  }

  if (sameYear) {
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }

  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format a time duration from minutes
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

// ============================================================================
// Smart Date Labels
// ============================================================================

/**
 * Get a smart label for a date (Today, Yesterday, This Week, etc.)
 */
export function getDateLabel(date: string | Date | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return 'Invalid date';

  if (isToday(parsedDate)) return 'Today';
  if (isYesterday(parsedDate)) return 'Yesterday';
  if (isThisWeek(parsedDate)) return 'This Week';
  if (isThisMonth(parsedDate)) return 'This Month';
  if (isThisYear(parsedDate)) return 'This Year';
  
  return format(parsedDate, 'yyyy');
}

/**
 * Group dates by time period
 */
export function groupByDateLabel<T extends { createdAt: string | Date }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  items.forEach((item) => {
    const label = getDateLabel(item.createdAt);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  });

  return groups;
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Calculate days until a date
 */
export function daysUntil(date: string | Date | null | undefined): number | null {
  const parsedDate = parseDate(date);
  if (!parsedDate) return null;

  return differenceInDays(parsedDate, new Date());
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: string | Date | null | undefined): boolean {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;

  return differenceInDays(new Date(), parsedDate) > 0;
}

/**
 * Get the next review date for spaced repetition
 */
export function calculateNextReview(
  interval: number,
  easeFactor: number,
  repetitionCount: number
): Date {
  // Simple spaced repetition algorithm
  // interval is in days
  const newInterval = Math.round(interval * easeFactor);
  return addDays(new Date(), Math.max(1, newInterval));
}

/**
 * Get start and end of day for a date
 */
export function getDayBounds(date: string | Date | null | undefined): {
  start: Date;
  end: Date;
} | null {
  const parsedDate = parseDate(date);
  if (!parsedDate) return null;

  return {
    start: startOfDay(parsedDate),
    end: endOfDay(parsedDate),
  };
}

// ============================================================================
// Constants
// ============================================================================

export const DATE_FORMATS = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  full: 'EEEE, MMMM d, yyyy',
  time: 'h:mm a',
  datetime: "MMM d, yyyy 'at' h:mm a",
  iso: 'yyyy-MM-dd',
  isoWithTime: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============================================================================
// Legacy/Compatibility
// ============================================================================

/**
 * @deprecated Use formatDate with preset 'short' instead
 */
export function formatShortDate(date: string | Date): string {
  return formatDate(date, { preset: 'short' });
}

/**
 * @deprecated Use formatDate with preset 'long' instead
 */
export function formatLongDate(date: string | Date): string {
  return formatDate(date, { preset: 'long' });
}
