import { useEffect, RefObject, useCallback } from "react";

export interface UseOnClickOutsideOptions {
  enabled?: boolean;
  eventTypes?: ("mousedown" | "mouseup" | "touchstart" | "touchend")[];
}

/**
 * Custom hook to handle clicks outside a referenced element
 * Features: multiple event types support, enabled/disabled toggle
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void,
  options: UseOnClickOutsideOptions = {}
): void {
  const { enabled = true, eventTypes = ["mousedown", "touchstart"] } = options;

  const handleEvent = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    },
    [ref, handler]
  );

  useEffect(() => {
    if (!enabled) return;

    eventTypes.forEach((eventType) => {
      document.addEventListener(eventType, handleEvent as EventListener);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        document.removeEventListener(eventType, handleEvent as EventListener);
      });
    };
  }, [enabled, eventTypes, handleEvent]);
}

export default useOnClickOutside;
