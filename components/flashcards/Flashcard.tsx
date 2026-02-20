"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  front: string;
  back: string;
  onRate?: (quality: number) => void;
  showRating?: boolean;
}

export function Flashcard({ front, back, onRate, showRating = true }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (quality: number) => {
    onRate?.(quality);
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container */}
      <div
        className="relative h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
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
              <span className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4">
                Question
              </span>
              <p className="text-[#2D2D2D] text-xl text-center font-medium">{front}</p>
              <p className="text-[#8A8A8A] text-sm mt-8">Click to flip</p>
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
              <span className="text-[#8A8A8A] text-xs uppercase tracking-wider mb-4">
                Answer
              </span>
              <p className="text-[#2D2D2D] text-xl text-center font-medium">{back}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {isFlipped && showRating && (
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
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(rating);
                  }}
                  className={cn(
                    "w-12 h-12 rounded-xl font-semibold transition-all duration-200",
                    rating <= 2
                      ? "bg-[#D4A8A8]/20 text-[#8B5A5A] hover:bg-[#D4A8A8]/40"
                      : rating === 3
                      ? "bg-[#E5D4A8]/20 text-[#8B7A4A] hover:bg-[#E5D4A8]/40"
                      : "bg-[#A8C5A8]/20 text-[#4A6A4A] hover:bg-[#A8C5A8]/40"
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#8A8A8A] mt-2 px-2">
              <span>Again</span>
              <span>Hard</span>
              <span>Good</span>
              <span>Easy</span>
              <span>Perfect</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
