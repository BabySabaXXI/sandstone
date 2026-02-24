// Error Boundary Components
export { EnhancedErrorBoundary, withErrorBoundary } from "./enhanced-error-boundary";
export type { Props as ErrorBoundaryProps } from "./enhanced-error-boundary";

// Global Error Handler
export { 
  GlobalErrorHandler, 
  useGlobalErrorHandler,
  SectionErrorFallback,
  withRetry,
  createDebouncedErrorHandler,
  isNetworkError,
  isAuthError,
  isApiError,
  getUserFriendlyMessage,
} from "./global-error-handler";

// Fallback Components
export {
  LoadingFallback,
  SkeletonFallback,
  CardSkeleton,
  GridSkeleton,
  NotFoundFallback,
  NetworkErrorFallback,
  ServerErrorFallback,
  AuthErrorFallback,
  EmptyStateFallback,
  GenericErrorFallback,
  SuspenseWithFallback,
  ErrorBoundaryWithFallback,
  SafeComponent,
} from "./fallback-components";

// Error Monitor
export { ErrorMonitor } from "./error-monitor";

// Re-export from error-logger for convenience
export { 
  errorLogger, 
  handleAsyncError, 
  withErrorHandling,
  safeJsonParse,
  safeLocalStorage,
} from "@/lib/error-handling/error-logger";
export type { 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext,
  LogEntry,
} from "@/lib/error-handling/error-logger";

// Re-export from error-utils for convenience
export {
  AppError,
  ValidationError,
  NetworkError,
  AuthError,
  ApiError,
  useAsyncOperation,
  useErrorState,
  useNetworkStatus,
  useRetry,
  useDebouncedErrorHandler,
  useFormErrors,
  createSafeFetcher,
  handleBatchOperations,
  parseApiError,
  formatErrorForDisplay,
  isRetryableError,
} from "@/lib/error-handling/error-utils";
