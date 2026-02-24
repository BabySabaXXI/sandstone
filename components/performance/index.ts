/**
 * Performance Components & Utilities
 * 
 * This module exports all performance optimization components and hooks
 * for the Sandstone application.
 */

// ============================================================================
// Dynamic Imports & Code Splitting
// ============================================================================

export {
  // Lazy-loaded components
  LazyDashboardStats,
  LazyRecentActivity,
  LazyStudyProgress,
  LazyFlashcardsContent,
  LazyDocumentsContent,
  LazyQuizContent,
  LazySettingsModal,
  LazyCreateDeckModal,
  LazyProgressChart,
  LazyActivityChart,
  // Preload functions
  preloadDashboardComponents,
  preloadFlashcardComponents,
} from './dynamic-imports';

export {
  // Dynamic component factory
  createDynamicComponent,
  // Route-based components
  routeComponents,
  // Heavy components
  heavyComponents,
  // Lazy modals
  lazyModals,
  // Bundle monitoring
  useBundleMonitor,
  BundleSizeWarning,
  // Import cost analysis
  analyzeImportCost,
  // Intelligent prefetching
  useIntelligentPrefetch,
  // Chunk analysis
  analyzeChunks,
  // Performance budget
  checkPerformanceBudget,
} from './bundle-analyzer';

// ============================================================================
// Virtualization
// ============================================================================

export {
  VirtualList,
  VirtualGrid,
  WindowScroller,
  type VirtualListProps,
  type VirtualGridProps,
  type WindowScrollerProps,
} from './virtual-list';

// ============================================================================
// Image Optimization
// ============================================================================

export {
  OptimizedImage,
  ResponsiveImage,
  LazyImage,
  LazyBackground,
  type OptimizedImageProps,
  type ResponsiveImageProps,
  type LazyImageProps,
  type LazyBackgroundProps,
} from './optimized-image';

// ============================================================================
// Resource Hints
// ============================================================================

export {
  DNSPrefetch,
  Preconnect,
  Prefetch,
  Preload,
  Prerender,
  PerformanceResourceHints,
  PrefetchOnHover,
  CriticalCSS,
  FontOptimization,
  useResourceHints,
} from './resource-hints';

// ============================================================================
// Performance Hooks
// ============================================================================

export {
  // Debounce
  useDebounce,
  useDebouncedCallback,
  // Throttle
  useThrottle,
  useThrottledCallback,
  // Intersection Observer
  useIntersectionObserver,
  // Media Queries
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  usePrefersReducedData,
  // Network & Memory
  useNetworkStatus,
  useMemoryStatus,
  // Page Visibility
  usePageVisibility,
  // Animation Frame
  useRAF,
  // Idle Callback
  useIdleCallback,
  // Web Worker
  useWebWorker,
  // Web Vitals
  useWebVitals,
  // Local Storage
  useLocalStorage,
} from './performance-hooks';

// ============================================================================
// Performance Monitoring Component
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useWebVitals } from './performance-hooks';

