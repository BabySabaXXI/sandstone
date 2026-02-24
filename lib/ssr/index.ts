/**
 * SSR Utilities Index
 * 
 * Centralized exports for all SSR-related utilities.
 */

// Data Fetching
export {
  // User data
  getCurrentUser,
  getUserProfile,
  
  // Dashboard data
  getDashboardStats,
  getRecentActivity,
  getStudyProgress,
  fetchDashboardData,
  
  // Documents data
  getUserDocuments,
  
  // Flashcards data
  getUserFlashcardDecks,
  
  // Library data
  getLibraryResources,
  
  // Quiz data
  getQuizData,
  
  // Initial app data
  fetchInitialAppData,
  
  // Error handling
  safeFetch,
  batchFetch,
} from "./data-fetching";

// Types
export type {
  DashboardStats,
  RecentActivity,
  StudyProgress,
  Document,
  FlashcardDeck,
  LibraryResource,
} from "./data-fetching";

// Caching
export {
  // Cache configuration
  cacheConfigs,
  cacheDurations,
  routeConfig,
  
  // Cache tags
  generateCacheTags,
  revalidationTags,
  
  // Cache wrappers
  withCache,
  createCachedFetcher,
  
  // Cache invalidation
  invalidateCache,
  invalidateCaches,
  invalidateUserCache,
  invalidateDocumentCache,
  invalidateFlashcardCache,
  invalidateLibraryCache,
  invalidateQuizCache,
  
  // Fetch options
  createFetchOptions,
  cachedFetch,
  
  // Cache stats (dev only)
  recordCacheHit,
  recordCacheMiss,
  getCacheStats,
  clearCacheStats,
} from "./cache";

export type { CacheConfig } from "./cache";
