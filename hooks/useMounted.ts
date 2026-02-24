import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to check if component is mounted
 * Useful for preventing state updates on unmounted components
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  return mounted;
}

export interface UseIsMountedReturn {
  isMounted: boolean;
  isUnmounted: boolean;
}

/**
 * Custom hook that returns both mounted and unmounted states
 */
export function useIsMounted(): UseIsMountedReturn {
  const mountedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);

    return () => {
      mountedRef.current = false;
      setIsMounted(false);
    };
  }, []);

  return {
    isMounted,
    isUnmounted: !isMounted,
  };
}

export type UseMountedCallback<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => ReturnType<T> | undefined;

/**
 * Custom hook that wraps a callback to only execute if component is mounted
 */
export function useMountedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): UseMountedCallback<T> {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (mountedRef.current) {
        return callback(...args);
      }
      return undefined;
    },
    [callback]
  );
}

export interface UseMountEffectOptions {
  onMount?: () => void | (() => void);
  onUnmount?: () => void;
}

/**
 * Custom hook for mount/unmount lifecycle effects
 */
export function useMountEffect(options: UseMountEffectOptions): void {
  const { onMount, onUnmount } = options;

  useEffect(() => {
    const cleanup = onMount?.();

    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
      onUnmount?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useMounted;
