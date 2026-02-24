"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
}

/**
 * Custom hook for handling async operations
 * Provides loading, error, and data states with proper cleanup
 * 
 * @param asyncFunction - The async function to execute
 * @param options - Options for immediate execution
 * @returns Object containing data, loading, error, and execute function
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(fetchUserData);
 * 
 * useEffect(() => {
 *   execute(userId);
 * }, [userId]);
 */
export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
): AsyncState<T> & { execute: (...args: Args) => Promise<void> } {
  const { immediate = false } = options;
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args: Args) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunction(...args);
      
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error) {
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        setState({ 
          data: null, 
          loading: false, 
          error: error instanceof Error ? error : new Error(String(error)) 
        });
      }
    }
  }, [asyncFunction]);

  return {
    ...state,
    execute,
  };
}
