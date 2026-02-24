/**
 * Next.js Instrumentation
 * 
 * This file is used to set up performance monitoring and analytics
 * for the Sandstone application.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { NextConfig } from "next";

/**
 * Register function called when the Next.js server starts
 */
export async function register() {
  // Only run on the server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize server-side monitoring
    console.log("[Instrumentation] Server monitoring initialized");
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    // Set up error tracking
    setupErrorTracking();
  }
  
  // Edge runtime instrumentation
  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[Instrumentation] Edge runtime initialized");
  }
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
  // Log build information
  console.log(`[Performance] Build ID: ${process.env.NEXT_BUILD_ID || "development"}`);
  console.log(`[Performance] Node Env: ${process.env.NODE_ENV}`);
  
  // Monitor memory usage in production
  if (process.env.NODE_ENV === "production") {
    const logMemoryUsage = () => {
      const usage = process.memoryUsage();
      console.log("[Memory Usage]", {
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      });
    };
    
    // Log memory usage every 5 minutes in production
    setInterval(logMemoryUsage, 5 * 60 * 1000);
    
    // Initial log
    logMemoryUsage();
  }
}

/**
 * Setup error tracking
 */
function setupErrorTracking() {
  // Global unhandled rejection handler
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Unhandled Rejection]", reason);
    // In production, you would send this to your error tracking service
  });
  
  // Global uncaught exception handler
  process.on("uncaughtException", (error) => {
    console.error("[Uncaught Exception]", error);
    // In production, you would send this to your error tracking service
    // Note: The process will exit after this, so consider using a process manager
  });
}

/**
 * Web Vitals reporting
 * Called when the app reports web vitals metrics
 */
export function onRequest({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) {
  // Log request metrics in development
  if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    console.log(`[Request] ${request.method} ${url.pathname} - ${response.status}`);
  }
}

/**
 * Report Web Vitals metrics
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  startTime: number;
  value: number;
  label: "web-vital" | "custom";
}) {
  // Log web vitals in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vital] ${metric.name}: ${metric.value}`, {
      id: metric.id,
      label: metric.label,
    });
  }
  
  // In production, send to analytics service
  // Example: sendToAnalytics(metric);
}
