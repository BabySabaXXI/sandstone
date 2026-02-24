/**
 * Optimized Image Component
 * 
 * High-performance image component with:
 * - Lazy loading with Intersection Observer
 * - Blur placeholder support
 * - WebP/AVIF format detection
 * - Responsive srcset generation
 * - Priority loading for critical images
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: "high" | "low" | "auto";
}

// Generate srcset for responsive images
function generateSrcSet(src: string, widths: number[]): string {
  const urlWithoutExt = src.replace(/\.[^/.]+$/, "");
  const ext = src.split(".").pop() || "jpg";
  
  return widths
    .map((w) => `${urlWithoutExt}-${w}w.${ext} ${w}w`)
    .join(", ");
}

// Detect WebP support
function detectWebPSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const webp = new Image();
    webp.onload = () => resolve(true);
    webp.onerror = () => resolve(false);
    webp.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  });
}

// Detect AVIF support
function detectAVIFSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = () => resolve(true);
    avif.onerror = () => resolve(false);
    avif.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=";
  });
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  sizes = "100vw",
  quality = 75,
  objectFit = "cover",
  onLoad,
  onError,
  loading,
  decoding = "async",
  fetchPriority = "auto",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [imageFormat, setImageFormat] = useState<"avif" | "webp" | "original">("original");
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect optimal image format
  useEffect(() => {
    const detectFormat = async () => {
      const [avifSupported, webpSupported] = await Promise.all([
        detectAVIFSupport(),
        detectWebPSupport(),
      ]);

      if (avifSupported) {
        setImageFormat("avif");
        setOptimizedSrc(src.replace(/\.(jpg|jpeg|png)$/i, ".avif"));
      } else if (webpSupported) {
        setImageFormat("webp");
        setOptimizedSrc(src.replace(/\.(jpg|jpeg|png)$/i, ".webp"));
      }
    };

    detectFormat();
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px 0px",
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle image error - fallback to original
  const handleError = useCallback(() => {
    if (optimizedSrc !== src) {
      setOptimizedSrc(src);
    } else {
      onError?.();
    }
  }, [optimizedSrc, src, onError]);

  // Determine loading strategy
  const loadingStrategy = loading || (priority ? "eager" : "lazy");
  const actualFetchPriority = priority ? "high" : fetchPriority;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        containerClassName
      )}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === "blur" && blurDataURL && !isLoaded && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        >
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full"
            style={{ objectFit, filter: "blur(20px)", transform: "scale(1.1)" }}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Color placeholder */}
      {placeholder === "empty" && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Main image */}
      {(isInView || priority) && (
        <picture>
          {/* AVIF source */}
          <source
            srcSet={optimizedSrc.replace(/\.(webp|jpg|jpeg|png)$/i, ".avif")}
            type="image/avif"
          />
          {/* WebP source */}
          <source
            srcSet={optimizedSrc.replace(/\.(jpg|jpeg|png)$/i, ".webp")}
            type="image/webp"
          />
          {/* Fallback image */}
          <img
            ref={imageRef}
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loadingStrategy}
            decoding={decoding}
            fetchPriority={actualFetchPriority}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            style={{ objectFit, width: "100%", height: "100%" }}
          />
        </picture>
      )}
    </div>
  );
}

// Image with responsive srcset
interface ResponsiveImageProps extends Omit<OptimizedImageProps, "srcSet"> {
  srcSet?: { url: string; width: number }[];
  breakpoints?: number[];
}

export function ResponsiveImage({
  src,
  srcSet,
  breakpoints = [640, 750, 828, 1080, 1200, 1920, 2048],
  sizes = "100vw",
  ...props
}: ResponsiveImageProps) {
  const generatedSrcSet = srcSet
    ? srcSet.map((s) => `${s.url} ${s.width}w`).join(", ")
    : generateSrcSet(src, breakpoints);

  return (
    <OptimizedImage
      {...props}
      src={src}
      sizes={sizes}
    />
  );
}

// Lazy image component with skeleton loading
interface LazyImageProps extends OptimizedImageProps {
  skeletonClassName?: string;
}

export function LazyImage({
  skeletonClassName,
  className,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-muted animate-pulse rounded-lg",
            skeletonClassName
          )}
        />
      )}
      <OptimizedImage
        {...props}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

// Background image with lazy loading
interface LazyBackgroundProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayClassName?: string;
  priority?: boolean;
}

export function LazyBackground({
  src,
  alt,
  className,
  children,
  overlay = false,
  overlayClassName,
  priority = false,
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Loading placeholder */}
      {!isLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

      {/* Background image */}
      {(isInView || priority) && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {/* Optional overlay */}
      {overlay && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
