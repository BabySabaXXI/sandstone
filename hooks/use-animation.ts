"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnimation, useReducedMotion, AnimationControls } from "framer-motion";

// ============================================
// Types
// ============================================

interface UseAnimatedStateOptions {
  duration?: number;
  delay?: number;
}

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

interface UseCounterAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

// ============================================
// Use Animated State
// ============================================

/**
 * useAnimatedState - State with animated transitions
 * 
 * @example
 * ```tsx
 * const [isOpen, toggle] = useAnimatedState(false);
 * 
 * <motion.div animate={{ height: isOpen ? 'auto' : 0 }}>
 *   Content
 * </motion.div>
 * ```
 */
export function useAnimatedState<T>(
  initialValue: T,
  options: UseAnimatedStateOptions = {}
) {
  const { duration = 300, delay = 0 } = options;
  const [value, setValue] = useState<T>(initialValue);
  const [isAnimating, setIsAnimating] = useState(false);

  const setAnimatedValue = useCallback(
    (newValue: T) => {
      setIsAnimating(true);
      setTimeout(() => {
        setValue(newValue);
        setTimeout(() => setIsAnimating(false), duration);
      }, delay);
    },
    [duration, delay]
  );

  const toggle = useCallback(() => {
    if (typeof value === "boolean") {
      setAnimatedValue(!value as T);
    }
  }, [value, setAnimatedValue]);

  return {
    value,
    setValue: setAnimatedValue,
    isAnimating,
    toggle,
  };
}

// ============================================
// Use Scroll Animation
// ============================================

/**
 * useScrollAnimation - Triggers animation on scroll into view
 * 
 * @example
 * ```tsx
 * const { ref, isInView } = useScrollAnimation({ threshold: 0.5 });
 * 
 * <motion.div
 *   ref={ref}
 *   animate={{ opacity: isInView ? 1 : 0 }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", once = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}

// ============================================
// Use Counter Animation
// ============================================

/**
 * useCounterAnimation - Animates a number counting up
 * 
 * @example
 * ```tsx
 * const count = useCounterAnimation(1000, { duration: 2000 });
 * 
 * <span>{Math.round(count)}</span>
 * ```
 */
export function useCounterAnimation(
  endValue: number,
  options: UseCounterAnimationOptions = {}
) {
  const { duration = 1000, delay = 0, easing = (t) => t } = options;
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current - delay;

      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const currentValue = easedProgress * endValue;

      setCount(currentValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [endValue, duration, delay, easing]);

  return count;
}

// ============================================
// Use Stagger Animation
// ============================================

/**
 * useStaggerAnimation - Controls staggered animations
 * 
 * @example
 * ```tsx
 * const { controls, start } = useStaggerAnimation(5, 0.1);
 * 
 * useEffect(() => {
 *   start();
 * }, []);
 * 
 * {items.map((item, i) => (
 *   <motion.div
 *     key={item.id}
 *     custom={i}
 *     animate={controls}
 *     variants={itemVariants}
 *   >
 *     {item.content}
 *   </motion.div>
 * ))}
 * ```
 */
export function useStaggerAnimation(itemCount: number, staggerDelay: number = 0.1) {
  const controls = useAnimation();

  const start = useCallback(async () => {
    await controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * staggerDelay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    }));
  }, [controls, staggerDelay]);

  const stop = useCallback(async () => {
    await controls.start({
      opacity: 0,
      y: 20,
      transition: { duration: 0.2 },
    });
  }, [controls]);

  const reset = useCallback(() => {
    controls.set({ opacity: 0, y: 20 });
  }, [controls]);

  return { controls, start, stop, reset };
}

// ============================================
// Use Animation Sequence
// ============================================

