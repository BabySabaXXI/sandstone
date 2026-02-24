import { useState, useCallback, useRef, FormEvent } from "react";
import { ZodSchema, ZodError } from "zod";

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  validate: () => boolean;
}

/**
 * Custom hook for form handling with validation support
 * Features: Zod validation, dirty tracking, touched tracking, submission handling
 */
export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialValuesRef = useRef(initialValues);
  const isDirtyRef = useRef(false);

  // Check if form is dirty
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  isDirtyRef.current = isDirty;

  // Validate a single field
  const validateField = useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      if (!validationSchema) return undefined;

      try {
        const fieldSchema = (validationSchema as ZodSchema<T>).pick({ [field]: true } as {
          [K in keyof T]: true;
        });
        fieldSchema.parse({ [field]: value } as T);
        return undefined;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find((e) => e.path[0] === field);
          return fieldError?.message;
        }
        return undefined;
      }
    },
    [validationSchema]
  );

  // Validate all fields
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FormErrors<T> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T;
          if (!newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [validationSchema, values]);

  // Set a single value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  }, [validateOnChange, validateField]);

  // Set multiple values
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Set a single error
  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set multiple errors
  const setFormErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrors(newErrors);
  }, []);

  // Clear a single error
  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Handle change for a field
  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValue(field, value as T[typeof field]);
    },
    [setValue]
  );

  // Handle blur for a field
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      if (validateOnBlur) {
        const error = validateField(field, values[field]);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [validateOnBlur, validateField, values]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as FormTouched<T>
      );
      setTouched(allTouched);

      // Validate before submission
      const isValid = validate();
      if (!isValid) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues
      ? { ...initialValuesRef.current, ...newValues }
      : initialValuesRef.current;
    setValues(resetValues);
    setErrors({});
    setTouched({});
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues: setFormValues,
    setError,
    setErrors: setFormErrors,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validate,
  };
}

export default useForm;
