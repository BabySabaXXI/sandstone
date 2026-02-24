"use client";

import React from "react";
import { z } from "zod";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormRadio,
  FormActions,
  useForm,
  schemas,
} from "@/components/ui/form";

// ============================================================================
// Validation Schema
// ============================================================================

const contactSchema = z.object({
  name: schemas.name("Name", 2, 100),
  email: schemas.email(),
  subject: z.string().min(1, "Please select a subject"),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
  }),
  message: schemas.description("Message", 1000).min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ============================================================================
// Subject Options
// ============================================================================

const subjectOptions = [
  { value: "", label: "Select a subject", disabled: true },
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
  { value: "other", label: "Other" },
];

// ============================================================================
// Priority Options
// ============================================================================

const priorityOptions = [
  { value: "low", label: "Low", description: "General question or feedback" },
  { value: "medium", label: "Medium", description: "Issue affecting my work" },
  { value: "high", label: "High", description: "Critical issue requiring immediate attention" },
];

// ============================================================================
// Contact Form Component
// ============================================================================

interface ContactFormProps {
  /** Callback when form is submitted successfully */
  onSubmit: (data: ContactFormData) => Promise<void>;
  /** Callback when user cancels */
  onCancel?: () => void;
}

/**
 * ContactForm - A complete contact form with validation
 * 
 * Features:
 * - Name and email validation
 * - Subject selection
 * - Priority radio buttons
 * - Message textarea with character count
 * - Loading state
 * - Error handling
 */
export function ContactForm({ onSubmit, onCancel }: ContactFormProps) {
  const form = useForm<ContactFormData>({
    initialValues: {
      name: "",
      email: "",
      subject: "",
      priority: "medium",
      message: "",
    },
    validationSchema: contactSchema,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const fieldLabels = {
    name: "Name",
    email: "Email",
    subject: "Subject",
    priority: "Priority",
    message: "Message",
  };

  return (
    <Form
      errors={form.errors}
      isSubmitting={form.isSubmitting}
      touched={Object.keys(form.touched).length > 0}
      onSubmit={form.handleSubmit}
      fieldLabels={fieldLabels}
      className="w-full max-w-xl"
    >
      {/* Name */}
      <FormInput
        label="Name"
        placeholder="Your full name"
        required
        autoComplete="name"
        value={form.values.name}
        onChange={(e) => form.setValue("name", e.target.value)}
        onBlur={form.handleBlur("name")}
        error={form.errors.name}
        touched={form.touched.name}
        isLoading={form.isSubmitting}
      />

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

      {/* Subject */}
      <FormSelect
        label="Subject"
        required
        options={subjectOptions}
        placeholder="What is this about?"
        value={form.values.subject}
        onChange={(e) => form.setValue("subject", e.target.value)}
        onBlur={form.handleBlur("subject")}
        error={form.errors.subject}
        touched={form.touched.subject}
        isLoading={form.isSubmitting}
      />

      {/* Priority */}
      <FormRadio
        label="Priority"
        name="priority"
        options={priorityOptions}
        selectedValue={form.values.priority}
        onValueChange={(value) => form.setValue("priority", value as ContactFormData["priority"])}
        direction="horizontal"
        error={form.errors.priority}
        touched={form.touched.priority}
        isLoading={form.isSubmitting}
      />

      {/* Message */}
      <FormTextarea
        label="Message"
        placeholder="How can we help you?"
        required
        rows={5}
        maxLength={1000}
        showCharacterCount
        autoResize
        value={form.values.message}
        onChange={(e) => form.setValue("message", e.target.value)}
        onBlur={form.handleBlur("message")}
        error={form.errors.message}
        touched={form.touched.message}
        isLoading={form.isSubmitting}
      />

      <FormActions
        isSubmitting={form.isSubmitting}
        submitText="Send Message"
        showCancel={!!onCancel}
        onCancel={onCancel}
        align="between"
      />
    </Form>
  );
}

export default ContactForm;
