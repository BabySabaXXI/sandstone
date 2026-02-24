/**
 * Flashcard Data Fetching Hooks with SWR
 * Features: caching, optimistic updates, error retry, SM2 algorithm integration
 */

'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, documentSWRConfig, cacheMutations } from '@/lib/swr/config';
import { calculateNextReview } from '@/lib/flashcards/sm2';
import type { Flashcard, FlashcardDeck } from '@/stores/types';
import type { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface CreateFlashcardParams {
  front: string;
  back: string;
  documentId?: string;
  deckId?: string;
  subject?: Subject;
  tags?: string[];
}

interface UpdateFlashcardParams {
  id: string;
  updates: Partial<Omit<Flashcard, 'id' | 'createdAt'>>;
}

interface ReviewFlashcardParams {
  id: string;
  quality: number; // 0-5 rating
}

interface CreateDeckParams {
  name: string;
  description?: string;
  subject?: Subject;
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all flashcards for the current user
 */
async function fetchFlashcards(): Promise<Flashcard[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    documentId: card.document_id,
    deckId: card.deck_id,
    subject: card.subject as Subject,
    tags: card.tags || [],
    interval: card.interval || 0,
    repetitionCount: card.repetition_count || 0,
    easeFactor: card.ease_factor || 2.5,
    nextReviewAt: card.next_review_at ? new Date(card.next_review_at) : null,
    lastReviewedAt: card.last_reviewed_at ? new Date(card.last_reviewed_at) : null,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  }));
}

/**
 * Fetch flashcards due for review
 */
async function fetchDueFlashcards(): Promise<Flashcard[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    documentId: card.document_id,
    deckId: card.deck_id,
    subject: card.subject as Subject,
    tags: card.tags || [],
    interval: card.interval || 0,
    repetitionCount: card.repetition_count || 0,
    easeFactor: card.ease_factor || 2.5,
    nextReviewAt: card.next_review_at ? new Date(card.next_review_at) : null,
    lastReviewedAt: card.last_reviewed_at ? new Date(card.last_reviewed_at) : null,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  }));
}

/**
 * Fetch flashcards by document
 */
async function fetchFlashcardsByDocument(documentId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    documentId: card.document_id,
    deckId: card.deck_id,
    subject: card.subject as Subject,
    tags: card.tags || [],
    interval: card.interval || 0,
    repetitionCount: card.repetition_count || 0,
    easeFactor: card.ease_factor || 2.5,
    nextReviewAt: card.next_review_at ? new Date(card.next_review_at) : null,
    lastReviewedAt: card.last_reviewed_at ? new Date(card.last_reviewed_at) : null,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  }));
}

/**
 * Fetch flashcards by deck
 */
async function fetchFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    documentId: card.document_id,
    deckId: card.deck_id,
    subject: card.subject as Subject,
    tags: card.tags || [],
    interval: card.interval || 0,
    repetitionCount: card.repetition_count || 0,
    easeFactor: card.ease_factor || 2.5,
    nextReviewAt: card.next_review_at ? new Date(card.next_review_at) : null,
    lastReviewedAt: card.last_reviewed_at ? new Date(card.last_reviewed_at) : null,
    createdAt: new Date(card.created_at),
    updatedAt: new Date(card.updated_at),
  }));
}

/**
 * Fetch all decks
 */
