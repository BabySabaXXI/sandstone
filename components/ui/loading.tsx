"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Loading Components
 * 
 * A collection of loading indicators for different use cases.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Spinner />
 * <Skeleton className="h-20 w-full" />
 * <Shimmer className="h-20 w-full" />
 * <LoadingState type="spinner" />
 */

// Spinner component
const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
    },
    variant: {
      default: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className={cn(spinnerVariants({ size, variant }))} />
    </div>
  )
);
Spinner.displayName = "Spinner";

// Skeleton component
const skeletonVariants = cva(
  "animate-pulse bg-sand-200 rounded-lg",
  {
    variants: {
      variant: {
        default: "",
        circle: "rounded-full",
        text: "h-4 w-3/4",
        avatar: "w-10 h-10 rounded-full",
        title: "h-6 w-1/2",
        card: "h-32 w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

// Shimmer component - Gradient loading effect
interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  ({ className, width, height, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-sand-200 rounded-lg",
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
    </div>
  )
);
Shimmer.displayName = "Shimmer";

// Loading State - Full loading component with optional text
interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "spinner" | "skeleton" | "shimmer";
  text?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  count?: number;
}

const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    { className, type = "spinner", text, spinnerSize = "md", count = 1, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-4",
          className
        )}
        {...props}
      >
        {type === "spinner" && (
          <>
            <Spinner size={spinnerSize} />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
          </>
        )}
        {type === "skeleton" && (
          <div className="w-full space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
        {type === "shimmer" && (
          <div className="w-full space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <Shimmer key={i} className="h-16 w-full" />
            ))}
          </div>
        )}
      </div>
    );
  }
);
LoadingState.displayName = "LoadingState";

// Page Loading - Full page loading overlay
interface PageLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

const PageLoading = React.forwardRef<HTMLDivElement, PageLoadingProps>(
  ({ className, text = "Loading...", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Spinner size="xl" />
      <p className="mt-4 text-lg font-medium text-foreground">{text}</p>
    </div>
  )
);
PageLoading.displayName = "PageLoading";

// Skeleton Card - Pre-built skeleton for cards
interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hasImage?: boolean;
  lines?: number;
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, hasImage = false, lines = 2, ...props }, ref) => (
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
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
);
SkeletonCard.displayName = "SkeletonCard";

// Skeleton List - Pre-built skeleton for lists
interface SkeletonListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: number;
  hasAvatar?: boolean;
}

const SkeletonList = React.forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ className, items = 5, hasAvatar = true, ...props }, ref) => (
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
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
);
SkeletonList.displayName = "SkeletonList";

export {
  Spinner,
  Skeleton,
  Shimmer,
  LoadingState,
  PageLoading,
  SkeletonCard,
  SkeletonList,
  spinnerVariants,
  skeletonVariants,
};
