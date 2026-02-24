/**
 * Bundle Analyzer & Code Splitting Utilities
 * 
 * Tools for analyzing and optimizing bundle size:
 * - Dynamic imports with prefetching
 * - Route-based code splitting
 * - Component-level code splitting
 * - Bundle size monitoring
 */

"use client";

import { lazy, Suspense, useEffect, useState, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Dynamic Import with Prefetching
// ============================================================================

interface DynamicImportOptions {
  prefetch?: boolean;
  prefetchDelay?: number;
  fallback?: ComponentType;
  ssr?: boolean;
}

// Create a lazy component with optional prefetching
export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
) {
  const {
    prefetch = false,
    prefetchDelay = 2000,
    fallback: FallbackComponent = DefaultFallback,
    ssr = false,
  } = options;

  const LazyComponent = lazy(importFn);
  let prefetchTimeout: NodeJS.Timeout | null = null;

  // Prefetch function
  const doPrefetch = () => {
    importFn();
  };

  // Schedule prefetch
  const schedulePrefetch = () => {
    if (prefetch && typeof window !== "undefined") {
      prefetchTimeout = setTimeout(() => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(doPrefetch);
        } else {
          doPrefetch();
        }
      }, prefetchDelay);
    }
  };

  // Cancel prefetch
  const cancelPrefetch = () => {
    if (prefetchTimeout) {
      clearTimeout(prefetchTimeout);
    }
  };

  function DynamicWrapper(props: React.ComponentProps<T>) {
    useEffect(() => {
      schedulePrefetch();
      return cancelPrefetch;
    }, []);

    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  // Attach prefetch method for manual triggering
  DynamicWrapper.prefetch = doPrefetch;

  return DynamicWrapper;
}

// Default fallback component
function DefaultFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

// ============================================================================
// Route-Based Code Splitting
// ============================================================================

interface RouteComponent {
  path: string;
  component: ComponentType<any>;
  prefetch?: boolean;
}

// Route-based dynamic imports for Next.js pages
export const routeComponents = {
  // Dashboard routes
  dashboard: createDynamicComponent(
    () => import("@/components/dashboard/dashboard-content").then(m => ({ default: m.DashboardContent })),
    { prefetch: true, prefetchDelay: 1000 }
  ),
  
  // Flashcard routes
  flashcards: createDynamicComponent(
    () => import("@/components/flashcards/flashcards-content").then(m => ({ default: m.FlashcardsContent })),
    { prefetch: false }
  ),
  
  // Document routes
  documents: createDynamicComponent(
    () => import("@/components/documents/documents-content").then(m => ({ default: m.DocumentsContent })),
    { prefetch: false }
  ),
  
  // Quiz routes
  quiz: createDynamicComponent(
    () => import("@/components/quiz/quiz-content").then(m => ({ default: m.QuizContent })),
    { prefetch: false }
  ),
  
  // Grade routes
  grade: createDynamicComponent(
    () => import("@/components/grade/grade-content").then(m => ({ default: m.GradeContent })),
    { prefetch: false }
  ),
  
  // Library routes
  library: createDynamicComponent(
    () => import("@/components/library/library-content").then(m => ({ default: m.LibraryContent })),
    { prefetch: false }
  ),
  
  // Settings routes
  settings: createDynamicComponent(
    () => import("@/components/settings/settings-content").then(m => ({ default: m.SettingsContent })),
    { prefetch: false }
  ),
};

// ============================================================================
// Heavy Component Code Splitting
// ============================================================================

