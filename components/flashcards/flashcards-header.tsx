/**
 * Flashcards Header Component
 * 
 * Server Component for the flashcards page header.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

/**
 * Flashcards Header Component
 */
export function FlashcardsHeader() {
  return (
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
  );
}