interface PerformanceMonitorProps {
  onMetric?: (metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => void;
  reportToAnalytics?: boolean;
}

export function PerformanceMonitor({ onMetric, reportToAnalytics = false }: PerformanceMonitorProps) {
  const vitals = useWebVitals();

  useEffect(() => {
    // Report metrics
    const reportMetric = (name: string, value: number, thresholds: { good: number; poor: number }) => {
      let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
      if (value > thresholds.poor) {
        rating = 'poor';
      } else if (value > thresholds.good) {
        rating = 'needs-improvement';
      }

      onMetric?.({ name, value, rating });

      // Send to analytics if enabled
      if (reportToAnalytics && typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: name,
          value: Math.round(value),
          custom_parameter_1: rating,
        });
      }
    };

    // Report FCP
    if (vitals.fcp) {
      reportMetric('FCP', vitals.fcp, { good: 1800, poor: 3000 });
    }

    // Report LCP
    if (vitals.lcp) {
      reportMetric('LCP', vitals.lcp, { good: 2500, poor: 4000 });
    }

    // Report FID
    if (vitals.fid) {
      reportMetric('FID', vitals.fid, { good: 100, poor: 300 });
    }

    // Report CLS
    if (vitals.cls) {
      reportMetric('CLS', vitals.cls, { good: 0.1, poor: 0.25 });
    }

    // Report TTFB
    if (vitals.ttfb) {
      reportMetric('TTFB', vitals.ttfb, { good: 800, poor: 1800 });
    }
  }, [vitals, onMetric, reportToAnalytics]);

  return null;
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    // Preload fonts
    { url: '/fonts/inter-var.woff2', as: 'font' as const, crossOrigin: true },
    // Preload critical images
    { url: '/icons/icon-192x192.png', as: 'image' as const },
  ];

  criticalResources.forEach(({ url, as, crossOrigin }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

/**
 * Prefetch routes based on user navigation patterns
 */
export function prefetchCommonRoutes(): void {
  if (typeof window === 'undefined') return;

  const commonRoutes = [
    '/dashboard',
    '/flashcards',
    '/documents',
    '/grade',
    '/quiz',
  ];

  // Use requestIdleCallback for non-critical prefetching
  const schedulePrefetch = () => {
    commonRoutes.forEach((route, index) => {
      setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      }, index * 100);
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(schedulePrefetch, { timeout: 2000 });
  } else {
    setTimeout(schedulePrefetch, 2000);
  }
}

/**
 * Optimize third-party scripts loading
 */
export function optimizeThirdPartyScripts(): void {
  if (typeof window === 'undefined') return;

  // Defer non-critical third-party scripts
  const deferScripts = () => {
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach((script) => {
      script.setAttribute('defer', '');
      script.removeAttribute('data-defer');
    });
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(deferScripts, { timeout: 5000 });
  } else {
    setTimeout(deferScripts, 5000);
  }
}

/**
 * Measure and report performance metrics
 */
export function measurePerformance(): void {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  // Measure TTI (Time to Interactive)
  const measureTTI = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const tti = navigation.domInteractive;
      console.log('[Performance] TTI:', tti.toFixed(2), 'ms');
    }
  };

  // Measure resource loading
  const measureResources = () => {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
    console.log('[Performance] Total resources size:', (totalSize / 1024).toFixed(2), 'KB');
  };

  // Run measurements after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      measureTTI();
      measureResources();
    }, 0);
  });
}

// ============================================================================
// Performance Budget Configuration
// ============================================================================

export const PERFORMANCE_BUDGET = {
  // JavaScript bundle size (KB)
  javascript: 200,
  // CSS bundle size (KB)
  css: 50,
  // Images (KB)
  images: 500,
  // Total page weight (KB)
  total: 1000,
  // Number of requests
  requests: 50,
  // Time to First Byte (ms)
  ttfb: 600,
  // First Contentful Paint (ms)
  fcp: 1800,
  // Largest Contentful Paint (ms)
  lcp: 2500,
  // First Input Delay (ms)
  fid: 100,
  // Cumulative Layout Shift
  cls: 0.1,
};

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

/**
 * Create an intersection observer for lazy loading
 */
export function createLazyLoader(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
}

/**
 * Lazy load images using native loading attribute
 */
export function lazyLoadImages(): void {
  if (typeof document === 'undefined') return;

  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = createLazyLoader((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

/**
 * Lazy load iframes
 */
export function lazyLoadIframes(): void {
  if (typeof document === 'undefined') return;

  const iframes = document.querySelectorAll('iframe[data-src]');
  
  const iframeObserver = createLazyLoader((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const iframe = entry.target as HTMLIFrameElement;
        iframe.src = iframe.dataset.src || '';
        iframe.removeAttribute('data-src');
        iframeObserver.unobserve(iframe);
      }
    });
  });

  iframes.forEach((iframe) => iframeObserver.observe(iframe));
}
