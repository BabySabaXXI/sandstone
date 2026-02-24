"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/**
 * useAnnounce hook - provides a way to announce messages to screen readers
 * @param politeness - "polite" (default) or "assertive"
 * @returns { announce, announcement, clearAnnouncement }
 */
export function useAnnounce(politeness: "polite" | "assertive" = "polite") {
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((message: string, duration = 1000) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the announcement
    setAnnouncement(message);

    // Clear after duration
    timeoutRef.current = setTimeout(() => {
      setAnnouncement("");
    }, duration);
  }, []);

  const clearAnnouncement = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setAnnouncement("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, announcement, clearAnnouncement, politeness };
}

/**
 * useLoadingAnnounce hook - announces loading states
 * @param loadingText - Text to announce when loading
 * @param successText - Text to announce on success
 * @param errorText - Text to announce on error
 */
export function useLoadingAnnounce(
  loadingText: string,
  successText?: string,
  errorText?: string
) {
  const { announce, announcement, clearAnnouncement } = useAnnounce("polite");

  const announceLoading = useCallback(() => {
    announce(loadingText);
  }, [announce, loadingText]);

  const announceSuccess = useCallback(() => {
    if (successText) {
      announce(successText);
    }
  }, [announce, successText]);

  const announceError = useCallback(() => {
    if (errorText) {
      announce(errorText);
    }
  }, [announce, errorText]);

  return {
    announceLoading,
    announceSuccess,
    announceError,
    announcement,
    clearAnnouncement,
  };
}

/**
 * usePageAnnounce hook - announces page changes
 */
export function usePageAnnounce(pageTitle: string) {
  const { announce } = useAnnounce("polite");

  useEffect(() => {
    // Update document title
    document.title = `${pageTitle} | Sandstone`;
    
    // Announce page change
    announce(`Navigated to ${pageTitle}`);
  }, [pageTitle, announce]);
}
