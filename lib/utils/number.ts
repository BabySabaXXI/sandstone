/**
 * Number Formatting Utilities
 * 
 * Helper functions for formatting numbers, percentages,
 * currency, and statistical values.
 */

// ============================================================================
// Types
// ============================================================================

export interface FormatNumberOptions {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  padDecimals?: boolean;
}

export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
}

export interface FormatPercentOptions {
  decimals?: number;
  includeSymbol?: boolean;
  multiply?: boolean; // If true, 0.5 becomes 50%
}

// ============================================================================
// Basic Number Formatting
// ============================================================================

/**
 * Format a number with customizable options
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: FormatNumberOptions = {}
): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const {
    decimals = 0,
    thousandsSeparator = ',',
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
    padDecimals = false,
  } = options;

  // Format the number
  const fixed = num.toFixed(decimals);
  const [whole, fraction] = fixed.split('.');

  // Add thousands separators
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  // Build the result
  let result = prefix + formattedWhole;
  
  if (decimals > 0 && fraction) {
    if (padDecimals || parseInt(fraction) > 0) {
      result += decimalSeparator + fraction;
    }
  }

  return result + suffix;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const { currency = 'USD', locale = 'en-US', decimals = 2 } = options;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch {
    // Fallback for unsupported currencies
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${formatNumber(num, { decimals })}`;
  }
}

/**
 * Format a number as a percentage
 */
export function formatPercent(
  value: number | string | null | undefined,
  options: FormatPercentOptions = {}
): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const { decimals = 0, includeSymbol = true, multiply = true } = options;

  const displayValue = multiply ? num * 100 : num;
  const formatted = formatNumber(displayValue, { decimals });

  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format a large number in compact notation (e.g., 1.2K, 3.5M)
 */
export function formatCompact(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_000_000_000) {
    return `${sign}${(absNum / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absNum >= 1_000_000) {
    return `${sign}${(absNum / 1_000_000).toFixed(decimals)}M`;
  }
  if (absNum >= 1_000) {
    return `${sign}${(absNum / 1_000).toFixed(decimals)}K`;
  }

  return String(num);
}

// ============================================================================
// Ordinal & Special Formats
// ============================================================================

/**
 * Format a number as an ordinal (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) return '';

  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Format a number as a file size (bytes, KB, MB, GB, etc.)
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = bytes / Math.pow(k, i);
  const decimals = i === 0 ? 0 : 2;

  return `${size.toFixed(decimals)} ${units[i]}`;
}

/**
 * Format a number as a duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '';
  if (seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(secs)}`;
  }

  return `${minutes}:${padZero(secs)}`;
}

// ============================================================================
// Range & Clamping
// ============================================================================

/**
 * Clamp a number between min and max values
 */
export function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a specific number of decimal places
 */
export function round(value: number, decimals: number = 0): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Round up to the nearest multiple
 */
export function roundUp(value: number, multiple: number): number {
  return Math.ceil(value / multiple) * multiple;
}

/**
 * Round down to the nearest multiple
 */
export function roundDown(value: number, multiple: number): number {
  return Math.floor(value / multiple) * multiple;
}

/**
 * Get the nearest value from an array of options
 */
export function nearest(value: number, options: number[]): number {
  if (options.length === 0) return value;
  
  return options.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Calculate the average of an array of numbers
 */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the sum of an array of numbers
 */
export function sum(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate the median of an array of numbers
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Find the minimum value in an array
 */
export function min(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * Find the maximum value in an array
 */
export function max(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = average(values);
  const squareDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquareDiff = average(squareDiffs);
  
  return Math.sqrt(avgSquareDiff);
}

// ============================================================================
// Grade & Score Formatting (Specific to Sandstone)
// ============================================================================

/**
 * Format a grade/score with proper styling info
 */
export function formatGrade(
  score: number | null | undefined,
  maxScore: number = 100
): {
  letter: string;
  color: string;
  percentage: string;
} {
  if (score === null || score === undefined) {
    return { letter: '-', color: 'gray', percentage: '-' };
  }

  const percentage = (score / maxScore) * 100;
  const formattedPercent = formatPercent(percentage / 100, { decimals: 0 });

  if (percentage >= 90) {
    return { letter: 'A*', color: 'green', percentage: formattedPercent };
  }
  if (percentage >= 80) {
    return { letter: 'A', color: 'green', percentage: formattedPercent };
  }
  if (percentage >= 70) {
    return { letter: 'B', color: 'blue', percentage: formattedPercent };
  }
  if (percentage >= 60) {
    return { letter: 'C', color: 'yellow', percentage: formattedPercent };
  }
  if (percentage >= 50) {
    return { letter: 'D', color: 'orange', percentage: formattedPercent };
  }
  if (percentage >= 40) {
    return { letter: 'E', color: 'orange', percentage: formattedPercent };
  }
  
  return { letter: 'U', color: 'red', percentage: formattedPercent };
}

/**
 * Format a band score (A-Level style)
 */
export function formatBand(score: number): string {
  if (score >= 90) return 'A*';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  if (score >= 40) return 'E';
  return 'U';
}

/**
 * Convert a band to a numeric score range
 */
export function bandToRange(band: string): { min: number; max: number } | null {
  const ranges: Record<string, { min: number; max: number }> = {
    'A*': { min: 90, max: 100 },
    'A': { min: 80, max: 89 },
    'B': { min: 70, max: 79 },
    'C': { min: 60, max: 69 },
    'D': { min: 50, max: 59 },
    'E': { min: 40, max: 49 },
    'U': { min: 0, max: 39 },
  };

  return ranges[band.toUpperCase()] || null;
}

// ============================================================================
// Helper Functions
// ============================================================================

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  
  return symbols[currency.toUpperCase()] || currency;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if a string can be parsed as a number
 */
export function isNumericString(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
}

/**
 * Parse a number safely, returning a default value if invalid
 */
export function safeParseNumber(
  value: string | number | null | undefined,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined) return defaultValue;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isValidNumber(num) ? num : defaultValue;
}
