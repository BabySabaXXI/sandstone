"use client";

import { useEffect, ReactNode } from "react";
import { WebVitalsMonitor, lazyLoadResources } from "./web-vitals";

interface PerformanceProviderProps {
  children: ReactNode;
  enableWebVitals?: boolean;
  enableLazyLoading?: boolean;
}

/**
 * Performance Provider Component
 * Wraps the application with performance monitoring and optimizations
 */
export function PerformanceProvider({
  children,
  enableWebVitals = true,
  enableLazyLoading = true,
}: PerformanceProviderProps) {
  useEffect(() => {
    // Lazy load non-critical resources after initial render
    if (enableLazyLoading) {
      const timer = setTimeout(() => {
        lazyLoadResources();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [enableLazyLoading]);

  return (
    <>
      {enableWebVitals && <WebVitalsMonitor />}
      {children}
    </>
  );
}

export default PerformanceProvider;