/**
 * useAnimationSequence - Chains multiple animations
 * 
 * @example
 * ```tsx
 * const { runSequence } = useAnimationSequence([
 *   { target: 'fadeIn', duration: 0.5 },
 *   { target: 'slideUp', duration: 0.3, delay: 0.2 },
 *   { target: 'scale', duration: 0.4 },
 * ]);
 * 
 * useEffect(() => {
 *   runSequence();
 * }, []);
 * ```
 */
export function useAnimationSequence(
  sequence: Array<{
    target: string;
    duration: number;
    delay?: number;
  }>
) {
  const controls = useAnimation();

  const runSequence = useCallback(async () => {
    for (const step of sequence) {
      await controls.start(step.target, {
        duration: step.duration,
        delay: step.delay || 0,
      });
    }
  }, [controls, sequence]);

  return { controls, runSequence };
}

// ============================================
// Use Gesture State
// ============================================

interface GestureState {
  isDragging: boolean;
  isHovering: boolean;
  isPressed: boolean;
}

/**
 * useGestureState - Tracks gesture states
 * 
 * @example
 * ```tsx
 * const { ref, state } = useGestureState();
 * 
 * <motion.div
 *   ref={ref}
 *   animate={{
 *     scale: state.isPressed ? 0.95 : state.isHovering ? 1.05 : 1,
 *   }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useGestureState() {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<GestureState>({
    isDragging: false,
    isHovering: false,
    isPressed: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () =>
      setState((prev) => ({ ...prev, isHovering: true }));
    const handleMouseLeave = () =>
      setState((prev) => ({ ...prev, isHovering: false, isPressed: false }));
    const handleMouseDown = () =>
      setState((prev) => ({ ...prev, isPressed: true }));
    const handleMouseUp = () =>
      setState((prev) => ({ ...prev, isPressed: false }));

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { ref, state };
}

// ============================================
// Use Parallax
// ============================================

interface ParallaxOptions {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
}

/**
 * useParallax - Creates parallax scrolling effect
 * 
 * @example
 * ```tsx
 * const { ref, y } = useParallax({ speed: 0.5 });
 * 
 * <motion.div ref={ref} style={{ y }}>
 *   Parallax content
 * </motion.div>
 * ```
 */
export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, direction = "up" } = options;
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const relativeScroll = scrolled - elementTop + window.innerHeight;

      const multiplier = direction === "up" || direction === "left" ? -1 : 1;
      const axis = direction === "up" || direction === "down" ? "y" : "x";

      setOffset(relativeScroll * speed * multiplier);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  const style =
    direction === "up" || direction === "down"
      ? { y: offset }
      : { x: offset };

  return { ref, offset, style };
}

// ============================================
// Use Reduced Motion
// ============================================

/**
 * useReducedMotionPreference - Enhanced reduced motion hook
 * 
 * @example
 * ```tsx
 * const { shouldReduceMotion, prefersReducedMotion } = useReducedMotionPreference();
 * 
 * <motion.div
 *   animate={shouldReduceMotion ? {} : { rotate: 360 }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useReducedMotionPreference() {
  const prefersReducedMotion = useReducedMotion();
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for saved user preference
    const saved = localStorage.getItem("reduce-motion");
    if (saved !== null) {
      setUserPreference(saved === "true");
    }
  }, []);

  const shouldReduceMotion = userPreference ?? prefersReducedMotion ?? false;

  const setPreference = useCallback((value: boolean) => {
    setUserPreference(value);
    localStorage.setItem("reduce-motion", String(value));
  }, []);

  return {
    shouldReduceMotion,
    prefersReducedMotion,
    userPreference,
    setPreference,
  };
}

// ============================================
// Use Loading State
// ============================================

interface LoadingStateOptions {
  minDuration?: number;
  delay?: number;
}

/**
 * useLoadingState - Manages loading state with minimum duration
 * 
 * @example
 * ```tsx
 * const { isLoading, startLoading, stopLoading } = useLoadingState({ minDuration: 1000 });
 * 
 * const handleSubmit = async () => {
 *   startLoading();
 *   await submitData();
 *   stopLoading();
 * };
 * ```
 */
