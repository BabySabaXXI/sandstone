"use client";

import { useEffect, useRef, useCallback } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: () => void;
  delay?: number;
  enabled?: boolean;
}

// =============================================================================
// HOOK
// =============================================================================

export function useAutoSave<T>({
  data,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);

  // Compare data to detect changes
  const hasDataChanged = useCallback((prev: T, current: T): boolean => {
    return JSON.stringify(prev) !== JSON.stringify(current);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Check if data has changed
    if (!hasDataChanged(previousDataRef.current, data)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave();
      previousDataRef.current = data;
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled, hasDataChanged]);

  // Manual save trigger
  const triggerSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSave();
    previousDataRef.current = data;
  }, [onSave, data]);

  // Cancel pending save
  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { triggerSave, cancelSave };
}

export default useAutoSave;
