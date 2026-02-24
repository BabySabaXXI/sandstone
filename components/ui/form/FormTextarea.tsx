"use client";

import React, { forwardRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FormField, FormFieldProps } from "./FormField";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FormTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Omit<FormFieldProps, "children" | "size"> {
  /** Textarea size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Whether to show character count */
  showCharacterCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Whether to auto-resize based on content */
  autoResize?: boolean;
  /** Minimum rows for auto-resize */
  minRows?: number;
  /** Maximum rows for auto-resize */
  maxRows?: number;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================================================
// Form Textarea Component
// ============================================================================

/**
 * FormTextarea - A comprehensive textarea component with built-in form field features
 * 
 * Features:
 * - Label, error, and helper text support via FormField
 * - Character count display
 * - Auto-resize capability
 * - Size variants
 * - Loading state
 * - Full accessibility support
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
      
      // Textarea props
      className,
      inputSize = "md",
      showCharacterCount = false,
      maxLength,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      isLoading = false,
      disabled,
      onChange,
      onFocus,
      onBlur,
      rows,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    // Update character count
    useEffect(() => {
      const currentValue = String(value || defaultValue || "");
      setCharacterCount(currentValue.length);
    }, [value, defaultValue]);

    // Auto-resize function
    const resizeTextarea = useCallback(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
      const padding =
        parseInt(getComputedStyle(textarea).paddingTop) +
        parseInt(getComputedStyle(textarea).paddingBottom);

      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight - padding;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight + padding}px`;
    }, [autoResize, minRows, maxRows]);

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharacterCount(e.target.value.length);
      onChange?.(e);
      
      if (autoResize) {
        // Use setTimeout to ensure the DOM has updated
        setTimeout(resizeTextarea, 0);
      }
    };

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Initial resize
    useEffect(() => {
      if (autoResize) {
        resizeTextarea();
      }
    }, [autoResize, resizeTextarea]);

    // Size variants
    const sizeClasses = {
      sm: "px-2.5 py-1.5 text-xs min-h-[60px]",
      md: "px-3 py-2 text-sm min-h-[80px]",
      lg: "px-4 py-3 text-base min-h-[100px]",
    };

    const showError = error && touched;
    const isAtLimit = maxLength && characterCount >= maxLength;
    const isNearLimit = maxLength && characterCount >= maxLength * 0.9 && !isAtLimit;

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
          <textarea
            ref={combinedRef}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            rows={autoResize ? minRows : rows}
            className={cn(
              // Base styles
              "flex w-full rounded-md border border-input bg-background ring-offset-background",
              "placeholder:text-muted-foreground",
              "transition-all duration-200 ease-in-out resize-y",
              
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
              
              className
            )}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={value}
            defaultValue={defaultValue}
            {...props}
          />
        </div>

        {/* Character Count */}
        {(showCharacterCount || maxLength) && (
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs transition-colors",
                isAtLimit && "text-destructive font-medium",
                isNearLimit && "text-warning",
                !isAtLimit && !isNearLimit && "text-muted-foreground"
              )}
              aria-live="polite"
              aria-atomic="true"
            >
              {characterCount}
              {maxLength && ` / ${maxLength}`}
            </span>
          </div>
        )}
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export default FormTextarea;
