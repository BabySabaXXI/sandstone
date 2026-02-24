"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Input Component
 * 
 * A comprehensive input component with label, helper text, and error states.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Input label="Email" placeholder="Enter your email" />
 * <Input label="Password" type="password" error="Invalid password" />
 * <Input label="Search" icon={<Search />} />
 */

// Input field variants
const inputVariants = cva(
  "w-full px-4 py-3 bg-sand-100 text-sand-900 text-sm border rounded-[10px] " +
  "placeholder:text-sand-500 " +
  "transition-all duration-200 ease-out " +
  "focus:outline-none focus:ring-2 focus:ring-peach-100 " +
  "disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      state: {
        default: "border-sand-300 focus:border-peach-300",
        error: "border-rose-200 bg-rose-100/50 focus:border-rose-200 focus:ring-rose-100",
        success: "border-sage-200 bg-sage-100/50 focus:border-sage-200 focus:ring-sage-100",
      },
      size: {
        sm: "h-9 px-3 py-2 text-xs",
        md: "h-11 px-4 py-3",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      state: "default",
      size: "md",
    },
  }
);

// Label component
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-sand-700 mb-2",
      className
    )}
    {...props}
  >
    {children}
    {required && <span className="text-rose-200 ml-1">*</span>}
  </label>
));
Label.displayName = "Label";

// Helper text component
const HelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { variant?: "default" | "error" }
>(({ className, variant = "default", ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mt-1.5 text-xs flex items-center gap-1",
      variant === "error" ? "text-rose-200" : "text-sand-500",
      className
    )}
    {...props}
  />
));
HelperText.displayName = "HelperText";

// Main Input component
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  helper?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helper,
      error,
      icon,
      iconPosition = "left",
      state,
      size,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Determine state based on error
    const inputState = error ? "error" : state;

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={props.id} required={required}>
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ state: inputState, size }),
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-500 pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        {error ? (
          <HelperText id={`${props.id}-error`} variant="error">
            <AlertCircle className="w-3 h-3" />
            {error}
          </HelperText>
        ) : helper ? (
          <HelperText id={`${props.id}-helper`}>{helper}</HelperText>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helper?: string;
  error?: string;
  required?: boolean;
  minRows?: number;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helper,
      error,
      state,
      required,
      disabled,
      minRows = 4,
      ...props
    },
    ref
  ) => {
    const inputState = error ? "error" : state;

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={props.id} required={required}>
            {label}
          </Label>
        )}
        <textarea
          className={cn(
            inputVariants({ state: inputState }),
            "min-h-[120px] resize-y leading-relaxed py-3",
            className
          )}
          ref={ref}
          disabled={disabled}
          rows={minRows}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${props.id}-error` : helper ? `${props.id}-helper` : undefined}
          {...props}
        />
        {error ? (
          <HelperText id={`${props.id}-error`} variant="error">
            <AlertCircle className="w-3 h-3" />
            {error}
          </HelperText>
        ) : helper ? (
          <HelperText id={`${props.id}-helper`}>{helper}</HelperText>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// Select component
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helper?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helper,
      error,
      state,
      options,
      placeholder,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputState = error ? "error" : state;

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={props.id} required={required}>
            {label}
          </Label>
        )}
        <div className="relative">
          <select
            className={cn(
              inputVariants({ state: inputState }),
              "appearance-none cursor-pointer pr-10",
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-500 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
        {error ? (
          <HelperText variant="error">
            <AlertCircle className="w-3 h-3" />
            {error}
          </HelperText>
        ) : helper ? (
          <HelperText>{helper}</HelperText>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Input, Textarea, Select, Label, HelperText, inputVariants };
