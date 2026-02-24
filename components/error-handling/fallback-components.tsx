"use client";

import { motion } from "framer-motion";
import { 
  Loader2, 
  FileQuestion, 
  WifiOff, 
  AlertCircle,
  RefreshCw,
  Home,
  Search,
  Database,
  ServerOff,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Base fallback props
interface FallbackProps {
  className?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

// Loading fallback
export function LoadingFallback({ className, message = "Loading..." }: FallbackProps & { message?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-primary" />
      </motion.div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Skeleton loading placeholder
export function SkeletonFallback({ className, lines = 3 }: FallbackProps & { lines?: number }) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-muted rounded animate-pulse"
          style={{ width: `${Math.random() * 30 + 60}%` }}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ className }: FallbackProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  );
}

// Grid skeleton
export function GridSkeleton({ className, count = 4 }: FallbackProps & { count?: number }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Not found fallback
export function NotFoundFallback({ 
  className, 
  title = "Not Found",
  message = "The page or resource you're looking for doesn't exist.",
  onGoHome,
  onSearch,
}: FallbackProps & { 
  title?: string; 
  message?: string;
  onSearch?: () => void;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      <div className="flex gap-3">
        {onGoHome && (
          <Button onClick={onGoHome} variant="default">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
        {onSearch && (
          <Button onClick={onSearch} variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        )}
      </div>
    </div>
  );
}

// Network error fallback
export function NetworkErrorFallback({ 
  className, 
  onRetry,
  onGoHome,
}: FallbackProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
        <WifiOff className="w-10 h-10 text-orange-500" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">You're Offline</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        It looks like you're not connected to the internet. Check your connection and try again.
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Server error fallback
export function ServerErrorFallback({ 
  className, 
  onRetry,
  onGoHome,
}: FallbackProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <ServerOff className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Server Error</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        We're experiencing some technical difficulties. Please try again in a moment.
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Auth error fallback
export function AuthErrorFallback({ 
  className, 
  onRetry,
  onGoHome,
}: FallbackProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
        <ShieldAlert className="w-10 h-10 text-yellow-600" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Session Expired</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Your session has expired or you're not authorized. Please sign in again to continue.
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Data empty fallback
export function EmptyStateFallback({ 
  className, 
  title = "No data yet",
  message = "Get started by creating your first item.",
  icon: Icon = Database,
  action,
  actionLabel,
}: FallbackProps & { 
  title?: string; 
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      {action && actionLabel && (
        <Button onClick={action} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Generic error fallback
export function GenericErrorFallback({ 
  className, 
  error,
  onRetry,
  onGoHome,
}: FallbackProps & { error?: Error }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Something Went Wrong</h2>
      <p className="text-muted-foreground max-w-md mb-2">
        An unexpected error occurred. We've noted the issue and are working on it.
      </p>
      {error && (
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          {error.message}
        </p>
      )}
      <div className="flex gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Suspense wrapper with fallback
interface SuspenseFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

import { Suspense } from "react";

export function SuspenseWithFallback({ 
  children, 
  fallback = <LoadingFallback />,
}: SuspenseFallbackProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Error boundary wrapper with fallback
interface ErrorBoundaryFallbackProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

import { EnhancedErrorBoundary } from "./enhanced-error-boundary";

export function ErrorBoundaryWithFallback({ 
  children, 
  fallback,
}: ErrorBoundaryFallbackProps) {
  return (
    <EnhancedErrorBoundary fallback={fallback}>
      {children}
    </EnhancedErrorBoundary>
  );
}

// Combined suspense + error boundary
export function SafeComponent({ 
  children, 
  loadingFallback = <LoadingFallback />,
  errorFallback,
}: {
  children: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  return (
    <EnhancedErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </EnhancedErrorBoundary>
  );
}
