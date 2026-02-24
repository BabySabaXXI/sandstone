"use client";

import { useState, useEffect } from "react";

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

export function useMobile(): MobileState {
  const [state, setState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    viewportWidth: 1024,
    viewportHeight: 768,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check for touch capability
      const isTouchDevice = 
        "ontouchstart" in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        (window.DocumentTouch && document instanceof window.DocumentTouch);

      setState({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        isTouch: isTouchDevice,
        viewportWidth: width,
        viewportHeight: height,
      });
    };

    // Check on mount
    checkDevice();

    // Listen for resize events
    window.addEventListener("resize", checkDevice);
    
    // Listen for orientation change on mobile
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  return state;
}

export default useMobile;
