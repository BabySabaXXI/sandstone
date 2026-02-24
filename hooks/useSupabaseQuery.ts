import { useState, useEffect, useCallback, useRef } from "react";
import { PostgrestError, PostgrestBuilder } from "@supabase/supabase-js";

export interface UseSupabaseQueryOptions<T> {
  query: PostgrestBuilder<T> | null;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: PostgrestError) => void;
  initialData?: T;
}

export interface UseSupabaseQueryReturn<T> {
  data: T | undefined;
  error: PostgrestError | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for Supabase queries with proper cleanup and state management
 * Features: automatic cleanup, loading states, error handling, refetch capability
 */
export function useSupabaseQuery<T = unknown>({
  query,
  enabled = true,
  onSuccess,
  onError,
  initialData,
}: UseSupabaseQueryOptions<T>): UseSupabaseQueryReturn<T> {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const executeQuery = useCallback(async () => {
    if (!query || !enabled) return;

    const requestId = ++requestIdRef.current;

    setIsFetching(true);
    if (!data) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const { data: result, error: queryError } = await query;

      // Only update state if this is the latest request and component is mounted
      if (requestId === requestIdRef.current && isMountedRef.current) {
        if (queryError) {
          setError(queryError);
          onError?.(queryError);
        } else {
          setData(result as T);
          onSuccess?.(result as T);
        }
      }
    } catch (err) {
      const pgError = err as PostgrestError;
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setError(pgError);
        onError?.(pgError);
      }
    } finally {
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [query, enabled, onSuccess, onError, data]);

  // Execute query when dependencies change
  useEffect(() => {
    isMountedRef.current = true;
    executeQuery();

    return () => {
      isMountedRef.current = false;
    };
  }, [executeQuery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: executeQuery,
  };
}

export default useSupabaseQuery;
