/**
 * Use Shares Hook
 * ===============
 * Hook for managing shares with real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import { useCollaborationStore } from '@/lib/collaboration/store';
import { shareApi } from '@/lib/collaboration/api';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';
import type { ShareWithDetails, ContentType, SharePermission, CreateShareRequest } from '@/lib/collaboration/types';

interface UseSharesOptions {
  autoLoad?: boolean;
}

export function useShares(options: UseSharesOptions = {}) {
  const { autoLoad = true } = options;
  const store = useCollaborationStore();
  const [channel, setChannel] = useState<ReturnType<typeof getRealtimeClient>['channel'] | null>(null);

  // Get shares from store
  const sentShares = store.shares.sent;
  const receivedShares = store.shares.received;
  const isLoading = store.shares.isLoading;
  const error = store.shares.error;

  // Load shares
  const loadShares = useCallback(async () => {
    store.setSharesLoading(true);
    store.setSharesError(null);

    try {
      const { sent, received } = await shareApi.getShares();
      store.setShares({ sent, received });
    } catch (err) {
      store.setSharesError(err instanceof Error ? err.message : 'Failed to load shares');
    } finally {
      store.setSharesLoading(false);
    }
  }, [store]);

  // Create share
  const createShare = useCallback(async (request: CreateShareRequest) => {
    try {
      const share = await shareApi.createShare(request);
      // Reload shares to get full details
      await loadShares();
      return share;
    } catch (err) {
      throw err;
    }
  }, [loadShares]);

  // Accept share
  const acceptShare = useCallback(async (id: string) => {
    try {
      const share = await shareApi.acceptShare(id);
      store.updateShare(id, share);
      return share;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Decline share
  const declineShare = useCallback(async (id: string) => {
    try {
      const share = await shareApi.declineShare(id);
      store.updateShare(id, share);
      return share;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Revoke share
  const revokeShare = useCallback(async (id: string) => {
    try {
      const share = await shareApi.revokeShare(id);
      store.updateShare(id, share);
      return share;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Delete share
  const deleteShare = useCallback(async (id: string) => {
    try {
      await shareApi.deleteShare(id);
      store.removeShare(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Update share permission
  const updatePermission = useCallback(async (id: string, permission: SharePermission) => {
    try {
      const share = await shareApi.updateShare(id, { permission });
      store.updateShare(id, share);
      return share;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Check access to content
  const checkAccess = useCallback(async (contentType: ContentType, contentId: string) => {
    try {
      return await shareApi.checkAccess(contentType, contentId);
    } catch (err) {
      return { hasAccess: false, permission: null as SharePermission | null };
    }
  }, []);

  // Get shares by content
  const getSharesByContent = useCallback((contentType: ContentType, contentId: string) => {
    return sentShares.filter(s => s.content_type === contentType && s.content_id === contentId);
  }, [sentShares]);

  // Setup real-time subscription
  useEffect(() => {
    const client = getRealtimeClient();
    const channelName = 'shares:user';
    const newChannel = client.channel(channelName);

    newChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shares',
        },
        (payload) => {
          // Reload shares when any change occurs
          loadShares();
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [loadShares]);

  // Auto-load shares on mount
  useEffect(() => {
    if (autoLoad) {
      loadShares();
    }
  }, [autoLoad, loadShares]);

  return {
    sentShares,
    receivedShares,
    isLoading,
    error,
    loadShares,
    createShare,
    acceptShare,
    declineShare,
    revokeShare,
    deleteShare,
    updatePermission,
    checkAccess,
    getSharesByContent,
  };
}

export default useShares;
