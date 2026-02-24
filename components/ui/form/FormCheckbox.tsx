"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    Omit<FormFieldProps, "children" | "size" | "label"> {
  /** Checkbox size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Label for the checkbox (can be React node for rich content) */
  label: React.ReactNode;
  /** Description text displayed below the label */
  description?: string;
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Position of the checkbox relative to the label */
  checkboxPosition?: "left" | "right";
}

// ============================================================================
// Form Checkbox Component
// ============================================================================

/**
 * FormCheckbox - A comprehensive checkbox component with built-in form field features
 * 
 * Features:
 * - Label and description support
 * - Indeterminate state
 * - Size variants
 * - Loading state
 * - Custom positioning
 * - Full accessibility support
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      // FormField props
      required,
      error,
      helperText,
      touched,
      
      // Checkbox props
      className,
      inputSize = "md",
      label,
      description,
      indeterminate = false,
      isLoading = false,
      disabled,
      checked,
      defaultChecked,
      checkboxPosition = "left",
      onChange,
      onFocus,
      onBlur,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const uniqueId = React.useId();
    const checkboxId = id || `${uniqueId}-checkbox`;
    const descriptionId = `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Set indeterminate state via ref
    const setIndeterminate = (node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = indeterminate;
      }
      // Forward ref
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Size variants
    const sizeClasses = {
      sm: {
        checkbox: "w-4 h-4",
        label: "text-sm",
        description: "text-xs",
      },
      md: {
        checkbox: "w-5 h-5",
        label: "text-base",
        description: "text-sm",
      },
      lg: {
        checkbox: "w-6 h-6",
        label: "text-lg",
        description: "text-base",
      },
    };

    const showError = error && touched;

    const CheckboxContent = (
      <>
        {/* Custom Checkbox */}
        <div
          className={cn(
            // Base styles
            "relative flex-shrink-0 rounded border-2 transition-all duration-200",
            sizeClasses[inputSize].checkbox,
            
            // Unchecked styles
            !checked && !defaultChecked && "border-input bg-background",
            
            // Checked styles
            (checked || defaultChecked) && "border-primary bg-primary",
            
            // Indeterminate styles
            indeterminate && "border-primary bg-primary",
            
            // Focus styles
            isFocused && "ring-2 ring-ring ring-offset-2",
            
            // Error styles
            showError && "border-destructive",
            
            // Disabled styles
            (disabled || isLoading) && "opacity-50 cursor-not-allowed"
          )}
          aria-hidden="true"
        >
          {/* Checkmark */}
          {(checked || defaultChecked) && !indeterminate && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "absolute inset-0 m-auto text-primary-foreground",
                inputSize === "sm" && "w-2.5 h-2.5",
                inputSize === "md" && "w-3 h-3",
                inputSize === "lg" && "w-4 h-4"
              )}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          
          {/* Indeterminate mark */}
          {indeterminate && (
            <div
              className={cn(
                "absolute inset-0 m-auto bg-primary-foreground rounded-sm",
                inputSize === "sm" && "w-2 h-0.5",
                inputSize === "md" && "w-2.5 h-0.5",
                inputSize === "lg" && "w-3 h-1"
              )}
            />
          )}
        </div>

        {/* Label Content */}
        <div className="flex flex-col">
          <span
            className={cn(
              "font-medium text-foreground transition-colors",
              sizeClasses[inputSize].label,
              showError && "text-destructive",
              (disabled || isLoading) && "opacity-50"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-0.5" aria-hidden="true">
                *
              </span>
            )}
            {required && <span className="sr-only">(required)</span>}
          </span>
          
          {description && (
            <span
              id={descriptionId}
              className={cn(
                "text-muted-foreground",
                sizeClasses[inputSize].description,
                (disabled || isLoading) && "opacity-50"
              )}
            >
              {description}
            </span>
          )}
        </div>
      </>
    );

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <label
          className={cn(
            "flex items-start gap-3 cursor-pointer",
            checkboxPosition === "right" && "flex-row-reverse justify-between",
            (disabled || isLoading) && "cursor-not-allowed"
          )}
        >
          {/* Hidden Native Checkbox */}
          <input
            ref={setIndeterminate}
            type="checkbox"
            id={checkboxId}
            disabled={disabled || isLoading}
            checked={checked}
            defaultChecked={defaultChecked}
            className="sr-only"
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={showError ? "true" : "false"}
            aria-describedby={cn(
              description && descriptionId,
              showError && errorId
            )}
            {...props}
          />

          {CheckboxContent}
        </label>

        {/* Helper Text */}
        {helperText && !showError && (
          <p
            className={cn(
              "text-muted-foreground ml-8",
              inputSize === "sm" && "text-xs",
              inputSize === "md" && "text-xs",
              inputSize === "lg" && "text-sm"
            )}
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {showError && (
          <p
            id={errorId}
            className={cn(
              "text-destructive flex items-center gap-1 ml-8",
              inputSize === "sm" && "text-xs",
              inputSize === "md" && "text-xs",
              inputSize === "lg" && "text-sm"
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
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export default FormCheckbox;
