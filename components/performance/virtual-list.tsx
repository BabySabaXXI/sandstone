/**
 * Virtual List Component
 * 
 * High-performance virtualized list rendering for large datasets.
 * Only renders visible items, dramatically improving performance for long lists.
 */

"use client";

import { useRef, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  keyExtractor?: (item: T, index: number) => string;
}

interface VirtualItem<T> {
  item: T;
  index: number;
  style: React.CSSProperties;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className,
  containerHeight = 400,
  onEndReached,
  endReachedThreshold = 200,
  keyExtractor,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerMeasuredHeight, setContainerMeasuredHeight] = useState(0);

  // Measure container height
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerMeasuredHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      setContainerMeasuredHeight(containerRef.current.clientHeight);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Calculate visible range
  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    const visibleHeight = containerMeasuredHeight || (typeof containerHeight === 'number' ? containerHeight : 400);
    const totalItems = items.length;
    const totalHeight = totalItems * itemHeight;
    
    // Calculate visible range with overscan
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(visibleHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount);
    
    // Generate virtual items
    const virtualItems: VirtualItem<T>[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (i < totalItems) {
        virtualItems.push({
          item: items[i],
          index: i,
          style: {
            position: "absolute",
            top: i * itemHeight,
            height: itemHeight,
            left: 0,
            right: 0,
          },
        });
      }
    }
    
    return { virtualItems, totalHeight, startIndex, endIndex };
  }, [items, itemHeight, scrollTop, containerMeasuredHeight, overscan, containerHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    // Check if end is reached
    if (onEndReached) {
      const visibleHeight = containerMeasuredHeight || (typeof containerHeight === 'number' ? containerHeight : 400);
      const totalHeight = items.length * itemHeight;
      const scrollBottom = newScrollTop + visibleHeight;
      
      if (totalHeight - scrollBottom < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [containerMeasuredHeight, containerHeight, items.length, itemHeight, onEndReached, endReachedThreshold]);

  // Use passive scroll listener for better performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePassiveScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener("scroll", handlePassiveScroll, { passive: true });
    return () => container.removeEventListener("scroll", handlePassiveScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : index}
            style={style}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Grid virtualization for card layouts
interface VirtualGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  columns: number;
  gap?: number;
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
  onEndReached?: () => void;
  keyExtractor?: (item: T, index: number) => string;
}

export function VirtualGrid<T>({
  items,
  renderItem,
  itemHeight,
  columns,
  gap = 16,
  overscan = 2,
  className,
  containerHeight = 400,
  onEndReached,
  keyExtractor,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      setContainerWidth(containerRef.current.clientWidth);
      
      return () => resizeObserver.disconnect();
    }
  }, []);

  const { virtualItems, totalHeight } = useMemo(() => {
    const totalRows = Math.ceil(items.length / columns);
    const totalHeight = totalRows * (itemHeight + gap);
    
    const containerMeasuredHeight = containerRef.current?.clientHeight || 400;
    const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const visibleRows = Math.ceil(containerMeasuredHeight / (itemHeight + gap)) + overscan * 2;
    const endRow = Math.min(totalRows - 1, startRow + visibleRows);
    
    const virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }> = [];
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          const itemWidth = (containerWidth - (columns - 1) * gap) / columns;
          
          virtualItems.push({
            item: items[index],
            index,
            style: {
              position: "absolute",
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            },
          });
        }
      }
    }
    
    return { virtualItems, totalHeight };
  }, [items, columns, itemHeight, gap, scrollTop, containerWidth, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    
    if (onEndReached) {
      const containerHeight = containerRef.current?.clientHeight || 400;
      const totalRows = Math.ceil(items.length / columns);
      const totalHeight = totalRows * (itemHeight + gap);
      
      if (totalHeight - (newScrollTop + containerHeight) < 200) {
        onEndReached();
      }
    }
  }, [items.length, columns, itemHeight, gap, onEndReached]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : index}
            style={style}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Window scroller for full-page virtualization
interface WindowScrollerProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  keyExtractor?: (item: T, index: number) => string;
}

export function WindowScroller<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 5,
  className,
  onEndReached,
  keyExtractor,
}: WindowScrollerProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
      
      if (onEndReached) {
        const totalHeight = items.length * itemHeight;
        const scrollBottom = window.scrollY + window.innerHeight;
        
        if (totalHeight - scrollBottom < 200) {
          onEndReached();
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items.length, itemHeight, onEndReached]);

  const { virtualItems, totalHeight } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(windowHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount);
    
    const virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }> = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (i < items.length) {
        virtualItems.push({
          item: items[i],
          index: i,
          style: {
            position: "absolute",
            top: i * itemHeight,
            height: itemHeight,
            left: 0,
            right: 0,
          },
        });
      }
    }
    
    return { virtualItems, totalHeight };
  }, [items, itemHeight, scrollTop, windowHeight, overscan]);

  return (
    <div className={cn("relative", className)} style={{ height: totalHeight }}>
      {virtualItems.map(({ item, index, style }) => (
        <div
          key={keyExtractor ? keyExtractor(item, index) : index}
          style={style}
        >
          {renderItem(item, index, style)}
        </div>
      ))}
    </div>
  );
}
