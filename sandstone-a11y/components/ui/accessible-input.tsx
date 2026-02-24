"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  hideLabel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    hideLabel = false,
    leftIcon,
    rightIcon,
    id,
    className,
    containerClassName,
    "aria-describedby": ariaDescribedBy,
    disabled,
    required,
    ...props 
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    // Build aria-describedby
    const describedBy = [
      helperText && helperId,
      error && errorId,
      ariaDescribedBy,
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5",
            hideLabel && "sr-only",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>

        {/* Input Container */}
        <div className="relative">
          {leftIcon && (
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-3 bg-[#F5F5F0] dark:bg-[#1A1A1A] dark:text-white border rounded-xl text-sm outline-none transition-all",
              "placeholder:text-[#8A8A8A]",
              "focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error 
                ? "border-red-500 focus:ring-red-200" 
                : "border-transparent hover:border-[#E5E5E0] dark:hover:border-[#3D3D3D]",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            aria-required={required}
            disabled={disabled}
            {...props}
          />

          {rightIcon && (
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !error && (
          <p 
            id={helperId}
            className="mt-1.5 text-xs text-[#8A8A8A]"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p 
            id={errorId}
            className="mt-1.5 text-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = "AccessibleInput";

// Accessible Textarea Component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  hideLabel?: boolean;
  containerClassName?: string;
  rows?: number;
}

export const AccessibleTextarea = forwardRef<HTMLTextAreaElement, AccessibleTextareaProps>(
  ({ 
    label, 
    helperText, 
    error, 
    hideLabel = false,
    id,
    className,
    containerClassName,
    rows = 4,
    "aria-describedby": ariaDescribedBy,
    disabled,
    required,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;

    const describedBy = [
      helperText && helperId,
      error && errorId,
      ariaDescribedBy,
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          htmlFor={textareaId}
          className={cn(
            "block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5",
            hideLabel && "sr-only",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full px-4 py-3 bg-[#F5F5F0] dark:bg-[#1A1A1A] dark:text-white border rounded-xl text-sm outline-none transition-all resize-y",
            "placeholder:text-[#8A8A8A]",
            "focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error 
              ? "border-red-500 focus:ring-red-200" 
              : "border-transparent hover:border-[#E5E5E0] dark:hover:border-[#3D3D3D]",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          disabled={disabled}
          {...props}
        />

        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-[#8A8A8A]">
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleTextarea.displayName = "AccessibleTextarea";

// Accessible Select Component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: string;
  error?: string;
  hideLabel?: boolean;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
  containerClassName?: string;
}

export const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
  ({ 
    label, 
    helperText, 
    error, 
    hideLabel = false,
    options,
    placeholder,
    id,
    className,
    containerClassName,
    "aria-describedby": ariaDescribedBy,
    disabled,
    required,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;

    const describedBy = [
      helperText && helperId,
      error && errorId,
      ariaDescribedBy,
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        <label
          htmlFor={selectId}
          className={cn(
            "block text-sm font-medium text-[#2D2D2D] dark:text-white mb-1.5",
            hideLabel && "sr-only",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>

        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-4 py-3 bg-[#F5F5F0] dark:bg-[#1A1A1A] dark:text-white border rounded-xl text-sm outline-none transition-all appearance-none",
            "focus:ring-2 focus:ring-[#E8D5C4] focus:border-transparent",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error 
              ? "border-red-500 focus:ring-red-200" 
              : "border-transparent hover:border-[#E5E5E0] dark:hover:border-[#3D3D3D]",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          aria-required={required}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs text-[#8A8A8A]">
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleSelect.displayName = "AccessibleSelect";
