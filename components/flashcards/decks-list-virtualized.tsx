/**
 * Virtualized Decks List Component
 * 
 * High-performance list rendering using virtualization for large deck collections.
 * Only renders visible items, dramatically improving performance.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
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
import { VirtualGrid, VirtualList } from "@/components/performance/virtual-list";
import type { FlashcardDeck } from "@/lib/ssr/data-fetching";

interface DecksListVirtualizedProps {
  decks: FlashcardDeck[];
  userId: string;
  viewMode?: "grid" | "list";
}

/**
 * Virtualized Decks List Component
 * 
 * Features:
 * - Virtualized rendering for large lists
 * - Grid and list view modes
 * - Search and filter functionality
 * - Smooth animations
 */
export function DecksListVirtualized({ 
  decks: initialDecks, 
  userId,
  viewMode = "grid" 
}: DecksListVirtualizedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>(initialDecks);

  // Filter decks based on search
  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    
    const query = searchQuery.toLowerCase();
    return decks.filter(
      (deck) =>
        deck.name.toLowerCase().includes(query) ||
        deck.subject.toLowerCase().includes(query)
    );
  }, [decks, searchQuery]);

  // Handle deck deletion
  const handleDelete = useCallback((deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    toast.success("Deck deleted");
  }, []);

  // Key extractor for virtualization
  const keyExtractor = useCallback((deck: FlashcardDeck) => deck.id, []);

  // Render grid item
  const renderGridItem = useCallback((deck: FlashcardDeck) => (
    <DeckCard deck={deck} onDelete={handleDelete} />
  ), [handleDelete]);

  // Render list item
  const renderListItem = useCallback((deck: FlashcardDeck) => (
    <DeckListItem deck={deck} onDelete={handleDelete} />
  ), [handleDelete]);

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

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''}
      </div>

      {/* Virtualized Grid/List */}
      {filteredDecks.length > 0 ? (
        viewMode === "grid" ? (
          <VirtualGrid
            items={filteredDecks}
            renderItem={renderGridItem}
            itemHeight={280}
            columns={3}
            gap={16}
            containerHeight={600}
            keyExtractor={keyExtractor}
            overscan={2}
          />
        ) : (
          <VirtualList
            items={filteredDecks}
            renderItem={renderListItem}
            itemHeight={80}
            containerHeight={600}
            keyExtractor={keyExtractor}
            overscan={5}
          />
        )
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
    </div>
  );
}

/**
 * Deck Card Component (Grid View)
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
    <Card className="group h-full hover:shadow-md transition-shadow">
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

        <h3 className="font-semibold text-lg mb-1 truncate">{deck.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {deck.description}
        </p>

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
 * Deck List Item Component (List View)
 */
function DeckListItem({
  deck,
  onDelete,
}: {
  deck: FlashcardDeck;
  onDelete: (id: string) => void;
}) {
  const progress = deck.cardCount > 0 ? (deck.mastered / deck.cardCount) * 100 : 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Subject badge */}
      <div
        className={cn(
          "px-2 py-1 rounded text-xs font-medium flex-shrink-0",
          deck.subject === "Economics"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        )}
      >
        {deck.subject}
      </div>

      {/* Deck info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{deck.name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {deck.cardCount} cards • {Math.round(progress)}% mastered
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-24 hidden sm:block">
        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className="bg-primary rounded-full h-1.5 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" className="gap-1" asChild>
          <Link href={`/flashcards/${deck.id}/study`}>
            <Play className="w-3 h-3" />
            Study
          </Link>
        </Button>
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
    </div>
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
