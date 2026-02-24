/**
 * String Manipulation Utilities
 * 
 * Helper functions for string transformations, sanitization,
 * and text processing throughout the application.
 */

// ============================================================================
// Types
// ============================================================================

export interface TruncateOptions {
  length: number;
  suffix?: string;
  wordBoundary?: boolean;
}

export interface SlugifyOptions {
  lowercase?: boolean;
  separator?: string;
  strict?: boolean;
}

// ============================================================================
// Truncation & Ellipsis
// ============================================================================

/**
 * Truncate a string to a specified length with optional suffix
 */
export function truncate(
  str: string | null | undefined,
  options: TruncateOptions
): string {
  if (!str) return '';
  
  const { length, suffix = '...', wordBoundary = false } = options;
  
  if (str.length <= length) return str;

  let truncated = str.slice(0, length - suffix.length);

  if (wordBoundary) {
    // Find the last space to avoid cutting words
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated + suffix;
}

/**
 * Truncate text from the middle (useful for IDs, hashes)
 */
export function truncateMiddle(
  str: string | null | undefined,
  startLength: number = 6,
  endLength: number = 4,
  separator: string = '...'
): string {
  if (!str) return '';
  if (str.length <= startLength + endLength + separator.length) return str;

  return `${str.slice(0, startLength)}${separator}${str.slice(-endLength)}`;
}

// ============================================================================
// Case Conversions
// ============================================================================

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string | null | undefined): string {
  if (!str) return '';
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string | null | undefined): string {
  if (!str) return '';
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string | null | undefined): string {
  if (!str) return '';
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string | null | undefined): string {
  if (!str) return '';
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to Title Case
 */
export function toTitleCase(str: string | null | undefined): string {
  if (!str) return '';
  
  const minorWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'in', 'of'];
  
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !minorWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

/**
 * Convert string to Sentence case
 */
export function toSentenceCase(str: string | null | undefined): string {
  if (!str) return '';
  
  const lower = str.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ============================================================================
// Slug & URL
// ============================================================================

/**
 * Create a URL-friendly slug from a string
 */
export function slugify(
  str: string | null | undefined,
  options: SlugifyOptions = {}
): string {
  if (!str) return '';
  
  const { lowercase = true, separator = '-', strict = false } = options;
  
  let slug = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, strict ? '' : ' ')
    .trim();

  if (lowercase) {
    slug = slug.toLowerCase();
  }

  return slug.replace(/[\s_]+/g, separator);
}

/**
 * Generate a unique identifier
 */
export function generateId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Remove HTML tags from a string
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // First decode common HTML entities
  const decoded = html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Then strip tags
  return decoded.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Remove extra whitespace from a string
 */
export function normalizeWhitespace(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Remove all non-alphanumeric characters
 */
export function alphanumericOnly(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9]/g, '');
}

// ============================================================================
// Word & Character Counting
// ============================================================================

/**
 * Count words in a string
 */
export function countWords(str: string | null | undefined): number {
  if (!str) return 0;
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Count characters in a string (with or without spaces)
 */
export function countCharacters(
  str: string | null | undefined,
  includeSpaces: boolean = true
): number {
  if (!str) return 0;
  return includeSpaces ? str.length : str.replace(/\s/g, '').length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(
  str: string | null | undefined,
  wordsPerMinute: number = 200
): number {
  const words = countWords(str);
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Format reading time as a string
 */
export function formatReadingTime(
  str: string | null | undefined,
  wordsPerMinute: number = 200
): string {
  const minutes = estimateReadingTime(str, wordsPerMinute);
  
  if (minutes < 1) return '< 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

// ============================================================================
// Highlighting & Marking
// ============================================================================

/**
 * Highlight occurrences of a search term in text
 */
export function highlightText(
  text: string | null | undefined,
  searchTerm: string | null | undefined,
  highlightClass: string = 'highlight'
): string {
  if (!text || !searchTerm) return text || '';
  
  const escapedTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
}

/**
 * Extract text around a search term (context extraction)
 */
export function extractContext(
  text: string | null | undefined,
  searchTerm: string | null | undefined,
  contextLength: number = 50
): string[] {
  if (!text || !searchTerm) return [];
  
  const escapedTerm = escapeRegExp(searchTerm);
  const regex = new RegExp(`(.{0,${contextLength}})(${escapedTerm})(.{0,${contextLength}})`, 'gi');
  
  const matches: string[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    matches.push(`...${match[1]}${match[2]}${match[3]}...`);
  }
  
  return matches;
}

// ============================================================================
// Utility Helpers
// ============================================================================

/**
 * Escape special regex characters
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a string is empty or whitespace only
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if a string is not empty
 */
export function isPresent(str: string | null | undefined): boolean {
  return !isBlank(str);
}

/**
 * Repeat a string n times
 */
export function repeat(str: string, times: number): string {
  if (times <= 0) return '';
  return str.repeat(times);
}

/**
 * Pad a string to a specific length
 */
export function pad(
  str: string | number,
  length: number,
  char: string = ' ',
  position: 'start' | 'end' = 'end'
): string {
  const stringified = String(str);
  if (stringified.length >= length) return stringified;
  
  const padding = repeat(char, length - stringified.length);
  
  return position === 'start' 
    ? padding + stringified 
    : stringified + padding;
}

/**
 * Convert newlines to HTML breaks
 */
export function nl2br(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\n/g, '<br>');
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Decapitalize first letter of a string
 */
export function decapitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// ============================================================================
// Template Literals
// ============================================================================

/**
 * Simple template interpolation
 */
export function interpolate(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(values[key] ?? match);
  });
}

/**
 * Pluralize a word based on count
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}

/**
 * Format a list with proper Oxford comma
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}
