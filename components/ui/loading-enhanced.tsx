"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, FileText, BookOpen, Users, Calendar, BarChart3 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Enhanced Loading Components for Sandstone
 * 
 * Comprehensive loading states including:
 * - Multiple spinner variants
 * - Progress bars (linear and circular)
 * - Skeleton screens for various content types
 * - Shimmer effects
 * - Loading overlays
 * - Content placeholders
 * 
 * @example
 * <Spinner variant="dots" />
 * <ProgressBar value={75} />
 * <SkeletonDashboard />
 * <LoadingOverlay isLoading={true} />
 */

// ============================================
// SPINNER VARIANTS
// ============================================

const spinnerVariants = cva("", {
  variants: {
    variant: {
      default: "animate-spin",
      dots: "",
      pulse: "animate-pulse",
      bounce: "",
      ring: "",
    },
    size: {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
      "2xl": "w-16 h-16",
    },
    color: {
      default: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
      sand: "text-sand-400",
      peach: "text-peach-300",
      sage: "text-sage-300",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    color: "default",
  },
});

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

// Classic Spinner
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, color, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className={cn(spinnerVariants({ size, color }))} />
    </div>
  )
);
Spinner.displayName = "Spinner";

// Dots Spinner
const DotsSpinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "default", ...props }, ref) => {
    const sizeClasses = {
      xs: "w-1.5 h-1.5",
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
      xl: "w-4 h-4",
      "2xl": "w-5 h-5",
    };

    const colorClasses = {
      default: "bg-primary",
      muted: "bg-muted-foreground",
      white: "bg-white",
      sand: "bg-sand-400",
      peach: "bg-peach-300",
      sage: "bg-sage-300",
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)} {...props}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              sizeClasses[size || "md"],
              colorClasses[color || "default"],
              "rounded-full animate-bounce"
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }
);
DotsSpinner.displayName = "DotsSpinner";

// Pulse Ring Spinner
const PulseRingSpinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "default", ...props }, ref) => {
    const sizeClasses = {
      xs: "w-6 h-6",
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-14 h-14",
      xl: "w-20 h-20",
      "2xl": "w-28 h-28",
    };

    const colorClasses = {
      default: "border-primary",
      muted: "border-muted-foreground",
      white: "border-white",
      sand: "border-sand-400",
      peach: "border-peach-300",
      sage: "border-sage-300",
    };

    return (
      <div ref={ref} className={cn("relative flex items-center justify-center", className)} {...props}>
        <div
          className={cn(
            sizeClasses[size || "md"],
            colorClasses[color || "default"],
            "rounded-full border-2 animate-ping opacity-20 absolute"
          )}
        />
        <div
          className={cn(
            sizeClasses[size || "md"],
            colorClasses[color || "default"],
            "rounded-full border-2 animate-pulse opacity-40 absolute"
          )}
          style={{ animationDelay: "0.3s", transform: "scale(0.7)" }}
        />
        <div
          className={cn(
            sizeClasses[size || "md"],
            colorClasses[color || "default"],
            "rounded-full border-2 opacity-60"
          )}
          style={{ transform: "scale(0.4)" }}
        />
      </div>
    );
  }
);
PulseRingSpinner.displayName = "PulseRingSpinner";

// ============================================
// PROGRESS BARS
// ============================================

