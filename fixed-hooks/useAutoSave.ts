import { useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  // Use ReturnType<typeof setTimeout> for cross-platform compatibility
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedData = useRef<T>(data);

  const save = useCallback(() => {
    if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
      onSave(data);
      lastSavedData.current = data;
    }
  }, [data, onSave]);

  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // Save on unmount
  useEffect(() => {
    return () => {
      save();
    };
  }, [save]);

  return { save };
}
