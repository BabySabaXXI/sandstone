/**
 * Use Collaborative Editing Hook
 * ==============================
 * Hook for real-time collaborative document editing
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { collaborativeEditingApi } from '@/lib/collaboration/api';
import { getRealtimeClient, CHANNELS, EVENTS } from '@/lib/supabase/realtime-client';
import type { 
  CursorPosition, 
  TextSelection, 
  EditOperation,
  DocumentCollaborator 
} from '@/lib/collaboration/types';

// User colors for cursors
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

interface UseCollaborativeEditingOptions {
  documentId: string;
  autoJoin?: boolean;
}

interface CollaboratorInfo {
  userId: string;
  userName: string;
  userColor: string;
  avatarUrl: string | null;
  cursor: CursorPosition | null;
  selection: TextSelection | null;
  isActive: boolean;
}

export function useCollaborativeEditing({ documentId, autoJoin = true }: UseCollaborativeEditingOptions) {
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [userColor, setUserColor] = useState<string>('');
  const [versions, setVersions] = useState<any[]>([]);
  const channelsRef = useRef<ReturnType<typeof getRealtimeClient>['channel'][]>([]);
  const currentUserIdRef = useRef<string>('');

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const { data: { user } } = await createClient().auth.getUser();
      if (user) {
        currentUserIdRef.current = user.id;
        // Assign a consistent color based on user ID
        const colorIndex = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % USER_COLORS.length;
        setUserColor(USER_COLORS[colorIndex]);
      }
    };
    getUser();
  }, []);

  // Load collaborators
  const loadCollaborators = useCallback(async () => {
    if (!documentId) return;

    try {
      const data = await collaborativeEditingApi.getCollaborators(documentId);
      const formattedCollaborators: CollaboratorInfo[] = data.map((c: any) => ({
        userId: c.user_id,
        userName: c.user_name,
        userColor: c.user_color,
        avatarUrl: c.avatar_url,
        cursor: c.cursor_position,
        selection: c.selection,
        isActive: c.is_active,
      }));
      setCollaborators(formattedCollaborators);
    } catch (err) {
      console.error('Failed to load collaborators:', err);
    }
  }, [documentId]);

  // Join document collaboration
  const joinDocument = useCallback(async () => {
    if (!documentId || !userColor) return;

    try {
      await collaborativeEditingApi.joinDocument(documentId, userColor);
      setIsConnected(true);
      await loadCollaborators();
    } catch (err) {
      console.error('Failed to join document:', err);
      setIsConnected(false);
    }
  }, [documentId, userColor, loadCollaborators]);

  // Leave document collaboration
  const leaveDocument = useCallback(async () => {
    if (!documentId) return;

    try {
      await collaborativeEditingApi.leaveDocument(documentId);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to leave document:', err);
    }
  }, [documentId]);

  // Send cursor position
  const sendCursorPosition = useCallback(async (position: CursorPosition) => {
    if (!documentId || !isConnected) return;

    try {
      await collaborativeEditingApi.updateCursorPosition(documentId, position);
    } catch (err) {
      console.error('Failed to update cursor position:', err);
    }
  }, [documentId, isConnected]);

  // Send selection
  const sendSelection = useCallback(async (selection: TextSelection | null) => {
    if (!documentId || !isConnected) return;

    try {
      await collaborativeEditingApi.updateSelection(documentId, selection);
    } catch (err) {
      console.error('Failed to update selection:', err);
    }
  }, [documentId, isConnected]);

  // Save document version
  const saveVersion = useCallback(async (content: any[], changeSummary?: string) => {
    if (!documentId) return;

    try {
      const version = await collaborativeEditingApi.saveVersion(documentId, content, changeSummary);
      setVersions(prev => [version, ...prev]);
      return version;
    } catch (err) {
      console.error('Failed to save version:', err);
      throw err;
    }
  }, [documentId]);

  // Load document versions
  const loadVersions = useCallback(async (limit?: number) => {
    if (!documentId) return;

    try {
      const data = await collaborativeEditingApi.getVersions(documentId, limit);
      setVersions(data);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  }, [documentId]);

  // Get specific version
  const getVersion = useCallback(async (versionNumber: number) => {
    if (!documentId) return;

    try {
      return await collaborativeEditingApi.getVersion(documentId, versionNumber);
    } catch (err) {
      console.error('Failed to get version:', err);
      throw err;
    }
  }, [documentId]);

  // Get other collaborators (exclude current user)
  const otherCollaborators = collaborators.filter(c => c.userId !== currentUserIdRef.current);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!documentId) return;

    const client = getRealtimeClient();
    const newChannels: ReturnType<typeof getRealtimeClient>['channel'][] = [];

    // Subscribe to document collaborators
    const collabChannel = client.channel(CHANNELS.DOCUMENT_COLLAB(documentId));
    collabChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_collaborators',
          filter: `document_id=eq.${documentId}`,
        },
        (payload) => {
          loadCollaborators();
        }
      )
      .on('broadcast', { event: EVENTS.USER_JOINED_DOCUMENT }, (payload) => {
        const { userId, userName, userColor, avatarUrl } = payload.payload;
        setCollaborators(prev => {
          const exists = prev.find(c => c.userId === userId);
          if (exists) {
            return prev.map(c => c.userId === userId ? { ...c, isActive: true } : c);
          }
          return [...prev, { userId, userName, userColor, avatarUrl, cursor: null, selection: null, isActive: true }];
        });
      })
      .on('broadcast', { event: EVENTS.USER_LEFT_DOCUMENT }, (payload) => {
        const { userId } = payload.payload;
        setCollaborators(prev => prev.map(c => c.userId === userId ? { ...c, isActive: false } : c));
      })
      .subscribe();
    newChannels.push(collabChannel);

    // Subscribe to cursor updates
    const cursorChannel = client.channel(CHANNELS.DOCUMENT_CURSOR(documentId));
    cursorChannel
      .on('broadcast', { event: EVENTS.DOCUMENT_CURSOR_MOVED }, (payload) => {
        const { userId, cursor } = payload.payload;
        setCollaborators(prev => prev.map(c => 
          c.userId === userId ? { ...c, cursor } : c
        ));
      })
      .on('broadcast', { event: EVENTS.DOCUMENT_SELECTION_CHANGED }, (payload) => {
        const { userId, selection } = payload.payload;
        setCollaborators(prev => prev.map(c => 
          c.userId === userId ? { ...c, selection } : c
        ));
      })
      .subscribe();
    newChannels.push(cursorChannel);

    channelsRef.current = newChannels;

    return () => {
      newChannels.forEach(channel => channel.unsubscribe());
    };
  }, [documentId, loadCollaborators]);

  // Auto-join on mount
  useEffect(() => {
    if (autoJoin && documentId && userColor) {
      joinDocument();
    }

    return () => {
      leaveDocument();
    };
  }, [autoJoin, documentId, userColor, joinDocument, leaveDocument]);

  // Load versions on mount
  useEffect(() => {
    if (documentId) {
      loadVersions();
    }
  }, [documentId, loadVersions]);

  return {
    collaborators,
    otherCollaborators,
    isConnected,
    userColor,
    versions,
    joinDocument,
    leaveDocument,
    sendCursorPosition,
    sendSelection,
    saveVersion,
    loadVersions,
    getVersion,
    loadCollaborators,
  };
}

export default useCollaborativeEditing;
