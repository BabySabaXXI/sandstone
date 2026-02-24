"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Compass,
  Target,
  Footprints,
  Flag,
  CheckCircle2,
  AlertCircle,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// TYPES
// =============================================================================

type IndicatorType = "location" | "progress" | "direction" | "status" | "milestone";
type IndicatorPosition = "top" | "bottom" | "left" | "right" | "inline";
type IndicatorSize = "sm" | "md" | "lg";

interface WayfindingIndicatorProps {
  type: IndicatorType;
  position?: IndicatorPosition;
  size?: IndicatorSize;
  className?: string;
}

interface LocationIndicatorProps {
  currentSection: string;
  sections: { id: string; label: string; href?: string }[];
  showProgress?: boolean;
  className?: string;
}

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

interface DirectionIndicatorProps {
  direction: "up" | "down" | "left" | "right";
  label?: string;
  pulse?: boolean;
  className?: string;
}

interface StatusIndicatorProps {
  status: "idle" | "loading" | "success" | "error" | "warning";
  message?: string;
  showIcon?: boolean;
  className?: string;
}

interface MilestoneIndicatorProps {
  milestones: {
    label: string;
    completed: boolean;
    current?: boolean;
    description?: string;
  }[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

interface ScrollIndicatorProps {
  showOnScroll?: boolean;
  threshold?: number;
  className?: string;
}

interface ReadingProgressProps {
  targetRef?: React.RefObject<HTMLElement>;
  className?: string;
}

// =============================================================================
// LOCATION INDICATOR
// =============================================================================

export const LocationIndicator = memo(function LocationIndicator({
  currentSection,
  sections,
  showProgress = true,
  className,
}: LocationIndicatorProps) {
  const currentIndex = sections.findIndex((s) => s.id === currentSection);
  const progress = ((currentIndex + 1) / sections.length) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Current Location */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">
          {sections[currentIndex]?.label || "Unknown"}
        </span>
        <Badge variant="secondary" className="text-xs">
          {currentIndex + 1} of {sections.length}
        </Badge>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start</span>
            <span>Complete</span>
          </div>
        </div>
      )}

      {/* Section Dots */}
      <div className="flex items-center gap-2">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index < currentIndex && "bg-accent",
              index === currentIndex && "bg-accent ring-2 ring-accent/30",
              index > currentIndex && "bg-muted"
            )}
            animate={
              index === currentIndex
                ? { scale: [1, 1.2, 1] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 2 }}
          />
        ))}
      </div>
    </div>
  );
});

// =============================================================================
// PROGRESS INDICATOR
// =============================================================================

export const ProgressIndicator = memo(function ProgressIndicator({
  current,
  total,
  label,
  showPercentage = true,
  className,
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);
  const isComplete = current >= total;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          {label && <span className="text-sm font-medium">{label}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {current} / {total}
          </span>
          {showPercentage && (
            <Badge
              variant={isComplete ? "default" : "secondary"}
              className="text-xs"
            >
              {percentage}%
            </Badge>
          )}
        </div>
      </div>

      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isComplete ? "bg-green-500" : "bg-accent"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />

        {/* Animated stripe for incomplete */}
        {!isComplete && (
          <motion.div
            className="absolute inset-y-0 left-0 w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        )}
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-green-500"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Complete!</span>
        </motion.div>
      )}
    </div>
  );
});

// =============================================================================
// DIRECTION INDICATOR
// =============================================================================

export const DirectionIndicator = memo(function DirectionIndicator({
  direction,
  label,
  pulse = true,
  className,
}: DirectionIndicatorProps) {
  const rotations = {
    up: -90,
    down: 90,
    left: 180,
    right: 0,
  };

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      animate={pulse ? { opacity: [0.5, 1, 0.5] } : {}}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <Navigation
        className="w-4 h-4"
        style={{ transform: `rotate(${rotations[direction]}deg)` }}
      />
      {label && <span>{label}</span>}
    </motion.div>
  );
});

// =============================================================================
// STATUS INDICATOR
// =============================================================================

export const StatusIndicator = memo(function StatusIndicator({
  status,
  message,
  showIcon = true,
  className,
}: StatusIndicatorProps) {
  const config = {
    idle: {
      icon: Info,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      pulse: false,
    },
    loading: {
      icon: Compass,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      pulse: true,
    },
    success: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      pulse: false,
    },
    error: {
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      pulse: false,
    },
    warning: {
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      pulse: false,
    },
  };

  const { icon: Icon, color, bgColor, pulse } = config[status];

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        bgColor,
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {showIcon && (
        <motion.div
          animate={pulse ? { rotate: 360 } : {}}
          transition={pulse ? { repeat: Infinity, duration: 2, ease: "linear" } : {}}
        >
          <Icon className={cn("w-4 h-4", color)} />
        </motion.div>
      )}
      {message && <span className={cn("text-sm", color)}>{message}</span>}
    </motion.div>
  );
});

// =============================================================================
// MILESTONE INDICATOR
// =============================================================================

