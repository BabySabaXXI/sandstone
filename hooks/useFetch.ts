import { useState, useEffect, useCallback, useRef } from "react";

export interface UseFetchOptions<T> {
  url: string | null;
  options?: RequestInit;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

export interface UseFetchReturn<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  abort: () => void;
}

/**
 * Custom hook for data fetching with fetch API
 * Features: automatic cleanup, request deduplication, abort support, loading states
 */
export function useFetch<T = unknown>({
  url,
  options = {},
  enabled = true,
  onSuccess,
  onError,
  initialData,
}: UseFetchOptions<T>): UseFetchReturn<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Abort any in-flight request
    abort();

    const requestId = ++requestIdRef.current;
    abortControllerRef.current = new AbortController();
    
    setIsFetching(true);
    if (!data) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Only update state if this is the latest request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (err) {
      // Don't set error for aborted requests
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
      abortControllerRef.current = null;
    }
  }, [url, enabled, options, onSuccess, onError, data]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      abort();
    };
  }, [fetchData, abort]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abort();
    };
  }, [abort]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: fetchData,
    abort,
  };
}

export default useFetch;