const progressBarVariants = cva("relative overflow-hidden rounded-full", {
  variants: {
    variant: {
      default: "bg-sand-200",
      striped: "bg-sand-200",
      gradient: "bg-sand-200",
    },
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  animated?: boolean;
  color?: "default" | "success" | "warning" | "error" | "info" | "peach" | "sage";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { className, variant, size, value, max = 100, showValue = false, animated = true, color = "default", ...props },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colorClasses = {
      default: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-error",
      info: "bg-info",
      peach: "bg-peach-300",
      sage: "bg-sage-300",
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        <div className={cn(progressBarVariants({ variant, size }))}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              colorClasses[color],
              animated && "transition-all duration-500",
              variant === "striped" && "progress-striped",
              variant === "gradient" && "bg-gradient-to-r from-peach-300 to-sage-300"
            )}
            style={{ width: `${percentage}%` }}
          >
            {variant === "striped" && (
              <div
                className="h-full w-full animate-shimmer"
                style={{
                  backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)`,
                  backgroundSize: "1rem 1rem",
                }}
              />
            )}
          </div>
        </div>
        {showValue && (
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{Math.round(percentage)}%</span>
            <span>
              {value} / {max}
            </span>
          </div>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

// Circular Progress
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  color?: "default" | "success" | "warning" | "error" | "info";
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value, max = 100, size = 60, strokeWidth = 4, showValue = true, color = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
      default: "text-primary",
      success: "text-success",
      warning: "text-warning",
      error: "text-error",
      info: "text-info",
    };

    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)} {...props}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-sand-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn(colorClasses[color], "transition-all duration-500 ease-out")}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showValue && (
          <span className="absolute text-sm font-medium text-foreground">{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

// ============================================
// SKELETON COMPONENTS
// ============================================

const skeletonVariants = cva("animate-pulse bg-sand-200 rounded-lg", {
  variants: {
    variant: {
      default: "",
      circle: "rounded-full",
      text: "h-4 w-3/4",
      avatar: "w-10 h-10 rounded-full",
      title: "h-6 w-1/2",
      subtitle: "h-4 w-1/3",
      card: "h-32 w-full",
      button: "h-10 w-24 rounded-lg",
      input: "h-10 w-full rounded-lg",
      image: "h-40 w-full rounded-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(skeletonVariants({ variant }), className)} {...props} />
  )
);
Skeleton.displayName = "Skeleton";

// ============================================
// SHIMMER EFFECTS
// ============================================

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  duration?: number;
}

const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({ className, width, height, duration = 1.5, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-sand-200 rounded-lg", className)}
      style={{ width, height, ...style }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
          backgroundSize: "200% 100%",
          animation: `shimmer ${duration}s infinite`,
        }}
      />
    </div>
  )
);
Shimmer.displayName = "Shimmer";

// Shimmer Text
const ShimmerText = React.forwardRef<HTMLDivElement, { lines?: number; className?: string }>(
  ({ lines = 3, className }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  )
);
ShimmerText.displayName = "ShimmerText";

// ============================================
// LOADING OVERLAYS
// ============================================

interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  blur?: boolean;
  spinner?: React.ReactNode;
  text?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, isLoading, blur = true, spinner, text, children, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {children}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center",
            "bg-background/60",
            blur && "backdrop-blur-sm"
          )}
        >
          {spinner || <Spinner size="lg" />}
          {text && <p className="mt-3 text-sm text-muted-foreground">{text}</p>}
        </div>
      )}
    </div>
  )
);
LoadingOverlay.displayName = "LoadingOverlay";

// Full Page Loading
interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  subtext?: string;
  variant?: "spinner" | "dots" | "pulse" | "ring";
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, text = "Loading...", subtext, variant = "spinner", ...props }, ref) => {
    const SpinnerComponent = {
      spinner: Spinner,
      dots: DotsSpinner,
      pulse: PulseRingSpinner,
      ring: PulseRingSpinner,
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center",
          "bg-background/90 backdrop-blur-md",
          className
        )}
        {...props}
      >
        <SpinnerComponent size="xl" />
        <p className="mt-6 text-lg font-medium text-foreground">{text}</p>
        {subtext && <p className="mt-2 text-sm text-muted-foreground">{subtext}</p>}
      </div>
    );
  }
);
PageLoading.displayName = "PageLoading";

// ============================================
// CONTENT PLACEHOLDERS
// ============================================

// Card Placeholder
interface CardPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
  actions?: number;
}

const CardPlaceholder = React.forwardRef<HTMLDivElement, CardPlaceholderProps>(
  ({ className, hasImage = false, hasAvatar = true, lines = 2, actions = 0, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card border border-border rounded-xl p-5 space-y-4",
        className
      )}
      {...props}
    >
      {hasImage && <Shimmer className="h-40 w-full rounded-lg" />}
      <div className="flex items-center gap-3">
        {hasAvatar && <Skeleton variant="avatar" />}
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-4/5" : "w-full")} />
        ))}
      </div>
      {actions > 0 && (
        <div className="flex gap-2 pt-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} variant="button" />
          ))}
        </div>
      )}
    </div>
  )
);
CardPlaceholder.displayName = "CardPlaceholder";

// List Placeholder
interface ListPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
  hasAvatar?: boolean;
  hasAction?: boolean;
}

const ListPlaceholder = React.forwardRef<HTMLDivElement, ListPlaceholderProps>(
  ({ className, items = 5, hasAvatar = true, hasAction = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
        >
          {hasAvatar && <Skeleton variant="avatar" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {hasAction && <Skeleton className="h-8 w-20" />}
        </div>
      ))}
    </div>
  )
);
ListPlaceholder.displayName = "ListPlaceholder";

// Table Placeholder
interface TablePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
}

const TablePlaceholder = React.forwardRef<HTMLDivElement, TablePlaceholderProps>(
  ({ className, rows = 5, columns = 4, hasHeader = true, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {hasHeader && (
        <div className="flex gap-4 p-4 border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 flex-1" />
          ))}
        </div>
      )}
      <div className="space-y-1">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 ? "w-1/4" : colIndex === columns - 1 ? "w-1/6" : "w-1/5"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
);
TablePlaceholder.displayName = "TablePlaceholder";

// Form Placeholder
interface FormPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  fields?: number;
  hasSubmit?: boolean;
}

const FormPlaceholder = React.forwardRef<HTMLDivElement, FormPlaceholderProps>(
  ({ className, fields = 4, hasSubmit = true, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton variant="input" />
        </div>
      ))}
      {hasSubmit && (
        <div className="pt-2">
          <Skeleton variant="button" className="w-full h-11" />
        </div>
      )}
    </div>
  )
);
FormPlaceholder.displayName = "FormPlaceholder";

// ============================================
// SPECIALIZED SKELETON SCREENS
// ============================================

// Dashboard Skeleton
const DashboardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardPlaceholder key={i} hasImage={false} hasAvatar={false} lines={1} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48" />
          <CardPlaceholder hasImage lines={3} />
          <CardPlaceholder hasImage lines={2} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <ListPlaceholder items={4} hasAvatar={false} hasAction={false} />
        </div>
      </div>
    </div>
  )
);
DashboardSkeleton.displayName = "DashboardSkeleton";

// Document Skeleton
const DocumentSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("max-w-4xl mx-auto space-y-6", className)} {...props}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Shimmer className="h-64 w-full rounded-xl" />
        <ShimmerText lines={8} />
      </div>

      {/* Meta */}
      <div className="flex gap-2 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-full" />
        ))}
      </div>
    </div>
  )
);
DocumentSkeleton.displayName = "DocumentSkeleton";

// Flashcard Skeleton
const FlashcardSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <ProgressBar value={0} size="sm" />

      {/* Card */}
      <div className="aspect-[4/3] max-w-2xl mx-auto">
        <Shimmer className="h-full w-full rounded-2xl" />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
);
FlashcardSkeleton.displayName = "FlashcardSkeleton";

// Study Session Skeleton
const StudySessionSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Timer & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-16 h-16" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <CircularProgress value={0} size={60} />
      </div>

      {/* Content Area */}
      <Shimmer className="h-96 w-full rounded-2xl" />

      {/* Navigation */}
      <div className="flex justify-between">
        <Skeleton variant="button" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-3 h-3 rounded-full" />
          ))}
        </div>
        <Skeleton variant="button" />
      </div>
    </div>
  )
);
StudySessionSkeleton.displayName = "StudySessionSkeleton";

// Profile Skeleton
const ProfileSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {/* Header */}
      <div className="relative">
        <Shimmer className="h-48 w-full rounded-xl" />
        <div className="absolute -bottom-12 left-6">
          <Skeleton variant="circle" className="w-24 h-24 border-4 border-background" />
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-14 px-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton variant="button" />
        </div>
        <ShimmerText lines={3} />
      </div>

      {/* Stats */}
      <div className="flex gap-8 px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-1">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
);
ProfileSkeleton.displayName = "ProfileSkeleton";

// Sidebar Skeleton
const SidebarSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-64 h-full p-4 space-y-6", className)} {...props}>
      {/* Logo */}
      <Skeleton className="h-10 w-32" />

      {/* Navigation Groups */}
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 + groupIndex }).map((_, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-3 p-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ))}

      {/* User */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
);
SidebarSkeleton.displayName = "SidebarSkeleton";

// Chat Skeleton
const ChatSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-full flex flex-col", className)} {...props}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              i % 2 === 0 ? "flex-row" : "flex-row-reverse"
            )}
          >
            <Skeleton variant="avatar" className="w-8 h-8" />
            <div
              className={cn(
                "space-y-2 max-w-[70%]",
                i % 2 === 0 ? "items-start" : "items-end"
              )}
            >
              <Shimmer
                className={cn(
                  "h-16 rounded-2xl",
                  i % 2 === 0 ? "rounded-tl-sm" : "rounded-tr-sm"
                )}
              />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <Skeleton variant="input" className="h-12" />
      </div>
    </div>
  )
);
ChatSkeleton.displayName = "ChatSkeleton";

// ============================================
// LOADING STATE COMPONENTS
// ============================================

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "spinner" | "dots" | "pulse" | "skeleton" | "shimmer";
  text?: string;
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  count?: number;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, type = "spinner", text, spinnerSize = "md", count = 1, ...props }, ref) => {
    const SpinnerComponent = {
      spinner: Spinner,
      dots: DotsSpinner,
      pulse: PulseRingSpinner,
      skeleton: Skeleton,
      shimmer: Shimmer,
    }[type];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-4", className)}
        {...props}
      >
        {type === "spinner" || type === "dots" || type === "pulse" ? (
          <>
            <SpinnerComponent size={spinnerSize} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </>
        ) : (
          <div className="w-full space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <SpinnerComponent key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
      </div>
    );
  }
);
LoadingState.displayName = "LoadingState";

// Content Loader with delay
interface ContentLoaderProps {
  children: React.ReactNode;
  isLoading: boolean;
  fallback?: React.ReactNode;
  delay?: number;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
  children,
  isLoading,
  fallback,
  delay = 0,
}) => {
  const [showLoading, setShowLoading] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0 && isLoading) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    }
    setShowLoading(isLoading);
  }, [isLoading, delay]);

  if (showLoading && isLoading) {
    return fallback || <Spinner size="lg" />;
  }

  return <>{children}</>;
};

// ============================================
// EXPORTS
// ============================================

export {
  // Spinners
  Spinner,
  DotsSpinner,
  PulseRingSpinner,
  spinnerVariants,

  // Progress
  ProgressBar,
  CircularProgress,
  progressBarVariants,

  // Skeletons
  Skeleton,
  skeletonVariants,

  // Shimmer
  Shimmer,
  ShimmerText,

  // Overlays
  LoadingOverlay,
  PageLoading,

  // Placeholders
  CardPlaceholder,
  ListPlaceholder,
  TablePlaceholder,
  FormPlaceholder,

  // Specialized Skeletons
  DashboardSkeleton,
  DocumentSkeleton,
  FlashcardSkeleton,
  StudySessionSkeleton,
  ProfileSkeleton,
  SidebarSkeleton,
  ChatSkeleton,

  // Loading States
  LoadingState,
  ContentLoader,
};

export type {
  SpinnerProps,
  ProgressBarProps,
  CircularProgressProps,
  SkeletonProps,
  ShimmerProps,
  LoadingOverlayProps,
  PageLoadingProps,
  CardPlaceholderProps,
  ListPlaceholderProps,
  TablePlaceholderProps,
  FormPlaceholderProps,
  LoadingStateProps,
  ContentLoaderProps,
};
