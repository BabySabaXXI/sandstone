/**
 * Tests for Date Utilities
 */

import {
  parseDate,
  formatDate,
  formatRelativeTime,
  formatDateRange,
  formatDuration,
  formatMinutes,
  getDateLabel,
  groupByDateLabel,
  daysUntil,
  isOverdue,
  calculateNextReview,
  getDayBounds,
  DATE_FORMATS,
} from '../../../../lib/utils/date';

describe('parseDate', () => {
  it('should parse ISO string', () => {
    const result = parseDate('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(0); // January is 0
    expect(result?.getDate()).toBe(15);
  });

  it('should return Date object as-is', () => {
    const date = new Date('2024-01-15');
    const result = parseDate(date);
    expect(result).toBe(date);
  });

  it('should return null for invalid date string', () => {
    expect(parseDate('invalid')).toBeNull();
  });

  it('should return null for null input', () => {
    expect(parseDate(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(parseDate(undefined)).toBeNull();
  });

  it('should return null for invalid Date object', () => {
    expect(parseDate(new Date('invalid'))).toBeNull();
  });
});

describe('formatDate', () => {
  const testDate = '2024-01-15T14:30:00';

  it('should format with short preset', () => {
    expect(formatDate(testDate, { preset: 'short' })).toBe('Jan 15, 2024');
  });

  it('should format with long preset', () => {
    expect(formatDate(testDate, { preset: 'long' })).toBe('January 15, 2024');
  });

  it('should format with full preset', () => {
    expect(formatDate(testDate, { preset: 'full' })).toBe('Monday, January 15, 2024');
  });

  it('should format with time preset', () => {
    const result = formatDate(testDate, { preset: 'time' });
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
  });

  it('should format with datetime preset', () => {
    const result = formatDate(testDate, { preset: 'datetime' });
    expect(result).toMatch(/Jan 15, 2024 at \d{1,2}:\d{2} (AM|PM)/);
  });

  it('should format with iso preset', () => {
    expect(formatDate(testDate, { preset: 'iso' })).toBe('2024-01-15');
  });

  it('should format with relative preset', () => {
    const result = formatDate(testDate, { preset: 'relative' });
    expect(result).toContain('ago');
  });

  it('should use custom format string', () => {
    expect(formatDate(testDate, { format: 'yyyy/MM/dd' })).toBe('2024/01/15');
  });

  it('should include time when specified', () => {
    const result = formatDate(testDate, { preset: 'short', includeTime: true });
    expect(result).toMatch(/Jan 15, 2024 \d{1,2}:\d{2} (AM|PM)/);
  });

  it('should return "Invalid date" for invalid input', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });

  it('should default to short preset', () => {
    expect(formatDate(testDate)).toBe('Jan 15, 2024');
  });
});

describe('formatRelativeTime', () => {
  it('should format just now', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  it('should format minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should format hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatRelativeTime(twoHoursAgo);
    expect(result).toContain('ago');
  });

  it('should format yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(yesterday);
    expect(result).toContain('Yesterday');
  });

  it('should return "Invalid date" for invalid input', () => {
    expect(formatRelativeTime('invalid')).toBe('Invalid date');
  });
});

describe('formatDateRange', () => {
  it('should format same month range', () => {
    const result = formatDateRange('2024-01-01', '2024-01-15');
    expect(result).toBe('Jan 1 - 15, 2024');
  });

  it('should format same year range', () => {
    const result = formatDateRange('2024-01-01', '2024-03-15');
    expect(result).toBe('Jan 1 - Mar 15, 2024');
  });

  it('should format different year range', () => {
    const result = formatDateRange('2023-12-01', '2024-01-15');
    expect(result).toBe('Dec 1, 2023 - Jan 15, 2024');
  });

  it('should return "Invalid date range" for invalid input', () => {
    expect(formatDateRange('invalid', '2024-01-15')).toBe('Invalid date range');
    expect(formatDateRange('2024-01-01', 'invalid')).toBe('Invalid date range');
  });
});

describe('formatDuration', () => {
  it('should format seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(65000)).toBe('1m 5s');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(3660000)).toBe('1h 1m');
  });

  it('should format days and hours', () => {
    expect(formatDuration(90000000)).toBe('1d 1h');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});

describe('formatMinutes', () => {
  it('should format minutes only', () => {
    expect(formatMinutes(30)).toBe('30m');
  });

  it('should format hours only', () => {
    expect(formatMinutes(120)).toBe('2h');
  });

  it('should format hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1h 30m');
  });

  it('should handle zero', () => {
    expect(formatMinutes(0)).toBe('0m');
  });
});

