"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  onRate?: (quality: number) => void;
  showRating?: boolean;
  cardNumber?: number;
  totalCards?: number;
}

export function Flashcard({ 
  front, 
  back, 
  onRate, 
  showRating = true,
  cardNumber,
  totalCards 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const cardRef = useRef<HTMLButtonElement>(null);
  const ratingRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const newState = !prev;
      setAnnouncement(newState ? `Card flipped. Answer: ${back}` : `Card flipped. Question: ${front}`);
      return newState;
    });
  }, [front, back]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    } else if (e.key === "ArrowDown" && isFlipped && showRating) {
      e.preventDefault();
      // Focus first rating button
      ratingRefs.current[0]?.focus();
    }
  }, [handleFlip, isFlipped, showRating]);

  const handleRate = useCallback((quality: number) => {
    const ratingLabels = ["Again", "Hard", "Good", "Easy", "Perfect"];
    const label = ratingLabels[quality - 1];
    setAnnouncement(`Rated ${quality} - ${label}`);
    onRate?.(quality);
    setIsFlipped(false);
    // Return focus to card after rating
    setTimeout(() => cardRef.current?.focus(), 100);
  }, [onRate]);

  const ratingLabels = [
    { value: 1, label: "Again", description: "Complete blackout" },
    { value: 2, label: "Hard", description: "Incorrect response" },
    { value: 3, label: "Good", description: "Correct with difficulty" },
    { value: 4, label: "Easy", description: "Correct response" },
    { value: 5, label: "Perfect", description: "Perfect response" },
  ];

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Progress indicator */}
      {cardNumber && totalCards && (
        <div 
          className="mb-4 text-center"
          role="progressbar"
          aria-valuenow={cardNumber}
          aria-valuemin={1}
          aria-valuemax={totalCards}
          aria-label={`Card ${cardNumber} of ${totalCards}`}
        >
          <span className="text-sm text-[#8A8A8A]">
            Card {cardNumber} of {totalCards}
          </span>
          <div className="w-full h-1 bg-[#E5E5E0] rounded-full mt-2">
            <div 
              className="h-full bg-[#E8D5C4] rounded-full transition-all"
              style={{ width: `${(cardNumber / totalCards) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Card Container */}
      <button
        ref={cardRef}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        aria-label={isFlipped ? "Show question" : "Show answer"}
        aria-pressed={isFlipped}
        className="relative h-80 w-full cursor-pointer perspective-1000 focus:outline-none focus:ring-4 focus:ring-[#E8D5C4] focus:ring-offset-4 rounded-2xl"
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-full bg-white rounded-2xl border border-[#E5E5E0] shadow-card-hover p-8 flex flex-col items-center justify-center">
              <span 
                className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4"
                aria-hidden="true"
              >
                Question
              </span>
              <p 
                className="text-[#2D2D2D] text-xl text-center font-medium"
                role="text"
              >
                {front}
              </p>
              <p className="text-[#8A8A8A] text-sm mt-8 flex items-center gap-2">
                <span>Click or press Enter to flip</span>
              </p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#F5F5F0] to-white rounded-2xl border border-[#E8D5C4] shadow-card-hover p-8 flex flex-col items-center justify-center">
              <span 
                className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4"
                aria-hidden="true"
              >
                Answer
              </span>
              <p 
                className="text-[#2D2D2D] text-xl text-center font-medium"
                role="text"
              >
                {back}
              </p>
              <p className="text-[#8A8A8A] text-sm mt-8">
                Click or press Enter to flip back
              </p>
            </div>
          </div>
        </motion.div>
      </button>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && showRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
            role="group"
            aria-label="Rate your recall"
          >
            <p className="text-center text-[#5A5A5A] text-sm mb-4">
              How well did you know this?
            </p>
            <div className="flex justify-center gap-2">
              {ratingLabels.map((rating, index) => (
                <button
                  key={rating.value}
                  ref={(el) => { ratingRefs.current[index] = el; }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(rating.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" && index < 4) {
                      e.preventDefault();
                      ratingRefs.current[index + 1]?.focus();
                    } else if (e.key === "ArrowLeft" && index > 0) {
                      e.preventDefault();
                      ratingRefs.current[index - 1]?.focus();
                    }
                  }}
                  aria-label={`${rating.label}: ${rating.description}`}
                  className={cn(
                    "w-12 h-12 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:ring-offset-2",
                    rating.value <= 2
                      ? "bg-[#D4A8A8]/20 text-[#8B5A5A] hover:bg-[#D4A8A8]/40"
                      : rating.value === 3
                      ? "bg-[#E5D4A8]/20 text-[#8B7A4A] hover:bg-[#E5D4A8]/40"
                      : "bg-[#A8C5A8]/20 text-[#4A6A4A] hover:bg-[#A8C5A8]/40"
                  )}
                >
                  {rating.value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#8A8A8A] mt-2 px-2">
              {ratingLabels.map((rating) => (
                <span key={rating.value} className="w-12 text-center">
                  {rating.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard instructions */}
      <div className="mt-6 text-center text-xs text-[#8A8A8A]">
        <p>Press Enter or Space to flip card</p>
        {isFlipped && showRating && <p className="mt-1">Press Down arrow to access rating</p>}
      </div>
    </div>
  );
}
