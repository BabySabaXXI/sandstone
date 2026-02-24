/**
 * Validation Helper Utilities
 * 
 * Helper functions for validating data, forms, and user input.
 * Works alongside Zod for schema validation.
 */

import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  valid: boolean;
  error?: string;
}

export type Validator<T> = (value: T) => FieldValidationResult;

// ============================================================================
// String Validation
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate strong password
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): boolean {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return minLength && hasUppercase && hasLowercase && hasNumber;
}

/**
 * Get password strength details
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  requirements: { met: boolean; label: string }[];
} {
  const requirements = [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { met: /[a-z]/.test(password), label: 'One lowercase letter' },
    { met: /\d/.test(password), label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const score = Math.min(5, metCount);

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return {
    score,
    label: labels[score],
    requirements,
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

// ============================================================================
// Number Validation
// ============================================================================

/**
 * Check if value is within a range
 */
export function isInRange(
  value: number,
  min: number,
  max: number,
  inclusive: boolean = true
): boolean {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

/**
 * Check if value is an integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Check if value is a positive number
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Check if value is non-negative
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

// ============================================================================
// Collection Validation
// ============================================================================

/**
 * Check if array is not empty
 */
export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

/**
 * Check if all items in array are unique
 */
export function areAllUnique<T>(array: T[]): boolean {
  return new Set(array).size === array.length;
}

/**
 * Check if array has unique values by key
 */
export function areAllUniqueBy<T>(array: T[], key: keyof T): boolean {
  const values = array.map((item) => item[key]);
  return new Set(values).size === array.length;
}

// ============================================================================
// Type Validation
// ============================================================================

/**
 * Check if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Check if value is a valid Date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is null or undefined
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if value is not null or undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// ============================================================================
// Zod Schema Helpers
// ============================================================================

/**
 * Create a Zod schema for email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Create a Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number');

/**
 * Create a Zod schema for URL validation
 */
export const urlSchema = z.string().url('Invalid URL');

/**
 * Create a Zod schema for UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID');

/**
 * Create a Zod schema for hex color validation
 */
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color');

/**
 * Create a Zod schema for subject validation
 */
export const subjectSchema = z.enum(['economics', 'geography'], {
  errorMap: () => ({ message: 'Invalid subject selected' }),
});

/**
 * Create a Zod schema for pagination params
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Create a Zod schema for sorting params
 */
export const sortingSchema = z.object({
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Safe parse with detailed error messages
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : 'value';
    return `${path}: ${err.message}`;
  });
  
  return { success: false, errors };
}

// ============================================================================
// Form Validation Helpers
// ============================================================================

/**
 * Create a validator function
 */
export function createValidator<T>(
  validate: (value: T) => boolean,
  errorMessage: string
): Validator<T> {
  return (value: T) => ({
    valid: validate(value),
    error: validate(value) ? undefined : errorMessage,
  });
}

/**
 * Compose multiple validators
 */
export function composeValidators<T>(...validators: Validator<T>[]): Validator<T> {
  return (value: T) => {
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };
}

/**
 * Required field validator
 */
export const required = createValidator(
  (value: string | null | undefined) => !!value && value.trim().length > 0,
  'This field is required'
);

/**
 * Minimum length validator
 */
export function minLength(min: number): Validator<string> {
  return createValidator(
    (value) => (value?.length || 0) >= min,
    `Must be at least ${min} characters`
  );
}

/**
 * Maximum length validator
 */
export function maxLength(max: number): Validator<string> {
  return createValidator(
    (value) => (value?.length || 0) <= max,
    `Must be at most ${max} characters`
  );
}

/**
 * Email validator
 */
export const email: Validator<string> = createValidator(
  isValidEmail,
  'Please enter a valid email address'
);

/**
 * URL validator
 */
export const url: Validator<string> = createValidator(
  isValidUrl,
  'Please enter a valid URL'
);

/**
 * Pattern validator
 */
export function matches(pattern: RegExp, message: string): Validator<string> {
  return createValidator((value) => pattern.test(value || ''), message);
}

// ============================================================================
// Essay/Content Validation (Sandstone Specific)
// ============================================================================

/**
 * Validate essay content
 */
export function validateEssay(
  content: string,
  options: {
    minWords?: number;
    maxWords?: number;
    minCharacters?: number;
    maxCharacters?: number;
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const { minWords, maxWords, minCharacters, maxCharacters } = options;

  const trimmed = content.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  const characters = trimmed.length;

  if (minWords !== undefined && words.length < minWords) {
    errors.push(`Essay must be at least ${minWords} words`);
  }

  if (maxWords !== undefined && words.length > maxWords) {
    errors.push(`Essay must be at most ${maxWords} words`);
  }

  if (minCharacters !== undefined && characters < minCharacters) {
    errors.push(`Essay must be at least ${minCharacters} characters`);
  }

  if (maxCharacters !== undefined && characters > maxCharacters) {
    errors.push(`Essay must be at most ${maxCharacters} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Essay validation schema for Zod
 */
export const essaySchema = z.object({
  question: z.string().min(1, 'Question is required'),
  content: z.string().min(50, 'Essay must be at least 50 characters'),
  subject: subjectSchema,
});

/**
 * Flashcard validation schema
 */
export const flashcardSchema = z.object({
  front: z.string().min(1, 'Front side is required').max(500, 'Front side is too long'),
  back: z.string().min(1, 'Back side is required').max(1000, 'Back side is too long'),
});

/**
 * Document validation schema
 */
export const documentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  subject: subjectSchema,
  blocks: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['heading1', 'heading2', 'heading3', 'paragraph', 'bullet', 'numbered', 'quote', 'divider']),
      content: z.string(),
    })
  ).min(1, 'Document must have at least one block'),
});

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Format Zod errors into a simple object
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  
  return formatted;
}

/**
 * Get the first error message from a Zod error
 */
export function getFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Validation failed';
}