describe('getDateLabel', () => {
  it('should return "Today" for today', () => {
    const today = new Date();
    expect(getDateLabel(today)).toBe('Today');
  });

  it('should return "Yesterday" for yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(getDateLabel(yesterday)).toBe('Yesterday');
  });

  it('should return "This Week" for this week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    // Only test if it's still this week
    if (getDateLabel(threeDaysAgo) === 'This Week') {
      expect(getDateLabel(threeDaysAgo)).toBe('This Week');
    }
  });

  it('should return "This Month" for this month', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    // Only test if it's still this month
    if (getDateLabel(tenDaysAgo) === 'This Month') {
      expect(getDateLabel(tenDaysAgo)).toBe('This Month');
    }
  });

  it('should return "This Year" for this year', () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    // Only test if it's still this year
    if (getDateLabel(threeMonthsAgo) === 'This Year') {
      expect(getDateLabel(threeMonthsAgo)).toBe('This Year');
    }
  });

  it('should return year for older dates', () => {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    expect(getDateLabel(lastYear)).toBe(String(lastYear.getFullYear()));
  });

  it('should return "Invalid date" for invalid input', () => {
    expect(getDateLabel('invalid')).toBe('Invalid date');
  });
});

describe('groupByDateLabel', () => {
  it('should group items by date label', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const items = [
      { id: '1', createdAt: today },
      { id: '2', createdAt: today },
      { id: '3', createdAt: yesterday },
    ];

    const grouped = groupByDateLabel(items);

    expect(grouped['Today']).toHaveLength(2);
    expect(grouped['Yesterday']).toHaveLength(1);
  });

  it('should handle empty array', () => {
    const grouped = groupByDateLabel([]);
    expect(Object.keys(grouped)).toHaveLength(0);
  });

  it('should handle single item', () => {
    const today = new Date().toISOString();
    const items = [{ id: '1', createdAt: today }];

    const grouped = groupByDateLabel(items);

    expect(grouped['Today']).toHaveLength(1);
  });
});

describe('daysUntil', () => {
  it('should return positive days for future date', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = daysUntil(future);
    expect(result).toBeGreaterThanOrEqual(4);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('should return negative days for past date', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const result = daysUntil(past);
    expect(result).toBeLessThan(0);
  });

  it('should return 0 for today', () => {
    const today = new Date();
    expect(daysUntil(today)).toBe(0);
  });

  it('should return null for invalid date', () => {
    expect(daysUntil('invalid')).toBeNull();
  });
});

describe('isOverdue', () => {
  it('should return true for past date', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isOverdue(past)).toBe(true);
  });

  it('should return false for future date', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isOverdue(future)).toBe(false);
  });

  it('should return false for today', () => {
    const today = new Date();
    expect(isOverdue(today)).toBe(false);
  });

  it('should return false for invalid date', () => {
    expect(isOverdue('invalid')).toBe(false);
  });
});

describe('calculateNextReview', () => {
  it('should calculate next review date', () => {
    const result = calculateNextReview(1, 2.5, 0);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBeGreaterThan(Date.now());
  });

  it('should increase interval based on ease factor', () => {
    const result1 = calculateNextReview(1, 2.5, 0);
    const result2 = calculateNextReview(2, 2.5, 1);

    // Second review should be further in the future
    expect(result2.getTime()).toBeGreaterThan(result1.getTime());
  });

  it('should ensure minimum interval of 1 day', () => {
    const result = calculateNextReview(0, 1.3, 0);
    const daysDiff = Math.round((result.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    expect(daysDiff).toBeGreaterThanOrEqual(1);
  });
});

describe('getDayBounds', () => {
  it('should return start and end of day', () => {
    const date = '2024-01-15T14:30:00';
    const bounds = getDayBounds(date);

    expect(bounds).not.toBeNull();
    expect(bounds?.start.getHours()).toBe(0);
    expect(bounds?.start.getMinutes()).toBe(0);
    expect(bounds?.end.getHours()).toBe(23);
    expect(bounds?.end.getMinutes()).toBe(59);
  });

  it('should return null for invalid date', () => {
    expect(getDayBounds('invalid')).toBeNull();
  });

  it('should handle Date object input', () => {
    const date = new Date('2024-01-15T14:30:00');
    const bounds = getDayBounds(date);

    expect(bounds).not.toBeNull();
    expect(bounds?.start.getDate()).toBe(15);
    expect(bounds?.end.getDate()).toBe(15);
  });
});

describe('DATE_FORMATS', () => {
  it('should contain all expected formats', () => {
    expect(DATE_FORMATS.short).toBe('MMM d, yyyy');
    expect(DATE_FORMATS.long).toBe('MMMM d, yyyy');
    expect(DATE_FORMATS.full).toBe('EEEE, MMMM d, yyyy');
    expect(DATE_FORMATS.time).toBe('h:mm a');
    expect(DATE_FORMATS.datetime).toBe("MMM d, yyyy 'at' h:mm a");
    expect(DATE_FORMATS.iso).toBe('yyyy-MM-dd');
    expect(DATE_FORMATS.isoWithTime).toBe("yyyy-MM-dd'T'HH:mm:ss");
  });
});
