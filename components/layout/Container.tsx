"use client";

import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "narrow" | "wide" | "full" | "none";
type PaddingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

interface ContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Size
  size?: ContainerSize;

  // Padding
  padding?: PaddingValue;
  paddingX?: PaddingValue;
  paddingY?: PaddingValue;

  // Responsive padding
  paddingSm?: PaddingValue;
  paddingMd?: PaddingValue;
  paddingLg?: PaddingValue;
  paddingXl?: PaddingValue;

  // Center content
  center?: boolean;

  // Full height
  fullHeight?: boolean;

  // As main element
  asMain?: boolean;

  // Container query support
  asContainer?: boolean;
  containerName?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const sizeToClass = (size: ContainerSize | undefined): string => {
  switch (size) {
    case "xs":
      return "max-w-xs";
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    case "2xl":
      return "max-w-2xl";
    case "narrow":
      return "max-w-3xl";
    case "wide":
      return "max-w-6xl";
    case "full":
      return "max-w-7xl";
    case "none":
      return "";
    default:
      return "max-w-7xl";
  }
};

const paddingToClass = (padding: PaddingValue | undefined, breakpoint?: string): string => {
  if (padding === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}p-${padding}`;
};

const paddingXToClass = (padding: PaddingValue | undefined, breakpoint?: string): string => {
  if (padding === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}px-${padding}`;
};

const paddingYToClass = (padding: PaddingValue | undefined, breakpoint?: string): string => {
  if (padding === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}py-${padding}`;
};

// ============================================================================
// CONTAINER COMPONENT
// ============================================================================

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      className,
      style,
      size = "full",
      padding,
      paddingX,
      paddingY,
      paddingSm,
      paddingMd,
      paddingLg,
      paddingXl,
      center = true,
      fullHeight,
      asMain = false,
      asContainer = false,
      containerName,
    },
    ref
  ) => {
    const containerClasses = cn(
      // Width
      "w-full",
      sizeToClass(size),

      // Center
      center && "mx-auto",

      // Padding
      paddingToClass(padding),
      paddingToClass(paddingSm, "sm"),
      paddingToClass(paddingMd, "md"),
      paddingToClass(paddingLg, "lg"),
      paddingToClass(paddingXl, "xl"),
      paddingXToClass(paddingX),
      paddingXToClass(paddingSm, "sm"),
      paddingXToClass(paddingMd, "md"),
      paddingXToClass(paddingLg, "lg"),
      paddingXToClass(paddingXl, "xl"),
      paddingYToClass(paddingY),
      paddingYToClass(paddingSm, "sm"),
      paddingYToClass(paddingMd, "md"),
      paddingYToClass(paddingLg, "lg"),
      paddingYToClass(paddingXl, "xl"),

      // Full height
      fullHeight && "h-full min-h-full",

      className
    );

    const containerProps = {
      ref,
      className: containerClasses,
      style,
      ...(asContainer && { "data-container": containerName || true }),
    };

    if (asMain) {
      return <main {...containerProps}>{children}</main>;
    }

    return <div {...containerProps}>{children}</div>;
  }
);

Container.displayName = "Container";

// ============================================================================
// PAGE CONTAINER COMPONENT
// ============================================================================

interface PageContainerProps extends Omit<ContainerProps, "asMain"> {
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: number;
}

const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      children,
      className,
      style,
      header,
      footer,
      sidebar,
      sidebarWidth = 64,
      size = "full",
      padding = 6,
      center = true,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen flex flex-col", className)}
        style={style}
      >
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-50 w-full">
            {header}
          </header>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          {sidebar && (
            <aside
              className="flex-shrink-0 h-screen sticky top-0"
              style={{ width: sidebarWidth }}
            >
              {sidebar}
            </aside>
          )}

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 overflow-auto",
              sidebar && `ml-${sidebarWidth / 4}`
            )}
          >
            <Container
              size={size}
              padding={padding}
              center={center}
              className="py-6"
            >
              {children}
            </Container>
          </main>
        </div>

        {/* Footer */}
        {footer && (
          <footer className="w-full mt-auto">
            {footer}
          </footer>
        )}
      </div>
    );
  }
);

PageContainer.displayName = "PageContainer";

// ============================================================================
// SECTION CONTAINER COMPONENT
// ============================================================================

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  as?: "section" | "div" | "article" | "aside";
  fullBleed?: boolean;
  background?: string;
}

const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  (
    {
      children,
      className,
      style,
      id,
      as: Component = "section",
      fullBleed = false,
      background,
    },
    ref
  ) => {
    const sectionClasses = cn(
      "w-full",
      fullBleed && "full-bleed",
      className
    );

    const sectionStyle: CSSProperties = {
      ...(background && { backgroundColor: background }),
      ...style,
    };

    return (
      <Component
        ref={ref as any}
        id={id}
        className={sectionClasses}
        style={sectionStyle}
      >
        {children}
      </Component>
    );
  }
);

SectionContainer.displayName = "SectionContainer";

// ============================================================================
// EXPORTS
// ============================================================================

export { Container, PageContainer, SectionContainer };
export type { ContainerProps, PageContainerProps, SectionContainerProps, ContainerSize, PaddingValue };
