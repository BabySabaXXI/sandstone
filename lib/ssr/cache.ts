/**
 * Server-Side Caching Utilities
 * 
 * This module provides caching strategies for Next.js App Router:
 * - fetch caching with revalidation
 * - unstable_cache for data caching
 * - Route segment caching
 */

import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

// ============================================================================
// Cache Configuration
// ============================================================================

export interface CacheConfig {
  /** Cache duration in seconds */
  revalidate?: number | false;
  /** Cache tags for selective revalidation */
  tags?: string[];
  /** Whether to use dynamic rendering */
  dynamic?: "force-dynamic" | "auto" | "error" | "force-static";
}

/**
 * Default cache configurations for different data types
 */
export const cacheConfigs = {
  /** User-specific data - short cache */
  user: {
    revalidate: 60,
    tags: ["user"],
    dynamic: "auto" as const,
  },
  /** Dashboard data - short cache for real-time feel */
  dashboard: {
    revalidate: 60,
    tags: ["dashboard"],
    dynamic: "auto" as const,
  },
  /** Activity data - very short cache */
  activity: {
    revalidate: 30,
    tags: ["activity"],
    dynamic: "auto" as const,
  },
  /** Documents - moderate cache */
  documents: {
    revalidate: 120,
    tags: ["documents"],
    dynamic: "auto" as const,
  },
  /** Flashcards - moderate cache */
  flashcards: {
    revalidate: 120,
    tags: ["flashcards"],
    dynamic: "auto" as const,
  },
  /** Library resources - longer cache (public data) */
  library: {
    revalidate: 300,
    tags: ["library"],
    dynamic: "auto" as const,
  },
  /** Quiz data - short cache */
  quiz: {
    revalidate: 60,
    tags: ["quiz"],
    dynamic: "auto" as const,
  },
  /** Static content - long cache */
  static: {
    revalidate: 3600,
    tags: ["static"],
    dynamic: "auto" as const,
  },
  /** No cache - for real-time data */
  realtime: {
    revalidate: 0,
    tags: [],
    dynamic: "force-dynamic" as const,
  },
} as const;

// ============================================================================
// Cache Tags
// ============================================================================

/**
 * Generate cache tags for different entities
 */
export const generateCacheTags = {
  user: (userId: string) => `user:${userId}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
  documents: (userId: string) => `documents:${userId}`,
  document: (documentId: string) => `document:${documentId}`,
  flashcards: (userId: string) => `flashcards:${userId}`,
  deck: (deckId: string) => `deck:${deckId}`,
  library: (subject?: string) => `library:${subject || "all"}`,
  libraryResource: (resourceId: string) => `library-resource:${resourceId}`,
  quiz: (quizId: string) => `quiz:${quizId}`,
  quizzes: (userId: string) => `quizzes:${userId}`,
  activity: (userId: string) => `activity:${userId}`,
  progress: (userId: string) => `progress:${userId}`,
  subject: (subject: string) => `subject:${subject}`,
} as const;

// ============================================================================
// Cache Wrapper Functions
// ============================================================================

/**
 * Wrap a function with Next.js unstable_cache
 * 
 * @param fn - The function to cache
 * @param keyParts - Unique key parts for the cache
 * @param config - Cache configuration
 * @returns Cached function
 * 
 * @example
 * const getCachedUser = withCache(
 *   async (userId: string) => fetchUser(userId),
 *   (userId) => ["user", userId],
 *   cacheConfigs.user
 * );
 */
export function withCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyParts: (...args: TArgs) => string[],
  config: CacheConfig = cacheConfigs.static
) {
  return unstable_cache(
    async (...args: TArgs): Promise<TReturn> => {
      return fn(...args);
    },
    keyParts,
    {
      revalidate: config.revalidate,
      tags: config.tags,
    }
  );
}

/**
 * Create a cached data fetcher with automatic tag generation
 * 
 * @example
 * const getUserData = createCachedFetcher(
 *   "user",
 *   async (userId) => fetchUser(userId),
 *   cacheConfigs.user
 * );
 */
export function createCachedFetcher<TArgs extends unknown[], TReturn>(
  entityType: keyof typeof generateCacheTags,
  fetcher: (...args: TArgs) => Promise<TReturn>,
  config: CacheConfig = cacheConfigs.static
) {
  return unstable_cache(
    async (...args: TArgs): Promise<TReturn> => {
      return fetcher(...args);
    },
    (userId) => [entityType, userId],
    {
      revalidate: config.revalidate,
      tags: [...(config.tags || []), entityType],
    }
  );
}

// ============================================================================
// Cache Revalidation
// ============================================================================

/**
 * Revalidate cache by tag
 * Call this after mutations to invalidate cached data
 */
export async function invalidateCache(tag: string): Promise<void> {
  revalidateTag(tag);
}

/**
 * Revalidate multiple cache tags
 */
export async function invalidateCaches(tags: string[]): Promise<void> {
  tags.forEach((tag) => revalidateTag(tag));
}

/**
 * Revalidate user-related caches
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  const tags = [
    generateCacheTags.user(userId),
    generateCacheTags.dashboard(userId),
    generateCacheTags.activity(userId),
    generateCacheTags.progress(userId),
  ];
  invalidateCaches(tags);
}

/**
 * Revalidate document caches
 */
export async function invalidateDocumentCache(
  userId: string,
  documentId?: string
): Promise<void> {
  const tags = [generateCacheTags.documents(userId)];
  if (documentId) {
    tags.push(generateCacheTags.document(documentId));
  }
  invalidateCaches(tags);
}

/**
 * Revalidate flashcard caches
 */
export async function invalidateFlashcardCache(
  userId: string,
  deckId?: string
): Promise<void> {
  const tags = [generateCacheTags.flashcards(userId)];
  if (deckId) {
    tags.push(generateCacheTags.deck(deckId));
  }
  invalidateCaches(tags);
}

/**
 * Revalidate library caches
 */
export async function invalidateLibraryCache(subject?: string): Promise<void> {
  invalidateCache(generateCacheTags.library(subject));
}

/**
 * Revalidate quiz caches
 */
export async function invalidateQuizCache(
  userId: string,
  quizId?: string
): Promise<void> {
  const tags = [generateCacheTags.quizzes(userId)];
  if (quizId) {
    tags.push(generateCacheTags.quiz(quizId));
  }
  invalidateCaches(tags);
}

// ============================================================================
// Fetch Cache Configuration
// ============================================================================

/**
 * Create fetch options with caching
 * Use this for external API calls
 */
export function createFetchOptions(
  config: CacheConfig = cacheConfigs.static
): RequestInit {
  return {
    next: {
      revalidate: config.revalidate === false ? undefined : config.revalidate,
      tags: config.tags,
    },
  };
}

/**
 * Cached fetch wrapper for external APIs
 */
export async function cachedFetch<T>(
  url: string,
  config: CacheConfig = cacheConfigs.static
): Promise<T> {
  const response = await fetch(url, createFetchOptions(config));
  
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.statusText}`);
  }
  
  return response.json();
}

