"use client";

import { useState, useEffect, useCallback } from "react";

// Breakpoint definitions matching Tailwind config
const breakpoints = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

type Breakpoint = keyof typeof breakpoints;

interface ResponsiveState {
  // Current viewport width
  width: number;
  // Current viewport height
  height: number;
  // Breakpoint checks
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  // Range checks
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1023px
  isDesktop: boolean;     // >= 1024px
  isTouch: boolean;       // Touch device
  isLandscape: boolean;   // Landscape orientation
  isPortrait: boolean;    // Portrait orientation
  // Helper methods
  isAbove: (breakpoint: Breakpoint) => boolean;
  isBelow: (breakpoint: Breakpoint) => boolean;
  isBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Default to desktop values for SSR
    const width = typeof window !== "undefined" ? window.innerWidth : 1024;
    const height = typeof window !== "undefined" ? window.innerHeight : 768;

    return createResponsiveState(width, height);
  });

  const updateState = useCallback(() => {
    if (typeof window === "undefined") return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    setState(createResponsiveState(width, height));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial state
    updateState();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateState, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", updateState);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", updateState);
    };
  }, [updateState]);

  return state;
}

function createResponsiveState(width: number, height: number): ResponsiveState {
  const isXs = width >= breakpoints.xs;
  const isSm = width >= breakpoints.sm;
  const isMd = width >= breakpoints.md;
  const isLg = width >= breakpoints.lg;
  const isXl = width >= breakpoints.xl;
  const is2xl = width >= breakpoints["2xl"];

  const isMobile = width < breakpoints.md;
  const isTablet = width >= breakpoints.md && width < breakpoints.lg;
  const isDesktop = width >= breakpoints.lg;

  // Check for touch device
  const isTouch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  // Check orientation
  const isLandscape = width > height;
  const isPortrait = width <= height;

  return {
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    isLandscape,
    isPortrait,
    isAbove: (breakpoint: Breakpoint) => width >= breakpoints[breakpoint],
    isBelow: (breakpoint: Breakpoint) => width < breakpoints[breakpoint],
    isBetween: (min: Breakpoint, max: Breakpoint) =>
      width >= breakpoints[min] && width < breakpoints[max],
  };
}

// Hook for detecting if element is in viewport
export function useInView(
  options?: IntersectionObserverInit
): [(node: Element | null) => void, boolean] {
  const [ref, setRef] = useState<Element | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return [setRef, isInView];
}

// Hook for media query
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Hook for prefers-reduced-motion
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

// Hook for dark mode preference
export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

// Hook for hover capability
export function useHoverCapability(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
