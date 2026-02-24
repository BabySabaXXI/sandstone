"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
  ReactNode,
  Component,
  ErrorInfo,
} from "react";
import { useNotification } from "./notification-context";

// =============================================================================
// Types
// =============================================================================

interface AppError {
  id: string;
  message: string;
  code?: string;
  details?: string;
  timestamp: Date;
  source?: string;
  recoverable?: boolean;
}

interface ErrorContextType {
  // Error state
  errors: AppError[];
  hasErrors: boolean;
  lastError: AppError | null;
  
  // Error actions
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  
  // Error handlers
  handleError: (error: unknown, options?: { source?: string; showToast?: boolean }) => void;
  handleAsyncError: <T>(
    promise: Promise<T>,
    options?: { source?: string; showToast?: boolean; fallbackValue?: T }
  ) => Promise<T | undefined>;
  
  // Recovery
  retry: <T>(operation: () => Promise<T>, errorId: string) => Promise<T>;
}

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  onError?: (error: AppError) => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// =============================================================================
// Context
// =============================================================================

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// =============================================================================
// Utility Functions
// =============================================================================

function generateErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizeError(error: unknown): { message: string; code?: string; details?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as any).code,
      details: error.stack,
    };
  }
  
  if (typeof error === "string") {
    return { message: error };
  }
  
  if (error && typeof error === "object") {
    return {
      message: (error as any).message || "An unknown error occurred",
      code: (error as any).code,
      details: JSON.stringify(error),
    };
  }
  
  return { message: "An unknown error occurred" };
}

// =============================================================================
// Error Boundary Component
// =============================================================================

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps.children !== this.props.children
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

// =============================================================================
// Provider Component
// =============================================================================

function ErrorProviderComponent({
  children,
  maxErrors = 50,
  onError,
}: ErrorProviderProps) {
  const [errors, setErrors] = useState<AppError[]>([]);
  const { showError } = useNotification();

  // =============================================================================
  // Error Actions
  // =============================================================================

  const addError = useCallback((error: Omit<AppError, "id" | "timestamp">) => {
    const newError: AppError = {
      ...error,
      id: generateErrorId(),
      timestamp: new Date(),
    };

    setErrors((prev) => {
      const next = [newError, ...prev];
      // Keep only the most recent errors
      return next.slice(0, maxErrors);
    });

    onError?.(newError);
  }, [maxErrors, onError]);

  const removeError = useCallback((errorId: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // =============================================================================
  // Error Handlers
  // =============================================================================

  const handleError = useCallback((
    error: unknown,
    options?: { source?: string; showToast?: boolean }
  ) => {
    const normalized = normalizeError(error);
    const appError: AppError = {
      id: generateErrorId(),
      message: normalized.message,
      code: normalized.code,
      details: normalized.details,
      timestamp: new Date(),
      source: options?.source,
      recoverable: true,
    };

    setErrors((prev) => [appError, ...prev].slice(0, maxErrors));

    if (options?.showToast !== false) {
      showError(normalized.message);
    }

    onError?.(appError);
  }, [maxErrors, onError, showError]);

  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    options?: { source?: string; showToast?: boolean; fallbackValue?: T }
  ): Promise<T | undefined> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error, options);
      return options?.fallbackValue;
    }
  }, [handleError]);

  const retry = useCallback(async <T,>(
    operation: () => Promise<T>,
    errorId: string
  ): Promise<T> => {
    removeError(errorId);
    
    try {
      return await operation();
    } catch (error) {
      handleError(error, { source: "retry" });
      throw error;
    }
  }, [removeError, handleError]);

  // =============================================================================
  // Computed Values
  // =============================================================================

  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const lastError = useMemo(() => errors[0] || null, [errors]);

  // =============================================================================
  // Memoized Value
  // =============================================================================

  const value = useMemo<ErrorContextType>(
    () => ({
      errors,
      hasErrors,
      lastError,
      addError,
      removeError,
      clearErrors,
      handleError,
      handleAsyncError,
      retry,
    }),
    [
      errors,
      hasErrors,
      lastError,
      addError,
      removeError,
      clearErrors,
      handleError,
      handleAsyncError,
      retry,
    ]
  );

  // =============================================================================
  // Error Boundary Handler
  // =============================================================================

  const handleBoundaryError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    addError({
      message: error.message,
      details: errorInfo.componentStack,
      source: "ErrorBoundary",
      recoverable: false,
    });
  }, [addError]);

  return (
    <ErrorContext.Provider value={value}>
      <ErrorBoundaryClass onError={handleBoundaryError}>
        {children}
      </ErrorBoundaryClass>
    </ErrorContext.Provider>
  );
}

// Memoize the provider
export const ErrorProvider = memo(ErrorProviderComponent);
ErrorProvider.displayName = "ErrorProvider";

// =============================================================================
// Hook
// =============================================================================

export function useError(): ErrorContextType {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Hook to check if there are any errors
 */
export function useHasErrors(): boolean {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useHasErrors must be used within an ErrorProvider");
  }
  return context.hasErrors;
}

/**
 * Hook to get the last error
 */
export function useLastError(): AppError | null {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useLastError must be used within an ErrorProvider");
  }
  return context.lastError;
}

/**
 * Hook to create an error handler for a specific source
 */
export function useErrorHandler(source: string) {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useErrorHandler must be used within an ErrorProvider");
  }

  return useMemo(
    () => ({
      handle: (error: unknown, options?: { showToast?: boolean }) =>
        context.handleError(error, { source, ...options }),
      handleAsync: <T>(promise: Promise<T>, options?: { showToast?: boolean; fallbackValue?: T }) =>
        context.handleAsyncError(promise, { source, ...options }),
    }),
    [context, source]
  );
}

// =============================================================================
// Error Boundary Export
// =============================================================================

export { ErrorBoundaryClass as ErrorBoundary };
export type { ErrorBoundaryProps, ErrorBoundaryState, AppError };

export default ErrorContext;
