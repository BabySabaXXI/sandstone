/**
 * Validation utilities for forms
 * Provides consistent validation logic across the application
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type Validator<T = string> = (value: T) => ValidationResult;

// ==================== String Validators ====================

/**
 * Creates a required field validator
 */
export const required = (message = "This field is required"): Validator => (value) => ({
  valid: value !== undefined && value !== null && value.trim() !== "",
  error: value !== undefined && value !== null && value.trim() !== "" ? undefined : message,
});

/**
 * Creates a minimum length validator
 */
export const minLength = (min: number, message?: string): Validator => (value) => {
  const valid = value.length >= min;
  return {
    valid,
    error: valid ? undefined : message || `Must be at least ${min} characters`,
  };
};

/**
 * Creates a maximum length validator
 */
export const maxLength = (max: number, message?: string): Validator => (value) => {
  const valid = value.length <= max;
  return {
    valid,
    error: valid ? undefined : message || `Must be no more than ${max} characters`,
  };
};

/**
 * Creates a pattern validator using regex
 */
export const pattern = (regex: RegExp, message: string): Validator => (value) => {
  const valid = regex.test(value);
  return {
    valid,
    error: valid ? undefined : message,
  };
};

/**
 * Creates an email validator
 */
export const email = (message = "Please enter a valid email address"): Validator => (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(value);
  return {
    valid,
    error: valid ? undefined : message,
  };
};

/**
 * Creates a URL validator
 */
export const url = (message = "Please enter a valid URL"): Validator => (value) => {
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return { valid: false, error: message };
  }
};

/**
 * Creates a phone number validator
 */
export const phone = (message = "Please enter a valid phone number"): Validator => (value) => {
  // Allow formats: +1234567890, +1 (234) 567-890, 123-456-7890, etc.
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  const valid = phoneRegex.test(value);
  const digitsOnly = value.replace(/\D/g, "");
  
  if (!valid) {
    return { valid: false, error: message };
  }
  if (digitsOnly.length < 10) {
    return { valid: false, error: "Phone number must have at least 10 digits" };
  }
  if (digitsOnly.length > 15) {
    return { valid: false, error: "Phone number is too long" };
  }
  
  return { valid: true };
};

// ==================== Password Validators ====================

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

/**
 * Calculates password strength
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  
  return {
    score,
    label: labels[score],
    requirements,
  };
};

/**
 * Creates a password validator with configurable requirements
 */
export const password = (options: {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
} = {}): Validator => {
  const {
    minLength: minLen = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  return (value) => {
    if (!value) {
      return { valid: false, error: "Password is required" };
    }

    if (value.length < minLen) {
      return { valid: false, error: `Password must be at least ${minLen} characters` };
    }

    if (requireUppercase && !/[A-Z]/.test(value)) {
      return { valid: false, error: "Password must contain at least one uppercase letter" };
    }

    if (requireLowercase && !/[a-z]/.test(value)) {
      return { valid: false, error: "Password must contain at least one lowercase letter" };
    }

    if (requireNumber && !/[0-9]/.test(value)) {
      return { valid: false, error: "Password must contain at least one number" };
    }

    if (requireSpecial && !/[^A-Za-z0-9]/.test(value)) {
      return { valid: false, error: "Password must contain at least one special character" };
    }

    return { valid: true };
  };
};

// ==================== Number Validators ====================

/**
 * Creates a number range validator
 */
export const numberRange = (
  min?: number,
  max?: number,
  message?: string
): Validator => (value) => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: "Please enter a valid number" };
  }
  
  if (min !== undefined && num < min) {
    return { valid: false, error: message || `Must be at least ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { valid: false, error: message || `Must be no more than ${max}` };
  }
  
  return { valid: true };
};

// ==================== OTP Validators ====================

/**
 * Creates an OTP validator
 */
export const otp = (length = 6, message?: string): Validator => (value) => {
  const regex = new RegExp(`^\\d{${length}}$`);
  const valid = regex.test(value);
  return {
    valid,
    error: valid ? undefined : message || `Please enter a valid ${length}-digit code`,
  };
};

// ==================== Name Validators ====================

/**
 * Creates a name validator
 */
export const name = (message?: string): Validator => (value) => {
  if (!value.trim()) {
    return { valid: false, error: "Name is required" };
  }
  
  if (value.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(value)) {
    return {
      valid: false,
      error: message || "Name can only contain letters, spaces, hyphens and apostrophes",
    };
  }
  
  return { valid: true };
};

// ==================== Composite Validators ====================

/**
 * Combines multiple validators into one
 * Returns the first error found, or valid if all pass
 */
export const compose = (...validators: Validator[]): Validator => (value) => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

// ==================== Form Validation Helper ====================

export interface FieldValidation<T = string> {
  value: T;
  validators: Validator<T>[];
  touched?: boolean;
}

export interface FormValidationResult<T extends Record<string, any>> {
  valid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

/**
 * Validates an entire form object
 */
export const validateForm = <T extends Record<string, string>>(
  fields: Record<keyof T, FieldValidation>
): FormValidationResult<T> => {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const [key, field] of Object.entries(fields) as [keyof T, FieldValidation][]) {
    for (const validator of field.validators) {
      const result = validator(field.value);
      if (!result.valid) {
        errors[key] = result.error;
        valid = false;
        break;
      }
    }
  }

  return { valid, errors };
};

// ==================== Predefined Validators ====================

export const validators = {
  email: compose(required("Email is required"), email()),
  password: compose(required("Password is required"), minLength(6)),
  strongPassword: password({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  }),
  phone: compose(required("Phone number is required"), phone()),
  name: compose(required("Name is required"), name()),
  otp: (length = 6) => compose(required("Verification code is required"), otp(length)),
};

export default validators;
