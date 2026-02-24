"use client";

/**
 * Micro-Interactions Hooks Library
 * 
 * A collection of React hooks for adding delightful micro-interactions
 * to the Sandstone Design System.
 */

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  RefObject,
  CSSProperties,
} from "react";

// ============================================
// Types
// ============================================

export interface RippleOptions {
  color?: string;
  duration?: number;
  maxSize?: number;
}

export interface HoverOptions {
  scale?: number;
  lift?: number;
  duration?: number;
}

export interface PressOptions {
  scale?: number;
  duration?: number;
}

export interface MagneticOptions {
  strength?: number;
  radius?: number;
}

export interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
}

export interface StaggerOptions {
  staggerDelay?: number;
  initialDelay?: number;
}

// ============================================
// Use Ripple Effect
// ============================================

/**
 * useRipple - Creates a ripple effect on click
 * 
 * @example
 * ```tsx
 * const { ref, createRipple } = useRipple({ color: 'rgba(255,255,255,0.3)' });
 * 
 * <button ref={ref} onClick={createRipple}>
 *   Click me
 * </button>
 * ```
 */
export function useRipple(options: RippleOptions = {}) {
  const { color = "rgba(255, 255, 255, 0.3)", duration = 600, maxSize = 300 } = options;
  const ref = useRef<HTMLElement>(null);

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const size = Math.min(maxSize, Math.max(rect.width, rect.height));
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        animation: ripple ${duration}ms cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;

      element.style.position = "relative";
      element.style.overflow = "hidden";
      element.appendChild(ripple);

      setTimeout(() => ripple.remove(), duration);
    },
    [color, duration, maxSize]
  );

  return { ref, createRipple };
}

// ============================================
// Use Hover Animation
// ============================================

/**
 * useHoverAnimation - Smooth hover animations with scale and lift
 * 
 * @example
 * ```tsx
 * const { ref, style, isHovered } = useHoverAnimation({ scale: 1.02, lift: -4 });
 * 
 * <div ref={ref} style={style}>
 *   Hover me
 * </div>
 * ```
 */
