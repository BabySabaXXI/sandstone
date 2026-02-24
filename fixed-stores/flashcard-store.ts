import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: Date;
  lastReviewed?: Date;
  nextReview?: Date;
  interval: number;
  repetitionCount: number;
  easeFactor: number;
}

export interface FlashcardDeck {
  id: string;
  userId: string;
  subject: Subject;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
  updatedAt: Date;
}

interface FlashcardStore {
  // State
  decks: FlashcardDeck[];
  currentDeckId: string | null;
  isLoading: boolean;
  error: string | null;
  syncing: boolean;
  studyMode: string | null;
  isHydrated: boolean;
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];

  // Actions
  fetchDecks: () => Promise<void>;
  createDeck: (name: string, description: string, subject: Subject) => Promise<FlashcardDeck>;
  deleteDeck: (id: string) => Promise<void>;
  addCard: (deckId: string, front: string, back: string) => Promise<void>;
  updateCard: (deckId: string, cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  deleteCard: (deckId: string, cardId: string) => Promise<void>;
  getDeck: (id: string) => FlashcardDeck | undefined;
  getDecksBySubject: (subject: Subject) => FlashcardDeck[];
  getDueCards: (deckId: string) => Flashcard[];
  reviewCard: (deckId: string, cardId: string, quality: number) => Promise<void>;
  setCurrentDeck: (id: string | null) => void;
  getStudyStats: (deckId: string) => { 
    total: number; 
    due: number; 
    reviewed: number; 
    mastered: number; 
    learning: number; 
    new: number 
  };
  setStudyMode: (mode: string | null) => void;
  syncWithSupabase: () => Promise<void>;
  processPendingOperations: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: 'create_deck' | 'delete_deck' | 'add_card' | 'update_card' | 'delete_card' | 'review_card';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// Type for Supabase flashcard update data
interface FlashcardUpdateData {
  front?: string;
  back?: string;
  interval?: number;
  repetition_count?: number;
  ease_factor?: number;
  next_review?: string;
  last_reviewed?: string;
}

// Type for Supabase deck row
interface SupabaseDeckRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  subject: string;
  created_at: string;
  updated_at: string;
}

// Type for Supabase flashcard row
interface SupabaseFlashcardRow {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  interval: number;
  repetition_count: number;
  ease_factor: number;
  next_review?: string;
  last_reviewed?: string;
  created_at: string;
}

