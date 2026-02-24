"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormErrorSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Object containing field errors */
  errors: Record<string, string>;
  /** Optional title for the error summary */
  title?: string;
  /** Whether to show the error count */
  showCount?: boolean;
  /** Callback when an error is clicked (for focus management) */
  onErrorClick?: (fieldName: string) => void;
  /** Map of field names to display labels */
  fieldLabels?: Record<string, string>;
  /** Variant style */
  variant?: "default" | "compact" | "alert";
}

// ============================================================================
// Form Error Summary Component
// ============================================================================

/**
 * FormErrorSummary - Displays a summary of all form validation errors
 * 
 * Features:
 * - Lists all errors with field names
 * - Click to focus on error field
 * - Accessible alert role
 * - Customizable styling
 */
export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  (
    {
      errors,
      title = "Please correct the following errors:",
      showCount = true,
      onErrorClick,
      fieldLabels = {},
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    const errorEntries = Object.entries(errors).filter(([key]) => key !== "_form");
    const formError = errors._form;

    if (errorEntries.length === 0 && !formError) {
      return null;
    }

    const variantClasses = {
      default: "border-destructive/50 bg-destructive/5",
      compact: "border-destructive/30 bg-destructive/5 py-2 px-3",
      alert: "border-destructive bg-destructive/10",
    };

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        aria-atomic="false"
        className={cn(
          "rounded-lg border p-4",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-destructive flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3 className="text-sm font-semibold text-destructive">
            {title}
            {showCount && errorEntries.length > 0 && (
              <span className="ml-1">({errorEntries.length})</span>
            )}
          </h3>
        </div>

        {/* Form-level error */}
        {formError && (
          <p className="text-sm text-destructive mb-2">{formError}</p>
        )}

        {/* Error List */}
        {errorEntries.length > 0 && (
          <ul className="space-y-1.5">
            {errorEntries.map(([field, message]) => {
              const displayLabel = fieldLabels[field] || field;
              const clickable = !!onErrorClick;

              return (
                <li
                  key={field}
                  className={cn(
                    "text-sm",
                    clickable && "cursor-pointer hover:underline"
                  )}
                >
                  {clickable ? (
                    <button
                      type="button"
                      onClick={() => onErrorClick(field)}
                      className="text-left text-destructive hover:text-destructive/80 flex items-start gap-2"
                    >
                      <span className="text-destructive/70">•</span>
                      <span>
                        <span className="font-medium">{displayLabel}:</span>{" "}
                        {message}
                      </span>
                    </button>
                  ) : (
                    <span className="text-destructive flex items-start gap-2">
                      <span className="text-destructive/70">•</span>
                      <span>
                        <span className="font-medium">{displayLabel}:</span>{" "}
                        {message}
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);

FormErrorSummary.displayName = "FormErrorSummary";

export default FormErrorSummary;
