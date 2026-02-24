"use client";

// =============================================================================
// Context Providers - Main Export File
// =============================================================================

// App Providers Composition
export { AppProviders, default as default } from "./app-providers";

// Individual Providers
export { AuthProvider } from "./auth-provider";
export { ThemeProvider } from "./theme-provider";
export { NotificationProvider } from "./notification-context";
export { LoadingProvider } from "./loading-context";
export { ErrorProvider, ErrorBoundary } from "./error-context";
export { QueryProvider, queryKeys, createQueryOptions, createMutationOptions } from "./query-provider";

// =============================================================================
// Hooks - Re-export from hooks.ts
// =============================================================================

export {
  // Auth hooks
  useAuth,
  useIsAuthenticated,
  useUser,
  useAuthLoading,
  
  // Theme hooks
  useTheme,
  useResolvedTheme,
  useIsDarkMode,
  useSetTheme,
  
  // Notification hooks
  useNotification,
  useToast,
  usePromiseToast,
  
  // Loading hooks
  useLoading,
  useIsLoading,
  useLoadingKey,
  useLoadingHandler,
  
  // Error hooks
  useError,
  useHasErrors,
  useLastError,
  useErrorHandler,
  
  // Utility hooks
  useAsyncOperation,
  useFormSubmit,
  useDataFetch,
  useIsBusy,
  useBusyChecker,
} from "./hooks";

// =============================================================================
// Types
// =============================================================================

export type {
  AppError,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./error-context";

// =============================================================================
// Context Values (for advanced use cases)
// =============================================================================

export { default as AuthContext } from "./auth-provider";
export { default as ThemeContext } from "./theme-provider";
export { default as NotificationContext } from "./notification-context";
export { default as LoadingContext } from "./loading-context";
export { default as ErrorContext } from "./error-context";
