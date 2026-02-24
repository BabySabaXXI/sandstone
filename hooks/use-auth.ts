/**
 * Use Auth Hook
 * =============
 * Simple authentication hook for components
 */

'use client';

import { useUser } from './useUser';
import { createClient } from '@/lib/supabase/client';
import { useCallback } from 'react';

export function useAuth() {
  const { data: user, error, isLoading, mutate } = useUser();

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    mutate(null);
  }, [mutate]);

  const refreshUser = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signOut,
    refreshUser,
  };
}

export default useAuth;
