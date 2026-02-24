"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
  initialFocus?: boolean;
  returnFocus?: boolean;
}

export function FocusTrap({ 
  children, 
  isActive, 
  onEscape,
  initialFocus = true,
  returnFocus = true 
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (isActive && returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isActive, returnFocus]);

  // Handle initial focus
  useEffect(() => {
    if (isActive && initialFocus && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        // Focus the first focusable element, or the one with data-autofocus
        const autofocusElement = containerRef.current.querySelector('[data-autofocus]') as HTMLElement;
        (autofocusElement || focusableElements[0])?.focus();
      }
    }
  }, [isActive, initialFocus]);

  // Return focus when trap is deactivated
  useEffect(() => {
    return () => {
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [returnFocus]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, onEscape]);

  // Handle tab key to trap focus
  const handleTabKey = useCallback((e: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      handleTabKey(e);
    }
  }, [handleTabKey]);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef} 
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      {children}
    </div>
  );
}

// Helper function to get all focusable elements within a container
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
  );

  // Filter out elements that are not visible
  return elements.filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}

// Hook for using focus trap
export function useFocusTrap(isActive: boolean, options?: {
  onEscape?: () => void;
  initialFocus?: boolean;
  returnFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && containerRef.current && options?.initialFocus !== false) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isActive, options?.initialFocus]);

  useEffect(() => {
    return () => {
      if (options?.returnFocus !== false && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [options?.returnFocus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && options?.onEscape) {
        e.preventDefault();
        options.onEscape();
      }
    };

    if (isActive) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, options?.onEscape]);

  return containerRef;
}
