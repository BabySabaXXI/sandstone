"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { gpuOptimized } from "./animation-config";

interface TemplateWrapperProps {
  children: ReactNode;
}

/**
 * TemplateWrapper - Wraps page content with smooth transitions
 * 
 * This component should be used in your page.tsx files or layout templates
 * to provide smooth page transitions throughout the app.
 * 
 * @example
 * ```tsx
 * // In app/(app)/dashboard/page.tsx
 * export default function DashboardPage() {
 *   return (
 *     <TemplateWrapper>
 *       <DashboardContent />
 *     </TemplateWrapper>
 *   );
 * }
 * ```
 */
export function TemplateWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * PageWrapper - Alternative wrapper with more dramatic transitions
 * 
 * @example
 * ```tsx
 * <PageWrapper>
 *   <YourContent />
 * </PageWrapper>
 * ```
 */
export function PageWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.98 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * FadeWrapper - Simple fade transition wrapper
 * 
 * @example
 * ```tsx
 * <FadeWrapper>
 *   <YourContent />
 * </FadeWrapper>
 * ```
 */
export function FadeWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * SlideWrapper - Slide transition wrapper
 * 
 * @example
 * ```tsx
 * <SlideWrapper direction="left">
 *   <YourContent />
 * </SlideWrapper>
 * ```
 */
interface SlideWrapperProps extends TemplateWrapperProps {
  direction?: "left" | "right" | "up" | "down";
}

export function SlideWrapper({ 
  children, 
  direction = "right" 
}: SlideWrapperProps) {
  const pathname = usePathname();

  const directionOffset = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: -50 },
    down: { x: 0, y: 50 },
  };

  const offset = directionOffset[direction];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, ...offset }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * ScaleWrapper - Scale transition wrapper
 * 
 * @example
 * ```tsx
 * <ScaleWrapper>
 *   <YourContent />
 * </ScaleWrapper>
 * ```
 */
export function ScaleWrapper({ children }: TemplateWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        style={gpuOptimized}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
