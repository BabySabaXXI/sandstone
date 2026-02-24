/**
 * Form Components
 * 
 * A comprehensive collection of form components with built-in validation,
 * accessibility, and user experience features.
 * 
 * @example
 * ```tsx
 * import { Form, FormInput, FormField, FormActions } from "@/components/ui/form";
 * import { useForm } from "@/hooks/useForm";
 * import { z } from "zod";
 * 
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * 
 * function LoginForm() {
 *   const form = useForm({
 *     initialValues: { email: "", password: "" },
 *     validationSchema: schema,
 *     onSubmit: async (values) => {
 *       // Handle submission
 *     },
 *   });
 * 
 *   return (
 *     <Form
 *       errors={form.errors}
 *       isSubmitting={form.isSubmitting}
 *       onSubmit={form.handleSubmit}
 *     >
 *       <FormInput
 *         label="Email"
 *         type="email"
 *         required
 *         value={form.values.email}
 *         onChange={(e) => form.setValue("email", e.target.value)}
 *         onBlur={form.handleBlur("email")}
 *         error={form.errors.email}
 *         touched={form.touched.email}
 *       />
 *       <FormInput
 *         label="Password"
 *         type="password"
 *         required
 *         value={form.values.password}
 *         onChange={(e) => form.setValue("password", e.target.value)}
 *         onBlur={form.handleBlur("password")}
 *         error={form.errors.password}
 *         touched={form.touched.password}
 *       />
 *       <FormActions
 *         isSubmitting={form.isSubmitting}
 *         submitText="Sign In"
 *       />
 *     </Form>
 *   );
 * }
 * ```
 */

// Core Form Components
export { Form, type FormProps } from "./Form";
export { FormField, type FormFieldProps } from "./FormField";

// Input Components
export { FormInput, type FormInputProps } from "./FormInput";
export { FormTextarea, type FormTextareaProps } from "./FormTextarea";
export { FormSelect, type FormSelectProps, type SelectOption } from "./FormSelect";

// Selection Components
export { FormCheckbox, type FormCheckboxProps } from "./FormCheckbox";
export { FormRadio, type FormRadioProps, type RadioOption } from "./FormRadio";
export { FormSwitch, type FormSwitchProps } from "./FormSwitch";

// File Upload
export {
  FormFileUpload,
  type FormFileUploadProps,
  type FileWithPreview,
} from "./FormFileUpload";

// Utility Components
export { FormErrorSummary, type FormErrorSummaryProps } from "./FormErrorSummary";
export { FormActions, type FormActionsProps } from "./FormActions";

// Re-export hooks for convenience
export {
  useForm,
  type UseFormOptions,
  type UseFormReturn,
  type FormErrors,
  type FormTouched,
} from "@/hooks/useForm";

export {
  useField,
  type UseFieldOptions,
  type UseFieldReturn,
} from "@/hooks/useField";

// Re-export validation utilities
export {
  validators,
  schemas,
  validateForm,
  createFormSchema,
  errorMessages,
  emailRegex,
  passwordRegex,
  urlRegex,
  phoneRegex,
  type ValidationResult,
} from "@/lib/validation";