// Components with heavy dependencies
export const heavyComponents = {
  // Charts and visualizations
  progressChart: createDynamicComponent(
    () => import("@/components/performance/progress-chart").then(m => ({ default: m.ProgressChart })),
    { prefetch: false }
  ),
  
  activityChart: createDynamicComponent(
    () => import("@/components/performance/activity-chart").then(m => ({ default: m.ActivityChart })),
    { prefetch: false }
  ),
  
  // Rich text editor
  richTextEditor: createDynamicComponent(
    () => import("@/components/ui/rich-text-editor").then(m => ({ default: m.RichTextEditor })),
    { prefetch: false }
  ),
  
  // Markdown renderer
  markdownRenderer: createDynamicComponent(
    () => import("@/components/ui/markdown-renderer").then(m => ({ default: m.MarkdownRenderer })),
    { prefetch: false }
  ),
  
  // PDF viewer
  pdfViewer: createDynamicComponent(
    () => import("@/components/ui/pdf-viewer").then(m => ({ default: m.PdfViewer })),
    { prefetch: false }
  ),
  
  // Code editor
  codeEditor: createDynamicComponent(
    () => import("@/components/ui/code-editor").then(m => ({ default: m.CodeEditor })),
    { prefetch: false }
  ),
  
  // Image gallery
  imageGallery: createDynamicComponent(
    () => import("@/components/ui/image-gallery").then(m => ({ default: m.ImageGallery })),
    { prefetch: false }
  ),
  
  // Data table with sorting/filtering
  dataTable: createDynamicComponent(
    () => import("@/components/ui/data-table").then(m => ({ default: m.DataTable })),
    { prefetch: false }
  ),
};

// ============================================================================
// Modal/Dialog Code Splitting
// ============================================================================

// Lazy-loaded modals
export const lazyModals = {
  settings: createDynamicComponent(
    () => import("@/components/settings/settings-modal").then(m => ({ default: m.SettingsModal })),
    { prefetch: false }
  ),
  
  createDeck: createDynamicComponent(
    () => import("@/components/flashcards/create-deck-modal").then(m => ({ default: m.CreateDeckModal })),
    { prefetch: false }
  ),
  
  createDocument: createDynamicComponent(
    () => import("@/components/documents/create-document-modal").then(m => ({ default: m.CreateDocumentModal })),
    { prefetch: false }
  ),
  
  uploadFile: createDynamicComponent(
    () => import("@/components/documents/upload-modal").then(m => ({ default: m.UploadModal })),
    { prefetch: false }
  ),
  
  share: createDynamicComponent(
    () => import("@/components/ui/share-modal").then(m => ({ default: m.ShareModal })),
    { prefetch: false }
  ),
  
  confirm: createDynamicComponent(
    () => import("@/components/ui/confirm-dialog").then(m => ({ default: m.ConfirmDialog })),
    { prefetch: false }
  ),
};

// ============================================================================
// Bundle Size Monitor
// ============================================================================

interface BundleSize {
  name: string;
  size: number;
  gzipSize: number;
}

interface BundleMetrics {
  totalSize: number;
  totalGzipSize: number;
  chunks: BundleSize[];
}

export function useBundleMonitor() {
  const [metrics, setMetrics] = useState<BundleMetrics | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if performance API is available
    if ("performance" in window && "getEntriesByType" in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const resources: BundleSize[] = [];

        entries.forEach((entry) => {
          if (entry.entryType === "resource" && entry.name.includes("_next/static")) {
            resources.push({
              name: entry.name.split("/").pop() || entry.name,
              size: (entry as PerformanceResourceTiming).transferSize || 0,
              gzipSize: (entry as PerformanceResourceTiming).encodedBodySize || 0,
            });
          }
        });

        const totalSize = resources.reduce((acc, r) => acc + r.size, 0);
        const totalGzipSize = resources.reduce((acc, r) => acc + r.gzipSize, 0);

        setMetrics({
          totalSize,
          totalGzipSize,
          chunks: resources,
        });
      });

      observer.observe({ entryTypes: ["resource"] });

      return () => observer.disconnect();
    }
  }, []);

  return metrics;
}

// Bundle size warning component
interface BundleSizeWarningProps {
  maxSize?: number; // in KB
}

