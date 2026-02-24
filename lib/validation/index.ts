/**
 * Form Validation Utilities
 * 
 * Provides comprehensive validation functions and schemas for form handling.
 * Includes common validators, error message formatting, and Zod schema helpers.
 */

import { z } from "zod";

// ============================================================================
// Common Validation Patterns
// ============================================================================

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
export const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// ============================================================================
// Error Messages
// ============================================================================

export const errorMessages = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  password: {
    min: (min: number) => `Password must be at least ${min} characters`,
    max: (max: number) => `Password must be at most ${max} characters`,
    uppercase: "Password must contain at least one uppercase letter",
    lowercase: "Password must contain at least one lowercase letter",
    number: "Password must contain at least one number",
    special: "Password must contain at least one special character",
    match: "Passwords do not match",
  },
  string: {
    min: (field: string, min: number) => `${field} must be at least ${min} characters`,
    max: (field: string, max: number) => `${field} must be at most ${max} characters`,
    length: (field: string, length: number) => `${field} must be exactly ${length} characters`,
  },
  number: {
    min: (field: string, min: number) => `${field} must be at least ${min}`,
    max: (field: string, max: number) => `${field} must be at most ${max}`,
    positive: (field: string) => `${field} must be a positive number`,
    integer: (field: string) => `${field} must be a whole number`,
  },
  url: "Please enter a valid URL",
  phone: "Please enter a valid phone number",
  date: {
    invalid: "Please enter a valid date",
    future: "Date must be in the future",
    past: "Date must be in the past",
  },
  file: {
    size: (maxSize: string) => `File size must be less than ${maxSize}`,
    type: (types: string[]) => `File must be one of: ${types.join(", ")}`,
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

export const validators = {
  /**
   * Validate email address
   */
  email: (email: string): boolean => {
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  password: (password: string, options?: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }): { valid: boolean; errors: string[] } => {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = true,
    } = options || {};

    const errors: string[] = [];

    if (password.length < minLength) {
      errors.push(errorMessages.password.min(minLength));
    }
    if (password.length > maxLength) {
      errors.push(errorMessages.password.max(maxLength));
    }
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push(errorMessages.password.uppercase);
    }
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push(errorMessages.password.lowercase);
    }
    if (requireNumber && !/\d/.test(password)) {
      errors.push(errorMessages.password.number);
    }
    if (requireSpecial && !/[@$!%*?&]/.test(password)) {
      errors.push(errorMessages.password.special);
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Validate URL
   */
  url: (url: string): boolean => {
    return urlRegex.test(url);
  },

  /**
   * Validate phone number
   */
  phone: (phone: string): boolean => {
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  },

  /**
   * Validate file size
   */
  fileSize: (file: File, maxSizeBytes: number): boolean => {
    return file.size <= maxSizeBytes;
  },

  /**
   * Validate file type
   */
  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
};

// ============================================================================
// Zod Schema Helpers
// ============================================================================

export const schemas = {
  /**
   * Email schema with validation
   */
  email: (message?: string) =>
    z.string()
      .min(1, errorMessages.required("Email"))
      .email(message || errorMessages.email),

  /**
   * Password schema with strength requirements
   */
  password: (options?: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }) => {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumber = true,
      requireSpecial = true,
    } = options || {};

    let schema = z.string().min(minLength, errorMessages.password.min(minLength));

    if (maxLength) {
      schema = schema.max(maxLength, errorMessages.password.max(maxLength));
    }

    const refinements: Array<{ check: (val: string) => boolean; message: string }> = [];
    
    if (requireUppercase) {
      refinements.push({ check: (val) => /[A-Z]/.test(val), message: errorMessages.password.uppercase });
    }
    if (requireLowercase) {
      refinements.push({ check: (val) => /[a-z]/.test(val), message: errorMessages.password.lowercase });
    }
    if (requireNumber) {
      refinements.push({ check: (val) => /\d/.test(val), message: errorMessages.password.number });
    }
    if (requireSpecial) {
      refinements.push({ check: (val) => /[@$!%*?&]/.test(val), message: errorMessages.password.special });
    }

    return refinements.reduce(
      (acc, refinement) => acc.refine(refinement.check, refinement.message),
      schema
    );
  },

  /**
   * Confirm password schema
   */
  confirmPassword: (passwordField: string = "password") =>
    z.string().min(1, errorMessages.required("Confirm password")),

  /**
   * Name schema
   */
  name: (fieldName: string = "Name", minLength: number = 2, maxLength: number = 100) =>
    z.string()
      .min(minLength, errorMessages.string.min(fieldName, minLength))
      .max(maxLength, errorMessages.string.max(fieldName, maxLength))
      .regex(/^[a-zA-Z\s\-'\.]+$/, `${fieldName} contains invalid characters`),

  /**
   * Phone schema
   */
  phone: (required: boolean = true) => {
    const schema = z.string();
    if (required) {
      return schema.min(1, errorMessages.required("Phone number")).regex(phoneRegex, errorMessages.phone);
    }
    return schema.regex(phoneRegex, errorMessages.phone).optional().or(z.literal(""));
  },

  /**
   * URL schema
   */
  url: (required: boolean = true) => {
    const schema = z.string();
    if (required) {
      return schema.min(1, errorMessages.required("URL")).regex(urlRegex, errorMessages.url);
    }
    return schema.regex(urlRegex, errorMessages.url).optional().or(z.literal(""));
  },

  /**
   * Text area / description schema
   */
  description: (fieldName: string = "Description", maxLength: number = 2000) =>
    z.string()
      .max(maxLength, errorMessages.string.max(fieldName, maxLength)),

  /**
   * File upload schema
   */
  file: (options?: {
    maxSize?: number;
    allowedTypes?: string[];
  }) => {
    const { maxSize, allowedTypes } = options || {};
    
    return z.instanceof(File).refine(
      (file) => !maxSize || file.size <= maxSize,
      errorMessages.file.size(maxSize ? `${maxSize / 1024 / 1024}MB` : "")
    ).refine(
      (file) => !allowedTypes || allowedTypes.includes(file.type),
      errorMessages.file.type(allowedTypes || [])
    );
  },
};

// ============================================================================
// Form Validation Helper
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate form data against a Zod schema
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult & { data?: T } {
  try {
    const validatedData = schema.parse(data);
    return { valid: true, errors: {}, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = err.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _form: "Validation failed" } };
  }
}

/**
 * Create a form schema from field definitions
 */
export function createFormSchema<T extends Record<string, z.ZodTypeAny>>(
  fields: T
): z.ZodObject<T> {
  return z.object(fields);
}

// ============================================================================
// Export Types
// ============================================================================

export type { z };
export type ZodSchema<T = unknown> = z.ZodSchema<T>;
export type ZodError = z.ZodError;
