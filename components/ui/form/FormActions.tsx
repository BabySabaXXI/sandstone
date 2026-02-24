"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Primary submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether to show cancel button */
  showCancel?: boolean;
  /** Whether the form is submitting */
  isSubmitting?: boolean;
  /** Whether the form is dirty */
  isDirty?: boolean;
  /** Whether to disable submit when form is not dirty */
  disableSubmitOnPristine?: boolean;
  /** Custom submit button element */
  submitButton?: React.ReactNode;
  /** Custom cancel button element */
  cancelButton?: React.ReactNode;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Alignment of buttons */
  align?: "left" | "center" | "right" | "between";
  /** Spacing between buttons */
  gap?: "sm" | "md" | "lg";
  /** Whether to show a reset button */
  showReset?: boolean;
  /** Reset button text */
  resetText?: string;
  /** Callback when reset is clicked */
  onReset?: () => void;
  /** Submit button variant */
  submitVariant?: "primary" | "secondary" | "outline" | "ghost";
  /** Cancel button variant */
  cancelVariant?: "primary" | "secondary" | "outline" | "ghost";
}

// ============================================================================
// Form Actions Component
// ============================================================================

/**
 * FormActions - A component for form action buttons (submit, cancel, reset)
 * 
 * Features:
 * - Submit button with loading state
 * - Optional cancel button
 * - Optional reset button
 * - Configurable alignment
 * - Custom button support
 * - Full accessibility support
 */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  (
    {
      submitText = "Submit",
      cancelText = "Cancel",
      showCancel = false,
      isSubmitting = false,
      isDirty = true,
      disableSubmitOnPristine = false,
      submitButton,
      cancelButton,
      onCancel,
      align = "right",
      gap = "md",
      showReset = false,
      resetText = "Reset",
      onReset,
      submitVariant = "primary",
      cancelVariant = "outline",
      className,
      ...props
    },
    ref
  ) => {
    // Alignment classes
    const alignClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      between: "justify-between",
    };

    // Gap classes
    const gapClasses = {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    };

    // Button variant classes
    const buttonVariants = {
      primary: cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "h-10 px-4 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-colors"
      ),
      secondary: cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "h-10 px-4 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-colors"
      ),
      outline: cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "h-10 px-4 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-colors"
      ),
      ghost: cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "hover:bg-accent hover:text-accent-foreground",
        "h-10 px-4 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "transition-colors"
      ),
    };

    const isSubmitDisabled = isSubmitting || (disableSubmitOnPristine && !isDirty);

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-wrap items-center",
          alignClasses[align],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {/* Cancel Button */}
        {showCancel && (
          cancelButton || (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={buttonVariants[cancelVariant]}
            >
              {cancelText}
            </button>
          )
        )}

        {/* Reset Button */}
        {showReset && (
          <button
            type="reset"
            onClick={onReset}
            disabled={isSubmitting}
            className={buttonVariants.outline}
          >
            {resetText}
          </button>
        )}

        {/* Submit Button */}
        {submitButton || (
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={buttonVariants[submitVariant]}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-2 animate-spin"
                  aria-hidden="true"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              submitText
            )}
          </button>
        )}
      </div>
    );
  }
);

FormActions.displayName = "FormActions";

export default FormActions;
