"use client";

import { useEffect, useCallback } from "react";
import {
  onCLS,
  onFCP,
  onFID,
  onLCP,
  onTTFB,
  onINP,
  type Metric,
} from "web-vitals";

// Types for Web Vitals metrics
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id: string;
  navigationType?: string;
}

// Thresholds for Core Web Vitals
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

/**
 * Get rating based on metric value and thresholds
 */
function getRating(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = VITALS_THRESHOLDS[name as keyof typeof VITALS_THRESHOLDS];
  if (!thresholds) return "good";

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

/**
 * Send metrics to analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  const body = JSON.stringify({
    ...metric,
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
  });

  // Use sendBeacon if available, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/web-vitals", body);
  } else {
    try {
      await fetch("/api/analytics/web-vitals", {
        method: "POST",
        body,
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to send Web Vitals:", error);
    }
  }
}

/**
 * Log metrics to console in development
 */
function logToConsole(metric: WebVitalsMetric) {
  const styles = {
    good: "color: #10B981; font-weight: bold;",
    "needs-improvement": "color: #F59E0B; font-weight: bold;",
    poor: "color: #EF4444; font-weight: bold;",
  };

  console.log(
    `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
    styles[metric.rating]
  );
}

/**
 * Report Web Vitals metrics
 */
function reportWebVitals(metric: Metric) {
  const webVitalsMetric: WebVitalsMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  // Log in development
  if (process.env.NODE_ENV === "development") {
    logToConsole(webVitalsMetric);
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === "production") {
    sendToAnalytics(webVitalsMetric);
  }
}

/**
 * Web Vitals Monitor Component
 * Tracks and reports Core Web Vitals metrics
 */
export function WebVitalsMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    // Register Web Vitals observers
    const cleanupFns: Array<() => void> = [];

    // Cumulative Layout Shift (CLS)
    cleanupFns.push(
      onCLS(reportWebVitals, {
        reportAllChanges: true,
      })
    );

    // First Contentful Paint (FCP)
    cleanupFns.push(
      onFCP(reportWebVitals, {
        reportAllChanges: false,
      })
    );

    // First Input Delay (FID)
    cleanupFns.push(
      onFID(reportWebVitals, {
        reportAllChanges: false,
      })
    );

    // Largest Contentful Paint (LCP)
    cleanupFns.push(
      onLCP(reportWebVitals, {
        reportAllChanges: true,
      })
    );

    // Time to First Byte (TTFB)
    cleanupFns.push(
      onTTFB(reportWebVitals, {
        reportAllChanges: false,
      })
    );

    // Interaction to Next Paint (INP) - new metric
    cleanupFns.push(
      onINP(reportWebVitals, {
        reportAllChanges: true,
      })
    );

    // Cleanup observers on unmount
    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}

/**
 * Performance Observer hook for custom metrics
 */
export function usePerformanceObserver(
  entryTypes: string[],
  callback: (entries: PerformanceEntryList) => void
) {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });

    entryTypes.forEach((type) => {
      try {
        observer.observe({ entryTypes: [type as any] });
      } catch (e) {
        console.warn(`Failed to observe ${type}:`, e);
      }
    });

    return () => observer.disconnect();
  }, [entryTypes, callback]);
}

/**
 * Resource loading optimizer
 * Preloads critical resources
 */
export function preloadCriticalResources() {
  if (typeof window === "undefined") return;

  // Preload critical fonts
  const criticalFonts = [
    "/fonts/inter-var.woff2",
    "/fonts/jetbrains-mono-var.woff2",
  ];

  criticalFonts.forEach((font) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = font;
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/**
 * Lazy load non-critical resources
 */
export function lazyLoadResources() {
  if (typeof window === "undefined") return;

  // Use requestIdleCallback for non-critical work
  const schedule =
    (window as any).requestIdleCallback ||
    ((cb: () => void) => setTimeout(cb, 1));

  schedule(() => {
    // Prefetch likely next pages
    const prefetchUrls = ["/library", "/flashcards", "/quiz"];

    prefetchUrls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    });
  });
}

export default WebVitalsMonitor;
