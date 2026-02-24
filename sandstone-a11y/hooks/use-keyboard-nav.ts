"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseArrowNavigationOptions {
  itemSelector: string;
  onSelect?: (element: HTMLElement) => void;
  onEscape?: () => void;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
}

/**
 * useArrowNavigation hook - provides arrow key navigation for lists and menus
 */
export function useArrowNavigation({
  itemSelector,
  onSelect,
  onEscape,
  loop = true,
  orientation = "vertical",
}: UseArrowNavigationOptions) {
  const containerRef = useRef<HTMLElement>(null);

  const getItems = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemSelector));
  }, [itemSelector]);

  const focusItem = useCallback((index: number) => {
    const items = getItems();
    if (items[index]) {
      items[index].focus();
    }
  }, [getItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = getItems();
    if (items.length === 0) return;

    const currentIndex = items.findIndex((item) => item === document.activeElement);
    const isHorizontal = orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    switch (e.key) {
      case nextKey:
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          focusItem(currentIndex + 1);
        } else if (loop) {
          focusItem(0);
        }
        break;

      case prevKey:
        e.preventDefault();
        if (currentIndex > 0) {
          focusItem(currentIndex - 1);
        } else if (loop) {
          focusItem(items.length - 1);
        }
        break;

      case "Home":
        e.preventDefault();
        focusItem(0);
        break;

      case "End":
        e.preventDefault();
        focusItem(items.length - 1);
        break;

      case "Enter":
      case " ":
        if (currentIndex >= 0 && onSelect) {
          e.preventDefault();
          onSelect(items[currentIndex]);
        }
        break;

      case "Escape":
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;
    }
  }, [getItems, focusItem, loop, orientation, onSelect, onEscape]);

  return { containerRef, handleKeyDown };
}

interface UseTabNavigationOptions {
  onTabChange?: (index: number) => void;
  initialIndex?: number;
}

/**
 * useTabNavigation hook - provides keyboard navigation for tabs
 */
export function useTabNavigation({
  onTabChange,
  initialIndex = 0,
}: UseTabNavigationOptions = {}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  const registerTab = useCallback((index: number) => (el: HTMLElement | null) => {
    tabRefs.current[index] = el;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const tabs = tabRefs.current.filter(Boolean);
    const tabCount = tabs.length;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        const nextIndex = (index + 1) % tabCount;
        setActiveIndex(nextIndex);
        tabs[nextIndex]?.focus();
        onTabChange?.(nextIndex);
        break;

      case "ArrowLeft":
        e.preventDefault();
        const prevIndex = (index - 1 + tabCount) % tabCount;
        setActiveIndex(prevIndex);
        tabs[prevIndex]?.focus();
        onTabChange?.(prevIndex);
        break;

      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        tabs[0]?.focus();
        onTabChange?.(0);
        break;

      case "End":
        e.preventDefault();
        const lastIndex = tabCount - 1;
        setActiveIndex(lastIndex);
        tabs[lastIndex]?.focus();
        onTabChange?.(lastIndex);
        break;
    }
  }, [onTabChange]);

  const activateTab = useCallback((index: number) => {
    setActiveIndex(index);
    tabRefs.current[index]?.focus();
    onTabChange?.(index);
  }, [onTabChange]);

  return {
    activeIndex,
    registerTab,
    handleKeyDown,
    activateTab,
  };
}

import { useState } from "react";

interface UseTypeaheadOptions {
  items: string[];
  onSelect: (item: string) => void;
  clearOnSelect?: boolean;
}

/**
 * useTypeahead hook - provides typeahead search functionality
 */
export function useTypeahead({
  items,
  onSelect,
  clearOnSelect = true,
}: UseTypeaheadOptions) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Only handle printable characters
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update query
    const newQuery = query + e.key.toLowerCase();
    setQuery(newQuery);

    // Find matching item
    const match = items.find((item) =>
      item.toLowerCase().startsWith(newQuery)
    );

    if (match) {
      onSelect(match);
    }

    // Clear query after delay
    timeoutRef.current = setTimeout(() => {
      setQuery("");
    }, 500);
  }, [query, items, onSelect]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { handleKeyDown, query };
}

/**
 * useShortcut hook - provides keyboard shortcut functionality
 */
export function useShortcut(
  key: string,
  callback: () => void,
  options?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = options?.ctrl ? e.ctrlKey : !e.ctrlKey;
      const altMatch = options?.alt ? e.altKey : !e.altKey;
      const shiftMatch = options?.shift ? e.shiftKey : !e.shiftKey;
      const metaMatch = options?.meta ? e.metaKey : !e.metaKey;

      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}

/**
 * useFocusVisible hook - tracks if focus is from keyboard (for focus-visible styling)
 */
export function useFocusVisible() {
  const [isKeyboardFocus, setIsKeyboardFocus] = useState(false);

  useEffect(() => {
    const handleKeyDown = () => setIsKeyboardFocus(true);
    const handleMouseDown = () => setIsKeyboardFocus(false);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isKeyboardFocus;
}
