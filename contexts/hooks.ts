"use client";

// =============================================================================
// Context Hooks - Centralized Export
// =============================================================================

// Auth Context
export {
  useAuth,
  useIsAuthenticated,
  useUser,
  useAuthLoading,
} from "./auth-provider";

// Theme Context
export {
  useTheme,
  useResolvedTheme,
  useIsDarkMode,
  useSetTheme,
} from "./theme-provider";

// Notification Context
export {
  useNotification,
  useToast,
  usePromiseToast,
} from "./notification-context";

// Loading Context
export {
  useLoading,
  useIsLoading,
  useLoadingKey,
  useLoadingHandler,
} from "./loading-context";

// Error Context
export {
  useError,
  useHasErrors,
  useLastError,
  useErrorHandler,
} from "./error-context";

// =============================================================================
// Re-export Types
// =============================================================================

export type { 
  AppError,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./error-context";

// =============================================================================
// Combined Hooks for Common Use Cases
// =============================================================================

import { useCallback } from "react";
import { useLoading } from "./loading-context";
import { useNotification } from "./notification-context";
import { useError } from "./error-context";

/**
 * Hook for async operations with loading, error handling, and notifications
 */
export function useAsyncOperation() {
  const { startLoading, stopLoading } = useLoading();
  const { showSuccess, showError } = useNotification();
  const { handleError } = useError();

  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options?: {
        loadingKey?: string;
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
        showToast?: boolean;
      }
    ): Promise<T | undefined> => {
      const key = options?.loadingKey || "__async_operation__";
      
      startLoading(key, options?.loadingMessage);
      
      try {
        const result = await operation();
        
        if (options?.showToast !== false && options?.successMessage) {
          showSuccess(options.successMessage);
        }
        
        return result;
      } catch (error) {
        const message = options?.errorMessage || (error instanceof Error ? error.message : "Operation failed");
        
        handleError(error, { showToast: false });
        
        if (options?.showToast !== false) {
          showError(message);
        }
        
        return undefined;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading, showSuccess, showError, handleError]
  );

  return { execute };
}

/**
 * Hook for form submission with loading and error handling
 */
export function useFormSubmit<T extends Record<string, unknown>, R = unknown>() {
  const { execute } = useAsyncOperation();

  const submit = useCallback(
    async (
      submitFn: (data: T) => Promise<R>,
      data: T,
      options?: {
        loadingMessage?: string;
        successMessage?: string;
        errorMessage?: string;
        onSuccess?: (result: R) => void;
        onError?: (error: Error) => void;
      }
    ): Promise<R | undefined> => {
      const result = await execute(
        () => submitFn(data),
        {
          loadingKey: "form-submit",
          loadingMessage: options?.loadingMessage || "Submitting...",
          successMessage: options?.successMessage,
          errorMessage: options?.errorMessage,
        }
      );

      if (result !== undefined) {
        options?.onSuccess?.(result as R);
      }

      return result as R | undefined;
    },
    [execute]
  );

  return { submit };
}

/**
 * Hook for data fetching with loading state
 */
export function useDataFetch<T>() {
  const { execute } = useAsyncOperation();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(
    async (
      fetchFn: () => Promise<T>,
      options?: {
        loadingMessage?: string;
        errorMessage?: string;
        onSuccess?: (data: T) => void;
      }
    ): Promise<T | undefined> => {
      setIsLoading(true);
      
      const result = await execute(fetchFn, {
        loadingMessage: options?.loadingMessage || "Loading...",
        errorMessage: options?.errorMessage,
        showToast: false,
      });

      if (result !== undefined) {
        setData(result as T);
        options?.onSuccess?.(result as T);
      }

      setIsLoading(false);
      return result as T | undefined;
    },
    [execute]
  );

  const clear = useCallback(() => {
    setData(null);
  }, []);

  return { data, isLoading, fetch, clear, setData };
}

// Import useState for useDataFetch
import { useState } from "react";

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Hook to check if any async operation is in progress
 */
export function useIsBusy(): boolean {
  const { isLoading } = useLoading();
  return isLoading;
}

/**
 * Hook to create a busy state checker for specific operations
 */
export function useBusyChecker(...keys: string[]): boolean {
  const { isKeyLoading } = useLoading();
  return keys.some((key) => isKeyLoading(key));
}
