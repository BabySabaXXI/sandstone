"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Loading State Hooks for Sandstone
 * 
 * A collection of hooks for managing loading states:
 * - useLoading: Basic loading state with delay support
 * - useProgress: Progress tracking for async operations
 * - useSkeleton: Skeleton loading with minimum display time
 * - useStaggeredLoading: Staggered loading for lists
 * - useLoadingTimeout: Timeout handling for loading states
 */

// ============================================
// USE LOADING HOOK
// ============================================

interface UseLoadingOptions {
  initialState?: boolean;
  delay?: number;
  minDuration?: number;
}

interface UseLoadingReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  toggleLoading: () => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialState = false, delay = 0, minDuration = 0 } = options;
  
  const [isLoading, setIsLoading] = useState(initialState);
  const loadingStartTime = useRef<number>(0);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    // Clear any existing timeouts
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
    }
    if (minDurationTimeoutRef.current) {
      clearTimeout(minDurationTimeoutRef.current);
    }

    if (delay > 0) {
      delayTimeoutRef.current = setTimeout(() => {
        setIsLoading(true);
        loadingStartTime.current = Date.now();
      }, delay);
    } else {
      setIsLoading(true);
      loadingStartTime.current = Date.now();
    }
  }, [delay]);

  const stopLoading = useCallback(() => {
    // Clear delay timeout if still pending
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }

    const elapsed = Date.now() - loadingStartTime.current;
    const remaining = Math.max(0, minDuration - elapsed);

    if (remaining > 0 && isLoading) {
      minDurationTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    } else {
      setIsLoading(false);
    }
  }, [minDuration, isLoading]);

  const toggleLoading = useCallback(() => {
    if (isLoading) {
      stopLoading();
    } else {
      startLoading();
    }
  }, [isLoading, startLoading, stopLoading]);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await promise;
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) clearTimeout(delayTimeoutRef.current);
      if (minDurationTimeoutRef.current) clearTimeout(minDurationTimeoutRef.current);
    };
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
}

// ============================================
// USE PROGRESS HOOK
// ============================================

interface UseProgressOptions {
  initialValue?: number;
  autoIncrement?: boolean;
  autoIncrementInterval?: number;
  maxAutoIncrement?: number;
}

interface UseProgressReturn {
  value: number;
  setValue: (value: number) => void;
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
  complete: () => void;
  isComplete: boolean;
}

export function useProgress(options: UseProgressOptions = {}): UseProgressReturn {
  const {
    initialValue = 0,
    autoIncrement = false,
    autoIncrementInterval = 100,
    maxAutoIncrement = 90,
  } = options;

  const [value, setValueState] = useState(initialValue);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setValue = useCallback((newValue: number) => {
    setValueState(Math.min(100, Math.max(0, newValue)));
  }, []);

  const increment = useCallback((amount: number = 10) => {
    setValueState((prev) => Math.min(100, prev + amount));
  }, []);

  const decrement = useCallback((amount: number = 10) => {
    setValueState((prev) => Math.max(0, prev - amount));
  }, []);

  const reset = useCallback(() => {
    setValueState(initialValue);
  }, [initialValue]);

  const complete = useCallback(() => {
    setValueState(100);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto increment effect
  useEffect(() => {
    if (autoIncrement && value < maxAutoIncrement) {
      intervalRef.current = setInterval(() => {
        setValueState((prev) => {
          if (prev >= maxAutoIncrement) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return prev;
          }
          // Slow down as we approach max
          const increment = Math.max(1, (maxAutoIncrement - prev) / 10);
          return Math.min(maxAutoIncrement, prev + increment);
        });
      }, autoIncrementInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoIncrement, autoIncrementInterval, maxAutoIncrement, value]);

  return {
    value,
    setValue,
    increment,
    decrement,
    reset,
    complete,
    isComplete: value >= 100,
  };
}

// ============================================
// USE SKELETON HOOK
// ============================================

interface UseSkeletonOptions {
  minDisplayTime?: number;
  delay?: number;
}

interface UseSkeletonReturn {
  showSkeleton: boolean;
  showContent: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export function useSkeleton(options: UseSkeletonOptions = {}): UseSkeletonReturn {
  const { minDisplayTime = 500, delay = 0 } = options;

  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showContent, setShowContent] = useState(true);
  const loadingStartTime = useRef<number>(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const startLoading = useCallback(() => {
    clearAllTimeouts();
    setShowContent(false);

    const delayTimeout = setTimeout(() => {
      setShowSkeleton(true);
      loadingStartTime.current = Date.now();
    }, delay);

    timeoutsRef.current.push(delayTimeout);
  }, [delay, clearAllTimeouts]);

  const stopLoading = useCallback(() => {
    const elapsed = Date.now() - loadingStartTime.current;
    const remaining = Math.max(0, minDisplayTime - elapsed);

    const stopTimeout = setTimeout(() => {
      setShowSkeleton(false);
      setShowContent(true);
    }, remaining);

    timeoutsRef.current.push(stopTimeout);
  }, [minDisplayTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  return {
    showSkeleton,
    showContent,
    startLoading,
    stopLoading,
  };
}

// ============================================
// USE STAGGERED LOADING HOOK
// ============================================

interface UseStaggeredLoadingOptions {
  itemCount: number;
  staggerDelay?: number;
  initialDelay?: number;
}

interface UseStaggeredLoadingReturn {
  visibleItems: boolean[];
  isComplete: boolean;
  reset: () => void;
}

export function useStaggeredLoading(
  options: UseStaggeredLoadingOptions
): UseStaggeredLoadingReturn {
  const { itemCount, staggerDelay = 100, initialDelay = 0 } = options;

  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    Array(itemCount).fill(false)
  );
  const [isComplete, setIsComplete] = useState(false);

  const reset = useCallback(() => {
    setVisibleItems(Array(itemCount).fill(false));
    setIsComplete(false);
  }, [itemCount]);

  useEffect(() => {
    reset();

    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });

        if (i === itemCount - 1) {
          setIsComplete(true);
        }
      }, initialDelay + i * staggerDelay);

      timeouts.push(timeout);
    }

    return () => timeouts.forEach(clearTimeout);
  }, [itemCount, staggerDelay, initialDelay, reset]);

  return {
    visibleItems,
    isComplete,
    reset,
  };
}

