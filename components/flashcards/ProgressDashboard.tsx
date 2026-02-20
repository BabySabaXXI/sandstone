"use client";

import { motion } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { Brain, TrendingUp, Clock, Target, BookOpen, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProgressDashboard() {
  const { decks } = useFlashcardStore();

  // Calculate overall stats
  const totalCards = decks.reduce((acc, deck) => acc + deck.cards.length, 0);
  const totalMastered = decks.reduce(
    (acc, deck) => acc + deck.cards.filter((c) => c.repetitionCount >= 3).length,
    0
  );
  const totalLearning = decks.reduce(
    (acc, deck) => acc + deck.cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 3).length,
    0
  );
  const totalNew = decks.reduce(
    (acc, deck) => acc + deck.cards.filter((c) => c.repetitionCount === 0).length,
    0
  );

  const cardsDueToday = decks.reduce((acc, deck) => {
    const now = new Date();
    return (
      acc +
      deck.cards.filter((c) => !c.nextReview || c.nextReview <= now).length
    );
  }, 0);

  const masteryRate = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  const stats = [
    {
      label: "Total Cards",
      value: totalCards,
      icon: BookOpen,
      color: "bg-[#E8D5C4]",
      textColor: "text-[#8B6A4A]",
    },
    {
      label: "Mastered",
      value: totalMastered,
      icon: Brain,
      color: "bg-[#A8C5A8]",
      textColor: "text-[#4A6A4A]",
    },
    {
      label: "Learning",
      value: totalLearning,
      icon: TrendingUp,
      color: "bg-[#E5D4A8]",
      textColor: "text-[#8B7A4A]",
    },
    {
      label: "Due Today",
      value: cardsDueToday,
      icon: Clock,
      color: "bg-[#A8C5D4]",
      textColor: "text-[#4A5A6A]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-h2 text-[#2D2D2D]">Study Progress</h2>
        <p className="text-[#5A5A5A] mt-1">Track your learning journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-[#E5E5E0] p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <div className="text-2xl font-bold text-[#2D2D2D]">{stat.value}</div>
            <div className="text-sm text-[#8A8A8A]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Mastery Progress */}
      <div className="bg-white rounded-xl border border-[#E5E5E0] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#2D2D2D]">Overall Mastery</h3>
            <p className="text-sm text-[#8A8A8A]">Your learning progress across all decks</p>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#A8C5A8]" />
            <span className="text-2xl font-bold text-[#2D2D2D]">{masteryRate}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-[#F0F0EC] rounded-full overflow-hidden flex mb-4">
          <motion.div
            className="h-full bg-[#A8C5A8]"
            initial={{ width: 0 }}
            animate={{ width: `${(totalMastered / totalCards) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.div
            className="h-full bg-[#E5D4A8]"
            initial={{ width: 0 }}
            animate={{ width: `${(totalLearning / totalCards) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.div
            className="h-full bg-[#A8C5D4]"
            initial={{ width: 0 }}
            animate={{ width: `${(totalNew / totalCards) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A8C5A8]" />
            <span className="text-[#5A5A5A]">Mastered ({totalMastered})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E5D4A8]" />
            <span className="text-[#5A5A5A]">Learning ({totalLearning})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A8C5D4]" />
            <span className="text-[#5A5A5A]">New ({totalNew})</span>
          </div>
        </div>
      </div>

      {/* Deck Breakdown */}
      {decks.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E0] p-6">
          <h3 className="font-semibold text-[#2D2D2D] mb-4">Deck Breakdown</h3>
          <div className="space-y-4">
            {decks.map((deck, index) => {
              const deckMastered = deck.cards.filter((c) => c.repetitionCount >= 3).length;
              const deckLearning = deck.cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 3).length;
              const deckNew = deck.cards.filter((c) => c.repetitionCount === 0).length;
              const deckTotal = deck.cards.length;
              const deckMastery = deckTotal > 0 ? Math.round((deckMastered / deckTotal) * 100) : 0;

              return (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#2D2D2D]">{deck.name}</span>
                      <span className="text-sm text-[#8A8A8A]">{deckTotal} cards</span>
                    </div>
                    <div className="h-2 bg-[#F0F0EC] rounded-full overflow-hidden flex">
                      {deckTotal > 0 ? (
                        <>
                          <div
                            className="h-full bg-[#A8C5A8]"
                            style={{ width: `${(deckMastered / deckTotal) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[#E5D4A8]"
                            style={{ width: `${(deckLearning / deckTotal) * 100}%` }}
                          />
                          <div
                            className="h-full bg-[#A8C5D4]"
                            style={{ width: `${(deckNew / deckTotal) * 100}%` }}
                          />
                        </>
                      ) : (
                        <div className="h-full w-full bg-[#E5E5E0]" />
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <span className={cn(
                      "text-sm font-medium",
                      deckMastery >= 80 ? "text-[#A8C5A8]" :
                      deckMastery >= 50 ? "text-[#E5D4A8]" :
                      "text-[#8A8A8A]"
                    )}>
                      {deckMastery}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Study Tips */}
      <div className="bg-gradient-to-br from-[#F5F5F0] to-[#FAFAF8] rounded-xl border border-[#E5E5E0] p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#E8D5C4] flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-[#8B6A4A]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2D2D2D] mb-1">Study Tip</h3>
            <p className="text-sm text-[#5A5A5A]">
              Consistency is key! Review cards daily to maintain your knowledge. 
              Cards you find difficult will appear more frequently using our spaced repetition algorithm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
