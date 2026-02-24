import { useState, useEffect, useRef, useCallback, RefObject } from "react";

export interface UseInViewOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
  fallbackInView?: boolean;
  trackVisibility?: boolean;
  delay?: number;
}

export interface UseInViewReturn<T extends Element = Element> {
  ref: RefObject<T>;
  inView: boolean;
  entry: IntersectionObserverEntry | undefined;
}

/**
 * Custom hook for intersection observer with advanced features
 * Features: triggerOnce support, fallback for unsupported browsers, visibility tracking
 */
export function useInView<T extends Element = Element>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    triggerOnce = false,
    initialInView = false,
    fallbackInView = true,
    trackVisibility = false,
    delay,
  } = options;

  const [inView, setInView] = useState(initialInView);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);
  
  const ref = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggeredRef = useRef(false);
  const isMountedRef = useRef(true);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!isMountedRef.current) return;

      const [entry] = entries;
      
      // Handle visibility tracking delay if specified
      const updateState = () => {
        const inViewValue = entry.isIntersecting;
        
        setInView(inViewValue);
        setEntry(entry);

        if (inViewValue && triggerOnce) {
          hasTriggeredRef.current = true;
          // Disconnect observer after first trigger
          if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      };

      if (delay && entry.isIntersecting) {
        setTimeout(updateState, delay);
      } else {
        updateState();
      }
    },
    [triggerOnce, delay]
  );

  useEffect(() => {
    // Skip if already triggered once
    if (triggerOnce && hasTriggeredRef.current) return;

    // Skip on server
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(fallbackInView);
      return;
    }

    const element = ref.current;
    if (!element) return;

    isMountedRef.current = true;

    try {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        root,
        rootMargin,
        trackVisibility: trackVisibility && "isVisible" in IntersectionObserverEntry.prototype,
        delay: trackVisibility ? 100 : undefined,
      });

      observerRef.current.observe(element);
    } catch (error) {
      console.warn("Error creating IntersectionObserver:", error);
      setInView(fallbackInView);
    }

    return () => {
      isMountedRef.current = false;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [threshold, root, rootMargin, triggerOnce, fallbackInView, trackVisibility, handleIntersection]);

  return {
    ref,
    inView,
    entry,
  };
}

export interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for infinite scroll using intersection observer
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  threshold = 0,
  rootMargin = "100px",
}: UseInfiniteScrollOptions): RefObject<Element> {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
}

export interface UseScrollSpyOptions {
  sectionIds: string[];
  rootMargin?: string;
  threshold?: number;
}

export interface UseScrollSpyReturn {
  activeId: string | null;
  setActiveId: (id: string) => void;
}

/**
 * Custom hook for scroll spy functionality
 * Tracks which section is currently in view
 */
export function useScrollSpy({
  sectionIds,
  rootMargin = "-50% 0px -50% 0px",
  threshold = 0,
}: UseScrollSpyOptions): UseScrollSpyReturn {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Skip on server
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    isMountedRef.current = true;

    const handleIntersection = (id: string) => (entries: IntersectionObserverEntry[]) => {
      if (!isMountedRef.current) return;

      const [entry] = entries;
      if (entry.isIntersecting) {
        setActiveId(id);
      }
    };

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver(handleIntersection(id), {
          threshold,
          rootMargin,
        });
        observer.observe(element);
        observersRef.current.set(id, observer);
      }
    });

    return () => {
      isMountedRef.current = false;
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
    };
  }, [sectionIds, rootMargin, threshold]);

  return {
    activeId,
    setActiveId,
  };
}

export default useInView;
