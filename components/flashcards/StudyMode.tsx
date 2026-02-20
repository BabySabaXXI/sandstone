"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { Flashcard } from "./Flashcard";
import { ArrowLeft, Clock, CheckCircle, RotateCcw, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyModeProps {
  deckId: string;
  onExit: () => void;
}

export function StudyMode({ deckId, onExit }: StudyModeProps) {
  const { getDeck, getDueCards, reviewCard, setStudyMode } = useFlashcardStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [studyComplete, setStudyComplete] = useState(false);

  const deck = getDeck(deckId);
  const dueCards = deck ? getDueCards(deckId) : [];
  const currentCard = dueCards[currentIndex];

  useEffect(() => {
    setStudyMode("skim");
    return () => setStudyMode(null);
  }, [setStudyMode]);

  const handleRate = (quality: number) => {
    if (currentCard) {
      reviewCard(deckId, currentCard.id, quality);
      setSessionStats((prev) => ({
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        total: prev.total + 1,
      }));

      if (currentIndex < dueCards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setStudyComplete(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionStats({ correct: 0, total: 0 });
    setStudyComplete(false);
  };

  if (!deck) return null;

  if (dueCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 rounded-full bg-[#A8C5A8]/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-[#A8C5A8]" />
        </div>
        <h3 className="text-h2 text-[#2D2D2D] mb-2">All Caught Up!</h3>
        <p className="text-[#5A5A5A] mb-6">No cards due for review right now.</p>
        <button
          onClick={onExit}
          className="bg-[#2D2D2D] text-white px-6 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
        >
          Back to Decks
        </button>
      </motion.div>
    );
  }

  if (studyComplete) {
    const accuracy = sessionStats.total > 0 
      ? Math.round((sessionStats.correct / sessionStats.total) * 100) 
      : 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 max-w-md mx-auto"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A8C5A8] to-[#B8D4B8] flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-h2 text-[#2D2D2D] mb-2">Session Complete!</h3>
        <p className="text-[#5A5A5A] mb-6">
          You reviewed {sessionStats.total} cards
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
            <div className="text-3xl font-bold text-[#A8C5A8]">{accuracy}%</div>
            <div className="text-sm text-[#5A5A5A]">Accuracy</div>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
            <div className="text-3xl font-bold text-[#2D2D2D]">{sessionStats.total}</div>
            <div className="text-sm text-[#5A5A5A]">Cards Reviewed</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-[#F0F0EC] text-[#2D2D2D] px-5 py-2 rounded-lg hover:bg-[#E5E5E0] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Study Again
          </button>
          <button
            onClick={onExit}
            className="bg-[#2D2D2D] text-white px-6 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            Back to Decks
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#2D2D2D] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#8A8A8A] bg-white px-3 py-1.5 rounded-full border border-[#E5E5E0]">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {currentIndex + 1} / {dueCards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#F0F0EC] rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E8D5C4] to-[#F5E6D3] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / dueCards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Flashcard
            front={currentCard.front}
            back={currentCard.back}
            onRate={handleRate}
          />
        </motion.div>
      </AnimatePresence>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-8 text-center">
        <p className="text-xs text-[#8A8A8A]">
          Press <kbd className="px-1.5 py-0.5 bg-[#F0F0EC] rounded text-[#5A5A5A]">Space</kbd> to flip
        </p>
      </div>
    </div>
  );
}
