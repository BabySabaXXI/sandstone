"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { FileQuestion, FolderOpen, Search, Inbox, BookOpen, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Empty State Component
 * 
 * A component for displaying empty states with consistent styling.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <EmptyState
 *   icon={FileQuestion}
 *   title="No essays yet"
 *   description="Start by grading your first essay"
 *   action={{ label: "Grade Essay", onClick: () => {} }}
 * />
 */

// Predefined icons for common empty states
const emptyStateIcons = {
  default: FileQuestion,
  folder: FolderOpen,
  search: Search,
  inbox: Inbox,
  book: BookOpen,
  graduation: GraduationCap,
};

type EmptyStateIconType = keyof typeof emptyStateIcons;

// Empty state variants
const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center py-16 px-4",
  {
    variants: {
      size: {
        sm: "py-8",
        md: "py-16",
        lg: "py-24",
      },
      variant: {
        default: "",
        card: "bg-card border border-border rounded-xl",
        minimal: "py-8",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// Icon container variants
const iconContainerVariants = cva(
  "rounded-full flex items-center justify-center mb-4",
  {
    variants: {
      size: {
        sm: "w-10 h-10",
        md: "w-16 h-16",
        lg: "w-20 h-20",
      },
      variant: {
        default: "bg-sand-200",
        muted: "bg-sand-100",
        primary: "bg-peach-100",
        subtle: "bg-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

// Icon size mapping
const iconSizes = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ComponentType<{ className?: string }> | EmptyStateIconType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  iconVariant?: VariantProps<typeof iconContainerVariants>["variant"];
  iconSize?: VariantProps<typeof iconContainerVariants>["size"];
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      size,
      variant,
      icon: IconProp = "default",
      title,
      description,
      action,
      secondaryAction,
      iconVariant = "default",
      iconSize = "md",
      ...props
    },
    ref
  ) => {
    // Resolve icon
    const Icon =
      typeof IconProp === "string"
        ? emptyStateIcons[IconProp] || emptyStateIcons.default
        : IconProp;

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ size, variant }), className)}
        {...props}
      >
        {/* Icon */}
        <div className={cn(iconContainerVariants({ size: iconSize, variant: iconVariant }))}>
          <Icon className={cn(iconSizes[iconSize || "md"], "text-sand-500")} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            {action && (
              <Button
                variant={action.variant || "primary"}
                onClick={action.onClick}
                leftIcon={action.icon}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

// Specialized empty state components

// No Results Empty State
interface NoResultsProps extends Omit<EmptyStateProps, "icon" | "title"> {
  searchTerm?: string;
  onClearSearch?: () => void;
}

const NoResults = React.forwardRef<HTMLDivElement, NoResultsProps>(
  ({ searchTerm, onClearSearch, ...props }, ref) => (
    <EmptyState
      ref={ref}
      icon="search"
      title={searchTerm ? `No results for "${searchTerm}"` : "No results found"}
      description="Try adjusting your search or filters to find what you're looking for."
      action={
        onClearSearch
          ? {
              label: "Clear search",
              onClick: onClearSearch,
              variant: "secondary",
            }
          : undefined
      }
      {...props}
    />
  )
);
NoResults.displayName = "NoResults";

// No Data Empty State
interface NoDataProps extends Omit<EmptyStateProps, "icon" | "title"> {
  itemName?: string;
  createLabel?: string;
  onCreate?: () => void;
}

const NoData = React.forwardRef<HTMLDivElement, NoDataProps>(
  ({ itemName = "items", createLabel, onCreate, ...props }, ref) => (
    <EmptyState
      ref={ref}
      icon="folder"
      title={`No ${itemName} yet`}
      description={`Get started by creating your first ${itemName.slice(0, -1)}.`}
      action={
        onCreate
          ? {
              label: createLabel || `Create ${itemName.slice(0, -1)}`,
              onClick: onCreate,
              variant: "primary",
            }
          : undefined
      }
      {...props}
    />
  )
);
NoData.displayName = "NoData";

// Coming Soon Empty State
interface ComingSoonProps extends Omit<EmptyStateProps, "icon" | "title"> {
  featureName?: string;
}

const ComingSoon = React.forwardRef<HTMLDivElement, ComingSoonProps>(
  ({ featureName = "This feature", ...props }, ref) => (
    <EmptyState
      ref={ref}
      icon="book"
      title="Coming Soon"
      description={`${featureName} is currently under development. Check back later!`}
      iconVariant="primary"
      {...props}
    />
  )
);
ComingSoon.displayName = "ComingSoon";

// Error Empty State
interface ErrorStateProps extends Omit<EmptyStateProps, "icon" | "title"> {
  error?: string;
  onRetry?: () => void;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ error, onRetry, ...props }, ref) => (
    <EmptyState
      ref={ref}
      icon={({ className }) => (
        <svg
          className={className}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )}
      title="Something went wrong"
      description={error || "An error occurred while loading the data. Please try again."}
      action={
        onRetry
          ? {
              label: "Try again",
              onClick: onRetry,
              variant: "primary",
            }
          : undefined
      }
      iconVariant="muted"
      {...props}
    />
  )
);
ErrorState.displayName = "ErrorState";

export {
  EmptyState,
  NoResults,
  NoData,
  ComingSoon,
  ErrorState,
  emptyStateVariants,
  emptyStateIcons,
};
