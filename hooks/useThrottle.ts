import { useState, useEffect, useRef, useCallback } from "react";

export interface UseThrottleOptions {
  limit?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface UseThrottleReturn<T> {
  throttledValue: T;
  isThrottled: boolean;
}

/**
 * Custom hook for throttling a value
 * Features: leading/trailing edge execution
 */
export function useThrottle<T>(
  value: T,
  options: UseThrottleOptions = {}
): UseThrottleReturn<T> {
  const { limit = 500, leading = true, trailing = true } = options;
  
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [isThrottled, setIsThrottled] = useState(false);
  
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = useRef<T>(value);

  useEffect(() => {
    pendingValueRef.current = value;
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    // Execute immediately if enough time has passed and leading is enabled
    if (timeSinceLastExecution >= limit) {
      if (leading) {
        setThrottledValue(value);
        lastExecutedRef.current = now;
      }
      
      // Set up trailing execution if enabled
      if (trailing && !leading) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        setIsThrottled(true);
        timeoutRef.current = setTimeout(() => {
          setThrottledValue(pendingValueRef.current);
          lastExecutedRef.current = Date.now();
          setIsThrottled(false);
        }, limit);
      }
    } else {
      // Throttle - wait for remaining time
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsThrottled(true);
      timeoutRef.current = setTimeout(
        () => {
          if (trailing) {
            setThrottledValue(pendingValueRef.current);
          }
          lastExecutedRef.current = Date.now();
          setIsThrottled(false);
        },
        limit - timeSinceLastExecution
      );
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, limit, leading, trailing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    throttledValue,
    isThrottled,
  };
}

export interface UseThrottledCallbackOptions {
  limit?: number;
  leading?: boolean;
  trailing?: boolean;
}

export interface UseThrottledCallbackReturn<T extends (...args: unknown[]) => unknown> {
  callback: T;
  cancel: () => void;
  flush: () => void;
  isThrottled: boolean;
}

/**
 * Custom hook for throttling a callback function
 * Features: leading/trailing edge execution, cancel, flush
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseThrottledCallbackOptions = {}
): UseThrottledCallbackReturn<T> {
  const { limit = 500, leading = true, trailing = true } = options;
  
  const [isThrottled, setIsThrottled] = useState(false);
  
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
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
    lastArgsRef.current = null;
    setIsThrottled(false);
  }, []);

  const invokeCallback = useCallback(() => {
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current);
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    invokeCallback();
    lastExecutedRef.current = Date.now();
    setIsThrottled(false);
  }, [invokeCallback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      const now = Date.now();
      const timeSinceLastExecution = now - lastExecutedRef.current;

      // Execute immediately if enough time has passed and leading is enabled
      if (timeSinceLastExecution >= limit) {
        if (leading) {
          invokeCallback();
          lastExecutedRef.current = now;
        }
        
        // Set up trailing execution if enabled
        if (trailing && !leading) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          setIsThrottled(true);
          timeoutRef.current = setTimeout(() => {
            invokeCallback();
            lastExecutedRef.current = Date.now();
            setIsThrottled(false);
          }, limit);
        }
      } else {
        // Throttle - wait for remaining time
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setIsThrottled(true);
        timeoutRef.current = setTimeout(
          () => {
            if (trailing) {
              invokeCallback();
            }
            lastExecutedRef.current = Date.now();
            setIsThrottled(false);
          },
          limit - timeSinceLastExecution
        );
      }
    },
    [limit, leading, trailing, invokeCallback]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    callback: throttledCallback,
    cancel,
    flush,
    isThrottled,
  };
}

export default useThrottle;