async function fetchDecks(): Promise<FlashcardDeck[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((deck) => ({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    subject: deck.subject as Subject,
    userId: deck.user_id,
    cardCount: deck.card_count || 0,
    createdAt: new Date(deck.created_at),
    updatedAt: new Date(deck.updated_at),
  }));
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new flashcard
 */
async function createFlashcard(
  url: string,
  { arg }: { arg: CreateFlashcardParams }
): Promise<Flashcard> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newFlashcard: Flashcard = {
    id: crypto.randomUUID(),
    front: arg.front,
    back: arg.back,
    documentId: arg.documentId,
    deckId: arg.deckId,
    subject: arg.subject || 'economics',
    tags: arg.tags || [],
    interval: 0,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewAt: now,
    lastReviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('flashcards').insert({
    id: newFlashcard.id,
    user_id: user.id,
    front: newFlashcard.front,
    back: newFlashcard.back,
    document_id: newFlashcard.documentId,
    deck_id: newFlashcard.deckId,
    subject: newFlashcard.subject,
    tags: newFlashcard.tags,
    interval: newFlashcard.interval,
    repetition_count: newFlashcard.repetitionCount,
    ease_factor: newFlashcard.easeFactor,
    next_review_at: newFlashcard.nextReviewAt?.toISOString(),
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newFlashcard;
}

/**
 * Update a flashcard
 */
async function updateFlashcard(
  url: string,
  { arg }: { arg: UpdateFlashcardParams }
): Promise<Flashcard> {
  const { id, updates } = arg;

  const { error } = await supabase
    .from('flashcards')
    .update({
      front: updates.front,
      back: updates.back,
      tags: updates.tags,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  // Fetch updated flashcard
  const { data, error: fetchError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  return {
    id: data.id,
    front: data.front,
    back: data.back,
    documentId: data.document_id,
    deckId: data.deck_id,
    subject: data.subject as Subject,
    tags: data.tags || [],
    interval: data.interval || 0,
    repetitionCount: data.repetition_count || 0,
    easeFactor: data.ease_factor || 2.5,
    nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
    lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Review a flashcard (SM2 algorithm)
 */
async function reviewFlashcard(
  url: string,
  { arg }: { arg: ReviewFlashcardParams }
): Promise<Flashcard> {
  const { id, quality } = arg;

  // Fetch current flashcard
  const { data: current, error: fetchError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Calculate next review using SM2
  const sm2Result = calculateNextReview({
    interval: current.interval || 0,
    repetitionCount: current.repetition_count || 0,
    easeFactor: current.ease_factor || 2.5,
    quality,
  });

  const now = new Date();
  const nextReviewAt = new Date(now.getTime() + sm2Result.interval * 24 * 60 * 60 * 1000);

  // Update flashcard
  const { error } = await supabase
    .from('flashcards')
    .update({
      interval: sm2Result.interval,
      repetition_count: sm2Result.repetitionCount,
      ease_factor: sm2Result.easeFactor,
      next_review_at: nextReviewAt.toISOString(),
      last_reviewed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  return {
    id: current.id,
    front: current.front,
    back: current.back,
    documentId: current.document_id,
    deckId: current.deck_id,
    subject: current.subject as Subject,
    tags: current.tags || [],
    interval: sm2Result.interval,
    repetitionCount: sm2Result.repetitionCount,
    easeFactor: sm2Result.easeFactor,
    nextReviewAt,
    lastReviewedAt: now,
    createdAt: new Date(current.created_at),
    updatedAt: now,
  };
}

/**
 * Delete a flashcard
 */
async function deleteFlashcard(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', arg);

  if (error) throw error;
}

/**
 * Create a new deck
 */
async function createDeck(
  url: string,
  { arg }: { arg: CreateDeckParams }
): Promise<FlashcardDeck> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newDeck: FlashcardDeck = {
    id: crypto.randomUUID(),
    name: arg.name,
    description: arg.description,
    subject: arg.subject || 'economics',
    userId: user.id,
    cardCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('flashcard_decks').insert({
    id: newDeck.id,
    user_id: user.id,
    name: newDeck.name,
    description: newDeck.description,
    subject: newDeck.subject,
    card_count: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newDeck;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all flashcards
 */
export function useFlashcards() {
  return useSWR<Flashcard[]>(
    cacheKeys.flashcards,
    fetchFlashcards,
    documentSWRConfig
  );
}

/**
 * Hook to fetch flashcards due for review
 */
export function useDueFlashcards() {
  return useSWR<Flashcard[]>(
    `${cacheKeys.flashcards}/due`,
    fetchDueFlashcards,
    { ...documentSWRConfig, refreshInterval: 60000 } // Refresh every minute
  );
}

/**
 * Hook to fetch flashcards by document
 */
export function useFlashcardsByDocument(documentId: string | null) {
  return useSWR<Flashcard[]>(
    documentId ? cacheKeys.flashcardsByDocument(documentId) : null,
    () => fetchFlashcardsByDocument(documentId!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch flashcards by deck
 */
export function useFlashcardsByDeck(deckId: string | null) {
  return useSWR<Flashcard[]>(
    deckId ? cacheKeys.flashcardsByDeck(deckId) : null,
    () => fetchFlashcardsByDeck(deckId!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch all decks
 */
export function useFlashcardDecks() {
  return useSWR<FlashcardDeck[]>(
    cacheKeys.flashcardDecks,
    fetchDecks,
    documentSWRConfig
  );
}

/**
 * Hook to create a flashcard with optimistic updates
 */
export function useCreateFlashcard() {
  return useSWRMutation<Flashcard, Error, string, CreateFlashcardParams>(
    cacheKeys.flashcards,
    createFlashcard,
    {
      onSuccess: (data) => {
        toast.success('Flashcard created successfully');
        
        // Update flashcards list
        globalMutate(
          cacheKeys.flashcards,
          (current: Flashcard[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        // Update document flashcards if applicable
        if (data.documentId) {
          globalMutate(
            cacheKeys.flashcardsByDocument(data.documentId),
            (current: Flashcard[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        }
        
        // Update deck flashcards if applicable
        if (data.deckId) {
          globalMutate(
            cacheKeys.flashcardsByDeck(data.deckId),
            (current: Flashcard[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        }
      },
      onError: (error) => {
        toast.error(`Failed to create flashcard: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update a flashcard with optimistic updates
 */
export function useUpdateFlashcard() {
  return useSWRMutation<Flashcard, Error, string, UpdateFlashcardParams>(
    cacheKeys.flashcards,
    updateFlashcard,
    {
      onSuccess: (data, { arg }) => {
        toast.success('Flashcard updated successfully');
        
        // Update all relevant caches
        globalMutate(
          cacheKeys.flashcards,
          (current: Flashcard[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        if (data.documentId) {
          globalMutate(
            cacheKeys.flashcardsByDocument(data.documentId),
            (current: Flashcard[] | undefined) => cacheMutations.updateInList(current, data),
            { revalidate: false }
          );
        }
        
        if (data.deckId) {
          globalMutate(
            cacheKeys.flashcardsByDeck(data.deckId),
            (current: Flashcard[] | undefined) => cacheMutations.updateInList(current, data),
            { revalidate: false }
          );
        }
      },
      onError: (error) => {
        toast.error(`Failed to update flashcard: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to review a flashcard (SM2 algorithm)
 */
export function useReviewFlashcard() {
  return useSWRMutation<Flashcard, Error, string, ReviewFlashcardParams>(
    cacheKeys.flashcards,
    reviewFlashcard,
    {
      onSuccess: (data) => {
        // Update all relevant caches
        globalMutate(
          cacheKeys.flashcards,
          (current: Flashcard[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        // Revalidate due flashcards
        globalMutate(`${cacheKeys.flashcards}/due`);
      },
      onError: (error) => {
        toast.error(`Failed to review flashcard: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to delete a flashcard
 */
export function useDeleteFlashcard() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.flashcards,
    deleteFlashcard,
    {
      onSuccess: (_, flashcardId) => {
        toast.success('Flashcard deleted successfully');
        
        globalMutate(
          cacheKeys.flashcards,
          (current: Flashcard[] | undefined) => cacheMutations.removeFromList(current, flashcardId),
          { revalidate: false }
        );
      },
      onError: (error) => {
        toast.error(`Failed to delete flashcard: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to create a deck
 */
export function useCreateDeck() {
  return useSWRMutation<FlashcardDeck, Error, string, CreateDeckParams>(
    cacheKeys.flashcardDecks,
    createDeck,
    {
      onSuccess: (data) => {
        toast.success('Deck created successfully');
        
        globalMutate(
          cacheKeys.flashcardDecks,
          (current: FlashcardDeck[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
      },
      onError: (error) => {
        toast.error(`Failed to create deck: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Exports
// ============================================================================

export type {
  CreateFlashcardParams,
  UpdateFlashcardParams,
  ReviewFlashcardParams,
  CreateDeckParams,
};