export function BundleSizeWarning({ maxSize = 500 }: BundleSizeWarningProps) {
  const metrics = useBundleMonitor();

  if (!metrics) return null;

  const totalSizeKB = metrics.totalSize / 1024;

  if (totalSizeKB < maxSize) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-yellow-950 p-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold">⚠️ Large Bundle Detected</p>
      <p className="text-sm">
        Total size: {totalSizeKB.toFixed(2)} KB (limit: {maxSize} KB)
      </p>
    </div>
  );
}

// ============================================================================
// Import Cost Analyzer
// ============================================================================

// Known package sizes (approximate gzipped sizes in KB)
const packageSizes: Record<string, number> = {
  "framer-motion": 35,
  "recharts": 75,
  "chart.js": 60,
  "lodash": 24,
  "moment": 70,
  "date-fns": 15,
  "@radix-ui/react-dialog": 12,
  "@radix-ui/react-dropdown-menu": 10,
  "@radix-ui/react-select": 15,
  "lucide-react": 0.5, // Tree-shakeable
  "sonner": 8,
  "zustand": 2,
  "@tanstack/react-query": 15,
  "axios": 13,
  "zod": 12,
};

interface ImportCost {
  package: string;
  size: number;
  isHeavy: boolean;
}

export function analyzeImportCost(imports: string[]): ImportCost[] {
  return imports.map((pkg) => {
    const size = packageSizes[pkg] || 10; // Default estimate
    return {
      package: pkg,
      size,
      isHeavy: size > 30,
    };
  });
}

// ============================================================================
// Prefetch Strategy
// ============================================================================

// Intelligent prefetching based on user behavior
export function useIntelligentPrefetch() {
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<Set<string>>(new Set());

  const prefetchRoute = (route: string) => {
    if (prefetchedRoutes.has(route)) return;

    // Use requestIdleCallback for non-critical prefetching
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(() => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = route;
        document.head.appendChild(link);
        
        setPrefetchedRoutes((prev) => new Set(prev).add(route));
      });
    }
  };

  const prefetchOnHover = (route: string) => {
    return () => prefetchRoute(route);
  };

  const prefetchOnVisible = (route: string) => {
    useEffect(() => {
      if (typeof window === "undefined") return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              prefetchRoute(route);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "100px" }
      );

      const element = document.querySelector(`[data-prefetch="${route}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => observer.disconnect();
    }, [route]);
  };

  return { prefetchRoute, prefetchOnHover, prefetchOnVisible, prefetchedRoutes };
}

// ============================================================================
// Webpack Chunk Analysis
// ============================================================================

interface ChunkAnalysis {
  id: string;
  names: string[];
  size: number;
  modules: string[];
}

// Analyze webpack chunks at runtime
export function analyzeChunks(): ChunkAnalysis[] {
  if (typeof window === "undefined") return [];

  // @ts-ignore - webpack runtime
  const webpackChunks = window.__webpack_chunks__;
  
  if (!webpackChunks) return [];

  return Object.entries(webpackChunks).map(([id, chunk]: [string, any]) => ({
    id,
    names: chunk.names || [],
    size: chunk.size || 0,
    modules: chunk.modules || [],
  }));
}

// ============================================================================
// Performance Budget
// ============================================================================

interface PerformanceBudget {
  jsSize: number;
  cssSize: number;
  imageSize: number;
  totalSize: number;
}

const DEFAULT_BUDGET: PerformanceBudget = {
  jsSize: 200 * 1024, // 200KB
  cssSize: 50 * 1024, // 50KB
  imageSize: 500 * 1024, // 500KB
  totalSize: 1000 * 1024, // 1MB
};

export function checkPerformanceBudget(
  metrics: BundleMetrics,
  budget: PerformanceBudget = DEFAULT_BUDGET
): { passed: boolean; violations: string[] } {
  const violations: string[] = [];

  if (metrics.totalSize > budget.totalSize) {
    violations.push(
      `Total bundle size (${(metrics.totalSize / 1024).toFixed(2)}KB) exceeds budget (${(budget.totalSize / 1024).toFixed(2)}KB)`
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
