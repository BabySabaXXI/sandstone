"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store-enhanced";
import { DeckManager } from "./DeckManager";
import { StudyMode } from "./StudyMode";
import { ProgressTracker } from "./ProgressTracker";
import {
  BookOpen,
  BarChart3,
  Settings,
  ChevronRight,
  Plus,
  Brain,
  TrendingUp,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================================================
// TYPES
// ============================================================================

type ViewState = "decks" | "study" | "progress" | "deck-detail";

// ============================================================================
// QUICK STATS COMPONENT
// ============================================================================

function QuickStats() {
  const { getGlobalStats, studyProgress } = useFlashcardStore();
  const stats = getGlobalStats();

  const cards = [
    {
      label: "Cards Due",
      value: stats.cardsDue,
      icon: BookOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      label: "Mastered",
      value: stats.mastered,
      icon: Award,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      label: "Streak",
      value: `${stats.streak} days`,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Studied",
      value: studyProgress.totalCardsStudied,
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border p-4"
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bgColor)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// DECK DETAIL VIEW
// ============================================================================

interface DeckDetailViewProps {
  deckId: string;
  onBack: () => void;
  onStudy: () => void;
}

function DeckDetailView({ deckId, onBack, onStudy }: DeckDetailViewProps) {
  const { getDeck, getDeckStats, getDueCards } = useFlashcardStore();
  const deck = getDeck(deckId);
  const stats = getDeckStats(deckId);
  const dueCards = getDueCards(deckId);

  if (!deck) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Decks
          </Button>
          <h1 className="text-2xl font-bold">{deck.name}</h1>
          <p className="text-muted-foreground">{deck.description}</p>
        </div>
        <Button onClick={onStudy} disabled={dueCards.length === 0}>
          <BookOpen className="w-4 h-4 mr-2" />
          Study ({dueCards.length})
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground uppercase">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
          <p className="text-xs text-blue-600/70 uppercase">New</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.learning}</p>
          <p className="text-xs text-yellow-600/70 uppercase">Learning</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.review}</p>
          <p className="text-xs text-purple-600/70 uppercase">Review</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.mastered}</p>
          <p className="text-xs text-green-600/70 uppercase">Mastered</p>
        </div>
      </div>

      {/* Cards List */}
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Cards ({deck.cards.length})</h3>
        </div>
        <div className="divide-y">
          {deck.cards.slice(0, 10).map((card) => (
            <div key={card.id} className="p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{card.front}</p>
                <p className="text-sm text-muted-foreground truncate">{card.back}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Interval: {card.interval}d</span>
                <span>Reviews: {card.repetitionCount}</span>
                <span>Ease: {card.easeFactor.toFixed(2)}</span>
              </div>
            </div>
          ))}
          {deck.cards.length > 10 && (
            <div className="p-4 text-center text-muted-foreground">
              +{deck.cards.length - 10} more cards
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <ProgressTracker deckId={deckId} />
    </div>
  );
}

// ============================================================================
// MAIN FLASHCARD PAGE
// ============================================================================

export function FlashcardPage() {
  const [view, setView] = useState<ViewState>("decks");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const handleSelectDeck = useCallback((deckId: string) => {
    setSelectedDeckId(deckId);
    setView("deck-detail");
  }, []);

  const handleStudyDeck = useCallback((deckId: string) => {
    setSelectedDeckId(deckId);
    setView("study");
  }, []);

  const handleBack = useCallback(() => {
    setView("decks");
    setSelectedDeckId(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Flashcards</span>
            </div>

            <nav className="flex items-center gap-1">
              <Button
                variant={view === "decks" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("decks")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Decks
              </Button>
              <Button
                variant={view === "progress" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("progress")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Progress
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {view === "decks" && (
            <motion.div
              key="decks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <QuickStats />
              <DeckManager
                onSelectDeck={handleSelectDeck}
                onStudyDeck={handleStudyDeck}
              />
            </motion.div>
          )}

          {view === "deck-detail" && selectedDeckId && (
            <motion.div
              key="deck-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DeckDetailView
                deckId={selectedDeckId}
                onBack={handleBack}
                onStudy={() => setView("study")}
              />
            </motion.div>
          )}

          {view === "study" && selectedDeckId && (
            <motion.div
              key="study"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <StudyMode
                deckId={selectedDeckId}
                onExit={() => setView("deck-detail")}
              />
            </motion.div>
          )}

          {view === "progress" && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProgressTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default FlashcardPage;
