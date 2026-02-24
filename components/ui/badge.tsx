"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge Component
 * 
 * A versatile badge component for status indicators and labels.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Badge>Default</Badge>
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="primary" size="lg">New</Badge>
 * <ScoreBadge score={85} />
 */

// Badge variants
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-sand-200 text-sand-700",
        primary: "bg-peach-100 text-sand-800",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        success: "bg-sage-100 text-sage-300",
        warning: "bg-amber-100 text-amber-200",
        error: "bg-rose-100 text-rose-200",
        info: "bg-blue-100 text-blue-300",
        outline: "border border-border text-foreground bg-transparent",
        ghost: "text-sand-600 hover:text-sand-800",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] rounded-full",
        md: "px-2.5 py-1 text-xs rounded-full",
        lg: "px-3 py-1.5 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// Dot indicator variants
const dotVariants = cva("w-1.5 h-1.5 rounded-full", {
  variants: {
    variant: {
      default: "bg-sand-500",
      primary: "bg-peach-300",
      success: "bg-sage-200",
      warning: "bg-amber-200",
      error: "bg-rose-200",
      info: "bg-blue-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && <span className={cn(dotVariants({ variant }))} />}
      {children}
    </div>
  )
);
Badge.displayName = "Badge";

// Score Badge - Specialized component for displaying scores
interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  showMax?: boolean;
  className?: string;
}

const ScoreBadge = React.forwardRef<HTMLDivElement, ScoreBadgeProps>(
  ({ score, maxScore = 100, size = "md", showMax = false, className }, ref) => {
    // Determine color based on score percentage
    const percentage = (score / maxScore) * 100;
    let colorClass = "";
    let bgClass = "";

    if (percentage >= 80) {
      colorClass = "text-white";
      bgClass = "bg-sage-200";
    } else if (percentage >= 60) {
      colorClass = "text-sand-900";
      bgClass = "bg-amber-200";
    } else {
      colorClass = "text-white";
      bgClass = "bg-rose-200";
    }

    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-lg",
      lg: "w-16 h-16 text-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-bold",
          sizeClasses[size],
          bgClass,
          colorClass,
          className
        )}
      >
        {Math.round(score)}
        {showMax && <span className="text-xs opacity-70 ml-0.5">/{maxScore}</span>}
      </div>
    );
  }
);
ScoreBadge.displayName = "ScoreBadge";

// Status Badge - Specialized component for status indicators
interface StatusBadgeProps {
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  pending: { variant: "default" as const, label: "Pending" },
  processing: { variant: "info" as const, label: "Processing" },
  completed: { variant: "success" as const, label: "Completed" },
  failed: { variant: "error" as const, label: "Failed" },
  cancelled: { variant: "warning" as const, label: "Cancelled" },
};

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, children, size = "md" }, ref) => {
    const config = statusConfig[status];

    return (
      <Badge ref={ref} variant={config.variant} size={size} dot>
        {children || config.label}
      </Badge>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

// Count Badge - Specialized component for notification counts
interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max = 99, className }, ref) => {
    if (count <= 0) return null;

    const displayCount = count > max ? `${max}+` : count;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5",
          "bg-peach-300 text-white text-[10px] font-bold rounded-full",
          className
        )}
      >
        {displayCount}
      </div>
    );
  }
);
CountBadge.displayName = "CountBadge";

export { Badge, ScoreBadge, StatusBadge, CountBadge, badgeVariants };
