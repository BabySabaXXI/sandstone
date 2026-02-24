"use client";

import React from "react";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden component - hides content visually but keeps it accessible to screen readers
 * Use this for providing additional context to screen reader users without affecting the visual design
 */
export function VisuallyHidden({ 
  children, 
  as: Component = "span" 
}: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: "0",
      }}
    >
      {children}
    </Component>
  );
}

/**
 * SkipLink component - provides a skip navigation link for keyboard users
 */
interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
}

export function SkipLink({ href, children = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
    >
      {children}
    </a>
  );
}

/**
 * LiveRegion component - announces content changes to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
  id?: string;
}

export function LiveRegion({ 
  children, 
  politeness = "polite", 
  atomic = true,
  id 
}: LiveRegionProps) {
  return (
    <div
      id={id}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

/**
 * Announce component - programmatically announces messages to screen readers
 */
interface AnnounceProps {
  message: string;
  politeness?: "polite" | "assertive";
}

export function Announce({ message, politeness = "polite" }: AnnounceProps) {
  return (
    <div role="status" aria-live={politeness} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
