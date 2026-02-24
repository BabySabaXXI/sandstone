/**
 * Optimized Flashcards Page with SSR
 * 
 * Features:
 * - Server-side data fetching with caching
 * - Streaming with Suspense boundaries
 * - Parallel data loading
 * - Optimized hydration
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getUserFlashcardDecks } from "@/lib/ssr/data-fetching";
import { routeConfig } from "@/lib/ssr/cache";
import { FlashcardsSkeleton } from "@/components/ssr/streaming-boundary";
import { FlashcardsHeader } from "@/components/flashcards/flashcards-header";
import { FlashcardsStats } from "@/components/flashcards/flashcards-stats";
import { DecksList } from "@/components/flashcards/decks-list";

// Export route configuration for caching
export const revalidate = routeConfig.flashcards.revalidate;
export const dynamic = routeConfig.flashcards.dynamic;

// Page metadata
export const metadata: Metadata = {
  title: "Flashcards",
  description: "Study with AI-generated flashcards using spaced repetition.",
};

// ============================================================================
// Main Page Component (Server Component)
// ============================================================================

export default async function FlashcardsPage() {
  // Check authentication
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login?redirectTo=/flashcards");
  }
  
  return (
    <div className="space-y-8">
      {/* Header - Static content */}
      <FlashcardsHeader />
      
      {/* Stats - With streaming */}
      <Suspense fallback={<FlashcardsStats.Skeleton />}>
        <StatsSection userId={user.id} />
      </Suspense>
      
      {/* Decks List - With streaming */}
      <Suspense fallback={<FlashcardsSkeleton />}>
        <DecksContent userId={user.id} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// Sub-components (Server Components)
// ============================================================================

/**
 * Stats Section - Fetches data server-side
 */
async function StatsSection({ userId }: { userId: string }) {
  const decks = await getUserFlashcardDecks(userId);
  
  const totalCards = decks.reduce((acc, deck) => acc + deck.cardCount, 0);
  const totalMastered = decks.reduce((acc, deck) => acc + deck.mastered, 0);
  const studyStreak = 7; // Would be fetched from database
  
  return (
    <FlashcardsStats
      totalCards={totalCards}
      totalMastered={totalMastered}
      studyStreak={studyStreak}
    />
  );
}

/**
 * Decks Content - Fetches data server-side
 */
async function DecksContent({ userId }: { userId: string }) {
  const decks = await getUserFlashcardDecks(userId);
  
  return <DecksList decks={decks} userId={userId} />;
}
