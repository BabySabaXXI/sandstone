import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Flashcard, FlashcardDeck, DatabaseFlashcardDeck, DatabaseFlashcard } from "@/types";
import { calculateSM2, SM2Result } from "@/lib/flashcards/sm2";
import { toast } from "sonner";

interface FlashcardStore {
  decks: FlashcardDeck[];
  currentDeckId: string | null;
  studyMode: "skim" | "hammer" | null;
  loading: boolean;
  syncing: boolean;
  
  // Local operations
  createDeck: (name: string, description?: string) => Promise<string>;
  updateDeck: (id: string, updates: Partial<FlashcardDeck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  setCurrentDeck: (id: string | null) => void;
  
  // Card operations
  addCard: (deckId: string, front: string, back: string) => Promise<void>;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  
  // Study operations
  setStudyMode: (mode: "skim" | "hammer" | null) => void;
  reviewCard: (deckId: string, cardId: string, quality: number) => Promise<void>;
  
  // Getters
  getDeck: (id: string) => FlashcardDeck | undefined;
  getDueCards: (deckId: string) => Flashcard[];
  getStudyStats: (deckId: string) => { mastered: number; learning: number; new: number };
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  fetchDecks: () => Promise<void>;
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      decks: [],
      currentDeckId: null,
      studyMode: null,
      loading: false,
      syncing: false,

      createDeck: async (name, description = "") => {
        const id = crypto.randomUUID();
        const newDeck: FlashcardDeck = {
          id,
          name,
          description,
          cards: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ decks: [...state.decks, newDeck] }));

        // Sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("flashcard_decks").insert({
              id: newDeck.id,
              user_id: user.id,
              name: newDeck.name,
              description: newDeck.description,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving deck to Supabase:", error);
        }

        return id;
      },

      updateDeck: async (id, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === id ? { ...deck, ...updates, updatedAt: new Date() } : deck
          ),
        }));

        try {
          const { error } = await supabase.from("flashcard_decks").update({
            name: updates.name,
            description: updates.description,
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating deck:", error);
        }
      },

      deleteDeck: async (id) => {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.id !== id),
          currentDeckId: state.currentDeckId === id ? null : state.currentDeckId,
        }));

        try {
          const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);
          if (error) throw error;
          toast.success("Deck deleted");
        } catch (error) {
          console.error("Error deleting deck:", error);
        }
      },

      setCurrentDeck: (id) => set({ currentDeckId: id }),

      addCard: async (deckId, front, back) => {
        const newCard: Flashcard = {
          id: crypto.randomUUID(),
          front,
          back,
          deckId,
          createdAt: new Date(),
          interval: 0,
          repetitionCount: 0,
          easeFactor: 2.5,
        };
        
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, cards: [...deck.cards, newCard], updatedAt: new Date() }
              : deck
          ),
        }));

        // Sync with Supabase
        try {
          const { error } = await supabase.from("flashcards").insert({
            id: newCard.id,
            deck_id: deckId,
            front: newCard.front,
            back: newCard.back,
            interval: newCard.interval,
            repetition_count: newCard.repetitionCount,
            ease_factor: newCard.easeFactor,
          });
          if (error) throw error;
        } catch (error) {
          console.error("Error saving card:", error);
        }
      },

      updateCard: async (deckId, cardId, updates) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                  ),
                  updatedAt: new Date(),
                }
              : deck
          ),
        }));

        try {
          const { error } = await supabase.from("flashcards").update({
            front: updates.front,
            back: updates.back,
            interval: updates.interval,
            repetition_count: updates.repetitionCount,
            ease_factor: updates.easeFactor,
            next_review: updates.nextReview,
            last_reviewed: updates.lastReviewed,
          }).eq("id", cardId);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating card:", error);
        }
      },

      deleteCard: async (deckId, cardId) => {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  cards: deck.cards.filter((card) => card.id !== cardId),
                  updatedAt: new Date(),
                }
              : deck
          ),
        }));

        try {
          const { error } = await supabase.from("flashcards").delete().eq("id", cardId);
          if (error) throw error;
        } catch (error) {
          console.error("Error deleting card:", error);
        }
      },

      setStudyMode: (mode) => set({ studyMode: mode }),

      reviewCard: async (deckId, cardId, quality) => {
        const deck = get().getDeck(deckId);
        if (!deck) return;

        const card = deck.cards.find((c) => c.id === cardId);
        if (!card) return;

        const result = calculateSM2(quality, card.interval, card.repetitionCount, card.easeFactor);
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + result.interval);

        set((state) => ({
          decks: state.decks.map((d) =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map((c) =>
                    c.id === cardId
                      ? {
                          ...c,
                          interval: result.interval,
                          repetitionCount: result.repetitionCount,
                          easeFactor: result.easeFactor,
                          nextReview,
                          lastReviewed: new Date(),
                        }
                      : c
                  ),
                  updatedAt: new Date(),
                }
              : d
          ),
        }));

        // Sync with Supabase
        try {
          const { error } = await supabase.from("flashcards").update({
            interval: result.interval,
            repetition_count: result.repetitionCount,
            ease_factor: result.easeFactor,
            next_review: nextReview.toISOString(),
            last_reviewed: new Date().toISOString(),
          }).eq("id", cardId);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating card review:", error);
        }
      },

      getDeck: (id) => get().decks.find((deck) => deck.id === id),

      getDueCards: (deckId) => {
        const deck = get().getDeck(deckId);
        if (!deck) return [];
        const now = new Date();
        return deck.cards.filter((card) => !card.nextReview || card.nextReview <= now);
      },

      getStudyStats: (deckId) => {
        const deck = get().getDeck(deckId);
        if (!deck) return { mastered: 0, learning: 0, new: 0 };
        return {
          mastered: deck.cards.filter((c) => c.repetitionCount >= 3).length,
          learning: deck.cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 3).length,
          new: deck.cards.filter((c) => c.repetitionCount === 0).length,
        };
      },

      fetchDecks: async () => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }

          // Fetch decks
          const { data: decksData, error: decksError } = await supabase
            .from("flashcard_decks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (decksError) throw decksError;

          // Fetch cards for all decks
          const { data: cardsData, error: cardsError } = await supabase
            .from("flashcards")
            .select("*")
            .in("deck_id", decksData?.map((d) => d.id) || []);

          if (cardsError) throw cardsError;

          // Map to local format
          const mappedDecks: FlashcardDeck[] = decksData.map((deck: DatabaseFlashcardDeck) => ({
            id: deck.id,
            name: deck.name,
            description: deck.description,
            cards: (cardsData || [])
              .filter((c: DatabaseFlashcard) => c.deck_id === deck.id)
              .map((c: DatabaseFlashcard) => ({
                id: c.id,
                front: c.front,
                back: c.back,
                deckId: c.deck_id,
                createdAt: new Date(c.created_at),
                interval: c.interval,
                repetitionCount: c.repetition_count,
                easeFactor: c.ease_factor,
                nextReview: c.next_review ? new Date(c.next_review) : undefined,
                lastReviewed: c.last_reviewed ? new Date(c.last_reviewed) : undefined,
              })),
            createdAt: new Date(deck.created_at),
            updatedAt: new Date(deck.updated_at),
          }));

          set({ decks: mappedDecks });
        } catch (error) {
          console.error("Error fetching decks:", error);
          toast.error("Failed to fetch flashcards");
        } finally {
          set({ loading: false });
        }
      },

      syncWithSupabase: async () => {
        set({ syncing: true });
        
        try {
          await get().fetchDecks();
          toast.success("Flashcards synced");
        } catch (error) {
          console.error("Error syncing flashcards:", error);
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: "flashcard-store",
    }
  )
);
