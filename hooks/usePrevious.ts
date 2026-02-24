import { useRef, useEffect } from "react";

/**
 * Custom hook to get the previous value of a state or prop
 * Returns undefined on first render
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const prevRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    prevRef.current = ref.current;
    ref.current = value;
  }, [value]);

  return prevRef.current;
}

/**
 * Custom hook to compare current and previous values
 * Returns true if the value has changed
 */
export function useHasChanged<T>(value: T, comparator?: (a: T, b: T) => boolean): boolean {
  const previousValue = usePrevious(value);
  
  if (previousValue === undefined) {
    return false;
  }
  
  if (comparator) {
    return !comparator(value, previousValue);
  }
  
  return value !== previousValue;
}

/**
 * Custom hook to get the previous value with a custom comparison
 * Only updates the previous value when the comparator returns true
 */
export function usePreviousWhen<T>(
  value: T,
  shouldUpdate: (prev: T | undefined, next: T) => boolean
): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    if (shouldUpdate(ref.current, value)) {
      ref.current = value;
    }
  }, [value, shouldUpdate]);

  return ref.current;
}

export default usePrevious;
