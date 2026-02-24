"use client";

import { useState, useCallback, useRef, TouchEvent } from "react";

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

interface PullToRefreshResult {
  pullDistance: number;
  isPulling: boolean;
  isRefreshing: boolean;
  onTouchStart: (e: TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: () => void;
}

export function usePullToRefresh(config: PullToRefreshConfig): PullToRefreshResult {
  const { onRefresh, threshold = 80, maxPullDistance = 150 } = config;
  
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    // Only allow pull-to-refresh when at the top of the page
    if (window.scrollY > 0) return;
    
    touchStartY.current = e.targetTouches[0].clientY;
    setIsPulling(true);
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;
    
    const touchY = e.targetTouches[0].clientY;
    const diff = touchY - touchStartY.current;
    
    // Only allow pulling down (positive diff)
    if (diff > 0) {
      // Apply resistance to make it feel natural
      const resistedDistance = Math.min(diff * 0.5, maxPullDistance);
      setPullDistance(resistedDistance);
    }
  }, [isPulling, maxPullDistance]);

  const onTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Animate back to 0
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}

export default usePullToRefresh;
