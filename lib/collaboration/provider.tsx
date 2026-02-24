/**
 * Collaboration Provider
 * ======================
 * Provider component for collaboration features
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCollaborationStore } from './store';
import { useNotifications } from '@/hooks/collaboration/use-notifications';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';

interface CollaborationContextValue {
  isInitialized: boolean;
  unreadNotificationCount: number;
}

const CollaborationContext = createContext<CollaborationContextValue>({
  isInitialized: false,
  unreadNotificationCount: 0,
});

export function useCollaboration() {
  return useContext(CollaborationContext);
}

interface CollaborationProviderProps {
  children: React.ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { unreadCount } = useNotifications({ autoLoad: true });

  useEffect(() => {
    // Initialize collaboration system
    const initialize = async () => {
      try {
        // Check realtime connection
        const client = getRealtimeClient();
        
        // Set up global error handling for collaboration
        window.addEventListener('error', (event) => {
          if (event.message?.includes('realtime') || event.message?.includes('collaboration')) {
            console.error('Collaboration error:', event.error);
          }
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    initialize();
  }, []);

  const value: CollaborationContextValue = {
    isInitialized,
    unreadNotificationCount: unreadCount,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export default CollaborationProvider;
