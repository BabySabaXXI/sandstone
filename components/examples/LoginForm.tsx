"use client";

import React from "react";
import { z } from "zod";
import {
  Form,
  FormInput,
  FormActions,
  useForm,
  schemas,
} from "@/components/ui/form";

// ============================================================================
// Validation Schema
// ============================================================================

const loginSchema = z.object({
  email: schemas.email(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// Login Form Component
// ============================================================================

interface LoginFormProps {
  /** Callback when form is submitted successfully */
  onSubmit: (data: LoginFormData) => Promise<void>;
  /** Callback when user clicks forgot password */
  onForgotPassword?: () => void;
  /** Whether to show the remember me option */
  showRememberMe?: boolean;
}

/**
 * LoginForm - A complete login form with validation
 * 
 * Features:
 * - Email and password validation
 * - Remember me option
 * - Loading state
 * - Error handling
 * - Accessible form structure
 */
export function LoginForm({
  onSubmit,
  onForgotPassword,
  showRememberMe = true,
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: loginSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const fieldLabels = {
    email: "Email",
    password: "Password",
  };

  return (
    <Form
      errors={form.errors}
      isSubmitting={form.isSubmitting}
      touched={Object.keys(form.touched).length > 0}
      onSubmit={form.handleSubmit}
      fieldLabels={fieldLabels}
      className="w-full max-w-md"
    >
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
        autoFocus
        leftElement={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        }
        value={form.values.email}
        onChange={(e) => form.setValue("email", e.target.value)}
        onBlur={form.handleBlur("email")}
        error={form.errors.email}
        touched={form.touched.email}
        isLoading={form.isSubmitting}
      />

      <div className="space-y-2">
        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          autoComplete="current-password"
          leftElement={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          value={form.values.password}
          onChange={(e) => form.setValue("password", e.target.value)}
          onBlur={form.handleBlur("password")}
          error={form.errors.password}
          touched={form.touched.password}
          isLoading={form.isSubmitting}
        />

        {/* Forgot Password Link */}
        {onForgotPassword && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>

      {/* Remember Me */}
      {showRememberMe && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.values.rememberMe}
            onChange={(e) => form.setValue("rememberMe", e.target.checked)}
            className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
            disabled={form.isSubmitting}
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
      )}

      <FormActions
        isSubmitting={form.isSubmitting}
        submitText="Sign In"
        align="stretch"
      />
    </Form>
  );
}

export default LoginForm;
