/**
 * Use Comments Hook
 * ================
 * Hook for managing comments with real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import { useCollaborationStore } from '@/lib/collaboration/store';
import { commentApi } from '@/lib/collaboration/api';
import { getRealtimeClient, CHANNELS, EVENTS } from '@/lib/supabase/realtime-client';
import type { CommentWithUser, ContentType, CreateCommentRequest } from '@/lib/collaboration/types';

interface UseCommentsOptions {
  contentType: ContentType;
  contentId: string;
  autoLoad?: boolean;
}

export function useComments({ contentType, contentId, autoLoad = true }: UseCommentsOptions) {
  const store = useCollaborationStore();
  const [channel, setChannel] = useState<ReturnType<typeof getRealtimeClient>['channel'] | null>(null);

  // Get comments from store
  const comments = store.comments.items;
  const isLoading = store.comments.isLoading;
  const error = store.comments.error;
  const totalCount = store.comments.totalCount;

  // Load comments
  const loadComments = useCallback(async () => {
    if (!contentId) return;

    store.setCommentsLoading(true);
    store.setCommentsError(null);

    try {
      const { comments: data, totalCount } = await commentApi.getComments(contentType, contentId);
      store.setComments(data, totalCount);
    } catch (err) {
      store.setCommentsError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      store.setCommentsLoading(false);
    }
  }, [contentType, contentId, store]);

  // Add comment
  const addComment = useCallback(async (request: Omit<CreateCommentRequest, 'content_type' | 'content_id'>) => {
    try {
      const comment = await commentApi.createComment({
        ...request,
        content_type: contentType,
        content_id: contentId,
      });
      
      // Fetch full comment with user details
      const { comments: updatedComments, totalCount } = await commentApi.getComments(contentType, contentId);
      store.setComments(updatedComments, totalCount);
      
      return comment;
    } catch (err) {
      throw err;
    }
  }, [contentType, contentId, store]);

  // Update comment
  const updateComment = useCallback(async (id: string, text: string) => {
    try {
      const comment = await commentApi.updateComment(id, text);
      store.updateComment(id, comment);
      return comment;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Delete comment
  const deleteComment = useCallback(async (id: string) => {
    try {
      await commentApi.deleteComment(id);
      store.removeComment(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Resolve comment
  const resolveComment = useCallback(async (id: string) => {
    try {
      const comment = await commentApi.resolveComment(id);
      store.updateComment(id, comment);
      return comment;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Add reaction
  const addReaction = useCallback(async (commentId: string, emoji: string) => {
    try {
      await commentApi.addReaction(commentId, emoji);
      // Reload comments to get updated reactions
      await loadComments();
    } catch (err) {
      throw err;
    }
  }, [loadComments]);

  // Remove reaction
  const removeReaction = useCallback(async (commentId: string, emoji: string) => {
    try {
      await commentApi.removeReaction(commentId, emoji);
      // Reload comments to get updated reactions
      await loadComments();
    } catch (err) {
      throw err;
    }
  }, [loadComments]);

  // Setup real-time subscription
  useEffect(() => {
    if (!contentId) return;

    const client = getRealtimeClient();
    const channelName = `comments:${contentType}:${contentId}`;
    const newChannel = client.channel(channelName);

    newChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `content_type=eq.${contentType}&content_id=eq.${contentId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New comment added
            loadComments();
          } else if (payload.eventType === 'UPDATE') {
            // Comment updated
            const updatedComment = payload.new as CommentWithUser;
            store.updateComment(updatedComment.id, updatedComment);
          } else if (payload.eventType === 'DELETE') {
            // Comment deleted
            store.removeComment(payload.old.id);
          }
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [contentType, contentId, loadComments, store]);

  // Auto-load comments on mount
  useEffect(() => {
    if (autoLoad && contentId) {
      loadComments();
    }
  }, [autoLoad, contentId, loadComments]);

  return {
    comments,
    isLoading,
    error,
    totalCount,
    loadComments,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    addReaction,
    removeReaction,
  };
}

export default useComments;
