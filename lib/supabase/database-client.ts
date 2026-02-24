/**
 * Typed Supabase Client
 * 
 * This file provides a fully typed Supabase client for the Sandstone application.
 * It includes type-safe database operations and helper functions.
 */

import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// ============================================================================
// CLIENT TYPE DEFINITIONS
// ============================================================================

export type TypedSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;
export type TypedServerClient = ReturnType<typeof createServerClient<Database>>;

// ============================================================================
// BROWSER CLIENT (for client-side usage)
// ============================================================================

/**
 * Creates a typed browser client for client-side Supabase operations
 * Use this in React components and client-side code
 */
export function createTypedBrowserClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient<Database>(url, key);
}

// ============================================================================
// SERVER CLIENT (for server-side usage)
// ============================================================================

/**
 * Creates a typed server client for server-side Supabase operations
 * Use this in Server Components, API routes, and server actions
 */
export async function createTypedServerClient(): Promise<TypedServerClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle cases where cookies can't be set (e.g., during SSR)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Handle cases where cookies can't be removed (e.g., during SSR)
        }
      },
    },
  });
}

// ============================================================================
// SINGLETON CLIENT (for client-side caching)
// ============================================================================

let browserClient: TypedSupabaseClient | null = null;

/**
 * Returns a singleton browser client instance
 * Prevents multiple client instances in React's strict mode
 */
export function getBrowserClient(): TypedSupabaseClient {
  if (browserClient === null) {
    browserClient = createTypedBrowserClient();
  }
  return browserClient;
}

// ============================================================================
// CONFIGURATION CHECK
// ============================================================================

/**
 * Checks if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && url.startsWith("http");
}

/**
 * Validates Supabase configuration and throws if invalid
 */
export function validateSupabaseConfig(): void {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not properly configured. " +
      "Please check your environment variables."
    );
  }
}

// ============================================================================
// TABLE-SPECIFIC QUERY HELPERS
// ============================================================================

import type { 
  Profile, 
  Essay, 
  FlashcardDeck, 
  Flashcard,
  Document,
  Folder,
  Quiz,
  QuizAttempt,
  AIChat,
  UserSetting,
  ExaminerScore,
  PaginationParams,
  PaginatedResult,
  EssayFilters,
  FlashcardFilters,
  DocumentFilters,
  QuizFilters,
  AIChatFilters,
  Subject
} from "@/types/database";

/**
 * Query helpers for the profiles table
 */
