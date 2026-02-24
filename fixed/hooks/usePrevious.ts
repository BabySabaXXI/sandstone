"use client";

import { useRef, useEffect } from "react";

/**
 * Custom hook for tracking previous values
 * Useful for comparing current and previous props or state
 * 
 * @param value - The value to track
 * @returns The previous value
 * 
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * useEffect(() => {
 *   if (count > prevCount) {
 *     console.log("Count increased");
 *   }
 * }, [count, prevCount]);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}
