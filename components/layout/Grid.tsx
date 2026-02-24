"use client";

import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type ColValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type RowValue = 1 | 2 | 3 | 4 | 5 | 6;

interface GridProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Grid columns
  cols?: ColValue;
  colsSm?: ColValue;
  colsMd?: ColValue;
  colsLg?: ColValue;
  colsXl?: ColValue;

  // Gap
  gap?: GapValue;
  gapX?: GapValue;
  gapY?: GapValue;

  // Responsive gap
  gapSm?: GapValue;
  gapMd?: GapValue;
  gapLg?: GapValue;
  gapXl?: GapValue;

  // Auto-fit/fill
  autoFit?: boolean;
  autoFill?: boolean;
  minChildWidth?: string;

  // Flow
  flow?: "row" | "col" | "dense" | "row-dense" | "col-dense";

  // Alignment
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyItems?: "start" | "center" | "end" | "stretch";
  alignContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";
  justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | "stretch";

  // Container query support
  asContainer?: boolean;
  containerName?: string;
}

interface GridItemProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;

  // Column span
  colSpan?: ColValue | "full";
  colSpanSm?: ColValue | "full";
  colSpanMd?: ColValue | "full";
  colSpanLg?: ColValue | "full";
  colSpanXl?: ColValue | "full";

  // Row span
  rowSpan?: RowValue | "full";

  // Start/End positions
  colStart?: ColValue | "auto";
  colEnd?: ColValue | "auto";
  rowStart?: RowValue | "auto";
  rowEnd?: RowValue | "auto";

  // Alignment
  alignSelf?: "auto" | "start" | "center" | "end" | "stretch";
  justifySelf?: "auto" | "start" | "center" | "end" | "stretch";

  // Order
  order?: "first" | "last" | "none" | number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const gapToClass = (gap: GapValue | undefined): string => {
  if (gap === undefined) return "";
  return `gap-${gap}`;
};

const colsToClass = (cols: ColValue | undefined, breakpoint?: string): string => {
  if (cols === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}grid-cols-${cols}`;
};

const colSpanToClass = (span: ColValue | "full" | undefined, breakpoint?: string): string => {
  if (span === undefined) return "";
  const prefix = breakpoint ? `${breakpoint}:` : "";
  return `${prefix}col-span-${span}`;
};

// ============================================================================
// GRID COMPONENT
// ============================================================================

const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      className,
      style,
      cols,
      colsSm,
      colsMd,
      colsLg,
      colsXl,
      gap,
      gapX,
      gapY,
      gapSm,
      gapMd,
      gapLg,
      gapXl,
      autoFit,
      autoFill,
      minChildWidth = "250px",
      flow,
      alignItems,
      justifyItems,
      alignContent,
      justifyContent,
      asContainer = false,
      containerName,
    },
    ref
  ) => {
    const gridClasses = cn(
      "grid",

      // Column definitions
      !autoFit && !autoFill && colsToClass(cols),
      !autoFit && !autoFill && colsToClass(colsSm, "sm"),
      !autoFit && !autoFill && colsToClass(colsMd, "md"),
      !autoFit && !autoFill && colsToClass(colsLg, "lg"),
      !autoFit && !autoFill && colsToClass(colsXl, "xl"),

      // Gap
      gapToClass(gap),
      gapX !== undefined && `gap-x-${gapX}`,
      gapY !== undefined && `gap-y-${gapY}`,
      gapSm !== undefined && `sm:gap-${gapSm}`,
      gapMd !== undefined && `md:gap-${gapMd}`,
      gapLg !== undefined && `lg:gap-${gapLg}`,
      gapXl !== undefined && `xl:gap-${gapXl}`,

      // Flow
      flow === "row" && "grid-flow-row",
      flow === "col" && "grid-flow-col",
      flow === "dense" && "grid-flow-dense",
      flow === "row-dense" && "grid-flow-row-dense",
      flow === "col-dense" && "grid-flow-col-dense",

      // Alignment
      alignItems && `items-${alignItems}`,
      justifyItems && `justify-items-${justifyItems}`,
      alignContent && `content-${alignContent}`,
      justifyContent && `justify-${justifyContent}`,

      className
    );

    const gridStyle: CSSProperties = {
      ...(autoFit && {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minChildWidth}, 1fr))`,
      }),
      ...(autoFill && {
        gridTemplateColumns: `repeat(auto-fill, minmax(${minChildWidth}, 1fr))`,
      }),
      ...style,
    };

    return (
      <div
        ref={ref}
        className={gridClasses}
        style={gridStyle}
        {...(asContainer && { "data-container": containerName || true })}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

// ============================================================================
// GRID ITEM COMPONENT
// ============================================================================

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      children,
      className,
      style,
      colSpan,
      colSpanSm,
      colSpanMd,
      colSpanLg,
      colSpanXl,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      alignSelf,
      justifySelf,
      order,
    },
    ref
  ) => {
    const itemClasses = cn(
      // Column span
      colSpanToClass(colSpan),
      colSpanToClass(colSpanSm, "sm"),
      colSpanToClass(colSpanMd, "md"),
      colSpanToClass(colSpanLg, "lg"),
      colSpanToClass(colSpanXl, "xl"),

      // Row span
      rowSpan && `row-span-${rowSpan}`,

      // Start/End positions
      colStart && `col-start-${colStart}`,
      colEnd && `col-end-${colEnd}`,
      rowStart && `row-start-${rowStart}`,
      rowEnd && `row-end-${rowEnd}`,

      // Alignment
      alignSelf && `self-${alignSelf}`,
      justifySelf && `justify-self-${justifySelf}`,

      // Order
      order === "first" && "order-first",
      order === "last" && "order-last",
      order === "none" && "order-none",
      typeof order === "number" && `order-${order}`,

      className
    );

    return (
      <div ref={ref} className={itemClasses} style={style}>
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";

// ============================================================================
// EXPORTS
// ============================================================================

export { Grid, GridItem };
export type { GridProps, GridItemProps, GapValue, ColValue, RowValue };
