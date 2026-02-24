"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getRatingLabel, getRatingColor, formatInterval } from "@/lib/flashcards/sm2-enhanced";
import { Volume2, Bookmark, MoreHorizontal } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface FlashcardProps {
  id: string;
  front: string;
  back: string;
  interval?: number;
  repetitionCount?: number;
  easeFactor?: number;
  onRate?: (quality: number, timeSpent: number) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  showRating?: boolean;
  showShortcuts?: boolean;
  className?: string;
  flipOnSpace?: boolean;
  autoFlipDelay?: number; // Auto flip after X seconds (0 = disabled)
}

// ============================================================================
// RATING BUTTON COMPONENT
// ============================================================================

interface RatingButtonProps {
  rating: number;
  onClick: (rating: number) => void;
  disabled?: boolean;
  showInterval?: boolean;
  interval?: number;
}

const RatingButton = memo(function RatingButton({
  rating,
  onClick,
  disabled,
  showInterval,
  interval,
}: RatingButtonProps) {
  const label = getRatingLabel(rating);
  const color = getRatingColor(rating);
  
  const getButtonStyles = () => {
    if (rating <= 1) return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
    if (rating === 2) return "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200";
    if (rating === 3) return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
    if (rating === 4) return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200";
  };

  return (
    <button
      onClick={() => onClick(rating)}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-3 rounded-xl border-2",
        "transition-all duration-200 min-w-[80px]",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        getButtonStyles(),
        disabled && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
      style={{ borderColor: color }}
      aria-label={`Rate ${label}`}
    >
      <span className="text-lg font-bold">{rating}</span>
      <span className="text-xs font-medium">{label}</span>
      {showInterval && interval !== undefined && (
        <span className="text-[10px] opacity-70 mt-1">
          {formatInterval(interval)}
        </span>
      )}
    </button>
  );
});

// ============================================================================
// CARD FACE COMPONENT
// ============================================================================

interface CardFaceProps {
  children: React.ReactNode;
  label: string;
  hint?: string;
  className?: string;
}

const CardFace = memo(function CardFace({ children, label, hint, className }: CardFaceProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full backface-hidden",
        "flex flex-col items-center justify-center",
        className
      )}
      style={{ backfaceVisibility: "hidden" }}
    >
      <span className="absolute top-6 left-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      
      <div className="px-8 py-12 text-center max-w-full overflow-auto">
        {children}
      </div>
      
      {hint && (
        <span className="absolute bottom-6 text-sm text-muted-foreground animate-pulse">
          {hint}
        </span>
      )}
    </div>
  );
});

// ============================================================================
// MAIN FLASHCARD COMPONENT
// ============================================================================

export const Flashcard = memo(function Flashcard({
  id,
  front,
  back,
  interval = 0,
  repetitionCount = 0,
  easeFactor = 2.5,
  onRate,
  onBookmark,
  isBookmarked = false,
  showRating = true,
  showShortcuts = true,
  className,
  flipOnSpace = true,
  autoFlipDelay = 0,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const autoFlipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setStartTime(Date.now());
    
    // Set up auto-flip if enabled
    if (autoFlipDelay > 0 && !isFlipped) {
      autoFlipTimerRef.current = setTimeout(() => {
        setIsFlipped(true);
      }, autoFlipDelay * 1000);
    }
    
    return () => {
      if (autoFlipTimerRef.current) {
        clearTimeout(autoFlipTimerRef.current);
      }
    };
  }, [id, autoFlipDelay]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && flipOnSpace && !isFlipped) {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped && showRating) {
        const rating = parseInt(e.key);
        if (rating >= 1 && rating <= 5) {
          e.preventDefault();
          handleRate(rating);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, flipOnSpace, showRating]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    
    // Clear auto-flip timer if manually flipped
    if (autoFlipTimerRef.current) {
      clearTimeout(autoFlipTimerRef.current);
      autoFlipTimerRef.current = null;
    }
  }, []);

  const handleRate = useCallback(
    (quality: number) => {
      const timeSpent = Date.now() - startTime;
      onRate?.(quality, timeSpent);
      setIsFlipped(false);
    },
    [onRate, startTime]
  );

  const handleBookmark = useCallback(() => {
    onBookmark?.(id);
  }, [onBookmark, id]);

  // Calculate estimated intervals for each rating
  const getEstimatedInterval = (rating: number): number => {
    if (rating < 3) return 1;
    if (repetitionCount === 0) return rating === 3 ? 1 : rating === 4 ? 2 : 4;
    if (repetitionCount === 1) return rating === 3 ? 3 : rating === 4 ? 6 : 8;
    return Math.round(interval * easeFactor * (rating === 5 ? 1.3 : rating === 4 ? 1.1 : 1));
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Card Container */}
      <div
        className="relative h-80 sm:h-96 cursor-pointer perspective-1000"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Flashcard - click to flip"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <CardFace
            label="Question"
            hint="Click or press Space to flip"
            className="bg-white rounded-2xl border-2 border-border shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="absolute top-4 right-4 flex gap-2">
              {onBookmark && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmark();
                  }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isBookmarked
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50"
                  )}
                  aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                >
                  <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                </button>
              )}
            </div>
            <p className="text-xl sm:text-2xl text-foreground font-medium leading-relaxed">
              {front}
            </p>
          </CardFace>

          {/* Back */}
          <CardFace
            label="Answer"
            className="bg-gradient-to-br from-muted/50 to-background rounded-2xl border-2 border-primary/20 shadow-lg"
            style={{ transform: "rotateY(180deg)" }}
          >
            <p className="text-xl sm:text-2xl text-foreground font-medium leading-relaxed">
              {back}
            </p>
            
            {/* Card Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-xs text-muted-foreground">
              <span>Interval: {formatInterval(interval)}</span>
              <span>Reviews: {repetitionCount}</span>
              <span>Ease: {easeFactor.toFixed(2)}</span>
            </div>
          </CardFace>
        </motion.div>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && showRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <p className="text-center text-muted-foreground text-sm mb-4">
              How well did you know this?
            </p>
            <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rating) => (
                <RatingButton
                  key={rating}
                  rating={rating}
                  onClick={(r) => {
                    handleRate(r);
                  }}
                  showInterval
                  interval={getEstimatedInterval(rating)}
                />
              ))}
            </div>

            {/* Keyboard Shortcuts Hint */}
            {showShortcuts && (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">1-5</kbd>
                  {" "}to rate
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flip Hint (when not flipped) */}
      {!isFlipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Space</kbd>
            {" "}or click to flip
          </p>
        </motion.div>
      )}
    </div>
  );
});

export default Flashcard;
