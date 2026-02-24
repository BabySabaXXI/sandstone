import { useState, useCallback, useRef, useEffect } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface UseAsyncState<T> {
  data: T | undefined;
  error: Error | null;
  status: AsyncStatus;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseAsyncReturn<T, Args extends unknown[] = unknown[]> extends UseAsyncState<T> {
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
}

export interface UseAsyncOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for handling async operations with state management
 * Features: status tracking, error handling, reset capability, cancellation
 */
export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const { initialData, onSuccess, onError } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: initialData,
    error: null,
    status: "idle",
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
  });

  const isMountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);

  // Keep function reference up to date
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      setState({
        data: state.data,
        error: null,
        status: "pending",
        isIdle: false,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await asyncFunctionRef.current(...args);

        if (isMountedRef.current) {
          setState({
            data,
            error: null,
            status: "success",
            isIdle: false,
            isPending: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(data);
        }

        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({
            data: state.data,
            error: err,
            status: "error",
            isIdle: false,
            isPending: false,
            isSuccess: false,
            isError: true,
          });
          onError?.(err);
        }

        return undefined;
      }
    },
    [state.data, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      status: "idle",
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState((prev) => ({
      ...prev,
      data,
      status: "success",
      isIdle: false,
      isPending: false,
      isSuccess: true,
      isError: false,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      error,
      status: "error",
      isIdle: false,
      isPending: false,
      isSuccess: false,
      isError: true,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

export interface UseAsyncEffectOptions {
  enabled?: boolean;
  deps?: unknown[];
}

/**
 * Custom hook to execute an async function on mount or when dependencies change
 */
export function useAsyncEffect<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncEffectOptions = {}
): UseAsyncState<T> {
  const { enabled = true, deps = [] } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: undefined,
    error: null,
    status: "idle",
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    isMountedRef.current = true;

    const execute = async () => {
      setState({
        data: undefined,
        error: null,
        status: "pending",
        isIdle: false,
        isPending: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await asyncFunction();

        if (isMountedRef.current) {
          setState({
            data,
            error: null,
            status: "success",
            isIdle: false,
            isPending: false,
            isSuccess: true,
            isError: false,
          });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (isMountedRef.current) {
          setState({
            data: undefined,
            error: err,
            status: "error",
            isIdle: false,
            isPending: false,
            isSuccess: false,
            isError: true,
          });
        }
      }
    };

    execute();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return state;
}

export default useAsync;
