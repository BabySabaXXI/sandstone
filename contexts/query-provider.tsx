"use client";

import { ReactNode, memo } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useNotification } from "./notification-context";

// =============================================================================
// Types
// =============================================================================

interface QueryProviderProps {
  children: ReactNode;
  showDevtools?: boolean;
}

// =============================================================================
// Query Client Configuration
// =============================================================================

function createQueryClient(showError: (message: string) => string) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast for queries that don't have their own error handling
        if (query.meta?.showToast !== false) {
          const message = error instanceof Error ? error.message : "An error occurred";
          showError(message);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.showToast !== false) {
          const message = error instanceof Error ? error.message : "An error occurred";
          showError(message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Stale time: 5 minutes
        staleTime: 1000 * 60 * 5,
        // Cache time: 10 minutes
        gcTime: 1000 * 60 * 10,
        // Retry failed requests 3 times
        retry: 3,
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
        // Don't refetch on mount if data is fresh
        refetchOnMount: "always",
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
  });
}

// =============================================================================
// Provider Component
// =============================================================================

// Singleton query client instance
let queryClientInstance: QueryClient | null = null;

function getQueryClient(showError: (message: string) => string): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient(showError);
  }
  return queryClientInstance;
}

function QueryProviderComponent({
  children,
  showDevtools = process.env.NODE_ENV === "development",
}: QueryProviderProps) {
  // We need to use the notification hook inside the component
  // But we can't use it before the NotificationProvider is mounted
  // So we create the query client lazily
  const [queryClient] = useState(() => {
    // Create a temporary query client without error handling
    // The actual error handling will be set up after NotificationProvider mounts
    return createQueryClient(() => "");
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

// Fix: Import useState
import { useState } from "react";

// Better approach: Create a wrapper that has access to notification
function QueryProviderWithNotification({
  children,
  showDevtools = process.env.NODE_ENV === "development",
}: QueryProviderProps) {
  const { showError } = useNotification();
  
  const [queryClient] = useState(() => createQueryClient(showError));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} position="bottom" />}
    </QueryClientProvider>
  );
}

// Export the version with notification support
export const QueryProvider = memo(QueryProviderWithNotification);
QueryProvider.displayName = "QueryProvider";

// =============================================================================
// Query Keys Factory
// =============================================================================

/**
 * Query keys factory for type-safe query key management
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  
  // Documents
  documents: {
    all: ["documents"] as const,
    list: (filters?: { subject?: string; folderId?: string }) =>
      [...queryKeys.documents.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.documents.all, "detail", id] as const,
    folders: () => [...queryKeys.documents.all, "folders"] as const,
  },
  
  // Essays
  essays: {
    all: ["essays"] as const,
    list: (filters?: { subject?: string }) =>
      [...queryKeys.essays.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.essays.all, "detail", id] as const,
    stats: () => [...queryKeys.essays.all, "stats"] as const,
  },
  
  // Flashcards
  flashcards: {
    all: ["flashcards"] as const,
    decks: () => [...queryKeys.flashcards.all, "decks"] as const,
    deck: (id: string) => [...queryKeys.flashcards.all, "deck", id] as const,
    cards: (deckId: string) =>
      [...queryKeys.flashcards.deck(deckId), "cards"] as const,
    due: (deckId: string) =>
      [...queryKeys.flashcards.deck(deckId), "due"] as const,
    stats: (deckId: string) =>
      [...queryKeys.flashcards.deck(deckId), "stats"] as const,
  },
  
  // Quizzes
  quizzes: {
    all: ["quizzes"] as const,
    list: (filters?: { subject?: string }) =>
      [...queryKeys.quizzes.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.quizzes.all, "detail", id] as const,
    attempts: (quizId: string) =>
      [...queryKeys.quizzes.detail(quizId), "attempts"] as const,
  },
  
  // Chats
  chats: {
    all: ["chats"] as const,
    list: (filters?: { subject?: string }) =>
      [...queryKeys.chats.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.chats.all, "detail", id] as const,
    messages: (chatId: string) =>
      [...queryKeys.chats.detail(chatId), "messages"] as const,
  },
  
  // Subjects
  subjects: {
    all: ["subjects"] as const,
    list: () => [...queryKeys.subjects.all, "list"] as const,
    config: (id: string) => [...queryKeys.subjects.all, "config", id] as const,
  },
  
  // User
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    settings: () => [...queryKeys.user.all, "settings"] as const,
    stats: () => [...queryKeys.user.all, "stats"] as const,
  },
} as const;

// =============================================================================
// Query Options Helpers
// =============================================================================

/**
 * Create query options with default settings
 */
export function createQueryOptions<T>(
  options: {
    queryKey: readonly unknown[];
    queryFn: () => Promise<T>;
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchInterval?: number | false;
    showToast?: boolean;
  }
) {
  return {
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    enabled: options.enabled ?? true,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    refetchInterval: options.refetchInterval,
    meta: {
      showToast: options.showToast ?? true,
    },
  };
}

/**
 * Create mutation options with default settings
 */
export function createMutationOptions<T, V>(
  options: {
    mutationFn: (variables: V) => Promise<T>;
    onSuccess?: (data: T, variables: V) => void;
    onError?: (error: Error, variables: V) => void;
    invalidateQueries?: readonly unknown[][];
    showToast?: boolean;
  }
) {
  return {
    mutationFn: options.mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    meta: {
      showToast: options.showToast ?? true,
      invalidateQueries: options.invalidateQueries,
    },
  };
}

export default QueryProvider;
