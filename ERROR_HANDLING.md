# Sandstone Error Handling Implementation

This document describes the comprehensive error handling system implemented for the Sandstone application.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Hooks](#hooks)
4. [Utilities](#utilities)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)

## Overview

The error handling system provides:

- **Error Boundaries** - Catch React component errors
- **Global Error Handler** - Handle async and global errors
- **Error Logging** - Centralized error tracking
- **User-Friendly Messages** - Clear error communication
- **Recovery Mechanisms** - Automatic retry and reset
- **Fallback UI Components** - Graceful degradation

## Components

### EnhancedErrorBoundary

A robust error boundary with recovery options and detailed error display.

```tsx
import { EnhancedErrorBoundary } from "@/components/error-handling";

<EnhancedErrorBoundary
  componentName="MyComponent"
  onError={(error, errorInfo) => console.log(error)}
  onReset={() => console.log("Reset!")}
  resetKeys={[key1, key2]}
>
  <YourComponent />
</EnhancedErrorBoundary>
```

**Props:**
- `children` - Components to wrap
- `fallback` - Custom fallback UI
- `onError` - Error callback
- `onReset` - Reset callback
- `resetKeys` - Keys that trigger reset when changed
- `componentName` - For error tracking

### GlobalErrorHandler

Handles global errors, unhandled promise rejections, and network status.

```tsx
import { GlobalErrorHandler } from "@/components/error-handling";

<GlobalErrorHandler onError={(error) => console.log(error)}>
  <YourApp />
</GlobalErrorHandler>
```

### Fallback Components

Pre-built fallback UIs for various states:

```tsx
import {
  LoadingFallback,
  SkeletonFallback,
  NotFoundFallback,
  NetworkErrorFallback,
  ServerErrorFallback,
  AuthErrorFallback,
  EmptyStateFallback,
  GenericErrorFallback,
} from "@/components/error-handling";

// Loading state
<LoadingFallback message="Loading data..." />

// Skeleton placeholder
<SkeletonFallback lines={5} />

// Error states
<NetworkErrorFallback onRetry={retryFn} onGoHome={goHomeFn} />
<ServerErrorFallback onRetry={retryFn} />
<AuthErrorFallback onRetry={signInFn} />
<EmptyStateFallback
  title="No data"
  message="Get started by creating your first item"
  action={createFn}
  actionLabel="Create"
/>
```

### ErrorMonitor

A debugging tool for viewing and managing error logs.

```tsx
import { ErrorMonitor } from "@/components/error-handling";

const [isOpen, setIsOpen] = useState(false);

<ErrorMonitor isOpen={isOpen} onClose={() => setIsOpen(false)} />
```

## Hooks

### useGlobalErrorHandler

Handle errors with user-friendly toasts and logging.

```tsx
import { useGlobalErrorHandler } from "@/components/error-handling";

const { handleError, handleAsyncError } = useGlobalErrorHandler();

// Handle sync error
handleError(new Error("Something went wrong"));

// Handle async error
const data = await handleAsyncError(fetchData());
```

### useAsyncOperation

Manage async operations with built-in error handling.

```tsx
import { useAsyncOperation } from "@/lib/error-handling/error-utils";

const { data, isLoading, error, execute, reset } = useAsyncOperation(
  async (id: string) => {
    return await fetchUser(id);
  },
  {
    onSuccess: (data) => console.log(data),
    onError: (error) => console.log(error),
    showToast: true,
    retryCount: 3,
  }
);

// Execute
execute("user-123");
```

### useErrorState

Manage error state in components.

```tsx
import { useErrorState } from "@/lib/error-handling/error-utils";

const { error, hasError, throwError, clearError, handleError } = useErrorState();

// Set error
handleError(new Error("Invalid input"));

// Clear error
clearError();
```

### useNetworkStatus

Monitor online/offline status.

```tsx
import { useNetworkStatus } from "@/lib/error-handling/error-utils";

const { isOnline, wasOffline } = useNetworkStatus();

if (!isOnline) {
  return <NetworkErrorFallback />;
}
```

### useRetry

Retry operations with exponential backoff.

```tsx
import { useRetry } from "@/lib/error-handling/error-utils";

const { execute, cancel, attempt, isRetrying } = useRetry(
  () => fetchData(),
  { maxRetries: 3, delay: 1000 }
);

// Execute with retry
execute();
```

### useFormErrors

Manage form validation errors.

```tsx
import { useFormErrors } from "@/lib/error-handling/error-utils";

const {
  errors,
  generalError,
  setFieldError,
  clearFieldError,
  clearAllErrors,
  hasErrors,
} = useFormErrors<FormData>();

setFieldError("email", "Invalid email");
clearFieldError("email");
```

## Utilities

### Error Logger

Centralized error logging service.

```tsx
import { errorLogger } from "@/lib/error-handling/error-logger";

// Log error
errorLogger.log(error, {
  componentName: "MyComponent",
  additionalData: { userId: "123" },
});

// Get logs
const logs = errorLogger.getLogs();
const criticalLogs = errorLogger.getLogsBySeverity("critical");

// Export logs
const json = errorLogger.exportLogs();

// Clear logs
errorLogger.clearLogs();
```

### Custom Error Classes

```tsx
import {
  AppError,
  ValidationError,
  NetworkError,
  AuthError,
  ApiError,
} from "@/lib/error-handling/error-utils";

// Throw custom errors
throw new ValidationError("Invalid email format", { field: "email" });
throw new NetworkError("Connection timeout");
throw new AuthError("Session expired");
throw new ApiError("Server error", 500);
```

### Helper Functions

```tsx
import {
  handleAsyncError,
  withErrorHandling,
  withRetry,
  safeJsonParse,
  safeLocalStorage,
  parseApiError,
  formatErrorForDisplay,
  isRetryableError,
  createSafeFetcher,
  handleBatchOperations,
} from "@/lib/error-handling/error-utils";

// Handle async with tuple return
const [data, error] = await handleAsyncError(fetchData());

// Wrap function with error handling
const safeFetch = withErrorHandling(fetchData);
const [data, error] = await safeFetch();

// Retry with exponential backoff
const result = await withRetry(() => fetchData(), {
  maxRetries: 3,
  delay: 1000,
});

// Safe JSON parse
const data = safeJsonParse(jsonString, defaultValue);

// Safe localStorage
const data = safeLocalStorage("key", defaultValue);

// Parse API error
const { message, code, status } = parseApiError(error);

// Format for display
const message = formatErrorForDisplay(error);

// Check if retryable
if (isRetryableError(error)) {
  // Retry logic
}

// Create safe fetcher
const fetchUser = createSafeFetcher(getUser, {
  fallback: null,
  onError: (error) => console.log(error),
});

// Batch operations
const { results, errors } = await handleBatchOperations(
  [() => op1(), () => op2(), () => op3()],
  { continueOnError: true }
);
```

## Usage Examples

### Basic Component Error Handling

```tsx
"use client";

import { EnhancedErrorBoundary, GenericErrorFallback } from "@/components/error-handling";

export default function Page() {
  return (
    <EnhancedErrorBoundary
      componentName="MyPage"
      fallback={<GenericErrorFallback onRetry={() => window.location.reload()} />}
    >
      <MyComponent />
    </EnhancedErrorBoundary>
  );
}
```

### API Call with Error Handling

```tsx
"use client";

import { useAsyncOperation, NetworkErrorFallback } from "@/components/error-handling";
import { useNetworkStatus } from "@/lib/error-handling/error-utils";

export function DataFetcher() {
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, error, execute } = useAsyncOperation(fetchData);

  if (!isOnline) {
    return <NetworkErrorFallback onRetry={() => window.location.reload()} />;
  }

  if (isLoading) return <LoadingFallback />;
  if (error) return <GenericErrorFallback error={error} onRetry={execute} />;

  return <DataDisplay data={data} />;
}
```

### Form with Validation

```tsx
"use client";

import { useFormErrors, ValidationError } from "@/lib/error-handling/error-utils";

export function MyForm() {
  const { errors, setFieldError, clearFieldError, hasErrors } = useFormErrors<FormData>();

  const handleSubmit = (data: FormData) => {
    clearAllErrors();

    if (!data.email.includes("@")) {
      setFieldError("email", "Invalid email format");
      return;
    }

    // Submit...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        onChange={() => clearFieldError("email")}
      />
      {errors.email && <span className="text-red-500">{errors.email}</span>}
    </form>
  );
}
```

## Configuration

### Error Logger Configuration

```tsx
import { errorLogger } from "@/lib/error-handling/error-logger";

errorLogger.updateConfig({
  maxLogs: 100,
  enableConsole: true,
  enableLocalStorage: true,
  enableServerReporting: true,
  serverEndpoint: "/api/errors",
  environment: "production",
  sampleRate: 1,
});
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ERROR_REPORTING_ENABLED=true
NEXT_PUBLIC_ERROR_SAMPLE_RATE=1
```

## File Structure

```
components/error-handling/
├── enhanced-error-boundary.tsx  # Main error boundary
├── global-error-handler.tsx     # Global error handling
├── fallback-components.tsx      # Fallback UI components
├── error-monitor.tsx            # Error monitoring dashboard
├── error-handling-example.tsx   # Usage examples
└── index.ts                     # Exports

lib/error-handling/
├── error-logger.ts              # Error logging service
└── error-utils.ts               # Error utilities and hooks

app/
├── error.tsx                    # Next.js error page
├── global-error.tsx             # Next.js global error page
├── not-found.tsx                # 404 page
├── loading.tsx                  # Loading state
└── layout-with-error-handling.tsx # Layout with error handling
```

## Integration with Existing Layout

To integrate error handling into the existing layout:

```tsx
// app/layout.tsx
import { EnhancedErrorBoundary } from "@/components/error-handling/enhanced-error-boundary";
import { GlobalErrorHandler } from "@/components/error-handling/global-error-handler";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <EnhancedErrorBoundary componentName="RootLayout">
          <GlobalErrorHandler>
            <ThemeProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider>
          </GlobalErrorHandler>
        </EnhancedErrorBoundary>
      </body>
    </html>
  );
}
```

## Best Practices

1. **Wrap critical components** with error boundaries
2. **Use async operation hooks** for data fetching
3. **Monitor network status** for offline handling
4. **Log errors** for debugging and monitoring
5. **Provide recovery options** in error UIs
6. **Use custom error classes** for specific scenarios
7. **Implement retry logic** for transient failures
8. **Show user-friendly messages** instead of technical errors
