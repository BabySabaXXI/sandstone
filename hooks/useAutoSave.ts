import { useEffect, useRef, useCallback, useMemo } from "react";

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void | Promise<void>;
  delay?: number;
  enabled?: boolean;
  compareFunction?: (a: T, b: T) => boolean;
}

export interface UseAutoSaveReturn {
  save: () => void;
  cancel: () => void;
  isDirty: boolean;
}

/**
 * Custom hook for auto-saving data with debouncing
 * Features: configurable delay, custom comparison, cancel capability, cleanup on unmount
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  compareFunction,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<T>(data);
  const isDirtyRef = useRef(false);
  const onSaveRef = useRef(onSave);
  const isMountedRef = useRef(true);

  // Keep callback reference up to date
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Default comparison using JSON serialization
  const defaultCompare = useCallback((a: T, b: T): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);

  const compare = compareFunction || defaultCompare;

  // Check if data has changed
  const isDirty = useMemo(() => {
    return !compare(data, lastSavedDataRef.current);
  }, [data, compare]);

  isDirtyRef.current = isDirty;

  // Cancel pending save
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Execute save
  const save = useCallback(() => {
    if (isDirtyRef.current && isMountedRef.current) {
      onSaveRef.current(data);
      lastSavedDataRef.current = data;
      isDirtyRef.current = false;
    }
  }, [data]);

  // Set up auto-save timer
  useEffect(() => {
    if (!enabled) {
      cancel();
      return;
    }

    // Only schedule save if data has changed
    if (!isDirty) {
      return;
    }

    // Clear any existing timeout
    cancel();

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        save();
      }
    }, delay);

    return () => {
      cancel();
    };
  }, [data, delay, enabled, isDirty, save, cancel]);

  // Save on unmount if there's pending data
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cancel();
      
      // Save any pending changes on unmount
      if (isDirtyRef.current) {
        onSaveRef.current(lastSavedDataRef.current);
      }
    };
  }, [cancel]);

  // Handle visibility change (save when tab becomes hidden)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isDirtyRef.current) {
        save();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, save]);

  return {
    save,
    cancel,
    isDirty,
  };
}

export default useAutoSave;