export const MilestoneIndicator = memo(function MilestoneIndicator({
  milestones,
  orientation = "horizontal",
  className,
}: MilestoneIndicatorProps) {
  const isHorizontal = orientation === "horizontal";
  const currentIndex = milestones.findIndex((m) => m.current);

  return (
    <div
      className={cn(
        isHorizontal ? "flex items-start gap-4" : "space-y-4",
        className
      )}
    >
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.completed;
        const isCurrent = milestone.current;
        const isPending = !isCompleted && !isCurrent;

        return (
          <div
            key={index}
            className={cn(
              "flex",
              isHorizontal ? "flex-col items-center flex-1" : "items-start gap-3"
            )}
          >
            {/* Milestone Icon */}
            <motion.div
              className={cn(
                "relative flex items-center justify-center rounded-full",
                isHorizontal ? "w-10 h-10" : "w-8 h-8",
                isCompleted && "bg-green-500 text-white",
                isCurrent && "bg-accent text-accent-foreground ring-4 ring-accent/20",
                isPending && "bg-muted text-muted-foreground"
              )}
              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {isCompleted ? (
                <CheckCircle2 className={isHorizontal ? "w-5 h-5" : "w-4 h-4"} />
              ) : (
                <Flag className={isHorizontal ? "w-5 h-5" : "w-4 h-4"} />
              )}

              {/* Connector */}
              {isHorizontal && index < milestones.length - 1 && (
                <div
                  className={cn(
                    "absolute left-full w-full h-0.5 -z-10",
                    isCompleted ? "bg-green-500" : "bg-muted"
                  )}
                  style={{ width: "calc(100% + 1rem)" }}
                />
              )}
            </motion.div>

            {/* Milestone Content */}
            <div
              className={cn(
                "text-center",
                isHorizontal ? "mt-2" : "flex-1"
              )}
            >
              <p
                className={cn(
                  "font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                  isHorizontal && "text-sm"
                )}
              >
                {milestone.label}
              </p>
              {milestone.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {milestone.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// =============================================================================
// SCROLL INDICATOR
// =============================================================================

export const ScrollIndicator = memo(function ScrollIndicator({
  showOnScroll = true,
  threshold = 100,
  className,
}: ScrollIndicatorProps) {
  const [show, setShow] = useState(!showOnScroll);
  const [direction, setDirection] = useState<"up" | "down">("down");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      if (showOnScroll) {
        setShow(currentScrollY > threshold);
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY) {
        setDirection("down");
      } else {
        setDirection("up");
      }

      // Check if near bottom
      if (currentScrollY + windowHeight >= scrollHeight - 50) {
        setDirection("up");
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showOnScroll, threshold]);

  const scrollTo = useCallback(() => {
    if (direction === "down") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [direction]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollTo}
          className={cn(
            "fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-background border rounded-full shadow-lg hover:shadow-xl transition-shadow",
            className
          )}
          aria-label={direction === "down" ? "Scroll to bottom" : "Scroll to top"}
        >
          <Footprints className="w-4 h-4" />
          <span className="text-sm">
            {direction === "down" ? "Continue" : "Back to top"}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

// =============================================================================
// READING PROGRESS
// =============================================================================

export const ReadingProgress = memo(function ReadingProgress({
  targetRef,
  className,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const target = targetRef?.current || document.documentElement;
      const scrollTop = window.scrollY;
      const docHeight = target.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [targetRef]);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-accent"
          style={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      <div className="absolute right-4 top-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
        {Math.round(progress)}%
      </div>
    </div>
  );
});

// =============================================================================
// CONTEXTUAL WAYFINDING
// =============================================================================

export const ContextualWayfinding = memo(function ContextualWayfinding({
  children,
  showBreadcrumbs = true,
  showProgress = true,
  showShortcuts = true,
  className,
}: {
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
  showProgress?: boolean;
  showShortcuts?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Reading Progress */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
          <motion.div
            className="h-full bg-accent"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}

      {/* Contextual Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// =============================================================================
// WAYFINDING COMPOSITE
// =============================================================================

export const WayfindingComposite = memo(function WayfindingComposite({
  indicators,
  className,
}: {
  indicators: {
    type: IndicatorType;
    props: Record<string, unknown>;
  }[];
  className?: string;
}) {
  const componentMap: Record<IndicatorType, React.ComponentType<unknown>> = {
    location: LocationIndicator,
    progress: ProgressIndicator,
    direction: DirectionIndicator,
    status: StatusIndicator,
    milestone: MilestoneIndicator,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {indicators.map((indicator, index) => {
        const Component = componentMap[indicator.type];
        return <Component key={index} {...indicator.props} />;
      })}
    </div>
  );
});

export default {
  LocationIndicator,
  ProgressIndicator,
  DirectionIndicator,
  StatusIndicator,
  MilestoneIndicator,
  ScrollIndicator,
  ReadingProgress,
  ContextualWayfinding,
  WayfindingComposite,
};
