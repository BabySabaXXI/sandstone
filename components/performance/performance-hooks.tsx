/**
 * Performance Hooks
 * 
 * Custom React hooks for performance optimization:
 * - useDebounce
 * - useThrottle
 * - useIntersectionObserver
 * - useMediaQuery
 * - useReducedMotion
 * - useNetworkStatus
 * - useMemoryStatus
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================================
// Debounce Hook
// ============================================================================

interface UseDebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useDebounce<T>(
  value: T,
  delay: number,
  options: UseDebounceOptions = {}
): T {
  const { leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef(true);

  useEffect(() => {
    if (leading && leadingRef.current) {
      setDebouncedValue(value);
      leadingRef.current = false;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
      leadingRef.current = true;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  ) as T;
}

// ============================================================================
// Throttle Hook
// ============================================================================

interface UseThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T>(
  value: T,
  limit: number,
  options: UseThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options;
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRan = now - lastRan.current;

    if (timeSinceLastRan >= limit) {
      if (leading) {
        setThrottledValue(value);
      }
      lastRan.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (trailing) {
          setThrottledValue(value);
        }
        lastRan.current = Date.now();
      }, limit - timeSinceLastRan);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, limit, leading, trailing]);

  return throttledValue;
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): T {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        callback(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, limit - (now - lastRan.current));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, ...deps]
  ) as T;
}

// ============================================================================
// Intersection Observer Hook
// ============================================================================

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [(node: Element | null) => void, IntersectionObserverEntry | undefined, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    triggerOnce = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [hasTriggered, setHasTriggered] = useState(false);
  const [node, setNode] = useState<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: Element | null) => {
      setNode(node);
    },
    []
  );

  useEffect(() => {
    if (!node || (triggerOnce && hasTriggered)) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        if (entry.isIntersecting && triggerOnce) {
          setHasTriggered(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [node, threshold, root, rootMargin, triggerOnce, hasTriggered]);

  return [ref, entry, hasTriggered];
}

// ============================================================================
// Media Query Hook
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    
    const updateMatch = () => setMatches(media.matches);
    updateMatch();

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", updateMatch);
      return () => media.removeEventListener("change", updateMatch);
    } else {
      // Legacy support
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}

// Common media query shortcuts
export const useIsMobile = () => useMediaQuery("(max-width: 640px)");
export const useIsTablet = () => useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");
export const usePrefersDarkMode = () => useMediaQuery("(prefers-color-scheme: dark)");
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const usePrefersReducedData = () => useMediaQuery("(prefers-reduced-data: reduce)");

// ============================================================================
// Network Status Hook
// ============================================================================

interface NetworkStatus {
  online: boolean;
  effectiveType: "slow-2g" | "2g" | "3g" | "4g" | "offline" | "unknown";
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    online: true,
    effectiveType: "unknown",
    downlink: 0,
    rtt: 0,
    saveData: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateStatus = () => {
      const connection = (navigator as any).connection;
      
      setStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || "unknown",
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      });
    };

    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      
      if (connection) {
        connection.removeEventListener("change", updateStatus);
      }
    };
  }, []);

  return status;
}

// ============================================================================
// Memory Status Hook
// ============================================================================

interface MemoryStatus {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

export function useMemoryStatus(): MemoryStatus | null {
  const [memory, setMemory] = useState<MemoryStatus | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const performance = window.performance as any;
    
    if (!performance?.memory) return;

    const updateMemory = () => {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      
      setMemory({
        usedJSHeapSize,
        totalJSHeapSize,
        jsHeapSizeLimit,
        usagePercentage: (usedJSHeapSize / jsHeapSizeLimit) * 100,
      });
    };

    updateMemory();

    const interval = setInterval(updateMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return memory;
}

// ============================================================================
// Page Visibility Hook
// ============================================================================

export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

// ============================================================================
// RAF Loop Hook (requestAnimationFrame)
// ============================================================================

export function useRAF(callback: (deltaTime: number) => void, isActive: boolean = true) {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const loop = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      callbackRef.current(deltaTime);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive]);
}

// ============================================================================
// Idle Callback Hook
// ============================================================================

export function useIdleCallback(
  callback: () => void,
  timeout?: number
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let idleCallbackId: number;

    if ("requestIdleCallback" in window) {
      idleCallbackId = requestIdleCallback(callback, { timeout });
    } else {
      // Fallback for browsers without requestIdleCallback
      const id = setTimeout(callback, timeout || 1);
      return () => clearTimeout(id);
    }

    return () => {
      if ("cancelIdleCallback" in window) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [callback, timeout]);
}

// ============================================================================
// Web Worker Hook
// ============================================================================

export function useWebWorker<T, R>(
  workerScript: string
): [(data: T) => Promise<R>, boolean] {
  const [isProcessing, setIsProcessing] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    workerRef.current = new Worker(workerScript);

    return () => {
      workerRef.current?.terminate();
    };
  }, [workerScript]);

  const process = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not initialized"));
          return;
        }

        setIsProcessing(true);

        const handleMessage = (e: MessageEvent) => {
          workerRef.current?.removeEventListener("message", handleMessage);
          setIsProcessing(false);
          resolve(e.data);
        };

        const handleError = (e: ErrorEvent) => {
          workerRef.current?.removeEventListener("error", handleError);
          setIsProcessing(false);
          reject(e.error);
        };

        workerRef.current.addEventListener("message", handleMessage);
        workerRef.current.addEventListener("error", handleError);
        workerRef.current.postMessage(data);
      });
    },
    []
  );

  return [process, isProcessing];
}

// ============================================================================
// Performance Metrics Hook
// ============================================================================

interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function useWebVitals(): WebVitals {
  const [vitals, setVitals] = useState<WebVitals>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // First Contentful Paint
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find((e) => e.name === "first-contentful-paint");
        if (fcp) {
          setVitals((prev) => ({ ...prev, fcp: fcp.startTime }));
        }
      });
      observer.observe({ entryTypes: ["paint"] });
    };

    // Largest Contentful Paint
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setVitals((prev) => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    };

    // First Input Delay
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart) {
            const fid = entry.processingStart - entry.startTime;
            setVitals((prev) => ({ ...prev, fid }));
          }
        });
      });
      observer.observe({ entryTypes: ["first-input"] });
    };

    // Cumulative Layout Shift
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setVitals((prev) => ({ ...prev, cls: clsValue }));
      });
      observer.observe({ entryTypes: ["layout-shift"] });
    };

    // Time to First Byte
    const observeTTFB = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        setVitals((prev) => ({ ...prev, ttfb: navigation.responseStart }));
      }
    };

    try {
      observeFCP();
      observeLCP();
      observeFID();
      observeCLS();
      observeTTFB();
    } catch (e) {
      // Some APIs may not be supported
    }
  }, []);

  return vitals;
}

// ============================================================================
// Local Storage Hook with Debounce
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 500
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Debounced setter
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = value instanceof Function ? value(prev) : value;

        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
          }
        }, debounceMs);

        return valueToStore;
      });
    },
    [key, debounceMs]
  );

  return [storedValue, setValue];
}
