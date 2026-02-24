"use client";

import React, { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  touched?: boolean;
  helperText?: string;
  icon?: LucideIcon;
  onChange?: (value: string) => void;
  validateOnChange?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  showPasswordToggle?: boolean;
  requiredIndicator?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      touched = false,
      helperText,
      icon: Icon,
      onChange,
      validateOnChange = true,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      showPasswordToggle = false,
      requiredIndicator = false,
      type = "text",
      disabled = false,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [internalTouched, setInternalTouched] = useState(false);

    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error && (touched || internalTouched);
    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setInternalTouched(true);
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className={cn(
            "block text-sm font-medium transition-colors",
            hasError ? "text-destructive" : "text-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            labelClassName
          )}
        >
          {label}
          {requiredIndicator && (
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Icon */}
          {Icon && (
            <Icon
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
                hasError ? "text-destructive" : "text-muted-foreground",
                isFocused && !hasError && "text-primary"
              )}
              aria-hidden="true"
            />
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={inputType}
            disabled={disabled}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={cn(
              "w-full border rounded-xl bg-background text-foreground transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              Icon ? "pl-10" : "pl-4",
              showPasswordToggle ? "pr-12" : "pr-4",
              "py-3",
              hasError
                ? "border-destructive focus:ring-destructive/20"
                : "border-border hover:border-border/80",
              inputClassName
            )}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />

          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                "text-muted-foreground hover:text-foreground",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              id={`${inputId}-error`}
              role="alert"
              className={cn(
                "text-sm text-destructive flex items-center gap-1.5",
                errorClassName
              )}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id={`${inputId}-hint`}
              className="text-xs text-muted-foreground"
            >
              {helperText}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
