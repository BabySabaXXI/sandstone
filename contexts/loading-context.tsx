"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
  ReactNode,
} from "react";

// =============================================================================
// Types
// =============================================================================

interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

type LoadingKey = string;

interface LoadingContextType {
  // Global loading state
  isLoading: boolean;
  globalMessage: string | undefined;
  globalProgress: number | undefined;
  
  // Named loading states
  getLoadingState: (key: LoadingKey) => LoadingState;
  isKeyLoading: (key: LoadingKey) => boolean;
  
  // Actions
  startLoading: (key?: LoadingKey, message?: string) => void;
  stopLoading: (key?: LoadingKey) => void;
  updateProgress: (key: LoadingKey, progress: number) => void;
  updateMessage: (key: LoadingKey, message: string) => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Batch operations
  startMultiple: (keys: LoadingKey[]) => void;
  stopMultiple: (keys: LoadingKey[]) => void;
  stopAll: () => void;
  
  // Async wrapper
  withLoading: <T>(
    promise: Promise<T>,
    key?: LoadingKey,
    options?: {
      message?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => Promise<T>;
}

interface LoadingProviderProps {
  children: ReactNode;
  defaultMessage?: string;
}

// =============================================================================
// Context
// =============================================================================

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// =============================================================================
// Constants
// =============================================================================

const GLOBAL_KEY = "__global__";

// =============================================================================
// Provider Component
// =============================================================================

function LoadingProviderComponent({
  children,
  defaultMessage = "Loading...",
}: LoadingProviderProps) {
  // State: Map of loading keys to their states
  const [loadingStates, setLoadingStates] = useState<Map<LoadingKey, LoadingState>>(
    new Map()
  );

  // =============================================================================
  // Helper Functions
  // =============================================================================

  const getState = useCallback((key: LoadingKey = GLOBAL_KEY): LoadingState => {
    return loadingStates.get(key) || { isLoading: false };
  }, [loadingStates]);

  const setState = useCallback((key: LoadingKey, state: LoadingState) => {
    setLoadingStates((prev) => {
      const next = new Map(prev);
      if (state.isLoading) {
        next.set(key, state);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  // =============================================================================
  // Computed Values
  // =============================================================================

  const isLoading = useMemo(() => {
    return loadingStates.size > 0;
  }, [loadingStates]);

  const globalState = useMemo(() => {
    return getState(GLOBAL_KEY);
  }, [getState]);

  // =============================================================================
  // Actions
  // =============================================================================

  const startLoading = useCallback((key: LoadingKey = GLOBAL_KEY, message?: string) => {
    setState(key, {
      isLoading: true,
      message: message || defaultMessage,
      progress: undefined,
    });
  }, [setState, defaultMessage]);

  const stopLoading = useCallback((key: LoadingKey = GLOBAL_KEY) => {
    setState(key, { isLoading: false });
  }, [setState]);

  const updateProgress = useCallback((key: LoadingKey, progress: number) => {
    setLoadingStates((prev) => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, { ...current, progress: Math.min(100, Math.max(0, progress)) });
      }
      return next;
    });
  }, []);

  const updateMessage = useCallback((key: LoadingKey, message: string) => {
    setLoadingStates((prev) => {
      const next = new Map(prev);
      const current = next.get(key);
      if (current) {
        next.set(key, { ...current, message });
      }
      return next;
    });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean, message?: string) => {
    if (loading) {
      startLoading(GLOBAL_KEY, message);
    } else {
      stopLoading(GLOBAL_KEY);
    }
  }, [startLoading, stopLoading]);

  const startMultiple = useCallback((keys: LoadingKey[]) => {
    setLoadingStates((prev) => {
      const next = new Map(prev);
      keys.forEach((key) => {
        next.set(key, { isLoading: true, message: defaultMessage });
      });
      return next;
    });
  }, [defaultMessage]);

  const stopMultiple = useCallback((keys: LoadingKey[]) => {
    setLoadingStates((prev) => {
      const next = new Map(prev);
      keys.forEach((key) => next.delete(key));
      return next;
    });
  }, []);

  const stopAll = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  // =============================================================================
  // Async Wrapper
  // =============================================================================

  const withLoading = useCallback(async <T,>(
    promise: Promise<T>,
    key: LoadingKey = GLOBAL_KEY,
    options?: {
      message?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<T> => {
    startLoading(key, options?.message);
    
    try {
      const result = await promise;
      stopLoading(key);
      return result;
    } catch (error) {
      stopLoading(key);
      throw error;
    }
  }, [startLoading, stopLoading]);

  // =============================================================================
  // Memoized Value
  // =============================================================================

  const value = useMemo<LoadingContextType>(
    () => ({
      isLoading,
      globalMessage: globalState.message,
      globalProgress: globalState.progress,
      getLoadingState: getState,
      isKeyLoading: (key) => getState(key).isLoading,
      startLoading,
      stopLoading,
      updateProgress,
      updateMessage,
      setGlobalLoading,
      startMultiple,
      stopMultiple,
      stopAll,
      withLoading,
    }),
    [
      isLoading,
      globalState,
      getState,
      startLoading,
      stopLoading,
      updateProgress,
      updateMessage,
      setGlobalLoading,
      startMultiple,
      stopMultiple,
      stopAll,
      withLoading,
    ]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

// Memoize the provider
export const LoadingProvider = memo(LoadingProviderComponent);
LoadingProvider.displayName = "LoadingProvider";

// =============================================================================
// Hook
// =============================================================================

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Hook to check if any loading is active
 */
export function useIsLoading(): boolean {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useIsLoading must be used within a LoadingProvider");
  }
  return context.isLoading;
}

/**
 * Hook for a specific loading key
 */
export function useLoadingKey(key: LoadingKey): LoadingState {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoadingKey must be used within a LoadingProvider");
  }
  return context.getLoadingState(key);
}

/**
 * Hook to create a loading handler for a specific key
 */
export function useLoadingHandler(key: LoadingKey) {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoadingHandler must be used within a LoadingProvider");
  }
  
  return useMemo(
    () => ({
      start: (message?: string) => context.startLoading(key, message),
      stop: () => context.stopLoading(key),
      updateProgress: (progress: number) => context.updateProgress(key, progress),
      updateMessage: (message: string) => context.updateMessage(key, message),
      isLoading: context.isKeyLoading(key),
      state: context.getLoadingState(key),
    }),
    [context, key]
  );
}

export default LoadingContext;
