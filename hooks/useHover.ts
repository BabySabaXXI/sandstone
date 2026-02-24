import { useState, useCallback, useRef, RefObject, useEffect } from "react";

export interface UseHoverReturn<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T>;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export interface UseHoverOptions {
  onEnter?: () => void;
  onLeave?: () => void;
}

/**
 * Custom hook to track hover state of an element
 * Features: ref-based tracking, enter/leave callbacks
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  options: UseHoverOptions = {}
): UseHoverReturn<T> {
  const { onEnter, onLeave } = options;
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
    onEnter?.();
  }, [onEnter]);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    onLeave?.();
  }, [onLeave]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mouseenter", onMouseEnter);
    element.addEventListener("mouseleave", onMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", onMouseEnter);
      element.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [onMouseEnter, onMouseLeave]);

  return {
    ref,
    isHovered,
    onMouseEnter,
    onMouseLeave,
  };
}

export interface UseHoverDelayOptions extends UseHoverOptions {
  enterDelay?: number;
  leaveDelay?: number;
}

export interface UseHoverDelayReturn<T extends HTMLElement = HTMLElement> {
  ref: RefObject<T>;
  isHovered: boolean;
}

/**
 * Custom hook to track hover state with delay
 * Features: configurable enter and leave delays
 */
export function useHoverDelay<T extends HTMLElement = HTMLElement>(
  options: UseHoverDelayOptions = {}
): UseHoverDelayReturn<T> {
  const { onEnter, onLeave, enterDelay = 0, leaveDelay = 0 } = options;
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }

      if (enterDelay === 0) {
        setIsHovered(true);
        onEnter?.();
      } else {
        enterTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
          onEnter?.();
        }, enterDelay);
      }
    };

    const handleMouseLeave = () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
        enterTimeoutRef.current = null;
      }

      if (leaveDelay === 0) {
        setIsHovered(false);
        onLeave?.();
      } else {
        leaveTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
          onLeave?.();
        }, leaveDelay);
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);

      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, [enterDelay, leaveDelay, onEnter, onLeave]);

  return {
    ref,
    isHovered,
  };
}

export default useHover;
