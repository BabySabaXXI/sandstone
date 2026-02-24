import { useState, useEffect, useRef, useCallback } from "react";

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

/**
 * Custom hook for debouncing a value
 * Features: leading/trailing edge execution, cancel, flush
 */
export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { delay = 500, leading = false, trailing = true } = options;
  
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingExecutedRef = useRef(false);
  const pendingValueRef = useRef<T>(value);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPending(false);
    leadingExecutedRef.current = false;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (trailing && leadingExecutedRef.current) {
      setDebouncedValue(pendingValueRef.current);
    }
    
    setIsPending(false);
    leadingExecutedRef.current = false;
  }, [trailing]);

  useEffect(() => {
    pendingValueRef.current = value;
    
    // Execute on leading edge
    if (leading && !leadingExecutedRef.current) {
      setDebouncedValue(value);
      leadingExecutedRef.current = true;
      
      if (!trailing) {
        return;
      }
    }

    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
      setIsPending(false);
      leadingExecutedRef.current = false;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush,
  };
}

export interface UseDebouncedCallbackOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface UseDebouncedCallbackReturn<T extends (...args: unknown[]) => unknown> {
  callback: T;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
}

/**
 * Custom hook for debouncing a callback function
 * Features: leading/trailing edge execution, maxWait, cancel, flush
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseDebouncedCallbackOptions = {}
): UseDebouncedCallbackReturn<T> {
  const { delay = 500, leading = false, trailing = true, maxWait } = options;
  
  const [isPending, setIsPending] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const leadingExecutedRef = useRef(false);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    lastCallTimeRef.current = null;
    lastArgsRef.current = null;
    leadingExecutedRef.current = false;
    setIsPending(false);
  }, []);

  const invokeCallback = useCallback(() => {
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current);
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    if (trailing && lastArgsRef.current) {
      invokeCallback();
    }
  }, [cancel, trailing, invokeCallback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      const now = Date.now();

      // Execute on leading edge
      if (leading && !leadingExecutedRef.current) {
        invokeCallback();
        leadingExecutedRef.current = true;
        
        if (!trailing) {
          return;
        }
      }

      setIsPending(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set up maxWait timeout if specified
      if (maxWait && !maxWaitTimeoutRef.current) {
        const timeSinceLastCall = lastCallTimeRef.current ? now - lastCallTimeRef.current : 0;
        const timeToWait = Math.max(0, maxWait - timeSinceLastCall);
        
        maxWaitTimeoutRef.current = setTimeout(() => {
          if (trailing && lastArgsRef.current) {
            invokeCallback();
          }
          cancel();
        }, timeToWait);
      }

      lastCallTimeRef.current = now;

      timeoutRef.current = setTimeout(() => {
        if (trailing) {
          invokeCallback();
        }
        cancel();
      }, delay);
    },
    [delay, leading, trailing, maxWait, cancel, invokeCallback]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    callback: debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

export default useDebounce;
