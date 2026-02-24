import { useState, useEffect, useCallback, useRef } from "react";

export interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

export interface UseMediaQueryReturn {
  matches: boolean;
  isLoading: boolean;
}

/**
 * Custom hook for media query matching with SSR support
 * Features: SSR-safe initialization, automatic cleanup, default value support
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): UseMediaQueryReturn {
  const { defaultValue = false, initializeWithValue = true } = options;
  
  const [matches, setMatches] = useState<boolean>(
    initializeWithValue && typeof window !== "undefined"
      ? window.matchMedia(query).matches
      : defaultValue
  );
  const [isLoading, setIsLoading] = useState(!initializeWithValue);
  
  const mediaQueryListRef = useRef<MediaQueryList | null>(null);
  const isMountedRef = useRef(true);

  const handleChange = useCallback((event: MediaQueryListEvent | MediaQueryList) => {
    if (isMountedRef.current) {
      setMatches(event.matches);
    }
  }, []);

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined") return;

    isMountedRef.current = true;
    setIsLoading(true);

    try {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryListRef.current = mediaQueryList;

      // Set initial value
      setMatches(mediaQueryList.matches);

      // Modern API (addEventListener)
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener("change", handleChange);
      } else {
        // Legacy API (addListener) for older browsers
        mediaQueryList.addListener(handleChange);
      }

      setIsLoading(false);

      return () => {
        isMountedRef.current = false;
        
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener("change", handleChange);
        } else {
          mediaQueryList.removeListener(handleChange);
        }
      };
    } catch (error) {
      console.warn(`Error setting up media query "${query}":`, error);
      setIsLoading(false);
    }
  }, [query, handleChange]);

  return {
    matches,
    isLoading,
  };
}

// Predefined breakpoint hooks
export function useIsMobile(): boolean {
  const { matches } = useMediaQuery("(max-width: 639px)");
  return matches;
}

export function useIsTablet(): boolean {
  const { matches } = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  return matches;
}

export function useIsDesktop(): boolean {
  const { matches } = useMediaQuery("(min-width: 1024px)");
  return matches;
}

export function useIsLargeDesktop(): boolean {
  const { matches } = useMediaQuery("(min-width: 1280px)");
  return matches;
}

export function usePrefersReducedMotion(): boolean {
  const { matches } = useMediaQuery("(prefers-reduced-motion: reduce)");
  return matches;
}

export function usePrefersDarkMode(): boolean {
  const { matches } = useMediaQuery("(prefers-color-scheme: dark)");
  return matches;
}

export function usePrefersLightMode(): boolean {
  const { matches } = useMediaQuery("(prefers-color-scheme: light)");
  return matches;
}

export function useHoverCapability(): boolean {
  const { matches } = useMediaQuery("(hover: hover)");
  return matches;
}

export function usePointerCoarse(): boolean {
  const { matches } = useMediaQuery("(pointer: coarse)");
  return matches;
}

export function usePointerFine(): boolean {
  const { matches } = useMediaQuery("(pointer: fine)");
  return matches;
}

export default useMediaQuery;
