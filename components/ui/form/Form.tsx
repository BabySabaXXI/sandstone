"use client";

import React, { forwardRef, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { FormErrorSummary, FormErrorSummaryProps } from "./FormErrorSummary";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form errors object */
  errors?: Record<string, string>;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether to show error summary */
  showErrorSummary?: boolean;
  /** Error summary title */
  errorSummaryTitle?: string;
  /** Custom error summary props */
  errorSummaryProps?: Omit<FormErrorSummaryProps, "errors">;
  /** Spacing between form fields */
  fieldGap?: "none" | "sm" | "md" | "lg";
  /** Whether to disable all fields during submission */
  disableDuringSubmit?: boolean;
  /** Callback when error is clicked in summary */
  onErrorClick?: (fieldName: string) => void;
  /** Map of field names to display labels for error summary */
  fieldLabels?: Record<string, string>;
  /** Custom class for form fields container */
  fieldsClassName?: string;
  /** Whether the form has been touched */
  touched?: boolean;
  /** Loading overlay content */
  loadingOverlay?: React.ReactNode;
}

// ============================================================================
// Form Component
// ============================================================================

/**
 * Form - A comprehensive form wrapper component
 * 
 * Features:
 * - Error summary display
 * - Loading state overlay
 * - Consistent field spacing
 * - Accessible form structure
 * - Focus management on error click
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      children,
      errors = {},
      isSubmitting = false,
      showErrorSummary = true,
      errorSummaryTitle = "Please correct the following errors:",
      errorSummaryProps,
      fieldGap = "md",
      disableDuringSubmit = true,
      onErrorClick,
      fieldLabels = {},
      fieldsClassName,
      touched = false,
      loadingOverlay,
      onSubmit,
      className,
      ...props
    },
    ref
  ) => {
    // Handle form submission
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      if (isSubmitting && disableDuringSubmit) {
        e.preventDefault();
        return;
      }
      onSubmit?.(e);
    };

    // Field gap classes
    const gapClasses = {
      none: "",
      sm: "space-y-3",
      md: "space-y-4",
      lg: "space-y-6",
    };

    const hasErrors = Object.keys(errors).length > 0;
    const showErrors = showErrorSummary && hasErrors && touched;

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("relative", className)}
        aria-busy={isSubmitting}
        {...props}
      >
        {/* Loading Overlay */}
        {isSubmitting && disableDuringSubmit && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-lg">
            {loadingOverlay || (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Submitting...</span>
              </div>
            )}
          </div>
        )}

        {/* Error Summary */}
        {showErrors && (
          <div className="mb-6">
            <FormErrorSummary
              errors={errors}
              title={errorSummaryTitle}
              onErrorClick={onErrorClick}
              fieldLabels={fieldLabels}
              {...errorSummaryProps}
            />
          </div>
        )}

        {/* Form Fields */}
        <div className={cn(gapClasses[fieldGap], fieldsClassName)}>
          {children}
        </div>
      </form>
    );
  }
);

Form.displayName = "Form";

export default Form;
