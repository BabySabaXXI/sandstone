"use client";

import { memo, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface FlashcardProps {
  front: string;
  back: string;
  onRate?: (quality: number) => void;
  showRating?: boolean;
}

interface RatingButtonProps {
  rating: number;
  onRate: (rating: number) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const RATINGS = [1, 2, 3, 4, 5] as const;

const RATING_LABELS = ["Again", "Hard", "Good", "Easy", "Perfect"] as const;

const RATING_STYLES = {
  low: "bg-[#D4A8A8]/20 text-[#8B5A5A] hover:bg-[#D4A8A8]/40",
  medium: "bg-[#E5D4A8]/20 text-[#8B7A4A] hover:bg-[#E5D4A8]/40",
  high: "bg-[#A8C5A8]/20 text-[#4A6A4A] hover:bg-[#A8C5A8]/40",
} as const;

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const RatingButton = memo(function RatingButton({
  rating,
  onRate,
}: RatingButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRate(rating);
    },
    [rating, onRate]
  );

  const styleClass =
    rating <= 2
      ? RATING_STYLES.low
      : rating === 3
      ? RATING_STYLES.medium
      : RATING_STYLES.high;

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-12 h-12 rounded-xl font-semibold transition-all duration-200",
        styleClass
      )}
      aria-label={`Rate as ${RATING_LABELS[rating - 1]}`}
    >
      {rating}
    </button>
  );
});

const RatingPanel = memo(function RatingPanel({
  onRate,
}: {
  onRate: (quality: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-6"
    >
      <p className="text-center text-[#5A5A5A] text-sm mb-4">
        How well did you know this?
      </p>
      <div className="flex justify-center gap-2">
        {RATINGS.map((rating) => (
          <RatingButton key={rating} rating={rating} onRate={onRate} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-[#8A8A8A] mt-2 px-2">
        {RATING_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </motion.div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Flashcard = memo(function Flashcard({
  front,
  back,
  onRate,
  showRating = true,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Memoized handlers
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (quality: number) => {
      onRate?.(quality);
      setIsFlipped(false);
    },
    [onRate]
  );

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div
        className="relative h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-label="Flashcard. Click to flip."
        aria-pressed={isFlipped}
      >
        <motion.div
          className="w-full h-full relative"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-full bg-white rounded-2xl border border-[#E5E5E0] shadow-card-hover p-8 flex flex-col items-center justify-center">
              <span className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4">
                Question
              </span>
              <p className="text-[#2D2D2D] text-xl text-center font-medium">
                {front}
              </p>
              <p className="text-[#8A8A8A] text-sm mt-8">Click to flip</p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#F5F5F0] to-white rounded-2xl border border-[#E8D5C4] shadow-card-hover p-8 flex flex-col items-center justify-center">
              <span className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4">
                Answer
              </span>
              <p className="text-[#2D2D2D] text-xl text-center font-medium">
                {back}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && showRating && <RatingPanel onRate={handleRate} />}
      </AnimatePresence>
    </div>
  );
});

export default Flashcard;
