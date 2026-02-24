"use client";

/**
 * Theme-Aware Components
 * 
 * These components automatically adapt to the current theme and provide
 * consistent styling across light and dark modes.
 */

import { cn } from "@/lib/utils";
import { useIsDarkMode } from "./theme-provider";

// =============================================================================
// TYPES
// =============================================================================

interface ThemeAwareCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "ghost";
  hover?: boolean;
}

interface ThemeAwareTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "secondary" | "danger";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface ThemeAwareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

interface ThemeAwareInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface ThemeAwareDividerProps {
  className?: string;
  vertical?: boolean;
}

// =============================================================================
// THEME-AWARE CARD
// =============================================================================

export function ThemeAwareCard({
  children,
  className,
  variant = "default",
  hover = false,
}: ThemeAwareCardProps) {
  const isDark = useIsDarkMode();

  const variantStyles = {
    default: "bg-card border-border",
    elevated: "bg-card border-border shadow-soft-md",
    outlined: "bg-transparent border-border",
    ghost: "bg-transparent border-transparent",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-5 border transition-all duration-200",
        variantStyles[variant],
        hover && "hover:shadow-soft-md hover:border-sand-400 dark:hover:border-sand-600",
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// THEME-AWARE TEXT
// =============================================================================

export function ThemeAwareText({
  children,
  className,
  variant = "default",
  size = "base",
  as: Component = "p",
}: ThemeAwareTextProps) {
  const variantStyles = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
    secondary: "text-secondary-foreground",
    danger: "text-destructive",
  };

  const sizeStyles = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <Component
      className={cn(variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </Component>
  );
}

// =============================================================================
// THEME-AWARE BUTTON
// =============================================================================

export function ThemeAwareButton({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ThemeAwareButtonProps) {
  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-sand-200 dark:hover:bg-sand-200/10",
    ghost:
      "bg-transparent text-sand-700 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-200/10",
    danger:
      "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-[10px]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

// =============================================================================
// THEME-AWARE INPUT
// =============================================================================

export function ThemeAwareInput({
  className,
  label,
  error,
  helperText,
  id,
  ...props
}: ThemeAwareInputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-sand-700 dark:text-sand-400"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-3 text-sm rounded-[10px]",
          "bg-sand-100 dark:bg-sand-200/10",
          "text-sand-900 dark:text-sand-100",
          "border border-sand-300 dark:border-sand-300/30",
          "placeholder:text-sand-500",
          "transition-all duration-200 ease-out",
          "focus:border-peach-300 dark:focus:border-peach-300/50",
          "focus:ring-2 focus:ring-peach-100 dark:focus:ring-peach-100/20",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error &&
            "border-rose-200 dark:border-rose-300/50 bg-rose-100 dark:bg-rose-200/10",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-200 dark:text-rose-300 flex items-center gap-1">
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-sand-500">{helperText}</p>
      )}
    </div>
  );
}

// =============================================================================
// THEME-AWARE DIVIDER
// =============================================================================

export function ThemeAwareDivider({
  className,
  vertical = false,
}: ThemeAwareDividerProps) {
  return (
    <div
      className={cn(
        "bg-border",
        vertical ? "w-px h-full" : "h-px w-full",
        className
      )}
    />
  );
}

// =============================================================================
// THEME-AWARE BADGE
// =============================================================================

interface ThemeAwareBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
}

export function ThemeAwareBadge({
  children,
  className,
  variant = "default",
  size = "md",
}: ThemeAwareBadgeProps) {
  const variantStyles = {
    default:
      "bg-sand-200 dark:bg-sand-200/20 text-sand-700 dark:text-sand-400",
    primary:
      "bg-peach-100 dark:bg-peach-200/20 text-sand-800 dark:text-peach-300",
    success:
      "bg-sage-100 dark:bg-sage-200/20 text-sage-300 dark:text-sage-300",
    warning:
      "bg-amber-100 dark:bg-amber-200/20 text-amber-200 dark:text-amber-300",
    error: "bg-rose-100 dark:bg-rose-200/20 text-rose-200 dark:text-rose-300",
    info: "bg-blue-100 dark:bg-blue-200/20 text-blue-300 dark:text-blue-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// =============================================================================
// THEME-AWARE SKELETON
// =============================================================================

interface ThemeAwareSkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

export function ThemeAwareSkeleton({
  className,
  variant = "text",
}: ThemeAwareSkeletonProps) {
  const variantStyles = {
    text: "h-4 w-full rounded",
    circle: "rounded-full",
    rect: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-sand-200 dark:bg-sand-200/20",
        variantStyles[variant],
        className
      )}
    />
  );
}

// =============================================================================
// THEME-AWARE ICON BUTTON
// =============================================================================

interface ThemeAwareIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "ghost";
}

export function ThemeAwareIconButton({
  children,
  className,
  variant = "default",
  ...props
}: ThemeAwareIconButtonProps) {
  const variantStyles = {
    default:
      "bg-sand-100 dark:bg-sand-200/10 text-sand-700 dark:text-sand-400 hover:bg-sand-200 dark:hover:bg-sand-200/20",
    ghost:
      "bg-transparent text-sand-600 dark:text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-200/10 hover:text-sand-800 dark:hover:text-sand-300",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-[10px]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.96]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Export all theme-aware components
export default {
  Card: ThemeAwareCard,
  Text: ThemeAwareText,
  Button: ThemeAwareButton,
  Input: ThemeAwareInput,
  Divider: ThemeAwareDivider,
  Badge: ThemeAwareBadge,
  Skeleton: ThemeAwareSkeleton,
  IconButton: ThemeAwareIconButton,
};
