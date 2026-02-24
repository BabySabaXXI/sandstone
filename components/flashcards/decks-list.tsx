/**
 * Decks List Component
 * 
 * Client Component that displays and manages flashcard decks.
 * Handles search, filtering, and deck management.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MoreVertical,
  Play,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FlashcardDeck } from "@/lib/ssr/data-fetching";

interface DecksListProps {
  decks: FlashcardDeck[];
  userId: string;
}

/**
 * Decks List Component
 */
export function DecksList({ decks: initialDecks, userId }: DecksListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>(initialDecks);

  // Filter decks based on search
  const filteredDecks = useMemo(() => {
    return decks.filter(
      (deck) =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [decks, searchQuery]);

  // Handle deck deletion
  const handleDelete = (deckId: string) => {
    setDecks(decks.filter((d) => d.id !== deckId));
    toast.success("Deck deleted");
  };

  return (
    <div className="space-y-6">
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
              <DeckCard deck={deck} onDelete={handleDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredDecks.length === 0 && <EmptyState searchQuery={searchQuery} />}
    </div>
  );
}

/**
 * Deck Card Component
 */
function DeckCard({
  deck,
  onDelete,
}: {
  deck: FlashcardDeck;
  onDelete: (id: string) => void;
}) {
  const progress = deck.cardCount > 0 ? (deck.mastered / deck.cardCount) * 100 : 0;

  return (
    <Card className="group h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              deck.subject === "Economics"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            )}
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
                onClick={() => onDelete(deck.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-lg mb-1">{deck.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{deck.description}</p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{deck.cardCount} cards</span>
            <span className="font-medium">{Math.round(progress)}% mastered</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary rounded-full h-1.5 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
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
  );
}

/**
 * Empty State Component
 */
function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Search className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {searchQuery ? "No decks found" : "No decks yet"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {searchQuery
          ? "Try a different search term"
          : "Create your first flashcard deck to get started"}
      </p>
      {!searchQuery && (
        <Link href="/flashcards/new">
          <Button className="gap-2">
            <Edit className="w-4 h-4" />
            Create Deck
          </Button>
        </Link>
      )}
    </div>
  );
}
