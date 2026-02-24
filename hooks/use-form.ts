"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ValidationResult, Validator } from "@/lib/validation";

export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  validators?: Validator<T>[];
}

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validators?: Partial<Record<keyof T, Validator<T[keyof T]>[]>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | undefined) => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  handleChange: <K extends keyof T>(field: K) => (value: T[K]) => void;
  handleBlur: <K extends keyof T>(field: K) => () => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateAll: () => boolean;
  reset: (newValues?: Partial<T>) => void;
  setSubmitting: (submitting: boolean) => void;
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean;
  };
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, validators = {}, validateOnChange = true, validateOnBlur = true } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValuesRef = useRef(initialValues);

  // Track if form is dirty
  const isDirty = Object.keys(initialValues).some(
    (key) => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
  );

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Validate a single field
  const validateField = useCallback(
    <K extends keyof T>(field: K): boolean => {
      const fieldValidators = validators[field];
      if (!fieldValidators || fieldValidators.length === 0) return true;

      const value = values[field];
      let error: string | undefined;

      for (const validator of fieldValidators) {
        const result = validator(value);
        if (!result.valid) {
          error = result.error;
          break;
        }
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
      return error === undefined;
    },
    [values, validators]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    let allValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    for (const field of Object.keys(validators) as (keyof T)[]) {
      const fieldValidators = validators[field];
      if (!fieldValidators || fieldValidators.length === 0) continue;

      const value = values[field];
      let error: string | undefined;

      for (const validator of fieldValidators) {
        const result = validator(value);
        if (!result.valid) {
          error = result.error;
          allValid = false;
          break;
        }
      }

      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    setTouchedState(
      Object.keys(validators).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>)
    );

    return allValid;
  }, [values, validators]);

  // Set field value
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      // Validate after state update
      setTimeout(() => {
        const fieldValidators = validators[field];
        if (!fieldValidators || fieldValidators.length === 0) return;

        let error: string | undefined;
        for (const validator of fieldValidators) {
          const result = validator(value);
          if (!result.valid) {
            error = result.error;
            break;
          }
        }
        setErrors((prev) => ({ ...prev, [field]: error }));
      }, 0);
    }
  }, [validateOnChange, validators]);

  // Set field error
  const setError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched
  const setTouched = useCallback(<K extends keyof T>(field: K, touchedValue: boolean = true) => {
    setTouchedState((prev) => ({ ...prev, [field]: touchedValue }));
    if (validateOnBlur && touchedValue) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  // Handle change for a field
  const handleChange = useCallback(
    <K extends keyof T>(field: K) => (value: T[K]) => {
      setValue(field, value);
    },
    [setValue]
  );

  // Handle blur for a field
  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => () => {
      setTouched(field, true);
    },
    [setTouched]
  );

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues
      ? { ...initialValuesRef.current, ...newValues }
      : initialValuesRef.current;
    setValues(resetValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // Get field props for easy binding
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K) => ({
      value: values[field],
      onChange: handleChange(field),
      onBlur: handleBlur(field),
      error: errors[field],
      touched: touched[field] || false,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    reset,
    setSubmitting,
    getFieldProps,
  };
}

export default useForm;
