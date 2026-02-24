# Context Migration Guide

This guide helps migrate from the existing context implementation to the optimized architecture.

## Step 1: Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Step 2: Update Layout

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/contexts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sandstone - AI-Powered Learning",
  description: "AI-powered A-Level response grading with detailed examiner feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

## Step 3: Update Import Paths

### Auth Hook

**Before**:
```tsx
import { useAuth } from "@/components/auth-provider";
```

**After**:
```tsx
import { useAuth, useIsAuthenticated, useUser } from "@/contexts";
```

### Theme Hook

**Before**:
```tsx
import { useTheme } from "@/components/theme-provider";
```

**After**:
```tsx
import { useTheme, useResolvedTheme, useIsDarkMode } from "@/contexts";
```

### Toast Notifications

**Before**:
```tsx
import { toast } from "sonner";

// In component
const handleClick = () => {
  toast.success("Success!");
};
```

**After**:
```tsx
import { useNotification } from "@/contexts";

// In component
const { showSuccess } = useNotification();

const handleClick = () => {
  showSuccess("Success!");
};
```

## Step 4: Update Components

### Example: Login Component

**Before**:
```tsx
"use client";

import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

export function LoginForm() {
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      toast.success("Signed in!");
    } catch (error) {
      toast.error("Sign in failed");
    }
  };

  if (loading) return <Spinner />;

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**After**:
```tsx
"use client";

import { useAuth, useNotification, useLoading } from "@/contexts";

export function LoginForm() {
  const { signIn } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { withLoading } = useLoading();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const result = await withLoading(
      signIn(email, password),
      "login",
      {
        successMessage: "Signed in successfully!",
        errorMessage: "Sign in failed",
      }
    );
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example: Theme Toggle

**Before**:
```tsx
"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

**After**:
```tsx
"use client";

import { useTheme, useIsDarkMode, useSetTheme } from "@/contexts";

// Option 1: Use minimal subscription
export function ThemeToggle() {
  const isDarkMode = useIsDarkMode();
  const setTheme = useSetTheme();

  return (
    <button onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}

// Option 2: Use full theme context if needed
export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      {themes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

## Step 5: Add Error Boundaries

Wrap risky components with Error Boundary:

```tsx
import { ErrorBoundary } from "@/contexts";

export function ParentComponent() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

## Step 6: Use React Query

Replace direct data fetching with React Query:

**Before**:
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  setLoading(true);
  fetchData().then((data) => {
    setData(data);
    setLoading(false);
  });
}, []);
```

**After**:
```tsx
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/contexts";

const { data, isLoading } = useQuery({
  queryKey: queryKeys.documents.list(),
  queryFn: fetchData,
});
```

## Step 7: Clean Up

Remove old provider files:
- `components/auth-provider.tsx` (keep for backward compatibility if needed)
- `components/theme-provider.tsx` (keep for backward compatibility if needed)

Update `components/index.ts` to export from new location:

```tsx
// Re-export for backward compatibility
export { useAuth, AuthProvider } from "@/contexts";
export { useTheme, ThemeProvider } from "@/contexts";
```

## Common Patterns

### Async Form Submission

```tsx
import { useFormSubmit } from "@/contexts";

export function MyForm() {
  const { submit } = useFormSubmit();

  const handleSubmit = async (data: FormData) => {
    await submit(api.createItem, data, {
      successMessage: "Item created!",
      errorMessage: "Failed to create item",
      onSuccess: (result) => {
        router.push(`/items/${result.id}`);
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Data Fetching with Loading

```tsx
import { useDataFetch } from "@/contexts";

export function DataDisplay() {
  const { data, isLoading, fetch } = useDataFetch<Item[]>();

  useEffect(() => {
    fetch(() => api.getItems());
  }, [fetch]);

  if (isLoading) return <LoadingSpinner />;

  return <ItemList items={data || []} />;
}
```

### Error Handling

```tsx
import { useErrorHandler } from "@/contexts";

export function ErrorProneComponent() {
  const { handle, handleAsync } = useErrorHandler("ErrorProneComponent");

  const riskyOperation = async () => {
    // Option 1: Handle async
    const result = await handleAsync(riskyPromise(), {
      fallbackValue: defaultValue,
    });

    // Option 2: Manual handling
    try {
      await riskyPromise();
    } catch (error) {
      handle(error);
    }
  };

  return <button onClick={riskyOperation}>Do Risky Thing</button>;
}
```

## Troubleshooting

### Context Not Found

If you get "useX must be used within an XProvider", ensure:
1. `AppProviders` is wrapping your app in `layout.tsx`
2. The component is marked with `"use client"`

### Infinite Re-renders

If you experience infinite re-renders:
1. Check that you're not creating new objects in render
2. Use selector hooks instead of destructuring the full context
3. Ensure callbacks are properly memoized

### TypeScript Errors

If you see TypeScript errors:
1. Run `npm run type-check` to identify issues
2. Ensure all imports are from `@/contexts`
3. Check that your component is marked `"use client"`

## Performance Tips

1. **Use selector hooks** for better performance:
   ```tsx
   const user = useUser(); // ✅ Only re-renders when user changes
   const { user } = useAuth(); // ❌ Re-renders on any auth change
   ```

2. **Batch multiple context updates**:
   ```tsx
   const { startMultiple, stopMultiple } = useLoading();
   startMultiple(["fetch-a", "fetch-b"]);
   ```

3. **Use React Query for server state**:
   ```tsx
   const { data } = useQuery({
     queryKey: queryKeys.documents.list(),
     queryFn: fetchDocuments,
     staleTime: 1000 * 60 * 5, // 5 minutes
   });
   ```

## Support

For questions or issues, refer to:
- `README.md` - Full documentation
- `hooks.ts` - All available hooks
- Component JSDoc comments - Inline documentation
