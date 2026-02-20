"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { DeckManager } from "@/components/flashcards/DeckManager";
import { StudyMode } from "@/components/flashcards/StudyMode";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function FlashcardsPage() {
  const { currentDeckId, setCurrentDeck, getDeck, fetchDecks, syncing } = useFlashcardStore();
  const [isStudying, setIsStudying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentDeck = currentDeckId ? getDeck(currentDeckId) : null;

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setIsLoading(true);
    await fetchDecks();
    setIsLoading(false);
  };

  const handleStudy = async (deckId: string) => {
    setCurrentDeck(deckId);
    setIsStudying(true);
  };

  const handleExitStudy = () => {
    setIsStudying(false);
    setCurrentDeck(null);
  };

  const handleRefresh = async () => {
    await loadDecks();
    toast.success("Flashcards refreshed");
  };

  return (
    <ThreePanel>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-[#E8D5C4]" />
              <h1 className="text-h1 text-[#2D2D2D]">Flashcards</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={syncing || isLoading}
              className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", (syncing || isLoading) && "animate-spin")} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
          <p className="text-[#5A5A5A]">
            Study vocabulary with spaced repetition
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isStudying && currentDeckId ? (
            <motion.div
              key="study"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StudyMode deckId={currentDeckId} onExit={handleExitStudy} />
            </motion.div>
          ) : (
            <motion.div
              key="decks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DeckManager />
              
              {/* Study Button for Selected Deck */}
              {currentDeck && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#2D2D2D]">{currentDeck.name}</h3>
                      <p className="text-sm text-[#5A5A5A]">
                        {currentDeck.cards.length} cards
                      </p>
                    </div>
                    <button
                      onClick={() => handleStudy(currentDeck.id)}
                      className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                    >
                      Study Now
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
