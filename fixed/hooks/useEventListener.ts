"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for adding event listeners with automatic cleanup
 * Works with any event target (window, document, elements, etc.)
 * 
 * @param eventName - The event name to listen for
 * @param handler - The event handler function
 * @param element - The target element (default: window)
 * @param options - Event listener options
 * 
 * @example
 * useEventListener("keydown", (event) => {
 *   if (event.key === "Escape") {
 *     closeModal();
 *   }
 * });
 */
export function useEventListener<
  K extends keyof WindowEventMap
>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: AddEventListenerOptions
): void;

export function useEventListener<
  K extends keyof DocumentEventMap
>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document,
  options?: AddEventListenerOptions
): void;

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: T | null,
  options?: AddEventListenerOptions
): void;

export function useEventListener<
  K extends string,
  T extends EventTarget = Window
>(
  eventName: K,
  handler: (event: Event) => void,
  element?: T | null,
  options?: AddEventListenerOptions
): void {
  // Create a ref for the handler to avoid re-subscribing on every render
  const handlerRef = useRef(handler);

  // Update handler ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element ?? window;
    
    if (!targetElement) {
      return;
    }

    const eventListener = (event: Event) => {
      handlerRef.current(event);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}