export const profileQueries = {
  /**
   * Get the current user's profile
   */
  async getCurrent(client: TypedSupabaseClient): Promise<Profile | null> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a profile by ID
   */
  async getById(client: TypedSupabaseClient, id: string): Promise<Profile | null> {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update the current user's profile
   */
  async update(
    client: TypedSupabaseClient, 
    updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Profile> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { data, error } = await client
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

/**
 * Query helpers for the essays table
 */
export const essayQueries = {
  /**
   * Get all essays for the current user with optional filtering
   */
  async getAll(
    client: TypedSupabaseClient,
    filters?: EssayFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Essay>> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("essays")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Apply filters
    if (filters?.subject) {
      query = query.eq("subject", filters.subject);
    }
    if (filters?.questionType) {
      query = query.eq("question_type", filters.questionType);
    }
    if (filters?.minScore !== undefined) {
      query = query.gte("overall_score", filters.minScore);
    }
    if (filters?.maxScore !== undefined) {
      query = query.lte("overall_score", filters.maxScore);
    }
    if (filters?.grade) {
      query = query.eq("grade", filters.grade);
    }
    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }
    if (filters?.searchQuery) {
      query = query.or(`question.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`);
    }

    // Apply pagination
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const orderBy = pagination?.orderBy ?? "created_at";
    const orderDirection = pagination?.orderDirection ?? "desc";

    query = query
      .order(orderBy, { ascending: orderDirection === "asc" })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data ?? [],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  /**
   * Get a single essay by ID with examiner scores
   */
  async getById(client: TypedSupabaseClient, id: string): Promise<Essay | null> {
    const { data, error } = await client
      .from("essays")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new essay
   */
  async create(
    client: TypedSupabaseClient,
    essay: Omit<Essay, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Essay> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("essays")
      .insert({ ...essay, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an essay
   */
  async update(
    client: TypedSupabaseClient,
    id: string,
    updates: Partial<Omit<Essay, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<Essay> {
    const { data, error } = await client
      .from("essays")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an essay
   */
  async delete(client: TypedSupabaseClient, id: string): Promise<void> {
    const { error } = await client
      .from("essays")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

/**
 * Query helpers for flashcard decks
 */
export const flashcardDeckQueries = {
  /**
   * Get all decks for the current user
   */
  async getAll(
    client: TypedSupabaseClient,
    subject?: Subject
  ): Promise<FlashcardDeck[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("flashcard_decks")
      .select("*")
      .eq("user_id", user.id);

    if (subject) {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get a deck with all its cards
   */
  async getWithCards(
    client: TypedSupabaseClient,
    id: string
  ): Promise<{ deck: FlashcardDeck; cards: Flashcard[] } | null> {
    const { data: deck, error: deckError } = await client
      .from("flashcard_decks")
      .select("*")
      .eq("id", id)
      .single();

    if (deckError) throw deckError;
    if (!deck) return null;

    const { data: cards, error: cardsError } = await client
      .from("flashcards")
      .select("*")
      .eq("deck_id", id)
      .order("created_at", { ascending: true });

    if (cardsError) throw cardsError;

    return { deck, cards: cards ?? [] };
  },

  /**
   * Get cards due for review
   */
  async getDueCards(
    client: TypedSupabaseClient,
    deckId?: string
  ): Promise<Flashcard[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("flashcards")
      .select("*, flashcard_decks!inner(user_id)")
      .eq("flashcard_decks.user_id", user.id)
      .lte("next_review", new Date().toISOString());

    if (deckId) {
      query = query.eq("deck_id", deckId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data ?? [];
  },
};

/**
 * Query helpers for documents
 */
export const documentQueries = {
  /**
   * Get all documents for the current user
   */
  async getAll(
    client: TypedSupabaseClient,
    filters?: DocumentFilters
  ): Promise<Document[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("documents")
      .select("*")
      .eq("user_id", user.id);

    if (filters?.subject) {
      query = query.eq("subject", filters.subject);
    }
    if (filters?.folderId !== undefined) {
      query = query.eq("folder_id", filters.folderId);
    }
    if (filters?.searchQuery) {
      query = query.ilike("title", `%${filters.searchQuery}%`);
    }

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get documents in a folder tree (recursive)
   */
  async getInFolder(
    client: TypedSupabaseClient,
    folderId: string | null
  ): Promise<Document[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .eq("folder_id", folderId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};

/**
 * Query helpers for folders
 */
export const folderQueries = {
  /**
   * Get all folders for the current user
   */
  async getAll(
    client: TypedSupabaseClient,
    subject?: Subject
  ): Promise<Folder[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("folders")
      .select("*")
      .eq("user_id", user.id);

    if (subject) {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get folder tree structure
   */
  async getTree(
    client: TypedSupabaseClient,
    parentId: string | null = null
  ): Promise<Array<Folder & { children: Folder[] }>> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .eq("parent_id", parentId)
      .order("name", { ascending: true });

    if (error) throw error;

    const folders = data ?? [];
    const result: Array<Folder & { children: Folder[] }> = [];

    for (const folder of folders) {
      const children = await this.getTree(client, folder.id);
      result.push({ ...folder, children });
    }

    return result;
  },
};

/**
 * Query helpers for quizzes
 */
export const quizQueries = {
  /**
   * Get all quizzes for the current user
   */
  async getAll(
    client: TypedSupabaseClient,
    filters?: QuizFilters
  ): Promise<Quiz[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("quizzes")
      .select("*")
      .eq("user_id", user.id);

    if (filters?.subject) {
      query = query.eq("subject", filters.subject);
    }
    if (filters?.sourceType) {
      query = query.eq("source_type", filters.sourceType);
    }
    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get quiz with attempts
   */
  async getWithAttempts(
    client: TypedSupabaseClient,
    id: string
  ): Promise<{ quiz: Quiz; attempts: QuizAttempt[] } | null> {
    const { data: quiz, error: quizError } = await client
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (quizError) throw quizError;
    if (!quiz) return null;

    const { data: attempts, error: attemptsError } = await client
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", id)
      .order("created_at", { ascending: false });

    if (attemptsError) throw attemptsError;

    return { quiz, attempts: attempts ?? [] };
  },
};

/**
 * Query helpers for AI chats
 */
export const aiChatQueries = {
  /**
   * Get all chats for the current user
   */
  async getAll(
    client: TypedSupabaseClient,
    filters?: AIChatFilters
  ): Promise<AIChat[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    let query = client
      .from("ai_chats")
      .select("*")
      .eq("user_id", user.id);

    if (filters?.subject) {
      query = query.eq("subject", filters.subject);
    }
    if (filters?.isPinned !== undefined) {
      query = query.eq("is_pinned", filters.isPinned);
    }
    if (filters?.isArchived !== undefined) {
      query = query.eq("is_archived", filters.isArchived);
    }
    if (filters?.folder) {
      query = query.eq("folder", filters.folder);
    }
    if (filters?.searchQuery) {
      query = query.ilike("title", `%${filters.searchQuery}%`);
    }

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Get pinned chats
   */
  async getPinned(client: TypedSupabaseClient): Promise<AIChat[]> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("ai_chats")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_pinned", true)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};

/**
 * Query helpers for user settings
 */
export const userSettingQueries = {
  /**
   * Get the current user's settings
   */
  async getCurrent(client: TypedSupabaseClient): Promise<UserSetting | null> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return data;
  },

  /**
   * Update user settings
   */
  async update(
    client: TypedSupabaseClient,
    updates: Partial<Omit<UserSetting, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<UserSetting> {
    const { data: { user } } = await client.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await client
      .from("user_settings")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
// EXPORT ALL QUERIES
// ============================================================================

export const db = {
  profiles: profileQueries,
  essays: essayQueries,
  flashcardDecks: flashcardDeckQueries,
  documents: documentQueries,
  folders: folderQueries,
  quizzes: quizQueries,
  aiChats: aiChatQueries,
  userSettings: userSettingQueries,
};

export default db;