export function useHoverAnimation(options: HoverOptions = {}) {
  const { scale = 1.02, lift = 0, duration = 200 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    transform: "scale(1) translateY(0)",
    transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      setIsHovered(true);
      setStyle({
        transform: `scale(${scale}) translateY(${lift}px)`,
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setStyle({
        transform: "scale(1) translateY(0)",
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [scale, lift, duration]);

  return { ref, style, isHovered };
}

// ============================================
// Use Press Animation
// ============================================

/**
 * usePressAnimation - Press/tap animations for buttons
 * 
 * @example
 * ```tsx
 * const { ref, style, isPressed } = usePressAnimation({ scale: 0.98 });
 * 
 * <button ref={ref} style={style}>
 *   Press me
 * </button>
 * ```
 */
export function usePressAnimation(options: PressOptions = {}) {
  const { scale = 0.98, duration = 100 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({
    transform: "scale(1)",
    transition: `transform ${duration}ms ease-out`,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseDown = () => {
      setIsPressed(true);
      setStyle({
        transform: `scale(${scale})`,
        transition: `transform ${duration}ms ease-out`,
      });
    };

    const handleMouseUp = () => {
      setIsPressed(false);
      setStyle({
        transform: "scale(1)",
        transition: `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
      });
    };

    const handleMouseLeave = () => {
      if (isPressed) {
        setIsPressed(false);
        setStyle({
          transform: "scale(1)",
          transition: `transform ${duration}ms ease-out`,
        });
      }
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);
    element.addEventListener("mouseleave", handleMouseLeave);

    // Touch events for mobile
    element.addEventListener("touchstart", handleMouseDown);
    element.addEventListener("touchend", handleMouseUp);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("touchstart", handleMouseDown);
      element.removeEventListener("touchend", handleMouseUp);
    };
  }, [scale, duration, isPressed]);

  return { ref, style, isPressed };
}

// ============================================
// Use Magnetic Effect
// ============================================

/**
 * useMagnetic - Magnetic pull effect towards cursor
 * 
 * @example
 * ```tsx
 * const { ref, style } = useMagnetic({ strength: 0.3, radius: 100 });
 * 
 * <button ref={ref} style={style}>
 *   Magnetic
 * </button>
 * ```
 */
export function useMagnetic(options: MagneticOptions = {}) {
  const { strength = 0.3, radius = 100 } = options;
  const ref = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    transform: "translate(0, 0)",
    transition: "transform 0.2s ease-out",
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        setStyle({
          transform: `translate(${distanceX * pull}px, ${distanceY * pull}px)`,
          transition: "transform 0.1s ease-out",
        });
      } else {
        setStyle({
          transform: "translate(0, 0)",
          transition: "transform 0.3s ease-out",
        });
      }
    };

    const handleMouseLeave = () => {
      setStyle({
        transform: "translate(0, 0)",
        transition: "transform 0.3s ease-out",
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, radius]);

  return { ref, style };
}

// ============================================
// Use Stagger Animation
// ============================================

/**
 * useStaggerAnimation - Staggered animations for lists
 * 
 * @example
 * ```tsx
 * const { getItemStyle, containerStyle } = useStaggerAnimation(5, { staggerDelay: 100 });
 * 
 * <div style={containerStyle}>
 *   {items.map((item, i) => (
 *     <div key={item.id} style={getItemStyle(i)}>
 *       {item.content}
 *     </div>
 *   ))}
 * </div>
 * ```
 */
export function useStaggerAnimation(itemCount: number, options: StaggerOptions = {}) {
  const { staggerDelay = 50, initialDelay = 0 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const containerStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${staggerDelay}ms ease-out`,
  };

  const getItemStyle = (index: number): CSSProperties => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 400ms cubic-bezier(0.16, 1, 0.3, 1) ${initialDelay + index * staggerDelay}ms,
                 transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${initialDelay + index * staggerDelay}ms`,
  });

  return { containerRef, containerStyle, getItemStyle, isVisible };
}

// ============================================
// Use Count Up Animation
// ============================================

/**
 * useCountUp - Animates a number counting up
 * 
 * @example
 * ```tsx
 * const count = useCountUp(1000, { duration: 2000, delay: 500 });
 * 
 * <span>{Math.round(count)}</span>
 * ```
 */
export function useCountUp(
  endValue: number,
  options: { duration?: number; delay?: number; startOnMount?: boolean } = {}
) {
  const { duration = 1000, delay = 0, startOnMount = true } = options;
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const start = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);

    const startTime = performance.now();
    const startDelay = delay;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime - startDelay;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = eased * endValue;

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration, delay, hasStarted]);

  useEffect(() => {
    if (startOnMount) {
      const timer = setTimeout(start, delay);
      return () => clearTimeout(timer);
    }
  }, [startOnMount, start, delay]);

  return { count, start };
}

// ============================================
// Use Typewriter Effect
// ============================================

/**
 * useTypewriter - Typewriter text effect
 * 
 * @example
 * ```tsx
 * const { displayText, isTyping, isComplete } = useTypewriter("Hello World", { speed: 50 });
 * 
 * <span>{displayText}</span>
 * ```
 */
export function useTypewriter(
  text: string,
  options: { speed?: number; delay?: number; startOnMount?: boolean } = {}
) {
  const { speed = 50, delay = 0, startOnMount = true } = options;
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  const start = useCallback(() => {
    if (isTyping || isComplete) return;

    setIsTyping(true);
    indexRef.current = 0;

    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        setTimeout(type, speed);
      } else {
        setIsTyping(false);
        setIsComplete(true);
      }
    };

    setTimeout(type, delay);
  }, [text, speed, delay, isTyping, isComplete]);

  const reset = useCallback(() => {
    setDisplayText("");
    setIsTyping(false);
    setIsComplete(false);
    indexRef.current = 0;
  }, []);

  useEffect(() => {
    if (startOnMount) {
      start();
    }
  }, [startOnMount, start]);

  return { displayText, isTyping, isComplete, start, reset };
}

// ============================================
// Use Confetti
// ============================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
}

/**
 * useConfetti - Trigger confetti explosion
 * 
 * @example
 * ```tsx
 * const { trigger, pieces } = useConfetti({ count: 50 });
 * 
 * <button onClick={trigger}>Celebrate!</button>
 * {pieces.map(piece => <ConfettiPiece key={piece.id} {...piece} />)}
 * ```
 */
export function useConfetti(options: { count?: number; colors?: string[] } = {}) {
  const { count = 50, colors = ["#E8D5C4", "#A8C5A8", "#A8C5D4", "#E5D4A8", "#D4A8A8"] } = options;
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  const trigger = useCallback(
    (originX?: number, originY?: number) => {
      const x = originX ?? window.innerWidth / 2;
      const y = originY ?? window.innerHeight / 2;

      const newPieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x,
        y,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 20,
        speedY: (Math.random() - 0.5) * 20 - 10,
      }));

      setPieces(newPieces);
      setIsActive(true);

      // Animate and remove pieces
      const animate = () => {
        setPieces((prev) => {
          const updated = prev
            .map((piece) => ({
              ...piece,
              x: piece.x + piece.speedX,
              y: piece.y + piece.speedY,
              rotation: piece.rotation + 10,
              speedY: piece.speedY + 0.5, // gravity
            }))
            .filter((piece) => piece.y < window.innerHeight + 100);

          if (updated.length === 0) {
            setIsActive(false);
          }

          return updated;
        });
      };

      const interval = setInterval(animate, 16);

      setTimeout(() => {
        clearInterval(interval);
        setPieces([]);
        setIsActive(false);
      }, 3000);
    },
    [count, colors]
  );

  return { trigger, pieces, isActive };
}

// ============================================
// Use Focus Ring
// ============================================

/**
 * useFocusRing - Enhanced focus ring with animation
 * 
 * @example
 * ```tsx
 * const { ref, isFocused, focusProps } = useFocusRing();
 * 
 * <input ref={ref} {...focusProps} className={isFocused ? 'ring-2' : ''} />
 * ```
 */
export function useFocusRing() {
  const ref = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  };

  return { ref, isFocused, focusProps };
}

// ============================================
// Use Loading State
// ============================================

/**
 * useLoadingState - Manages loading state with minimum duration
 * 
 * @example
 * ```tsx
 * const { isLoading, startLoading, stopLoading } = useLoadingState({ minDuration: 1000 });
 * 
 * <button onClick={async () => {
 *   startLoading();
 *   await fetchData();
 *   stopLoading();
 * }}>
 *   {isLoading ? 'Loading...' : 'Submit'}
 * </button>
 * ```
 */
export function useLoadingState(options: { minDuration?: number; delay?: number } = {}) {
  const { minDuration = 0, delay = 0 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      startTimeRef.current = Date.now();
    }, delay);
  }, [delay]);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDuration - elapsed);

    if (remaining > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    } else {
      setIsLoading(false);
    }
  }, [minDuration]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isLoading, startLoading, stopLoading };
}

// ============================================
// Use Shake
// ============================================

/**
 * useShake - Shake animation for error feedback
 * 
 * @example
 * ```tsx
 * const { ref, style, shake } = useShake();
 * 
 * <div ref={ref} style={style}>
 *   <input onInvalid={shake} />
 * </div>
 * ```
 */
export function useShake(options: { intensity?: number; duration?: number } = {}) {
  const { intensity = 8, duration = 500 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(() => {
    if (isShaking) return;

    setIsShaking(true);
    const element = ref.current;
    if (!element) return;

    const keyframes = [
      { transform: "translateX(0)" },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: `translateX(-${intensity}px)` },
      { transform: `translateX(${intensity}px)` },
      { transform: "translateX(0)" },
    ];

    element.animate(keyframes, {
      duration,
      easing: "ease-in-out",
    });

    setTimeout(() => setIsShaking(false), duration);
  }, [intensity, duration, isShaking]);

  const style: CSSProperties = {
    transform: isShaking ? undefined : "translateX(0)",
  };

  return { ref, style, shake, isShaking };
}

// ============================================
// Use Toast Animation
// ============================================

/**
 * useToastAnimation - Toast notification animations
 * 
 * @example
 * ```tsx
 * const { style, enter, exit } = useToastAnimation({ position: 'top-right' });
 * 
 * <div style={style}>Toast message</div>
 * ```
 */
export function useToastAnimation(options: { position?: string; duration?: number } = {}) {
  const { position = "top-right", duration = 300 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const getInitialTransform = () => {
    switch (position) {
      case "top-right":
      case "bottom-right":
        return "translateX(100%)";
      case "top-left":
      case "bottom-left":
        return "translateX(-100%)";
      case "top-center":
        return "translateY(-100%)";
      case "bottom-center":
        return "translateY(100%)";
      default:
        return "translateX(100%)";
    }
  };

  const style: CSSProperties = {
    opacity: isVisible && !isExiting ? 1 : 0,
    transform: isVisible && !isExiting ? "translate(0, 0)" : getInitialTransform(),
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  };

  const enter = useCallback(() => {
    setIsVisible(true);
    setIsExiting(false);
  }, []);

  const exit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => setIsVisible(false), duration);
  }, [duration]);

  return { style, enter, exit, isVisible };
}

// ============================================
// Use Scroll Progress
// ============================================

/**
 * useScrollProgress - Track scroll progress for animations
 * 
 * @example
 * ```tsx
 * const { progress, ref } = useScrollProgress();
 * 
 * <div ref={ref}>
 *   <div style={{ transform: `scale(${progress})` }} />
 * </div>
 * ```
 */
export function useScrollProgress() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate progress from when element enters viewport to when it leaves
      const scrollProgress = Math.max(
        0,
        Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight))
      );

      setProgress(scrollProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { progress, ref };
}

// ============================================
// Use Bounce
// ============================================

/**
 * useBounce - Bounce animation hook
 * 
 * @example
 * ```tsx
 * const { ref, style, bounce } = useBounce();
 * 
 * <div ref={ref} style={style} onClick={bounce}>
 *   Bounce me
 * </div>
 * ```
 */
export function useBounce(options: { height?: number; duration?: number } = {}) {
  const { height = 10, duration = 400 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isBouncing, setIsBouncing] = useState(false);

  const bounce = useCallback(() => {
    if (isBouncing) return;

    setIsBouncing(true);
    const element = ref.current;
    if (!element) return;

    const keyframes = [
      { transform: "translateY(0)", easing: "ease-out" },
      { transform: `translateY(-${height}px)`, easing: "ease-in" },
      { transform: "translateY(0)", easing: "ease-out" },
    ];

    element.animate(keyframes, { duration });

    setTimeout(() => setIsBouncing(false), duration);
  }, [height, duration, isBouncing]);

  const style: CSSProperties = {};

  return { ref, style, bounce, isBouncing };
}

// ============================================
// Use Pulse
// ============================================

/**
 * usePulse - Pulse animation for attention
 * 
 * @example
 * ```tsx
 * const { ref, style, pulse } = usePulse();
 * 
 * <div ref={ref} style={style}>
 *   Notice me
 * </div>
 * ```
 */
export function usePulse(options: { scale?: number; duration?: number } = {}) {
  const { scale = 1.05, duration = 1000 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isPulsing, setIsPulsing] = useState(false);

  const pulse = useCallback(() => {
    if (isPulsing) return;

    setIsPulsing(true);
    const element = ref.current;
    if (!element) return;

    const keyframes = [
      { transform: "scale(1)" },
      { transform: `scale(${scale})` },
      { transform: "scale(1)" },
    ];

    element.animate(keyframes, {
      duration,
      easing: "ease-in-out",
    });

    setTimeout(() => setIsPulsing(false), duration);
  }, [scale, duration, isPulsing]);

  const style: CSSProperties = {};

  return { ref, style, pulse, isPulsing };
}

// ============================================
// Export all hooks
// ============================================

export const microInteractionHooks = {
  useRipple,
  useHoverAnimation,
  usePressAnimation,
  useMagnetic,
  useStaggerAnimation,
  useCountUp,
  useTypewriter,
  useConfetti,
  useFocusRing,
  useLoadingState,
  useShake,
  useToastAnimation,
  useScrollProgress,
  useBounce,
  usePulse,
};

export default microInteractionHooks;
