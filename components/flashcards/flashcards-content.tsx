"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Layers,
  Clock,
  TrendingUp,
  MoreVertical,
  Play,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface FlashcardsContentProps {
  userId: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  mastered: number;
  lastStudied: string;
  subject: string;
}

const mockDecks: Deck[] = [
  {
    id: "1",
    name: "Microeconomics Basics",
    description: "Supply, demand, and market equilibrium",
    cardCount: 24,
    mastered: 18,
    lastStudied: "2 hours ago",
    subject: "Economics",
  },
  {
    id: "2",
    name: "Geography Case Studies",
    description: "Key case studies for A-Level Geography",
    cardCount: 36,
    mastered: 12,
    lastStudied: "1 day ago",
    subject: "Geography",
  },
  {
    id: "3",
    name: "Macroeconomic Indicators",
    description: "GDP, inflation, unemployment metrics",
    cardCount: 15,
    mastered: 15,
    lastStudied: "3 days ago",
    subject: "Economics",
  },
];

export function FlashcardsContent({ userId }: FlashcardsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [decks, setDecks] = useState<Deck[]>(mockDecks);

  const filteredDecks = decks.filter(
    (deck) =>
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCards = decks.reduce((acc, deck) => acc + deck.cardCount, 0);
  const totalMastered = decks.reduce((acc, deck) => acc + deck.mastered, 0);
  const overallProgress = totalCards > 0 ? (totalMastered / totalCards) * 100 : 0;

  const handleDeleteDeck = (deckId: string) => {
    setDecks(decks.filter((d) => d.id !== deckId));
    toast.success("Deck deleted");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Master concepts with spaced repetition
          </p>
        </div>
        <Link href="/flashcards/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Deck
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{totalCards}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold">{totalMastered}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">7 days</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {totalMastered} of {totalCards} cards mastered
            </span>
            <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search decks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Decks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredDecks.map((deck) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
            >
              <Card className="group h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        deck.subject === "Economics"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}
                    >
                      {deck.subject}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/flashcards/${deck.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-rose-500"
                          onClick={() => handleDeleteDeck(deck.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{deck.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {deck.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {deck.cardCount} cards
                      </span>
                      <span className="font-medium">
                        {Math.round((deck.mastered / deck.cardCount) * 100)}% mastered
                      </span>
                    </div>
                    <Progress
                      value={(deck.mastered / deck.cardCount) * 100}
                      className="h-1.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Last studied {deck.lastStudied}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button className="flex-1 gap-2" asChild>
                      <Link href={`/flashcards/${deck.id}/study`}>
                        <Play className="w-4 h-4" />
                        Study
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/flashcards/${deck.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No decks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Create your first flashcard deck to get started"}
          </p>
          {!searchQuery && (
            <Link href="/flashcards/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Deck
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
