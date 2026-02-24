# Form Components Documentation

A comprehensive form system for the Sandstone app with built-in validation, accessibility, and user experience features.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Core Components](#core-components)
- [Hooks](#hooks)
- [Validation](#validation)
- [Examples](#examples)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## Overview

The form system provides:

- **Complete form components** - Input, Textarea, Select, Checkbox, Radio, Switch, File Upload
- **Built-in validation** - Zod schema support with custom validators
- **Error handling** - Field-level and form-level error display
- **Loading states** - Visual feedback during submission
- **Accessibility** - Full ARIA support, keyboard navigation, screen reader friendly
- **Responsive design** - Works on all screen sizes

## Installation

The form components are already included in the project. Import them from:

```tsx
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadio,
  FormSwitch,
  FormFileUpload,
  FormActions,
  useForm,
} from "@/components/ui/form";
```

## Core Components

### Form

The main form wrapper that provides error summary and loading overlay.

```tsx
<Form
  errors={form.errors}
  isSubmitting={form.isSubmitting}
  onSubmit={form.handleSubmit}
  fieldLabels={{ email: "Email Address" }}
>
  {/* Form fields */}
</Form>
```

**Props:**
- `errors` - Object containing field errors
- `isSubmitting` - Whether the form is submitting
- `showErrorSummary` - Show error summary at top (default: true)
- `fieldGap` - Spacing between fields: "none" | "sm" | "md" | "lg"
- `disableDuringSubmit` - Disable form during submission (default: true)
- `fieldLabels` - Map of field names to display labels

### FormInput

Text input with label, error display, and various features.

```tsx
<FormInput
  label="Email"
  type="email"
  required
  value={form.values.email}
  onChange={(e) => form.setValue("email", e.target.value)}
  onBlur={form.handleBlur("email")}
  error={form.errors.email}
  touched={form.touched.email}
  leftElement={<MailIcon />}
  clearable
/>
```

**Features:**
- Password visibility toggle
- Clear button
- Left/right icons
- Debounced onChange
- Size variants (sm, md, lg)

### FormTextarea

Multi-line text input with auto-resize and character count.

```tsx
<FormTextarea
  label="Message"
  rows={4}
  maxLength={1000}
  showCharacterCount
  autoResize
  value={form.values.message}
  onChange={(e) => form.setValue("message", e.target.value)}
  error={form.errors.message}
  touched={form.touched.message}
/>
```

### FormSelect

Dropdown select with option groups support.

```tsx
<FormSelect
  label="Role"
  options={[
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User", group: "Standard" },
  ]}
  value={form.values.role}
  onChange={(e) => form.setValue("role", e.target.value)}
  placeholder="Select a role"
/>
```

### FormCheckbox

Single checkbox with label and description.

```tsx
<FormCheckbox
  label="I agree to the terms"
  description="You must accept to continue"
  required
  checked={form.values.terms}
  onChange={(e) => form.setValue("terms", e.target.checked)}
  error={form.errors.terms}
  touched={form.touched.terms}
/>
```

### FormRadio

Radio button group with multiple layout options.

```tsx
<FormRadio
  label="Priority"
  name="priority"
  options={[
    { value: "low", label: "Low", description: "Not urgent" },
    { value: "high", label: "High", description: "Urgent" },
  ]}
  selectedValue={form.values.priority}
  onValueChange={(value) => form.setValue("priority", value)}
  direction="horizontal"
/>
```

### FormSwitch

Toggle switch component.

```tsx
<FormSwitch
  label="Enable notifications"
  description="Receive email updates"
  checked={form.values.notifications}
  onChange={(e) => form.setValue("notifications", e.target.checked)}
/>
```

### FormFileUpload

File upload with drag-and-drop support.

```tsx
<FormFileUpload
  label="Upload File"
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024} // 5MB
  maxFiles={3}
  multiple
  value={files}
  onChange={setFiles}
  showFileList
/>
```

### FormActions

Submit, cancel, and reset buttons.

```tsx
<FormActions
  isSubmitting={form.isSubmitting}
  submitText="Save"
  showCancel
  onCancel={handleCancel}
  align="between"
/>
```

## Hooks

### useForm

Main form state management hook with validation.

```tsx
const form = useForm<FormData>({
  initialValues: { email: "", password: "" },
  validationSchema: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  onSubmit: async (values) => {
    // Handle submission
  },
  validateOnChange: true,
  validateOnBlur: true,
});

// Access form state
form.values      // Current form values
form.errors      // Validation errors
form.touched     // Touched fields
form.isSubmitting // Submission state
form.isDirty     // Whether form has changes
form.isValid     // Whether form is valid

// Form actions
form.setValue("email", "new@example.com")
form.handleSubmit()     // Submit the form
form.reset()            // Reset to initial values
form.validate()         // Manually validate
```

### useField

Individual field state management.

```tsx
const emailField = useField({
  name: "email",
  initialValue: "",
  validationSchema: z.string().email(),
  validateOnChange: true,
  validateOnBlur: true,
});

// Use with native input
<input {...emailField} />
```

## Validation

### Built-in Schemas

```tsx
import { schemas } from "@/components/ui/form";

const schema = z.object({
  email: schemas.email(),
  password: schemas.password({
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
  }),
  name: schemas.name("Full Name", 2, 100),
  phone: schemas.phone(),
  url: schemas.url(),
});
```

### Custom Validation

```tsx
import { validators, validateForm } from "@/components/ui/form";

// Use individual validators
const isValidEmail = validators.email("user@example.com");
const passwordCheck = validators.password("MyP@ssw0rd");

// Validate entire form
const result = validateForm(schema, formData);
if (!result.valid) {
  console.log(result.errors);
}
```

## Examples

### Login Form

```tsx
import { LoginForm } from "@/components/examples";

function LoginPage() {
  return (
    <LoginForm
      onSubmit={async (data) => {
        await signIn(data.email, data.password);
      }}
      onForgotPassword={() => router.push("/forgot-password")}
    />
  );
}
```

### Registration Form

```tsx
import { RegisterForm } from "@/components/examples";

function RegisterPage() {
  return (
    <RegisterForm
      onSubmit={async (data) => {
        await createAccount(data);
      }}
      onSignIn={() => router.push("/login")}
    />
  );
}
```

### Contact Form

```tsx
import { ContactForm } from "@/components/examples";

function ContactPage() {
  return (
    <ContactForm
      onSubmit={async (data) => {
        await sendContactMessage(data);
      }}
    />
  );
}
```

### Custom Form

```tsx
function CustomForm() {
  const form = useForm({
    initialValues: { name: "", email: "" },
    validationSchema: z.object({
      name: z.string().min(2),
      email: z.string().email(),
    }),
    onSubmit: async (values) => {
      await api.submit(values);
    },
  });

  return (
    <Form
      errors={form.errors}
      isSubmitting={form.isSubmitting}
      onSubmit={form.handleSubmit}
    >
      <FormInput
        label="Name"
        value={form.values.name}
        onChange={(e) => form.setValue("name", e.target.value)}
        onBlur={form.handleBlur("name")}
        error={form.errors.name}
        touched={form.touched.name}
      />
      <FormInput
        label="Email"
        type="email"
        value={form.values.email}
        onChange={(e) => form.setValue("email", e.target.value)}
        onBlur={form.handleBlur("email")}
        error={form.errors.email}
        touched={form.touched.email}
      />
      <FormActions isSubmitting={form.isSubmitting} />
    </Form>
  );
}
```

## Accessibility

All form components are built with accessibility in mind:

- **ARIA attributes** - Proper `aria-invalid`, `aria-describedby`, `aria-required`
- **Error announcements** - Errors announced via `aria-live="assertive"`
- **Label association** - All inputs have associated labels
- **Focus management** - Visible focus indicators and logical tab order
- **Screen reader support** - Hidden labels with `sr-only` class when needed
- **Keyboard navigation** - Full keyboard support for all interactive elements

### Focus Management on Errors

```tsx
<Form
  errors={form.errors}
  onErrorClick={(fieldName) => {
    // Focus the field with error
    document.getElementById(fieldName)?.focus();
  }}
>
  {/* Form fields */}
</Form>
```

## Best Practices

### 1. Always Use Validation Schema

```tsx
const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

### 2. Show Field Labels

```tsx
<FormInput
  label="Email Address"  // Always provide a label
  hideLabel              // Optionally hide visually (screen readers still see it)
/>
```

### 3. Handle Loading States

```tsx
<Form isSubmitting={isSubmitting}>
  <FormInput isLoading={isSubmitting} />
  <FormActions isSubmitting={isSubmitting} />
</Form>
```

### 4. Provide Helpful Error Messages

```tsx
<FormInput
  helperText="Must be at least 8 characters"
  error={errors.password}
  touched={touched.password}
/>
```

### 5. Use Consistent Spacing

```tsx
<Form fieldGap="md">  // Consistent spacing between fields
  {/* Form fields */}
</Form>
```

### 6. Group Related Fields

```tsx
<div className="grid grid-cols-2 gap-4">
  <FormInput label="First Name" />
  <FormInput label="Last Name" />
</div>
```

## File Structure

```
components/ui/form/
├── index.ts              # Main exports
├── Form.tsx              # Form wrapper
├── FormField.tsx         # Field wrapper
├── FormInput.tsx         # Text input
├── FormTextarea.tsx      # Multi-line input
├── FormSelect.tsx        # Dropdown select
├── FormCheckbox.tsx      # Checkbox
├── FormRadio.tsx         # Radio group
├── FormSwitch.tsx        # Toggle switch
├── FormFileUpload.tsx    # File upload
├── FormErrorSummary.tsx  # Error display
└── FormActions.tsx       # Action buttons

components/examples/
├── index.ts              # Example exports
├── LoginForm.tsx         # Login form example
├── RegisterForm.tsx      # Registration form example
├── ContactForm.tsx       # Contact form example
└── ProfileForm.tsx       # Profile form example

hooks/
├── useForm.ts            # Form state hook
└── useField.ts           # Field state hook

lib/validation/
└── index.ts              # Validation utilities
```

## Dependencies

- `zod` - Schema validation
- `clsx` - Conditional class names
- `tailwind-merge` - Tailwind class merging
- React 18+ - For hooks and components

## Migration Guide

### From Native Forms

**Before:**
```tsx
<form onSubmit={handleSubmit}>
  <label>Email</label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {error && <span>{error}</span>}
  <button type="submit">Submit</button>
</form>
```

**After:**
```tsx
<Form errors={errors} onSubmit={handleSubmit}>
  <FormInput
    label="Email"
    type="email"
    value={values.email}
    onChange={(e) => setValue("email", e.target.value)}
    error={errors.email}
    touched={touched.email}
  />
  <FormActions />
</Form>
```

## License

MIT - Part of the Sandstone application.