// ============================================================================
// Route Segment Cache Configuration
// ============================================================================

/**
 * Export this from page.tsx to configure caching
 * @example
 * export const revalidate = cacheDurations.dashboard;
 * export const dynamic = 'force-dynamic';
 */
export const cacheDurations = {
  /** No cache - real-time data */
  realtime: 0,
  /** Very short - activity feeds */
  activity: 30,
  /** Short - user data */
  user: 60,
  /** Short - dashboard data */
  dashboard: 60,
  /** Medium - documents, flashcards */
  medium: 120,
  /** Long - library resources */
  library: 300,
  /** Very long - static content */
  static: 3600,
} as const;

/**
 * Route segment configuration presets
 * Export these from page.tsx files
 */
export const routeConfig = {
  /** Dashboard pages */
  dashboard: {
    revalidate: cacheDurations.dashboard,
    dynamic: "auto" as const,
  },
  /** Document pages */
  documents: {
    revalidate: cacheDurations.medium,
    dynamic: "auto" as const,
  },
  /** Flashcard pages */
  flashcards: {
    revalidate: cacheDurations.medium,
    dynamic: "auto" as const,
  },
  /** Library pages */
  library: {
    revalidate: cacheDurations.library,
    dynamic: "auto" as const,
  },
  /** Quiz pages */
  quiz: {
    revalidate: cacheDurations.user,
    dynamic: "auto" as const,
  },
  /** Activity pages */
  activity: {
    revalidate: cacheDurations.activity,
    dynamic: "auto" as const,
  },
  /** Real-time pages */
  realtime: {
    revalidate: cacheDurations.realtime,
    dynamic: "force-dynamic" as const,
  },
  /** Static pages */
  static: {
    revalidate: cacheDurations.static,
    dynamic: "auto" as const,
  },
} as const;

// ============================================================================
// Cache Statistics (Development Only)
// ============================================================================

interface CacheStats {
  hits: number;
  misses: number;
  lastAccessed: Date;
}

const cacheStats = new Map<string, CacheStats>();

/**
 * Record cache hit (development only)
 */
export function recordCacheHit(key: string): void {
  if (process.env.NODE_ENV !== "development") return;
  
  const stats = cacheStats.get(key) || { hits: 0, misses: 0, lastAccessed: new Date() };
  stats.hits++;
  stats.lastAccessed = new Date();
  cacheStats.set(key, stats);
}

/**
 * Record cache miss (development only)
 */
export function recordCacheMiss(key: string): void {
  if (process.env.NODE_ENV !== "development") return;
  
  const stats = cacheStats.get(key) || { hits: 0, misses: 0, lastAccessed: new Date() };
  stats.misses++;
  stats.lastAccessed = new Date();
  cacheStats.set(key, stats);
}

/**
 * Get cache statistics (development only)
 */
export function getCacheStats(): Record<string, CacheStats> {
  if (process.env.NODE_ENV !== "development") return {};
  
  return Object.fromEntries(cacheStats);
}

/**
 * Clear cache statistics (development only)
 */
export function clearCacheStats(): void {
  cacheStats.clear();
}
