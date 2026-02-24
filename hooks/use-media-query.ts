"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to track media query matches
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (with fallback for older browsers)
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook to track multiple breakpoints
 * @returns Object with boolean values for each breakpoint
 */
export function useBreakpoints() {
  const isXs = useMediaQuery("(max-width: 479px)");
  const isSm = useMediaQuery("(min-width: 480px) and (max-width: 639px)");
  const isMd = useMediaQuery("(min-width: 640px) and (max-width: 767px)");
  const isLg = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isXl = useMediaQuery("(min-width: 1024px) and (max-width: 1279px)");
  const is2xl = useMediaQuery("(min-width: 1280px)");

  return {
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    // Helper properties
    isMobile: isXs || isSm,
    isTablet: isMd || isLg,
    isDesktop: isXl || is2xl,
    // Current breakpoint name
    current: isXs
      ? "xs"
      : isSm
      ? "sm"
      : isMd
      ? "md"
      : isLg
      ? "lg"
      : isXl
      ? "xl"
      : "2xl",
  };
}

/**
 * Hook to track container size (requires ResizeObserver)
 * @param ref - React ref to the container element
 * @returns Object with width and height of the container
 */
export function useContainerSize<T extends HTMLElement>(
  ref: React.RefObject<T | null>
): { width: number; height: number } {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current) {
      return;
    }

    const element = ref.current;

    // Set initial size
    const updateSize = useCallback(() => {
      if (element) {
        const rect = element.getBoundingClientRect();
        setSize({
          width: rect.width,
          height: rect.height,
        });
      }
    }, [element]);

    updateSize();

    // Use ResizeObserver if available
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    } else {
      // Fallback to window resize
      window.addEventListener("resize", updateSize);
      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }
  }, [ref]);

  return size;
}

/**
 * Hook to detect if the user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/**
 * Hook to detect if the user prefers dark mode
 * @returns boolean indicating if dark mode is preferred
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

/**
 * Hook to detect if the device supports hover
 * @returns boolean indicating if hover is supported
 */
export function useHoverSupport(): boolean {
  return useMediaQuery("(hover: hover)");
}

/**
 * Hook to detect if the device is a touch device
 * @returns boolean indicating if touch is the primary input
 */
export function useTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
