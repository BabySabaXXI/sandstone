"use client";

/**
 * Feedback Animations Component
 * 
 * A collection of animated feedback components for:
 * - Success states
 * - Error states
 * - Loading states
 * - Warning states
 * - Info states
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface FeedbackAnimationProps {
  show?: boolean;
  message?: string;
  className?: string;
  onComplete?: () => void;
  duration?: number;
}

// ============================================
// Success Animation
// ============================================

export const SuccessAnimation: React.FC<FeedbackAnimationProps> = ({
  show = true,
  message = "Success!",
  className,
  onComplete,
  duration = 2000,
}) => {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-6",
            className
          )}
        >
          <motion.div
            className="relative w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-full bg-sage-100"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-sage-100"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            />
            
            {/* Checkmark */}
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <Check className="w-8 h-8 text-sage-300" strokeWidth={3} />
            </motion.div>
          </motion.div>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-lg font-medium text-sage-300"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Error Animation
// ============================================

export const ErrorAnimation: React.FC<FeedbackAnimationProps> = ({
  show = true,
  message = "Something went wrong!",
  className,
  onComplete,
  duration = 2000,
}) => {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-6",
            className
          )}
        >
          <motion.div
            className="relative w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.1, 1] }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Shake animation */}
            <motion.div
              animate={{
                x: [0, -5, 5, -5, 5, 0],
              }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <X className="w-8 h-8 text-rose-200" strokeWidth={3} />
            </motion.div>
          </motion.div>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-lg font-medium text-rose-200"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Loading Animation
// ============================================

export interface LoadingAnimationProps {
  show?: boolean;
  message?: string;
  className?: string;
  variant?: "spinner" | "dots" | "pulse" | "bars";
  size?: "sm" | "md" | "lg";
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  show = true,
  message = "Loading...",
  className,
  variant = "spinner",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className={cn(sizeClasses[size], "text-primary")} />
          </motion.div>
        );

      case "dots":
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full bg-primary",
                  size === "sm" && "w-2 h-2",
                  size === "md" && "w-3 h-3",
                  size === "lg" && "w-4 h-4"
                )}
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <motion.div
            className={cn(
              "rounded-full bg-primary",
              sizeClasses[size]
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );

      case "bars":
        return (
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-2 bg-primary rounded-sm"
                animate={{
                  height: ["20%", "80%", "20%"],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "flex flex-col items-center justify-center gap-4",
            className
          )}
        >
          {renderLoader()}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Warning Animation
// ============================================

export const WarningAnimation: React.FC<FeedbackAnimationProps> = ({
  show = true,
  message = "Warning!",
  className,
  onComplete,
  duration = 2000,
}) => {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-6",
            className
          )}
        >
          <motion.div
            className="relative w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Wiggle animation */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <AlertCircle className="w-8 h-8 text-amber-200" strokeWidth={3} />
            </motion.div>
          </motion.div>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-lg font-medium text-amber-200"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Info Animation
// ============================================

export const InfoAnimation: React.FC<FeedbackAnimationProps> = ({
  show = true,
  message = "Information",
  className,
  onComplete,
  duration = 2000,
}) => {
  React.useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-6",
            className
          )}
        >
          <motion.div
            className="relative w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Info className="w-8 h-8 text-blue-300" strokeWidth={3} />
            </motion.div>
          </motion.div>
          
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-lg font-medium text-blue-300"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Confetti Animation
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

export interface ConfettiAnimationProps {
  trigger?: boolean;
  originX?: number;
  originY?: number;
  count?: number;
  colors?: string[];
  className?: string;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger = false,
  originX,
  originY,
  count = 50,
  colors = ["#E8D5C4", "#A8C5A8", "#A8C5D4", "#E5D4A8", "#D4A8A8"],
  className,
}) => {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);
  const animationRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (trigger) {
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

      const animate = () => {
        setPieces((prev) => {
          const updated = prev
            .map((piece) => ({
              ...piece,
              x: piece.x + piece.speedX,
              y: piece.y + piece.speedY,
              rotation: piece.rotation + 10,
              speedY: piece.speedY + 0.5,
            }))
            .filter((piece) => piece.y < window.innerHeight + 100);

          if (updated.length === 0 && animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }

          return updated;
        });

        if (pieces.length > 0) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [trigger, originX, originY, count, colors]);

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-50", className)}>
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              left: piece.x,
              top: piece.y,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Toast Notification
// ============================================

export interface ToastProps {
  show?: boolean;
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
  className?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const Toast: React.FC<ToastProps> = ({
  show = true,
  type = "info",
  title,
  message,
  className,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  React.useEffect(() => {
    if (show && autoClose && onClose) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  const typeConfig = {
    success: {
      bg: "bg-sage-100",
      border: "border-sage-200",
      icon: Check,
      iconColor: "text-sage-300",
    },
    error: {
      bg: "bg-rose-100",
      border: "border-rose-200",
      icon: X,
      iconColor: "text-rose-200",
    },
    warning: {
      bg: "bg-amber-100",
      border: "border-amber-200",
      icon: AlertCircle,
      iconColor: "text-amber-200",
    },
    info: {
      bg: "bg-blue-100",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-300",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm",
            config.bg,
            config.border,
            className
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
          >
            <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconColor)} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <p className="font-medium text-foreground">{title}</p>
            )}
            {message && (
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            )}
          </div>
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}

          {/* Progress bar for auto-close */}
          {autoClose && (
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 h-0.5 rounded-full",
                config.iconColor.replace("text-", "bg-")
              )}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Skeleton Loading
// ============================================

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect" | "card";
  lines?: number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "text",
  lines = 1,
  animate = true,
}) => {
  const baseClasses = "bg-sand-200 rounded-lg";
  const shimmerClasses = animate
    ? "relative overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-shimmer"
    : "";

  if (variant === "card") {
    return (
      <div className={cn("space-y-4 p-4", className)}>
        <div className={cn("h-4 w-1/3", baseClasses, shimmerClasses)} />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4",
                i === lines - 1 ? "w-3/4" : "w-full",
                baseClasses,
                shimmerClasses
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  const variantClasses = {
    text: "h-4 w-full",
    circle: "w-10 h-10 rounded-full",
    rect: "h-32 w-full",
  };

  if (lines > 1 && variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              variantClasses[variant],
              baseClasses,
              shimmerClasses,
              i === lines - 1 && "w-3/4"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        baseClasses,
        shimmerClasses,
        className
      )}
    />
  );
};

// ============================================
// Export all components
// ============================================

export const FeedbackAnimations = {
  Success: SuccessAnimation,
  Error: ErrorAnimation,
  Loading: LoadingAnimation,
  Warning: WarningAnimation,
  Info: InfoAnimation,
  Confetti: ConfettiAnimation,
  Toast,
  Skeleton,
};

export default FeedbackAnimations;
