"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<FormFieldProps, "children" | "size"> {
  /** Input size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Whether to show a clear button */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Left icon or element */
  leftElement?: React.ReactNode;
  /** Right icon or element */
  rightElement?: React.ReactNode;
  /** Loading state for the input itself */
  isLoading?: boolean;
  /** Debounce delay for onChange (in ms) */
  debounceMs?: number;
}

// ============================================================================
// Form Input Component
// ============================================================================

/**
 * FormInput - A comprehensive input component with built-in form field features
 * 
 * Features:
 * - Label, error, and helper text support via FormField
 * - Size variants
 * - Clearable input
 * - Left/right elements (icons, buttons)
 * - Loading state
 * - Password visibility toggle
 * - Debounced onChange support
 * - Full accessibility support
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      // FormField props
      label,
      required,
      error,
      helperText,
      labelElement,
      hideLabel,
      touched,
      
      // Input props
      className,
      inputSize = "md",
      type = "text",
      clearable = false,
      onClear,
      leftElement,
      rightElement,
      isLoading = false,
      disabled,
      debounceMs,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Determine actual input type (for password toggle)
    const inputType = type === "password" && showPassword ? "text" : type;

    // Handle debounced change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceMs && onChange) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onChange(e);
        }, debounceMs);
      } else {
        onChange?.(e);
      }
    };

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

    // Handle clear
    const handleClear = () => {
      onClear?.();
      // Trigger onChange with empty value
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    // Size variants
    const sizeClasses = {
      sm: "h-8 px-2.5 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    const iconSizeClasses = {
      sm: "w-3.5 h-3.5",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const leftPaddingClasses = {
      sm: leftElement ? "pl-8" : "",
      md: leftElement ? "pl-10" : "",
      lg: leftElement ? "pl-12" : "",
    };

    const rightPaddingClasses = {
      sm: rightElement || clearable || type === "password" ? "pr-8" : "",
      md: rightElement || clearable || type === "password" ? "pr-10" : "",
      lg: rightElement || clearable || type === "password" ? "pr-12" : "",
    };

    return (
      <FormField
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        labelElement={labelElement}
        hideLabel={hideLabel}
        touched={touched}
        isLoading={isLoading}
        size={inputSize}
      >
        <div className="relative">
          {/* Left Element */}
          {leftElement && (
            <div
              className={cn(
                "absolute left-0 top-0 h-full flex items-center justify-center text-muted-foreground",
                inputSize === "sm" && "w-8",
                inputSize === "md" && "w-10",
                inputSize === "lg" && "w-12"
              )}
            >
              {leftElement}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled || isLoading}
            className={cn(
              // Base styles
              "flex w-full rounded-md border border-input bg-background ring-offset-background",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "transition-all duration-200 ease-in-out",
              
              // Focus styles
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              
              // Disabled styles
              "disabled:cursor-not-allowed disabled:opacity-50",
              
              // Error styles
              error && touched && "border-destructive focus-visible:ring-destructive",
              
              // Focus state (when not error)
              isFocused && !(error && touched) && "border-primary",
              
              // Size
              sizeClasses[inputSize],
              
              // Padding for left/right elements
              leftPaddingClasses[inputSize],
              rightPaddingClasses[inputSize],
              
              className
            )}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {/* Right Element */}
          {rightElement && (
            <div
              className={cn(
                "absolute right-0 top-0 h-full flex items-center justify-center text-muted-foreground",
                inputSize === "sm" && "w-8",
                inputSize === "md" && "w-10",
                inputSize === "lg" && "w-12"
              )}
            >
              {rightElement}
            </div>
          )}

          {/* Clear Button */}
          {clearable && props.value && !disabled && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "absolute right-0 top-0 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                inputSize === "sm" && "w-8",
                inputSize === "md" && "w-10",
                inputSize === "lg" && "w-12",
                type === "password" && "right-8 md:right-10 lg:right-12"
              )}
              aria-label="Clear input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={iconSizeClasses[inputSize]}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Password Toggle */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "absolute right-0 top-0 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors",
                inputSize === "sm" && "w-8",
                inputSize === "md" && "w-10",
                inputSize === "lg" && "w-12"
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSizeClasses[inputSize]}
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={iconSizeClasses[inputSize]}
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
