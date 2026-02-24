"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { errorLogger, ErrorContext, ErrorSeverity } from "@/lib/error-handling/error-logger";
import { 
  WifiOff, 
  AlertCircle, 
  ShieldAlert, 
  ServerOff,
  RefreshCw
} from "lucide-react";

// Network error detection
export function isNetworkError(error: Error): boolean {
  return (
    error.message?.includes("network") ||
    error.message?.includes("fetch") ||
    error.message?.includes("Failed to fetch") ||
    error.name === "NetworkError" ||
    error.message?.includes("ERR_INTERNET_DISCONNECTED") ||
    error.message?.includes("ECONNREFUSED") ||
    !navigator.onLine
  );
}

// Auth error detection
export function isAuthError(error: Error): boolean {
  return (
    error.message?.includes("auth") ||
    error.message?.includes("unauthorized") ||
    error.message?.includes("token") ||
    error.message?.includes("session") ||
    error.message?.includes("JWT") ||
    error.message?.toLowerCase().includes("login") ||
    error.message?.includes("403") ||
    error.message?.includes("401")
  );
}

// API error detection
export function isApiError(error: Error): boolean {
  return (
    error.message?.includes("api") ||
    error.message?.includes("API") ||
    error.message?.includes("500") ||
    error.message?.includes("502") ||
    error.message?.includes("503") ||
    error.message?.includes("504")
  );
}

// User-friendly error messages
export function getUserFriendlyMessage(error: Error): {
  title: string;
  message: string;
  action?: string;
  icon: React.ReactNode;
} {
  if (isNetworkError(error)) {
    return {
      title: "Connection Issue",
      message: "It looks like you're offline or having network problems. Please check your connection and try again.",
      action: "Retry",
      icon: <WifiOff className="w-5 h-5" />,
    };
  }

  if (isAuthError(error)) {
    return {
      title: "Authentication Required",
      message: "Your session may have expired. Please sign in again to continue.",
      action: "Sign In",
      icon: <ShieldAlert className="w-5 h-5" />,
    };
  }

  if (isApiError(error)) {
    return {
      title: "Server Error",
      message: "We're experiencing some technical difficulties. Please try again in a moment.",
      action: "Retry",
      icon: <ServerOff className="w-5 h-5" />,
    };
  }

  return {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. We've noted the issue and are working on it.",
    action: "Try Again",
    icon: <AlertCircle className="w-5 h-5" />,
  };
}

// Global error handler hook
export function useGlobalErrorHandler() {
  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    // Log the error
    const logEntry = errorLogger.log(error, context);
    
    if (!logEntry) return;

    // Show user-friendly toast
    const { title, message, action, icon } = getUserFriendlyMessage(error);
    
    toast.error(title, {
      description: message,
      icon,
      action: action
        ? {
            label: action,
            onClick: () => {
              if (isAuthError(error)) {
                window.location.href = "/auth/login";
              } else {
                window.location.reload();
              }
            },
          }
        : undefined,
      duration: 8000,
    });

    return logEntry;
  }, []);

  const handleAsyncError = useCallback(async <T,>(
    promise: Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      handleError(err, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}

// Global error handler component
interface GlobalErrorHandlerProps {
  children: React.ReactNode;
  onError?: (error: Error, context?: ErrorContext) => void;
}

export function GlobalErrorHandler({ children, onError }: GlobalErrorHandlerProps) {
  const { handleError } = useGlobalErrorHandler();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      handleError(error, {
        additionalData: { source: "unhandledrejection" },
      });
      
      onError?.(error, { additionalData: { source: "unhandledrejection" } });
    };

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      
      handleError(error, {
        additionalData: {
          source: "window.onerror",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
      
      onError?.(error, {
        additionalData: {
          source: "window.onerror",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // Handle online/offline status
    const handleOffline = () => {
      toast.error("You're offline", {
        description: "Some features may not work until you're back online.",
        icon: <WifiOff className="w-5 h-5" />,
        duration: 5000,
      });
    };

    const handleOnline = () => {
      toast.success("You're back online!", {
        icon: <RefreshCw className="w-5 h-5" />,
        duration: 3000,
      });
    };

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial online status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleError, onError]);

  return <>{children}</>;
}

// Error boundary fallback component for specific sections
export function SectionErrorFallback({
  error,
  reset,
  title = "Failed to load",
}: {
  error: Error;
  reset: () => void;
  title?: string;
}) {
  const { title: errorTitle, message, action, icon } = getUserFriendlyMessage(error);

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-destructive/10 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {message}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {action || "Try Again"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Retry wrapper with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);
        
        // Wait before retrying
        await new Promise((resolve) => 
          setTimeout(resolve, delay * Math.pow(backoff, attempt))
        );
      }
    }
  }

  throw lastError!;
}

// Debounced error handler to prevent error spam
export function createDebouncedErrorHandler(
  handler: (error: Error) => void,
  delay: number = 5000
) {
  let timeout: NodeJS.Timeout | null = null;
  let lastError: string | null = null;

  return (error: Error) => {
    const errorKey = `${error.name}:${error.message}`;

    // Skip if same error within debounce period
    if (errorKey === lastError && timeout) {
      return;
    }

    lastError = errorKey;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      handler(error);
      lastError = null;
    }, delay);
  };
}
