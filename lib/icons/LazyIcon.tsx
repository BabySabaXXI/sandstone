/**
 * Lazy Icon Component
 * 
 * Lazy-loaded icon component that only loads the icon when it enters the viewport.
 * Useful for improving initial page load performance.
 * 
 * @example
 * ```tsx
 * // Lazy load an icon
 * <LazyIcon icon={HeavyIcon} size="lg" />
 * 
 * // With fallback
 * <LazyIcon 
 *   icon={HeavyIcon} 
 *   fallback={<Skeleton className="w-6 h-6" />}
 * />
 * 
 * // With intersection observer options
 * <LazyIcon 
 *   icon={HeavyIcon}
 *   rootMargin="100px"
 *   threshold={0.5}
 * />
 * ```
 */

"use client";

import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon, IconProps } from "./Icon";
import { LAZY_ICON_CONFIG } from "./constants";

// ============================================================================
// Types
// ============================================================================

export interface LazyIconProps extends Omit<IconProps, "icon"> {
  /** Icon component to lazy load */
  icon: LucideIcon;
  /** Fallback component to show while loading */
  fallback?: React.ReactNode;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number;
  /** Delay before loading (ms) */
  loadDelay?: number;
  /** Placeholder className */
  placeholderClassName?: string;
}

// ============================================================================
// Lazy Icon Component
// ============================================================================

export function LazyIcon({
  icon: IconComponent,
  fallback,
  rootMargin = LAZY_ICON_CONFIG.rootMargin,
  threshold = LAZY_ICON_CONFIG.threshold,
  loadDelay = LAZY_ICON_CONFIG.loadDelay,
  placeholderClassName,
  size = "md",
  ...iconProps
}: LazyIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Set up intersection observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add small delay before loading to prevent jank
            setTimeout(() => {
              setIsVisible(true);
            }, loadDelay);
            observer.unobserve(container);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, loadDelay]);

  // Default fallback - uses the same size as the icon
  const defaultFallback = (
    <span
      className={cn(
        "inline-block animate-pulse bg-muted rounded",
        typeof size === "number" ? "" : getSizeClass(size),
        placeholderClassName
      )}
      style={typeof size === "number" ? { width: size, height: size } : undefined}
      aria-hidden="true"
    />
  );

  return (
    <span ref={containerRef} className="inline-flex items-center justify-center">
      {isVisible ? (
        <Icon icon={IconComponent} size={size} {...iconProps} />
      ) : (
        fallback || defaultFallback
      )}
    </span>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getSizeClass(size: string | number): string {
  const sizeClasses: Record<string, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-10 h-10",
    "3xl": "w-12 h-12",
  };

  if (typeof size === "number") return "";
  return sizeClasses[size] || sizeClasses.md;
}

// ============================================================================
// Dynamic Import Version (for code splitting)
// ============================================================================

export interface DynamicIconProps {
  /** Name of the icon to dynamically import from lucide-react */
  iconName: string;
  /** Fallback component */
  fallback?: React.ReactNode;
  /** Props to pass to the icon */
  iconProps?: Omit<IconProps, "icon">;
}

/**
 * DynamicIcon - Loads icons dynamically from lucide-react
 * 
 * Note: This uses dynamic imports which may not work in all environments.
 * For most use cases, prefer the LazyIcon component.
 */
export function DynamicIcon({
  iconName,
  fallback,
  iconProps = {},
}: DynamicIconProps) {
  const [IconComponent, setIconComponent] = useState<LucideIcon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      try {
        // Dynamic import from lucide-react
        const module = await import("lucide-react");
        const icon = module[iconName as keyof typeof module] as LucideIcon;

        if (isMounted && icon) {
          setIconComponent(() => icon);
        }
      } catch (error) {
        console.warn(`Failed to load icon: ${iconName}`, error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      isMounted = false;
    };
  }, [iconName]);

  if (isLoading || !IconComponent) {
    return (
      <>
        {fallback || (
          <span
            className={cn(
              "inline-block animate-pulse bg-muted rounded",
              getSizeClass(iconProps.size || "md")
            )}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  return <Icon icon={IconComponent} {...iconProps} />;
}

// ============================================================================
// Batch Lazy Loading Hook
// ============================================================================

/**
 * Hook for batch lazy loading multiple icons
 */
export function useLazyIcons(iconCount: number) {
  const [visibleIcons, setVisibleIcons] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = containerRefs.current.indexOf(
              entry.target as HTMLSpanElement
            );
            if (index !== -1) {
              setVisibleIcons((prev) => new Set([...prev, index]));
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: LAZY_ICON_CONFIG.rootMargin,
        threshold: LAZY_ICON_CONFIG.threshold,
      }
    );

    containerRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [iconCount]);

  const setContainerRef = (index: number) => (el: HTMLSpanElement | null) => {
    containerRefs.current[index] = el;
  };

  const isIconVisible = (index: number) => visibleIcons.has(index);

  return { setContainerRef, isIconVisible };
}
