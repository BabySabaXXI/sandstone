"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Switch size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Label for the switch */
  label?: React.ReactNode;
  /** Description text displayed below the label */
  description?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Whether the field has been touched */
  touched?: boolean;
  /** Position of the switch relative to the label */
  switchPosition?: "left" | "right";
  /** Custom class for the switch track */
  trackClassName?: string;
  /** Custom class for the switch thumb */
  thumbClassName?: string;
}

// ============================================================================
// Form Switch Component
// ============================================================================

/**
 * FormSwitch - A toggle switch component with built-in form features
 * 
 * Features:
 * - Label and description support
 * - Size variants
 * - Loading state
 * - Error display
 * - Custom positioning
 * - Full accessibility support
 */
export const FormSwitch = forwardRef<HTMLInputElement, FormSwitchProps>(
  (
    {
      className,
      inputSize = "md",
      label,
      description,
      isLoading = false,
      error,
      touched,
      disabled,
      checked,
      defaultChecked,
      switchPosition = "left",
      trackClassName,
      thumbClassName,
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
    const switchId = id || `${uniqueId}-switch`;
    const descriptionId = `${switchId}-description`;
    const errorId = `${switchId}-error`;

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

    // Size variants
    const sizeClasses = {
      sm: {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        thumbOffset: "translate-x-4",
        label: "text-sm",
        description: "text-xs",
      },
      md: {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        thumbOffset: "translate-x-5",
        label: "text-base",
        description: "text-sm",
      },
      lg: {
        track: "w-14 h-7",
        thumb: "w-6 h-6",
        thumbOffset: "translate-x-7",
        label: "text-lg",
        description: "text-base",
      },
    };

    const isChecked = checked || defaultChecked;
    const showError = error && touched;
    const isDisabled = disabled || isLoading;

    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <label
          className={cn(
            "flex items-center gap-3 cursor-pointer",
            switchPosition === "right" && "flex-row-reverse justify-between",
            isDisabled && "cursor-not-allowed"
          )}
        >
          {/* Switch Container */}
          <div className="relative flex-shrink-0">
            {/* Hidden Native Checkbox */}
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              disabled={isDisabled}
              checked={checked}
              defaultChecked={defaultChecked}
              className="sr-only"
              onChange={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-checked={isChecked}
              aria-invalid={showError ? "true" : "false"}
              aria-describedby={cn(
                description && descriptionId,
                showError && errorId
              )}
              {...props}
            />

            {/* Custom Switch Track */}
            <div
              className={cn(
                // Base styles
                "relative rounded-full transition-all duration-200 ease-in-out",
                sizeClasses[inputSize].track,
                
                // Unchecked styles
                !isChecked && "bg-input",
                
                // Checked styles
                isChecked && "bg-primary",
                
                // Focus styles
                isFocused && "ring-2 ring-ring ring-offset-2",
                
                // Error styles
                showError && !isChecked && "bg-destructive/30",
                showError && isChecked && "bg-destructive",
                
                // Disabled styles
                isDisabled && "opacity-50",
                
                trackClassName
              )}
              aria-hidden="true"
            >
              {/* Switch Thumb */}
              <div
                className={cn(
                  // Base styles
                  "absolute top-1/2 -translate-y-1/2 left-0.5",
                  "bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out",
                  sizeClasses[inputSize].thumb,
                  
                  // Checked position
                  isChecked && sizeClasses[inputSize].thumbOffset,
                  
                  thumbClassName
                )}
              />
            </div>

            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Label Content */}
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span
                  className={cn(
                    "font-medium text-foreground transition-colors",
                    sizeClasses[inputSize].label,
                    showError && "text-destructive",
                    isDisabled && "opacity-50"
                  )}
                >
                  {label}
                </span>
              )}
              
              {description && (
                <span
                  id={descriptionId}
                  className={cn(
                    "text-muted-foreground",
                    sizeClasses[inputSize].description,
                    isDisabled && "opacity-50"
                  )}
                >
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {/* Error Message */}
        {showError && (
          <p
            id={errorId}
            className={cn(
              "text-destructive flex items-center gap-1",
              switchPosition === "left" && "ml-[calc(theme(spacing.8)+theme(spacing.3))]",
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

FormSwitch.displayName = "FormSwitch";

export default FormSwitch;
