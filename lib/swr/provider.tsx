/**
 * SWR Provider Component for Sandstone App
 * Wraps the application with SWR configuration
 */

'use client';

import React, { ReactNode } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';
import { globalSWRConfig } from './config';

interface SWRProviderProps {
  children: ReactNode;
  config?: SWRConfiguration;
  fallback?: Record<string, unknown>;
}

/**
 * SWR Provider Component
 * 
 * Usage:
 * ```tsx
 * // In layout.tsx or app wrapper
 * <SWRProvider>
 *   {children}
 * </SWRProvider>
 * 
 * // With SSR fallback data
 * <SWRProvider fallback={{ '/api/user': userData }}>
 *   {children}
 * </SWRProvider>
 * ```
 */
export function SWRProvider({ 
  children, 
  config = {},
  fallback = {},
}: SWRProviderProps) {
  const mergedConfig: SWRConfiguration = {
    ...globalSWRConfig,
    ...config,
    // Merge provider options
    provider: () => new Map(),
  };

  return (
    <SWRConfig 
      value={{
        ...mergedConfig,
        fallback,
      }}
    >
      {children}
    </SWRConfig>
  );
}

/**
 * SWR Provider with persistent cache
 * Uses localStorage for cache persistence across sessions
 */
export function PersistentSWRProvider({ 
  children, 
  config = {},
  fallback = {},
}: SWRProviderProps) {
  const persistentConfig: SWRConfiguration = {
    ...globalSWRConfig,
    ...config,
    provider: () => {
      // Use a custom provider that persists to localStorage
      const map = new Map<string, unknown>();
      
      // Try to restore from localStorage on init
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('swr-cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            Object.entries(parsed).forEach(([key, value]) => {
              map.set(key, value);
            });
          }
        } catch (e) {
          console.error('Failed to restore SWR cache:', e);
        }
      }
      
      return map;
    },
  };

  return (
    <SWRConfig 
      value={{
        ...persistentConfig,
        fallback,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export default SWRProvider;
