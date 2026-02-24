"use client";

import { useEffect, RefObject } from "react";

/**
 * Custom hook for detecting clicks outside a referenced element
 * Useful for closing modals, dropdowns, etc.
 * 
 * @param ref - React ref to the element to monitor
 * @param handler - Callback function when click outside is detected
 * 
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useOnClickOutside(modalRef, () => setIsOpen(false));
 * 
 * return (
 *   <div ref={modalRef}>
 *     {/* Modal content *\/}
 *   </div>
 * );
 */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
