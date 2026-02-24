/**
 * SWR Configuration for Sandstone App
 * Provides optimized caching, retry logic, and error handling
 */

import { SWRConfiguration } from 'swr';
import { toast } from 'sonner';

// ============================================================================
// Error Retry Configuration
// ============================================================================

/**
 * Custom retry function with exponential backoff
 */
export const retryWithBackoff = (
  error: Error,
  key: string,
  config: SWRConfiguration,
  revalidate: { count: number; errorRetryCount?: number }
): boolean => {
  // Don't retry on 4xx errors (client errors)
  if (error.message.includes('4')) {
    return false;
  }

  // Limit retry count
  const maxRetries = config.errorRetryCount ?? 3;
  if (revalidate.count >= maxRetries) {
    return false;
  }

  return true;
};

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (
  retryCount: number,
  baseDelay: number = 1000
): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s...
  const delay = baseDelay * Math.pow(2, retryCount);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, 30000); // Max 30s
};

// ============================================================================
// Fetcher Functions
// ============================================================================

/**
 * Generic fetcher for REST API endpoints
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * Fetcher with authentication token
 */
export const authenticatedFetcher = async <T>(
  url: string,
  token: string
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

/**
 * POST request fetcher
 */
export const postFetcher = async <T, D = unknown>(
  url: string,
  data: D
): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

// ============================================================================
// Global SWR Configuration
// ============================================================================

export const globalSWRConfig: SWRConfiguration = {
  // Refresh interval: 5 minutes for stale data
  refreshInterval: 5 * 60 * 1000,
  
  // Deduping interval: 2 seconds to prevent duplicate requests
  dedupingInterval: 2000,
  
  // Keep previous data while fetching new data
  keepPreviousData: true,
  
  // Retry configuration
  shouldRetryOnError: retryWithBackoff,
  errorRetryCount: 3,
  errorRetryInterval: (retryCount: number) => getRetryDelay(retryCount),
  
  // Revalidate on focus (useful for multi-tab sync)
  revalidateOnFocus: true,
  
  // Revalidate on reconnect
  revalidateOnReconnect: true,
  
  // Don't revalidate on mount if data is fresh
  revalidateIfStale: false,
  
  // Loading timeout
  loadingTimeout: 10000,
  
  // Error handling
  onError: (error: Error, key: string) => {
    console.error(`SWR Error [${key}]:`, error);
    
    // Show toast for non-retryable errors
    if (!retryWithBackoff(error, key, globalSWRConfig, { count: 0 })) {
      toast.error(`Failed to load data: ${error.message}`);
    }
  },
  
  // Success handling
  onSuccess: (data: unknown, key: string) => {
    console.log(`SWR Success [${key}]:`, data);
  },
  
  // Custom fetcher
  fetcher,
};

// ============================================================================
// Entity-Specific Configurations
// ============================================================================

/**
 * Configuration for user data (longer cache, less frequent updates)
 */
export const userSWRConfig: SWRConfiguration = {
  ...globalSWRConfig,
  refreshInterval: 10 * 60 * 1000, // 10 minutes
  dedupingInterval: 5000,
  revalidateOnFocus: false,
};

/**
 * Configuration for documents (frequent updates)
 */
export const documentSWRConfig: SWRConfiguration = {
  ...globalSWRConfig,
  refreshInterval: 30 * 1000, // 30 seconds
  dedupingInterval: 1000,
  revalidateOnFocus: true,
};

/**
 * Configuration for real-time data (frequent updates)
 */
export const realtimeSWRConfig: SWRConfiguration = {
  ...globalSWRConfig,
  refreshInterval: 5000, // 5 seconds
  dedupingInterval: 500,
  revalidateOnFocus: true,
};

/**
 * Configuration for static data (rarely changes)
 */
export const staticSWRConfig: SWRConfiguration = {
  ...globalSWRConfig,
  refreshInterval: 0, // Never auto-refresh
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
};

// ============================================================================
// Cache Keys
// ============================================================================

export const cacheKeys = {
  // Documents
  documents: 'documents',
  document: (id: string) => `document/${id}`,
  documentsInFolder: (folderId: string | null) => `documents/folder/${folderId ?? 'root'}`,
  documentsBySubject: (subject: string) => `documents/subject/${subject}`,
  
  // Folders
  folders: 'folders',
  folder: (id: string) => `folder/${id}`,
  foldersByParent: (parentId: string | null) => `folders/parent/${parentId ?? 'root'}`,
  
  // Flashcards
  flashcards: 'flashcards',
  flashcard: (id: string) => `flashcard/${id}`,
  flashcardsByDocument: (documentId: string) => `flashcards/document/${documentId}`,
  flashcardDecks: 'flashcard-decks',
  flashcardDeck: (id: string) => `flashcard-deck/${id}`,
  
  // Quizzes
  quizzes: 'quizzes',
  quiz: (id: string) => `quiz/${id}`,
  quizzesByDocument: (documentId: string) => `quizzes/document/${documentId}`,
  quizAttempts: (quizId: string) => `quiz/${quizId}/attempts`,
  
  // Essays
  essays: 'essays',
  essay: (id: string) => `essay/${id}`,
  essaysByDocument: (documentId: string) => `essays/document/${documentId}`,
  
  // Chat
  chatSessions: 'chat-sessions',
  chatSession: (id: string) => `chat-session/${id}`,
  chatMessages: (sessionId: string) => `chat-session/${sessionId}/messages`,
  
  // Subjects
  subjects: 'subjects',
  subject: (id: string) => `subject/${id}`,
  
  // User
  user: 'user',
  userProfile: 'user/profile',
  userSettings: 'user/settings',
  userStats: 'user/stats',
  
  // Search
  search: (query: string) => `search/${query}`,
  
  // Stats
  stats: 'stats',
  documentStats: 'stats/documents',
  studyStats: 'stats/study',
} as const;

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Cache mutation helpers for optimistic updates
 */
export const cacheMutations = {
  /**
   * Add item to list cache
   */
  addToList: <T extends { id: string }>(
    currentData: T[] | undefined,
    newItem: T
  ): T[] => {
    if (!currentData) return [newItem];
    return [newItem, ...currentData];
  },
  
  /**
   * Update item in list cache
   */
  updateInList: <T extends { id: string }>(
    currentData: T[] | undefined,
    updatedItem: T
  ): T[] => {
    if (!currentData) return [updatedItem];
    return currentData.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
  },
  
  /**
   * Remove item from list cache
   */
  removeFromList: <T extends { id: string }>(
    currentData: T[] | undefined,
    itemId: string
  ): T[] => {
    if (!currentData) return [];
    return currentData.filter((item) => item.id !== itemId);
  },
  
  /**
   * Update single item cache
   */
  updateItem: <T>(
    currentData: T | undefined,
    updates: Partial<T>
  ): T | undefined => {
    if (!currentData) return undefined;
    return { ...currentData, ...updates };
  },
};

export default globalSWRConfig;
