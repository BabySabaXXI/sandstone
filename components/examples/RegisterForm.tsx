"use client";

import React from "react";
import { z } from "zod";
import {
  Form,
  FormInput,
  FormSelect,
  FormCheckbox,
  FormActions,
  useForm,
  schemas,
} from "@/components/ui/form";

// ============================================================================
// Validation Schema
// ============================================================================

const registerSchema = z
  .object({
    firstName: schemas.name("First name", 2, 50),
    lastName: schemas.name("Last name", 2, 50),
    email: schemas.email(),
    password: schemas.password({
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.string().min(1, "Please select a role"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// Role Options
// ============================================================================

const roleOptions = [
  { value: "", label: "Select a role", disabled: true },
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Administrator" },
];

// ============================================================================
// Register Form Component
// ============================================================================

interface RegisterFormProps {
  /** Callback when form is submitted successfully */
  onSubmit: (data: RegisterFormData) => Promise<void>;
  /** Callback when user clicks to sign in instead */
  onSignIn?: () => void;
}

/**
 * RegisterForm - A complete registration form with validation
 * 
 * Features:
 * - Full name validation
 * - Email validation
 * - Password strength requirements
 * - Password confirmation
 * - Role selection
 * - Terms acceptance
 * - Newsletter opt-in
 * - Loading state
 * - Error handling
 */
export function RegisterForm({ onSubmit, onSignIn }: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      acceptTerms: false,
      newsletter: false,
    },
    validationSchema: registerSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const fieldLabels = {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    role: "Role",
    acceptTerms: "Terms and conditions",
  };

  return (
    <Form
      errors={form.errors}
      isSubmitting={form.isSubmitting}
      touched={Object.keys(form.touched).length > 0}
      onSubmit={form.handleSubmit}
      fieldLabels={fieldLabels}
      className="w-full max-w-lg"
    >
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First name"
          placeholder="John"
          required
          autoComplete="given-name"
          value={form.values.firstName}
          onChange={(e) => form.setValue("firstName", e.target.value)}
          onBlur={form.handleBlur("firstName")}
          error={form.errors.firstName}
          touched={form.touched.firstName}
          isLoading={form.isSubmitting}
        />

        <FormInput
          label="Last name"
          placeholder="Doe"
          required
          autoComplete="family-name"
          value={form.values.lastName}
          onChange={(e) => form.setValue("lastName", e.target.value)}
          onBlur={form.handleBlur("lastName")}
          error={form.errors.lastName}
          touched={form.touched.lastName}
          isLoading={form.isSubmitting}
        />
      </div>

      {/* Email */}
      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
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

      {/* Role Selection */}
      <FormSelect
        label="Role"
        required
        options={roleOptions}
        placeholder="Select your role"
        value={form.values.role}
        onChange={(e) => form.setValue("role", e.target.value)}
        onBlur={form.handleBlur("role")}
        error={form.errors.role}
        touched={form.touched.role}
        isLoading={form.isSubmitting}
      />

      {/* Password */}
      <FormInput
        label="Password"
        type="password"
        placeholder="Create a strong password"
        required
        autoComplete="new-password"
        helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
        value={form.values.password}
        onChange={(e) => form.setValue("password", e.target.value)}
        onBlur={form.handleBlur("password")}
        error={form.errors.password}
        touched={form.touched.password}
        isLoading={form.isSubmitting}
      />

      {/* Confirm Password */}
      <FormInput
        label="Confirm password"
        type="password"
        placeholder="Confirm your password"
        required
        autoComplete="new-password"
        value={form.values.confirmPassword}
        onChange={(e) => form.setValue("confirmPassword", e.target.value)}
        onBlur={form.handleBlur("confirmPassword")}
        error={form.errors.confirmPassword}
        touched={form.touched.confirmPassword}
        isLoading={form.isSubmitting}
      />

      {/* Terms Checkbox */}
      <FormCheckbox
        label={
          <span>
            I agree to the{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </span>
        }
        required
        checked={form.values.acceptTerms}
        onChange={(e) => form.setValue("acceptTerms", e.target.checked)}
        onBlur={form.handleBlur("acceptTerms")}
        error={form.errors.acceptTerms}
        touched={form.touched.acceptTerms}
        isLoading={form.isSubmitting}
      />

      {/* Newsletter Checkbox */}
      <FormCheckbox
        label="Subscribe to our newsletter"
        description="Get updates about new features and promotions"
        checked={form.values.newsletter}
        onChange={(e) => form.setValue("newsletter", e.target.checked)}
        isLoading={form.isSubmitting}
      />

      <FormActions
        isSubmitting={form.isSubmitting}
        submitText="Create Account"
        align="stretch"
      />

      {/* Sign In Link */}
      {onSignIn && (
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSignIn}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      )}
    </Form>
  );
}

export default RegisterForm;
