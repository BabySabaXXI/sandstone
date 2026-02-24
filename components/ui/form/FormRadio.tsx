"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface RadioOption {
  /** Option value */
  value: string;
  /** Option label */
  label: React.ReactNode;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Description text for the option */
  description?: string;
}

export interface FormRadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
    Omit<FormFieldProps, "children" | "size"> {
  /** Radio size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Array of radio options */
  options: RadioOption[];
  /** Radio group name */
  name: string;
  /** Currently selected value */
  selectedValue?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Layout direction */
  direction?: "vertical" | "horizontal" | "grid";
  /** Number of columns for grid layout */
  columns?: number;
  /** Callback when selection changes */
  onValueChange?: (value: string) => void;
}

// ============================================================================
// Form Radio Component
// ============================================================================

/**
 * FormRadio - A comprehensive radio group component with built-in form field features
 * 
 * Features:
 * - Label and description support
 * - Multiple layout options (vertical, horizontal, grid)
 * - Size variants
 * - Loading state
 * - Full accessibility support
 */
export const FormRadio = forwardRef<HTMLDivElement, FormRadioProps>(
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
      
      // Radio props
      className,
      inputSize = "md",
      options,
      name,
      selectedValue,
      defaultValue,
      isLoading = false,
      disabled,
      direction = "vertical",
      columns = 2,
      onValueChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const uniqueId = React.useId();
    const groupId = `${uniqueId}-radio-group`;
    const errorId = `${groupId}-error`;
    const helperId = `${groupId}-helper`;

    const showError = error && touched;

    // Handle radio change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    // Size variants
    const sizeClasses = {
      sm: {
        radio: "w-4 h-4",
        label: "text-sm",
        description: "text-xs",
        gap: "gap-2",
      },
      md: {
        radio: "w-5 h-5",
        label: "text-base",
        description: "text-sm",
        gap: "gap-3",
      },
      lg: {
        radio: "w-6 h-6",
        label: "text-lg",
        description: "text-base",
        gap: "gap-4",
      },
    };

    // Layout classes
    const layoutClasses = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row flex-wrap",
      grid: `grid grid-cols-1 sm:grid-cols-${columns}`,
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
        <div
          ref={ref}
          role="radiogroup"
          aria-invalid={showError ? "true" : "false"}
          aria-describedby={cn(
            helperText && helperId,
            showError && errorId
          )}
          className={cn(
            layoutClasses[direction],
            sizeClasses[inputSize].gap,
            className
          )}
          {...props}
        >
          {options.map((option, index) => {
            const optionId = `${groupId}-${index}`;
            const isChecked = selectedValue === option.value || defaultValue === option.value;
            const isDisabled = disabled || option.disabled || isLoading;

            return (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-3 cursor-pointer",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
              >
                {/* Hidden Native Radio */}
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={handleChange}
                  className="sr-only"
                  aria-describedby={option.description ? `${optionId}-desc` : undefined}
                />

                {/* Custom Radio */}
                <div
                  className={cn(
                    // Base styles
                    "relative flex-shrink-0 rounded-full border-2 transition-all duration-200",
                    sizeClasses[inputSize].radio,
                    
                    // Unchecked styles
                    !isChecked && "border-input bg-background",
                    
                    // Checked styles
                    isChecked && "border-primary bg-background",
                    
                    // Focus styles (applied via parent label:focus-within)
                    "group-focus-within:ring-2 group-focus-within:ring-ring group-focus-within:ring-offset-2",
                    
                    // Error styles
                    showError && "border-destructive"
                  )}
                  aria-hidden="true"
                >
                  {/* Inner dot */}
                  {isChecked && (
                    <div
                      className={cn(
                        "absolute inset-0 m-auto rounded-full bg-primary",
                        inputSize === "sm" && "w-2 h-2",
                        inputSize === "md" && "w-2.5 h-2.5",
                        inputSize === "lg" && "w-3 h-3"
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
                      showError && "text-destructive"
                    )}
                  >
                    {option.label}
                  </span>
                  
                  {option.description && (
                    <span
                      id={`${optionId}-desc`}
                      className={cn(
                        "text-muted-foreground",
                        sizeClasses[inputSize].description
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </FormField>
    );
  }
);

FormRadio.displayName = "FormRadio";

export default FormRadio;
