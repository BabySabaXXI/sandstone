/**
 * Sandstone Utilities
 * 
 * Centralized utility functions for the Sandstone application.
 * All utilities are organized by category for easy imports.
 * 
 * @example
 * ```typescript
 * // Import specific utilities
 * import { formatDate, formatRelativeTime } from '@/lib/utils/date';
 * import { truncate, slugify } from '@/lib/utils/string';
 * 
 * // Or import all from the main barrel
 * import { formatDate, truncate, clamp } from '@/lib/utils';
 * ```
 */

// ============================================================================
// Re-exports from all utility modules
// ============================================================================

// Date utilities
export * from './date';

// String utilities
export * from './string';

// Number utilities
export * from './number';

// Collection (array/object) utilities
export * from './collection';

// Validation utilities
export * from './validation';

// Color utilities
export * from './color';

// Type utilities
export * from './types';

// ============================================================================
// Common Type Exports
// ============================================================================

export type {
  // Date types
  DateFormatPreset,
  FormatDateOptions,
  
  // String types
  TruncateOptions,
  SlugifyOptions,
  
  // Number types
  FormatNumberOptions,
  FormatCurrencyOptions,
  FormatPercentOptions,
  
  // Collection types
  SortDirection,
  SortOptions,
  GroupByResult,
  DeepPartial,
  
  // Validation types
  ValidationResult,
  FieldValidationResult,
  Validator,
  
  // Color types
  ColorFormat,
  RGB,
  RGBA,
  HSL,
  HSV,
  ColorPalette,
} from './date';

// Re-export types from other modules explicitly
export type { TruncateOptions as StringTruncateOptions } from './string';
export type { FormatNumberOptions as NumberFormatOptions } from './number';
export type { SortOptions as CollectionSortOptions } from './collection';
export type { ValidationResult as ValidationResultType } from './validation';
export type { ColorPalette as ColorPaletteType } from './color';

// ============================================================================
// Convenience Compositions
// ============================================================================

import { formatDate } from './date';
import { truncate } from './string';
import { formatNumber } from './number';

/**
 * Format a value based on its type
 */
export function formatValue(
  value: unknown,
  type: 'date' | 'number' | 'string' | 'currency' | 'percent' = 'string'
): string {
  if (value === null || value === undefined) return '-';
  
  switch (type) {
    case 'date':
      return formatDate(value as string | Date, { preset: 'short' });
    case 'number':
      return formatNumber(value as number, { decimals: 0 });
    case 'currency':
      return formatNumber(value as number, { prefix: '$', decimals: 2 });
    case 'percent':
      return formatNumber((value as number) * 100, { suffix: '%', decimals: 0 });
    case 'string':
    default:
      return String(value);
  }
}

/**
 * Create a summary string from various data
 */
export function createSummary(
  items: Array<{ label: string; value: unknown; type?: 'date' | 'number' | 'string' | 'currency' | 'percent' }>
): string {
  return items
    .map((item) => `${item.label}: ${formatValue(item.value, item.type)}`)
    .join(' | ');
}

/**
 * Safely access nested object properties
 */
export function safeGet<T>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue?: T
): T | undefined {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = (result as Record<string, unknown>)[key];
  }
  
  return (result as T) ?? defaultValue;
}

/**
 * Check if all values in an object are truthy
 */
export function allTruthy(obj: Record<string, unknown>): boolean {
  return Object.values(obj).every((value) => !!value);
}

/**
 * Check if any value in an object is truthy
 */
export function anyTruthy(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((value) => !!value);
}

/**
 * Get the number of truthy values in an object
 */
export function countTruthy(obj: Record<string, unknown>): number {
  return Object.values(obj).filter((value) => !!value).length;
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay = 1000, backoff = 2 } = options;
  
  let lastError: Error;
  let currentDelay = delay;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }
  }
  
  throw lastError!;
}

/**
 * Memoize a function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Generate a range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Wait for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a promise that resolves after a condition is met
 */
export function waitFor(
  condition: () => boolean,
  options: {
    interval?: number;
    timeout?: number;
  } = {}
): Promise<void> {
  const { interval = 100, timeout = 5000 } = options;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Parse a query string into an object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

/**
 * Build a query string from an object
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const validParams = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  );
  
  if (validParams.length === 0) return '';
  
  return '?' + validParams
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}
