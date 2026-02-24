import { useState, useEffect, useRef, useCallback } from "react";

export interface WindowSize {
  width: number;
  height: number;
}

export interface UseWindowSizeOptions {
  initialWidth?: number;
  initialHeight?: number;
  debounceDelay?: number;
}

export interface UseWindowSizeReturn extends WindowSize {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook to track window size with debouncing
 * Features: SSR-safe, debounced updates, breakpoint detection
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn {
  const { initialWidth = 0, initialHeight = 0, debounceDelay = 100 } = options;

  const [size, setSize] = useState<WindowSize>({
    width: initialWidth,
    height: initialHeight,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const updateSize = useCallback(() => {
    if (typeof window === "undefined") return;

    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") return;

    isMountedRef.current = true;

    // Set initial size
    updateSize();

    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          updateSize();
        }
      }, debounceDelay);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [debounceDelay, updateSize]);

  return {
    ...size,
    isMobile: size.width < 640,
    isTablet: size.width >= 640 && size.width < 1024,
    isDesktop: size.width >= 1024,
  };
}

export interface UseWindowScrollOptions {
  throttleDelay?: number;
}

export interface UseWindowScrollReturn {
  x: number;
  y: number;
  scrollTo: (options: ScrollToOptions) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
}

/**
 * Custom hook to track window scroll position
 */
export function useWindowScroll(options: UseWindowScrollOptions = {}): UseWindowScrollReturn {
  const { throttleDelay = 16 } = options; // ~60fps

  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const lastUpdateRef = useRef(0);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    isMountedRef.current = true;

    const handleScroll = () => {
      const now = Date.now();
      
      if (now - lastUpdateRef.current >= throttleDelay) {
        lastUpdateRef.current = now;
        
        if (isMountedRef.current) {
          setScroll({
            x: window.scrollX,
            y: window.scrollY,
          });
        }
      }
    };

    // Set initial scroll position
    setScroll({
      x: window.scrollX,
      y: window.scrollY,
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("scroll", handleScroll);
    };
  }, [throttleDelay]);

  const scrollTo = useCallback((options: ScrollToOptions) => {
    if (typeof window !== "undefined") {
      window.scrollTo(options);
    }
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return {
    ...scroll,
    scrollTo,
    scrollToTop,
    scrollToBottom,
  };
}

export default useWindowSize;
