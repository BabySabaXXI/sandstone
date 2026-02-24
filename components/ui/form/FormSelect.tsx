"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface SelectOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional icon or element */
  icon?: React.ReactNode;
  /** Option group */
  group?: string;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    Omit<FormFieldProps, "children" | "size"> {
  /** Select size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Array of options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Whether to show a search/filter input */
  searchable?: boolean;
  /** Whether to group options */
  groupBy?: (option: SelectOption) => string | undefined;
  /** Custom empty message */
  emptyMessage?: string;
  /** Left icon or element */
  leftElement?: React.ReactNode;
}

// ============================================================================
// Form Select Component
// ============================================================================

/**
 * FormSelect - A comprehensive select component with built-in form field features
 * 
 * Features:
 * - Label, error, and helper text support via FormField
 * - Size variants
 * - Option groups
 * - Loading state
 * - Full accessibility support
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
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
      
      // Select props
      className,
      inputSize = "md",
      options,
      placeholder,
      isLoading = false,
      disabled,
      leftElement,
      emptyMessage = "No options available",
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Group options if needed
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];

      options.forEach((option) => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = [];
          }
          groups[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });

      return { groups, ungrouped };
    }, [options]);

    const hasGroups = Object.keys(groupedOptions.groups).length > 0;

    // Size variants
    const sizeClasses = {
      sm: "h-8 px-2.5 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    const leftPaddingClasses = {
      sm: leftElement ? "pl-8" : "",
      md: leftElement ? "pl-10" : "",
      lg: leftElement ? "pl-12" : "",
    };

    const showError = error && touched;

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
                "absolute left-0 top-0 h-full flex items-center justify-center text-muted-foreground pointer-events-none",
                inputSize === "sm" && "w-8",
                inputSize === "md" && "w-10",
                inputSize === "lg" && "w-12"
              )}
            >
              {leftElement}
            </div>
          )}

          {/* Select */}
          <select
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(
              // Base styles
              "flex w-full rounded-md border border-input bg-background ring-offset-background",
              "appearance-none",
              "transition-all duration-200 ease-in-out",
              
              // Focus styles
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              
              // Disabled styles
              "disabled:cursor-not-allowed disabled:opacity-50",
              
              // Error styles
              showError && "border-destructive focus-visible:ring-destructive",
              
              // Focus state (when not error)
              isFocused && !showError && "border-primary",
              
              // Size
              sizeClasses[inputSize],
              
              // Padding for left element
              leftPaddingClasses[inputSize],
              
              // Right padding for arrow
              "pr-10",
              
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {/* Placeholder */}
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {/* Empty state */}
            {options.length === 0 && (
              <option value="" disabled>
                {emptyMessage}
              </option>
            )}

            {/* Grouped options */}
            {hasGroups && (
              <>
                {Object.entries(groupedOptions.groups).map(([group, groupOptions]) => (
                  <optgroup key={group} label={group}>
                    {groupOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {groupedOptions.ungrouped.length > 0 && (
                  <>
                    {groupedOptions.ungrouped.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </>
                )}
              </>
            )}

            {/* Ungrouped options */}
            {!hasGroups && options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Arrow */}
          <div
            className={cn(
              "absolute right-0 top-0 h-full flex items-center justify-center text-muted-foreground pointer-events-none",
              inputSize === "sm" && "w-8",
              inputSize === "md" && "w-10",
              inputSize === "lg" && "w-12"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                inputSize === "sm" && "w-3.5 h-3.5",
                inputSize === "md" && "w-4 h-4",
                inputSize === "lg" && "w-5 h-5"
              )}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </FormField>
    );
  }
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