export function useLoadingState(options: LoadingStateOptions = {}) {
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
// Use Hover Intent
// ============================================

interface HoverIntentOptions {
  delay?: number;
  sensitivity?: number;
}

/**
 * useHoverIntent - Detects intentional hover (not accidental)
 * 
 * @example
 * ```tsx
 * const { ref, isHovered } = useHoverIntent({ delay: 150 });
 * 
 * <div ref={ref}>
 *   {isHovered && <Tooltip>Content</Tooltip>}
 * </div>
 * ```
 */
export function useHoverIntent(options: HoverIntentOptions = {}) {
  const { delay = 150, sensitivity = 7 } = options;
  const ref = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, delay);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsHovered(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { x: lastX, y: lastY } = mousePositionRef.current;

      const distance = Math.sqrt(
        Math.pow(clientX - lastX, 2) + Math.pow(clientY - lastY, 2)
      );

      if (distance > sensitivity) {
        mousePositionRef.current = { x: clientX, y: clientY };

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsHovered(true);
        }, delay);
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, sensitivity]);

  return { ref, isHovered };
}

// ============================================
// Use Spring Animation
// ============================================

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

/**
 * useSpringAnimation - Creates spring-based animation values
 * 
 * @example
 * ```tsx
 * const { value, setTarget } = useSpringAnimation(0, { stiffness: 300, damping: 30 });
 * 
 * <motion.div style={{ x: value }} />
 * 
 * setTarget(100); // Animates to 100
 * ```
 */
export function useSpringAnimation(
  initialValue: number,
  options: SpringOptions = {}
) {
  const { stiffness = 300, damping = 30, mass = 1 } = options;
  const [value, setValue] = useState(initialValue);
  const targetRef = useRef(initialValue);
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    const target = targetRef.current;
    const current = value;
    const velocity = velocityRef.current;

    const springForce = (target - current) * stiffness;
    const dampingForce = velocity * damping;
    const acceleration = (springForce - dampingForce) / mass;

    velocityRef.current = velocity + acceleration * 0.016; // ~60fps
    const newValue = current + velocityRef.current * 0.016;

    setValue(newValue);

    const isSettled =
      Math.abs(target - newValue) < 0.01 && Math.abs(velocityRef.current) < 0.01;

    if (!isSettled) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      setValue(target);
      velocityRef.current = 0;
    }
  }, [stiffness, damping, mass, value]);

  const setTarget = useCallback(
    (newTarget: number) => {
      targetRef.current = newTarget;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [animate]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { value, setTarget };
}

// ============================================
// Use Animated List
// ============================================

interface AnimatedListItem {
  id: string;
  [key: string]: unknown;
}

/**
 * useAnimatedList - Manages list animations (add/remove/reorder)
 * 
 * @example
 * ```tsx
 * const { items, addItem, removeItem } = useAnimatedList(initialItems);
 * 
 * <AnimatePresence>
 *   {items.map(item => (
 *     <motion.div
 *       key={item.id}
 *       initial={{ opacity: 0, x: -20 }}
 *       animate={{ opacity: 1, x: 0 }}
 *       exit={{ opacity: 0, x: 20 }}
 *     >
 *       {item.content}
 *     </motion.div>
 *   ))}
 * </AnimatePresence>
 * ```
 */
export function useAnimatedList<T extends AnimatedListItem>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const addItem = useCallback((item: T, index?: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      if (index !== undefined) {
        newItems.splice(index, 0, item);
      } else {
        newItems.push(item);
      }
      return newItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const reorderItems = useCallback((newOrder: string[]) => {
    setItems((prev) => {
      const itemMap = new Map(prev.map((item) => [item.id, item]));
      return newOrder
        .map((id) => itemMap.get(id))
        .filter((item): item is T => item !== undefined);
    });
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    setItems,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    clearItems,
  };
}
