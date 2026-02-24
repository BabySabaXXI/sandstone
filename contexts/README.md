# Sandstone Context Architecture

This directory contains the optimized React Context providers for the Sandstone application.

## Table of Contents

- [Overview](#overview)
- [Context Providers](#context-providers)
- [Usage Guide](#usage-guide)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

## Overview

The context architecture follows these principles:

1. **Separation of Concerns**: Each context handles a specific domain
2. **Performance Optimization**: All providers use `React.memo` and `useMemo` to prevent unnecessary re-renders
3. **Fine-Grained Subscriptions**: Selector hooks allow components to subscribe to only the state they need
4. **Composition Pattern**: `AppProviders` composes all providers in the correct order

## Context Providers

### 1. AppProviders

**File**: `app-providers.tsx`

Root provider composition that wraps all other providers in the correct order:

```tsx
<QueryProvider>
  <ThemeProvider>
    <NotificationProvider>
      <ErrorProvider>
        <LoadingProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LoadingProvider>
      </ErrorProvider>
    </NotificationProvider>
  </ThemeProvider>
</QueryProvider>
```

**Usage**:
```tsx
import { AppProviders } from "@/contexts";

export default function RootLayout({ children }) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
```

### 2. AuthProvider

**File**: `auth-provider.tsx`

Manages authentication state using Supabase Auth.

**Features**:
- User session management
- Sign in/out with email/password
- OAuth provider authentication
- Phone OTP authentication
- Session persistence
- Automatic token refresh

**Hooks**:
```tsx
// Full auth context
const { user, loading, signIn, signOut } = useAuth();

// Selective subscriptions (better performance)
const isAuthenticated = useIsAuthenticated();
const user = useUser();
const loading = useAuthLoading();
```

### 3. ThemeProvider

**File**: `theme-provider.tsx`

Manages application theme (light/dark/system).

**Features**:
- System preference detection
- LocalStorage persistence
- Smooth theme transitions
- SSR-safe rendering
- Meta theme-color updates

**Hooks**:
```tsx
// Full theme context
const { theme, setTheme, resolvedTheme } = useTheme();

// Selective subscriptions
const resolvedTheme = useResolvedTheme(); // "light" | "dark"
const isDarkMode = useIsDarkMode(); // boolean
const setTheme = useSetTheme(); // (theme: Theme) => void
```

### 4. NotificationProvider

**File**: `notification-context.tsx`

Global toast notification system using Sonner.

**Features**:
- Success, error, warning, info, loading toasts
- Promise-based toasts
- Toast actions and cancellation
- Position and styling customization

**Hooks**:
```tsx
const { show, showSuccess, showError, showWarning, showInfo, showLoading, showPromise } = useNotification();

// Usage
showSuccess("Operation completed!");
showError("Something went wrong");
showPromise(
  fetchData(),
  {
    loading: "Loading...",
    success: "Data loaded!",
    error: "Failed to load data",
  }
);
```

### 5. LoadingProvider

**File**: `loading-context.tsx`

Manages global and named loading states.

**Features**:
- Global loading state
- Named loading states for specific operations
- Progress tracking
- Async operation wrapper
- Batch operations

**Hooks**:
```tsx
const { isLoading, startLoading, stopLoading, withLoading } = useLoading();

// Named loading states
const { start, stop, isLoading } = useLoadingHandler("documents-fetch");

// Async wrapper
const data = await withLoading(fetchData(), "data-fetch", {
  message: "Fetching data...",
});
```

### 6. ErrorProvider

**File**: `error-context.tsx`

Global error handling with Error Boundary integration.

**Features**:
- Error collection and management
- Error recovery with retry
- Async error handling
- Error Boundary integration
- Toast notifications for errors

**Hooks**:
```tsx
const { errors, handleError, handleAsyncError, retry } = useError();

// Handle async errors
const data = await handleAsyncError(fetchData(), {
  source: "component-name",
  fallbackValue: defaultData,
});

// Error handler for specific source
const { handle, handleAsync } = useErrorHandler("my-component");
```

### 7. QueryProvider

**File**: `query-provider.tsx`

React Query configuration with integrated error handling.

**Features**:
- Centralized query client configuration
- Automatic error toasts
- Query key factory for type-safe keys
- Default retry and cache policies

**Query Keys**:
```tsx
import { queryKeys } from "@/contexts";

// Usage in queries
const { data } = useQuery({
  queryKey: queryKeys.documents.list({ subject: "economics" }),
  queryFn: fetchDocuments,
});
```

## Usage Guide

### Basic Setup

1. Wrap your app with `AppProviders` in `layout.tsx`:

```tsx
import { AppProviders } from "@/contexts";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

### Using Contexts in Components

```tsx
"use client";

import { useAuth, useTheme, useNotification, useLoading } from "@/contexts";

export function MyComponent() {
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const { showSuccess } = useNotification();
  const { withLoading } = useLoading();

  const handleSignOut = async () => {
    await withLoading(signOut(), "signout", {
      successMessage: "Signed out successfully",
    });
  };

  return (
    <div className={resolvedTheme === "dark" ? "dark" : ""}>
      <p>Hello, {user?.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
```

### Performance Optimization

Use selector hooks to avoid unnecessary re-renders:

```tsx
// Bad: Component re-renders on any auth change
const { user } = useAuth();

// Good: Component only re-renders when user changes
const user = useUser();

// Good: Component only re-renders when auth status changes
const isAuthenticated = useIsAuthenticated();
```

### Async Operations

Use the `useAsyncOperation` hook for complex async flows:

```tsx
import { useAsyncOperation } from "@/contexts";

export function DataFetcher() {
  const { execute } = useAsyncOperation();

  const fetchData = async () => {
    const result = await execute(
      () => api.getData(),
      {
        loadingKey: "data-fetch",
        loadingMessage: "Fetching data...",
        successMessage: "Data loaded!",
        errorMessage: "Failed to load data",
      }
    );
    
    if (result) {
      // Handle success
    }
  };

  return <button onClick={fetchData}>Fetch Data</button>;
}
```

## Best Practices

### 1. Use Selector Hooks

Always use the most specific hook for your needs:

```tsx
// ❌ Subscribes to all auth changes
const { isAuthenticated } = useAuth();

// ✅ Only subscribes to auth status
const isAuthenticated = useIsAuthenticated();
```

### 2. Memoize Callbacks

All context actions are already memoized with `useCallback`. Pass them directly to event handlers:

```tsx
// ✅ Context actions are already memoized
const { signIn } = useAuth();
<button onClick={() => signIn(email, password)}>Sign In</button>
```

### 3. Avoid Prop Drilling

Use contexts instead of prop drilling:

```tsx
// ❌ Prop drilling
<Parent theme={theme}>
  <Child theme={theme}>
    <Grandchild theme={theme} />
  </Child>
</Parent>

// ✅ Use context
const { resolvedTheme } = useTheme();
```

### 4. Handle Loading States

Always show loading states for async operations:

```tsx
const { isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 5. Error Boundaries

Wrap components that might throw with Error Boundary:

```tsx
import { ErrorBoundary } from "@/contexts";

<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```

## Migration Guide

### From Original AuthProvider

**Before**:
```tsx
import { useAuth } from "@/components/auth-provider";
```

**After**:
```tsx
import { useAuth } from "@/contexts";
```

### From Original ThemeProvider

**Before**:
```tsx
import { useTheme } from "@/components/theme-provider";
```

**After**:
```tsx
import { useTheme, useResolvedTheme, useIsDarkMode } from "@/contexts";
```

### From Direct Sonner Usage

**Before**:
```tsx
import { toast } from "sonner";
toast.success("Success!");
```

**After**:
```tsx
import { useNotification } from "@/contexts";
const { showSuccess } = useNotification();
showSuccess("Success!");
```

## File Structure

```
contexts/
├── index.ts              # Main exports
├── hooks.ts              # Combined and utility hooks
├── app-providers.tsx     # Provider composition
├── auth-provider.tsx     # Authentication context
├── theme-provider.tsx    # Theme context
├── notification-context.tsx  # Toast notifications
├── loading-context.tsx   # Loading states
├── error-context.tsx     # Error handling
├── query-provider.tsx    # React Query configuration
└── README.md             # This file
```

## Dependencies

- `react` - Core React library
- `@supabase/supabase-js` - Supabase client (AuthProvider)
- `sonner` - Toast notifications (NotificationProvider)
- `@tanstack/react-query` - Server state management (QueryProvider)

## License

Part of the Sandstone project.
