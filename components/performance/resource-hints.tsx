/**
 * Resource Hints Component
 * 
 * Provides resource hints for optimal loading performance:
 * - DNS prefetch
 * - Preconnect
 * - Prefetch
 * - Preload
 * - Prerender
 */

import Head from "next/head";

interface DNSPrefetchProps {
  domains: string[];
}

export function DNSPrefetch({ domains }: DNSPrefetchProps) {
  return (
    <Head>
      {domains.map((domain) => (
        <link
          key={domain}
          rel="dns-prefetch"
          href={domain.startsWith("http") ? domain : `https://${domain}`}
        />
      ))}
    </Head>
  );
}

interface PreconnectProps {
  domains: Array<{
    url: string;
    crossOrigin?: boolean;
  }>;
}

export function Preconnect({ domains }: PreconnectProps) {
  return (
    <Head>
      {domains.map(({ url, crossOrigin }) => (
        <link
          key={url}
          rel="preconnect"
          href={url.startsWith("http") ? url : `https://${url}`}
          crossOrigin={crossOrigin ? "anonymous" : undefined}
        />
      ))}
    </Head>
  );
}

interface PrefetchProps {
  resources: Array<{
    url: string;
    as?: string;
    type?: string;
  }>;
}

export function Prefetch({ resources }: PrefetchProps) {
  return (
    <Head>
      {resources.map(({ url, as, type }) => (
        <link
          key={url}
          rel="prefetch"
          href={url}
          as={as}
          type={type}
        />
      ))}
    </Head>
  );
}

interface PreloadProps {
  resources: Array<{
    url: string;
    as: "script" | "style" | "image" | "font" | "fetch" | "document";
    type?: string;
    crossOrigin?: boolean;
    media?: string;
    imagesrcset?: string;
    imagesizes?: string;
  }>;
}

export function Preload({ resources }: PreloadProps) {
  return (
    <Head>
      {resources.map(({ url, as, type, crossOrigin, media, imagesrcset, imagesizes }) => (
        <link
          key={url}
          rel="preload"
          href={url}
          as={as}
          type={type}
          crossOrigin={crossOrigin ? "anonymous" : undefined}
          media={media}
          imagesrcset={imagesrcset}
          imagesizes={imagesizes}
        />
      ))}
    </Head>
  );
}

interface PrerenderProps {
  pages: string[];
}

export function Prerender({ pages }: PrerenderProps) {
  return (
    <Head>
      {pages.map((page) => (
        <link
          key={page}
          rel="prerender"
          href={page}
        />
      ))}
    </Head>
  );
}

// Combined resource hints for common use cases
interface PerformanceResourceHintsProps {
  // External APIs and CDNs
  preconnectDomains?: string[];
  // Critical resources to preload
  preloadResources?: PreloadProps["resources"];
  // Pages to prefetch for next navigation
  prefetchPages?: string[];
  // Pages to prerender
  prerenderPages?: string[];
}

export function PerformanceResourceHints({
  preconnectDomains = [],
  preloadResources = [],
  prefetchPages = [],
  prerenderPages = [],
}: PerformanceResourceHintsProps) {
  return (
    <Head>
      {/* DNS Prefetch for all external domains */}
      {preconnectDomains.map((domain) => (
        <link
          key={`dns-${domain}`}
          rel="dns-prefetch"
          href={domain.startsWith("http") ? domain : `https://${domain}`}
        />
      ))}

      {/* Preconnect for critical domains */}
      {preconnectDomains.map((domain) => (
        <link
          key={`preconnect-${domain}`}
          rel="preconnect"
          href={domain.startsWith("http") ? domain : `https://${domain}`}
          crossOrigin="anonymous"
        />
      ))}

      {/* Preload critical resources */}
      {preloadResources.map((resource) => (
        <link
          key={`preload-${resource.url}`}
          rel="preload"
          href={resource.url}
          as={resource.as}
          type={resource.type}
          crossOrigin={resource.crossOrigin ? "anonymous" : undefined}
          media={resource.media}
          imagesrcset={resource.imagesrcset}
          imagesizes={resource.imagesizes}
        />
      ))}

      {/* Prefetch likely next pages */}
      {prefetchPages.map((page) => (
        <link
          key={`prefetch-${page}`}
          rel="prefetch"
          href={page}
        />
      ))}

      {/* Prerender critical pages */}
      {prerenderPages.map((page) => (
        <link
          key={`prerender-${page}`}
          rel="prerender"
          href={page}
        />
      ))}
    </Head>
  );
}

// Hook for programmatic resource hints
export function useResourceHints() {
  const addPrefetch = (url: string) => {
    if (typeof document === "undefined") return;

    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
  };

  const addPreload = (url: string, as: string) => {
    if (typeof document === "undefined") return;

    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = as;
    document.head.appendChild(link);
  };

  const addPreconnect = (url: string) => {
    if (typeof document === "undefined") return;

    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = url;
    document.head.appendChild(link);
  };

  return { addPrefetch, addPreload, addPreconnect };
}

// Prefetch on hover component
interface PrefetchOnHoverProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function PrefetchOnHover({ href, children, className }: PrefetchOnHoverProps) {
  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      requestIdleCallback(() => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter} className={className}>
      {children}
    </div>
  );
}

// Critical CSS inline component
interface CriticalCSSProps {
  css: string;
}

export function CriticalCSS({ css }: CriticalCSSProps) {
  return (
    <Head>
      <style
        dangerouslySetInnerHTML={{ __html: css }}
        data-critical="true"
      />
    </Head>
  );
}

// Font display optimization
interface FontOptimizationProps {
  fonts: Array<{
    family: string;
    weights?: number[];
    display?: "swap" | "block" | "fallback" | "optional";
  }>;
}

export function FontOptimization({ fonts }: FontOptimizationProps) {
  const fontFaceCSS = fonts
    .map(({ family, weights = [400], display = "swap" }) => {
      return weights
        .map(
          (weight) => `
            @font-face {
              font-family: '${family}';
              font-style: normal;
              font-weight: ${weight};
              font-display: ${display};
              src: local('${family}'), local('${family.replace(/\s/g, "")}');
            }
          `
        )
        .join("\n");
    })
    .join("\n");

  return (
    <Head>
      <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />
    </Head>
  );
}