// ============================================
// USE LOADING TIMEOUT HOOK
// ============================================

interface UseLoadingTimeoutOptions {
  timeout?: number;
  onTimeout?: () => void;
}

interface UseLoadingTimeoutReturn {
  isLoading: boolean;
  hasTimedOut: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  reset: () => void;
}

export function useLoadingTimeout(
  options: UseLoadingTimeoutOptions = {}
): UseLoadingTimeoutReturn {
  const { timeout = 10000, onTimeout } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    clearLoadingTimeout();
    setIsLoading(true);
    setHasTimedOut(false);

    timeoutRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setIsLoading(false);
      onTimeout?.();
    }, timeout);
  }, [timeout, onTimeout, clearLoadingTimeout]);

  const stopLoading = useCallback(() => {
    clearLoadingTimeout();
    setIsLoading(false);
    setHasTimedOut(false);
  }, [clearLoadingTimeout]);

  const reset = useCallback(() => {
    clearLoadingTimeout();
    setIsLoading(false);
    setHasTimedOut(false);
  }, [clearLoadingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearLoadingTimeout();
  }, [clearLoadingTimeout]);

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading,
    reset,
  };
}

// ============================================
// USE MULTI LOADING HOOK
// ============================================

type LoadingState = {
  isLoading: boolean;
  error: Error | null;
};

interface UseMultiLoadingReturn {
  states: Record<string, LoadingState>;
  isAnyLoading: boolean;
  isAllLoaded: boolean;
  hasAnyError: boolean;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  setError: (key: string, error: Error) => void;
  reset: (key?: string) => void;
  resetAll: () => void;
}

export function useMultiLoading(keys: string[]): UseMultiLoadingReturn {
  const [states, setStates] = useState<Record<string, LoadingState>>(() => {
    const initial: Record<string, LoadingState> = {};
    keys.forEach((key) => {
      initial[key] = { isLoading: false, error: null };
    });
    return initial;
  });

  const startLoading = useCallback((key: string) => {
    setStates((prev) => ({
      ...prev,
      [key]: { isLoading: true, error: null },
    }));
  }, []);

  const stopLoading = useCallback((key: string) => {
    setStates((prev) => ({
      ...prev,
      [key]: { isLoading: false, error: null },
    }));
  }, []);

  const setError = useCallback((key: string, error: Error) => {
    setStates((prev) => ({
      ...prev,
      [key]: { isLoading: false, error },
    }));
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates((prev) => ({
        ...prev,
        [key]: { isLoading: false, error: null },
      }));
    }
  }, []);

  const resetAll = useCallback(() => {
    const reset: Record<string, LoadingState> = {};
    keys.forEach((key) => {
      reset[key] = { isLoading: false, error: null };
    });
    setStates(reset);
  }, [keys]);

  const isAnyLoading = Object.values(states).some((s) => s.isLoading);
  const isAllLoaded = Object.values(states).every((s) => !s.isLoading);
  const hasAnyError = Object.values(states).some((s) => s.error !== null);

  return {
    states,
    isAnyLoading,
    isAllLoaded,
    hasAnyError,
    startLoading,
    stopLoading,
    setError,
    reset,
    resetAll,
  };
}

// ============================================
// USE INFINITE LOADING HOOK
// ============================================

interface UseInfiniteLoadingOptions {
  threshold?: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading?: boolean;
}

interface UseInfiniteLoadingReturn {
  loaderRef: React.RefObject<HTMLDivElement | null>;
  isLoadingMore: boolean;
}

export function useInfiniteLoading(
  options: UseInfiniteLoadingOptions
): UseInfiniteLoadingReturn {
  const { threshold = 100, hasMore, onLoadMore, isLoading = false } = options;
  const loaderRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setIsLoadingMore(true);
          onLoadMore();
          setTimeout(() => setIsLoadingMore(false), 500);
        }
      },
      { rootMargin: `${threshold}px` }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore, threshold]);

  return {
    loaderRef,
    isLoadingMore,
  };
}