// Custom storage with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to localStorage:`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please clear some data.');
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from localStorage:`, error);
    }
  },
};

// SM-2 Algorithm
function calculateNextReview(
  interval: number,
  repetitionCount: number,
  easeFactor: number,
  quality: number
): { interval: number; repetitionCount: number; easeFactor: number; nextReview: Date } {
  let newInterval: number;
  let newRepetitionCount: number;
  let newEaseFactor: number;

  if (quality >= 3) {
    if (repetitionCount === 0) {
      newInterval = 1;
    } else if (repetitionCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitionCount = repetitionCount + 1;
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    newInterval = 1;
    newRepetitionCount = 0;
    newEaseFactor = easeFactor;
  }

  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    repetitionCount: newRepetitionCount,
    easeFactor: newEaseFactor,
    nextReview,
  };
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      decks: [],
      currentDeckId: null,
      isLoading: false,
      error: null,
      syncing: false,
      studyMode: null,
      isHydrated: false,
      pendingOperations: [],

      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),

      fetchDecks: async () => {
        // Prevent concurrent fetches
        if (get().isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false, error: "Not authenticated" });
            return;
          }

          const { data: decksData, error: decksError } = await supabase
            .from("flashcard_decks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (decksError) throw decksError;

          const decks: FlashcardDeck[] = [];
          for (const deck of (decksData || []) as SupabaseDeckRow[]) {
            const { data: cardsData } = await supabase
              .from("flashcards")
              .select("*")
              .eq("deck_id", deck.id);

            decks.push({
              id: deck.id,
              userId: deck.user_id,
              subject: deck.subject as Subject,
              name: deck.name,
              description: deck.description,
              cards: ((cardsData || []) as SupabaseFlashcardRow[]).map((c) => ({
                id: c.id,
                front: c.front,
                back: c.back,
                deckId: c.deck_id,
                createdAt: new Date(c.created_at),
                lastReviewed: c.last_reviewed ? new Date(c.last_reviewed) : undefined,
                nextReview: c.next_review ? new Date(c.next_review) : undefined,
                interval: c.interval ?? 0,
                repetitionCount: c.repetition_count ?? 0,
                easeFactor: c.ease_factor ?? 2.5,
              })),
              createdAt: new Date(deck.created_at),
              updatedAt: new Date(deck.updated_at),
            });
          }

          set({ decks, isLoading: false });
        } catch (error) {
          console.error("Error fetching decks:", error);
          set({ isLoading: false, error: (error as Error).message });
        }
      },

      createDeck: async (name, description, subject) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const { data, error } = await supabase
            .from("flashcard_decks")
            .insert({
              user_id: user.id,
              name,
              description,
              subject,
            })
            .select()
            .single();

          if (error) throw error;

          const deckRow = data as SupabaseDeckRow;
          const deck: FlashcardDeck = {
            id: deckRow.id,
            userId: deckRow.user_id,
            subject: deckRow.subject as Subject,
            name: deckRow.name,
            description: deckRow.description,
            cards: [],
            createdAt: new Date(deckRow.created_at),
            updatedAt: new Date(deckRow.updated_at),
          };

          set((state) => ({ decks: [deck, ...state.decks], isLoading: false }));
          return deck;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      deleteDeck: async (id) => {
        try {
          const { error } = await supabase.from("flashcard_decks").delete().eq("id", id);
          if (error) throw error;
          
          set((state) => ({ 
            decks: state.decks.filter((d) => d.id !== id),
            currentDeckId: state.currentDeckId === id ? null : state.currentDeckId,
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      addCard: async (deckId, front, back) => {
        try {
          const { data, error } = await supabase
            .from("flashcards")
            .insert({
              deck_id: deckId,
              front,
              back,
              ease_factor: 2.5,
            })
            .select()
            .single();

          if (error) throw error;

          const cardRow = data as SupabaseFlashcardRow;
          const newCard: Flashcard = {
            id: cardRow.id,
            front: cardRow.front,
            back: cardRow.back,
            deckId: cardRow.deck_id,
            createdAt: new Date(cardRow.created_at),
            interval: 0,
            repetitionCount: 0,
            easeFactor: 2.5,
          };

          set((state) => ({
            decks: state.decks.map((d) =>
              d.id === deckId ? { ...d, cards: [...d.cards, newCard] } : d
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      updateCard: async (deckId, cardId, updates) => {
        const updateData: FlashcardUpdateData = {};
        
        if (updates.front !== undefined) updateData.front = updates.front;
        if (updates.back !== undefined) updateData.back = updates.back;
        if (updates.interval !== undefined) updateData.interval = updates.interval;
        if (updates.repetitionCount !== undefined) updateData.repetition_count = updates.repetitionCount;
        if (updates.easeFactor !== undefined) updateData.ease_factor = updates.easeFactor;
        if (updates.nextReview !== undefined) updateData.next_review = updates.nextReview.toISOString();
        if (updates.lastReviewed !== undefined) updateData.last_reviewed = updates.lastReviewed.toISOString();

        try {
          const { error } = await supabase.from("flashcards").update(updateData).eq("id", cardId);
          if (error) throw error;

          set((state) => ({
            decks: state.decks.map((d) =>
              d.id === deckId
                ? {
                    ...d,
                    cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
                  }
                : d
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      deleteCard: async (deckId, cardId) => {
        try {
          const { error } = await supabase.from("flashcards").delete().eq("id", cardId);
          if (error) throw error;

          set((state) => ({
            decks: state.decks.map((d) =>
              d.id === deckId ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) } : d
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      getDeck: (id) => {
        return get().decks.find((d) => d.id === id);
      },

      getDecksBySubject: (subject) => {
        return get().decks.filter((d) => d.subject === subject);
      },

      setCurrentDeck: (id) => {
        set({ currentDeckId: id });
      },

      setStudyMode: (mode) => {
        set({ studyMode: mode });
      },

      getStudyStats: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return { total: 0, due: 0, reviewed: 0, mastered: 0, learning: 0, new: 0 };
        
        const now = new Date();
        const total = deck.cards.length;
        const due = deck.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
        const reviewed = deck.cards.filter((c) => c.repetitionCount > 0).length;
        const mastered = deck.cards.filter((c) => c.repetitionCount >= 5).length;
        const learning = deck.cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 5).length;
        const newCards = deck.cards.filter((c) => c.repetitionCount === 0).length;
        
        return { total, due, reviewed, mastered, learning, new: newCards };
      },

      getDueCards: (deckId) => {
        const deck = get().decks.find((d) => d.id === deckId);
        if (!deck) return [];
        const now = new Date();
        return deck.cards.filter((c) => !c.nextReview || c.nextReview <= now);
      },

      reviewCard: async (deckId, cardId, quality) => {
        const deck = get().decks.find((d) => d.id === deckId);
        const card = deck?.cards.find((c) => c.id === cardId);
        if (!card) {
          set({ error: "Card not found" });
          return;
        }

        const result = calculateNextReview(
          card.interval,
          card.repetitionCount,
          card.easeFactor,
          quality
        );

        await get().updateCard(deckId, cardId, {
          interval: result.interval,
          repetitionCount: result.repetitionCount,
          easeFactor: result.easeFactor,
          nextReview: result.nextReview,
          lastReviewed: new Date(),
        });
      },

      syncWithSupabase: async () => {
        set({ syncing: true });
        try {
          await get().fetchDecks();
          await get().processPendingOperations();
          toast.success("Flashcards synced");
        } catch (error) {
          console.error("Sync error:", error);
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },

      processPendingOperations: async () => {
        const { pendingOperations } = get();
        if (pendingOperations.length === 0) return;

        const processedIds: string[] = [];

        for (const operation of pendingOperations) {
          if (operation.retryCount >= 3) continue;

          try {
            // Process operation based on type
            processedIds.push(operation.id);
          } catch (error) {
            console.error("Failed to process pending operation:", error);
            operation.retryCount++;
          }
        }

        set((state) => ({
          pendingOperations: state.pendingOperations.filter(
            (op) => !processedIds.includes(op.id)
          ),
        }));
      },
    }),
    {
      name: "flashcard-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ 
        decks: state.decks,
        currentDeckId: state.currentDeckId,
        studyMode: state.studyMode,
        pendingOperations: state.pendingOperations,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useDeck = (id: string) => 
  useFlashcardStore((state) => state.decks.find((d) => d.id === id));

export const useDecksBySubject = (subject: Subject) => 
  useFlashcardStore((state) => state.decks.filter((d) => d.subject === subject));

export const useDueCards = (deckId: string) => 
  useFlashcardStore((state) => {
    const deck = state.decks.find((d) => d.id === deckId);
    if (!deck) return [];
    const now = new Date();
    return deck.cards.filter((c) => !c.nextReview || c.nextReview <= now);
  });

export const useCurrentDeck = () => 
  useFlashcardStore((state) => state.currentDeckId ? state.decks.find((d) => d.id === state.currentDeckId) : undefined);

export const useStudyStats = (deckId: string) => 
  useFlashcardStore((state) => {
    const deck = state.decks.find((d) => d.id === deckId);
    if (!deck) return { total: 0, due: 0, reviewed: 0, mastered: 0, learning: 0, new: 0 };
    
    const now = new Date();
    const total = deck.cards.length;
    const due = deck.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
    const reviewed = deck.cards.filter((c) => c.repetitionCount > 0).length;
    const mastered = deck.cards.filter((c) => c.repetitionCount >= 5).length;
    const learning = deck.cards.filter((c) => c.repetitionCount > 0 && c.repetitionCount < 5).length;
    const newCards = deck.cards.filter((c) => c.repetitionCount === 0).length;
    
    return { total, due, reviewed, mastered, learning, new: newCards };
  });
