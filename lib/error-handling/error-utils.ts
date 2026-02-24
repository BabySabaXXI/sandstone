"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { errorLogger, ErrorContext, handleAsyncError, withRetry } from "./error-logger";
import { toast } from "sonner";

// Custom error classes for different scenarios
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: "low" | "medium" | "high" | "critical" = "medium",
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", "low", context);
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Network request failed", context?: Record<string, unknown>) {
    super(message, "NETWORK_ERROR", "high", context);
    this.name = "NetworkError";
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Authentication failed", context?: Record<string, unknown>) {
    super(message, "AUTH_ERROR", "high", context);
    this.name = "AuthError";
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    context?: Record<string, unknown>
  ) {
    super(message, "API_ERROR", statusCode >= 500 ? "critical" : "high", context);
    this.name = "ApiError";
  }
}

// Hook for managing async operations with error handling
export function useAsyncOperation<T, Args extends any[] = []>(
  operation: (...args: Args) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
    showToast?: boolean;
    retryCount?: number;
  } = {}
) {
  const {
    onSuccess,
    onError,
    errorMessage = "Operation failed",
    showToast = true,
    retryCount = 0,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = retryCount > 0
          ? await withRetry(() => operation(...args), { maxRetries: retryCount })
          : await operation(...args);

        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        errorLogger.log(error, {
          additionalData: { args, operation: operation.name },
        });

        if (showToast) {
          toast.error(errorMessage, {
            description: error.message,
          });
        }

        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [operation, onSuccess, onError, errorMessage, showToast, retryCount]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
}

// Hook for error state management
export function useErrorState() {
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);

  const throwError = useCallback((err: Error | string) => {
    const error = err instanceof Error ? err : new Error(err);
    setError(error);
    setHasError(true);
    throw error;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  const handleError = useCallback((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    setHasError(true);
    errorLogger.log(error);
  }, []);

  return { error, hasError, throwError, clearError, handleError };
}

// Hook for network status monitoring
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success("You're back online!");
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.error("You're offline", {
        description: "Some features may not work until you're back online.",
      });
    };

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// Hook for retry logic with exponential backoff
export function useRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    enabled?: boolean;
  } = {}
) {
  const { maxRetries = 3, delay = 1000, enabled = true } = options;
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    if (!enabled) return null;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsRetrying(true);
    setAttempt(0);

    for (let i = 0; i <= maxRetries; i++) {
      try {
        setAttempt(i);
        const result = await operation();
        setIsRetrying(false);
        return result;
      } catch (error) {
        if (i === maxRetries) {
          setIsRetrying(false);
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) => 
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }

    return null;
  }, [operation, maxRetries, delay, enabled]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsRetrying(false);
  }, []);

  return { execute, cancel, attempt, isRetrying };
}

// Hook for debounced error handling
export function useDebouncedErrorHandler(
  handler: (error: Error) => void,
  delay: number = 5000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  const handleError = useCallback(
    (error: Error) => {
      const errorKey = `${error.name}:${error.message}`;

      if (errorKey === lastErrorRef.current && timeoutRef.current) {
        return;
      }

      lastErrorRef.current = errorKey;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        handler(error);
        lastErrorRef.current = null;
      }, delay);
    },
    [handler, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return handleError;
}

// Hook for form error handling
export function useFormErrors<T extends Record<string, any>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setGeneralError(null);
  }, []);

  const setFormErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(newErrors);
  }, []);

  const handleValidationError = useCallback((error: ValidationError) => {
    if (error.context?.fieldErrors) {
      setErrors(error.context.fieldErrors as Partial<Record<keyof T, string>>);
    }
    setGeneralError(error.message);
  }, []);

  return {
    errors,
    generalError,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setFormErrors,
    handleValidationError,
    hasErrors: Object.keys(errors).length > 0 || !!generalError,
  };
}

// Utility for creating error-safe data fetchers
export function createSafeFetcher<T, Args extends any[] = []>(
  fetcher: (...args: Args) => Promise<T>,
  options: {
    onError?: (error: Error) => void;
    fallback?: T;
    logErrors?: boolean;
  } = {}
) {
  const { onError, fallback, logErrors = true } = options;

  return async (...args: Args): Promise<T | null> => {
    try {
      return await fetcher(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (logErrors) {
        errorLogger.log(err, {
          additionalData: { args, fetcher: fetcher.name },
        });
      }

      onError?.(err);
      return fallback ?? null;
    }
  };
}

// Utility for batch error handling
export async function handleBatchOperations<T>(
  operations: Array<() => Promise<T>>,
  options: {
    continueOnError?: boolean;
    onOperationError?: (index: number, error: Error) => void;
  } = {}
): Promise<{ results: T[]; errors: Array<{ index: number; error: Error }> }> {
  const { continueOnError = true, onOperationError } = options;
  const results: T[] = [];
  const errors: Array<{ index: number; error: Error }> = [];

  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await operations[i]();
      results.push(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push({ index: i, error: err });
      onOperationError?.(i, err);

      if (!continueOnError) {
        break;
      }
    }
  }

  return { results, errors };
}

// Parse API error response
export function parseApiError(error: unknown): { message: string; code?: string; status?: number } {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  if (error && typeof error === "object") {
    const err = error as any;
    return {
      message: err.message || "An unknown error occurred",
      code: err.code,
      status: err.status,
    };
  }

  return { message: "An unknown error occurred" };
}

// Format error for display
export function formatErrorForDisplay(error: unknown): string {
  const parsed = parseApiError(error);
  return parsed.message;
}

// Check if error is retryable
export function isRetryableError(error: Error): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ApiError && error.statusCode >= 500) return true;
  if (error.message?.includes("network") || error.message?.includes("timeout")) return true;
  return false;
}
