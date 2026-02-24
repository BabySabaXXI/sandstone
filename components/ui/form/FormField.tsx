"use client";

import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the field */
  helperText?: string;
  /** Whether the field is in a loading state */
  isLoading?: boolean;
  /** Custom label element */
  labelElement?: React.ReactNode;
  /** Whether to hide the label visually (still accessible to screen readers) */
  hideLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the field has been touched (for validation display) */
  touched?: boolean;
}

// ============================================================================
// Form Field Component
// ============================================================================

/**
 * FormField - A wrapper component for form inputs
 * 
 * Features:
 * - Label with required indicator
 * - Error message display
 * - Helper text support
 * - Loading state
 * - Accessibility attributes
 * - Size variants
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      required = false,
      error,
      helperText,
      isLoading = false,
      labelElement,
      hideLabel = false,
      size = "md",
      touched = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const uniqueId = useId();
    const errorId = `${uniqueId}-error`;
    const helperId = `${uniqueId}-helper`;
    const labelId = `${uniqueId}-label`;

    const showError = error && touched;

    // Size variants for spacing
    const sizeClasses = {
      sm: "space-y-1",
      md: "space-y-1.5",
      lg: "space-y-2",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", sizeClasses[size], className)}
        {...props}
      >
        {/* Label */}
        {(label || labelElement) && (
          <label
            id={labelId}
            className={cn(
              "font-medium text-foreground transition-colors",
              hideLabel && "sr-only",
              size === "sm" && "text-xs",
              size === "md" && "text-sm",
              size === "lg" && "text-base",
              showError && "text-destructive",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {labelElement || (
              <>
                {label}
                {required && (
                  <span
                    className="text-destructive ml-0.5"
                    aria-hidden="true"
                  >
                    *
                  </span>
                )}
                {required && (
                  <span className="sr-only">(required)</span>
                )}
              </>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement, {
                "aria-invalid": showError ? "true" : "false",
                "aria-describedby": cn(
                  showError && errorId,
                  helperText && helperId
                ),
                "aria-labelledby": label ? labelId : undefined,
                "aria-required": required || undefined,
              });
            }
            return child;
          })}
        </div>

        {/* Error Message */}
        {showError && (
          <p
            id={errorId}
            className={cn(
              "text-destructive flex items-center gap-1",
              size === "sm" && "text-xs",
              size === "md" && "text-xs",
              size === "lg" && "text-sm"
            )}
            role="alert"
            aria-live="assertive"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 flex-shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !showError && (
          <p
            id={helperId}
            className={cn(
              "text-muted-foreground",
              size === "sm" && "text-xs",
              size === "md" && "text-xs",
              size === "lg" && "text-sm"
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
