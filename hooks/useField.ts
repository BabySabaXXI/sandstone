import { useState, useCallback, useRef, ChangeEvent, FocusEvent } from "react";
import { ZodSchema, ZodError } from "zod";

export interface UseFieldOptions<T> {
  name: string;
  initialValue: T;
  validationSchema?: ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onChange?: (value: T) => void;
  onBlur?: (value: T) => void;
  transform?: (value: T) => T;
}

export interface UseFieldReturn<T> {
  value: T;
  error: string | undefined;
  touched: boolean;
  isDirty: boolean;
  isValid: boolean;
  setValue: (value: T) => void;
  setError: (error: string) => void;
  clearError: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  reset: () => void;
  validate: () => boolean;
}

/**
 * Custom hook for individual form field handling
 * Features: validation, dirty tracking, touched tracking, transform support
 */
export function useField<T = string>({
  name,
  initialValue,
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  onChange: onChangeCallback,
  onBlur: onBlurCallback,
  transform,
}: UseFieldOptions<T>): UseFieldReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  
  const initialValueRef = useRef(initialValue);

  // Check if field is dirty
  const isDirty = JSON.stringify(value) !== JSON.stringify(initialValueRef.current);

  // Validate the field
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(value);
      setError(undefined);
      return true;
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0]?.message);
      }
      return false;
    }
  }, [validationSchema, value]);

  // Set value with optional validation
  const setValue = useCallback(
    (newValue: T) => {
      const transformedValue = transform ? transform(newValue) : newValue;
      setValueState(transformedValue);
      onChangeCallback?.(transformedValue);

      if (validateOnChange) {
        if (validationSchema) {
          try {
            validationSchema.parse(transformedValue);
            setError(undefined);
          } catch (err) {
            if (err instanceof ZodError) {
              setError(err.errors[0]?.message);
            }
          }
        }
      }
    },
    [transform, onChangeCallback, validateOnChange, validationSchema]
  );

  // Handle input change
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target;
      let newValue: T;

      if (target.type === "checkbox") {
        newValue = target.checked as unknown as T;
      } else if (target.type === "number" || target.type === "range") {
        newValue = (target.value === "" ? "" : Number(target.value)) as unknown as T;
      } else {
        newValue = target.value as unknown as T;
      }

      setValue(newValue);
    },
    [setValue]
  );

  // Handle input blur
  const onBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched(true);
      onBlurCallback?.(value);

      if (validateOnBlur) {
        validate();
      }
    },
    [validateOnBlur, validate, onBlurCallback, value]
  );

  // Set error manually
  const setErrorManually = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  // Reset field
  const reset = useCallback(() => {
    setValueState(initialValueRef.current);
    setError(undefined);
    setTouched(false);
  }, []);

  // Check if field is valid
  const isValid = error === undefined;

  return {
    value,
    error,
    touched,
    isDirty,
    isValid,
    setValue,
    setError: setErrorManually,
    clearError,
    onChange,
    onBlur,
    reset,
    validate,
  };
}

export default useField;
