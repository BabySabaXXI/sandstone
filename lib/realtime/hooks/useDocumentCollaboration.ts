/**
 * useDocumentCollaboration Hook
 * =============================
 * Real-time hook for document collaboration features.
 * Handles multi-user editing, cursor tracking, and presence.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { 
  getRealtimeClient, 
  CHANNELS, 
  EVENTS,
  type DocumentCollaborationPayload,
  type CursorPosition 
} from "@/lib/supabase/realtime-client";
import type { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";

interface Collaborator {
  userId: string;
  userName: string;
  userColor: string;
  cursor?: CursorPosition;
  isActive: boolean;
  joinedAt: string;
}

interface DocumentEdit {
  userId: string;
  userName: string;
  operation: "insert" | "delete" | "replace";
  position: number;
  content?: string;
  length?: number;
  timestamp: string;
  version: number;
}

interface UseDocumentCollaborationOptions {
  documentId?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  enabled?: boolean;
  onUserJoined?: (user: Collaborator) => void;
  onUserLeft?: (user: Collaborator) => void;
  onContentEdited?: (edit: DocumentEdit) => void;
  onCursorMoved?: (cursor: CursorPosition) => void;
  onSelectionChanged?: (selection: CursorPosition) => void;
}

interface UseDocumentCollaborationReturn {
  isSubscribed: boolean;
  collaborators: Collaborator[];
  activeCollaborators: Collaborator[];
  documentVersion: number;
  isLocked: boolean;
  lockedBy: Collaborator | null;
  joinDocument: () => void;
  leaveDocument: () => void;
  broadcastEdit: (edit: Omit<DocumentEdit, "userId" | "userName" | "timestamp" | "version">) => void;
  broadcastCursorMove: (position: { x: number; y: number }) => void;
  broadcastSelectionChange: (selection: { start: number; end: number }) => void;
  lockDocument: () => void;
  unlockDocument: () => void;
  unsubscribe: () => void;
}

// Generate a random color for each user
const generateUserColor = (userId: string): string => {
  const colors = [
    "#EF4444", // red
    "#F97316", // orange
    "#F59E0B", // amber
    "#84CC16", // lime
    "#10B981", // emerald
    "#06B6D4", // cyan
    "#3B82F6", // blue
    "#8B5CF6", // violet
    "#D946EF", // fuchsia
    "#F43F5E", // rose
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Hook for real-time document collaboration
 */
export function useDocumentCollaboration(
  options: UseDocumentCollaborationOptions
): UseDocumentCollaborationReturn {
  const {
    documentId,
    userId,
    userName = "Anonymous",
    userColor,
    enabled = true,
    onUserJoined,
    onUserLeft,
    onContentEdited,
    onCursorMoved,
    onSelectionChanged,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<Collaborator | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cursorChannelRef = useRef<RealtimeChannel | null>(null);
  const myColorRef = useRef(userColor || (userId ? generateUserColor(userId) : "#3B82F6"));
  const isJoinedRef = useRef(false);

  const getActiveCollaborators = useCallback((): Collaborator[] => {
    return collaborators.filter(c => c.isActive && c.userId !== userId);
  }, [collaborators, userId]);

  const handleUserJoined = useCallback((payload: DocumentCollaborationPayload) => {
    const newCollaborator: Collaborator = {
      userId: payload.userId,
      userName: payload.userName,
      userColor: generateUserColor(payload.userId),
      isActive: true,
      joinedAt: payload.timestamp,
    };

    setCollaborators(prev => {
      const existing = prev.find(c => c.userId === payload.userId);
      if (existing) {
        return prev.map(c => 
          c.userId === payload.userId ? { ...c, isActive: true } : c
        );
      }
      return [...prev, newCollaborator];
    });

    onUserJoined?.(newCollaborator);
  }, [onUserJoined]);

  const handleUserLeft = useCallback((payload: DocumentCollaborationPayload) => {
    const leavingUser = collaborators.find(c => c.userId === payload.userId);
    
    setCollaborators(prev => 
      prev.map(c => 
        c.userId === payload.userId ? { ...c, isActive: false } : c
      )
    );

    if (leavingUser) {
      onUserLeft?.(leavingUser);
    }

    // Unlock document if the user who locked it left
    if (lockedBy?.userId === payload.userId) {
      setIsLocked(false);
      setLockedBy(null);
    }
  }, [collaborators, lockedBy, onUserLeft]);

  const handleContentEdited = useCallback((payload: DocumentCollaborationPayload) => {
    if (payload.content) {
      const edit: DocumentEdit = {
        userId: payload.userId,
        userName: payload.userName,
        operation: (payload.content as any).operation || "insert",
        position: (payload.content as any).position || 0,
        content: (payload.content as any).content,
        length: (payload.content as any).length,
        timestamp: payload.timestamp,
        version: payload.version || 0,
      };

      setDocumentVersion(prev => Math.max(prev, edit.version));
      onContentEdited?.(edit);
    }
  }, [onContentEdited]);

  const handleCursorMoved = useCallback((payload: DocumentCollaborationPayload) => {
    if (payload.cursor) {
      setCollaborators(prev => 
        prev.map(c => 
          c.userId === payload.userId 
            ? { ...c, cursor: payload.cursor || undefined }
            : c
        )
      );
      onCursorMoved?.(payload.cursor);
    }
  }, [onCursorMoved]);

  const joinDocument = useCallback(() => {
    if (!channelRef.current || !userId || isJoinedRef.current) return;

    isJoinedRef.current = true;

    channelRef.current.send({
      type: "broadcast",
      event: EVENTS.USER_JOINED_DOCUMENT,
      payload: {
        documentId,
        userId,
        userName,
        action: "joined",
        timestamp: new Date().toISOString(),
      },
    });

    // Track presence
    channelRef.current.track({
      userId,
      userName,
      userColor: myColorRef.current,
      joinedAt: new Date().toISOString(),
    });
  }, [documentId, userId, userName]);

  const leaveDocument = useCallback(() => {
    if (!channelRef.current || !userId || !isJoinedRef.current) return;

    isJoinedRef.current = false;

    channelRef.current.send({
      type: "broadcast",
      event: EVENTS.USER_LEFT_DOCUMENT,
      payload: {
        documentId,
        userId,
        userName,
        action: "left",
        timestamp: new Date().toISOString(),
      },
    });

    channelRef.current.untrack();
  }, [documentId, userId, userName]);

  const broadcastEdit = useCallback((
    edit: Omit<DocumentEdit, "userId" | "userName" | "timestamp" | "version">
  ) => {
    if (!channelRef.current || !isJoinedRef.current) return;

    const newVersion = documentVersion + 1;
    setDocumentVersion(newVersion);

    channelRef.current.send({
      type: "broadcast",
      event: EVENTS.DOCUMENT_EDITED,
      payload: {
        documentId,
        userId,
        userName,
        action: "edited",
        content: edit,
        version: newVersion,
        timestamp: new Date().toISOString(),
      },
    });
  }, [documentId, userId, userName, documentVersion]);

  const broadcastCursorMove = useCallback((position: { x: number; y: number }) => {
    if (!cursorChannelRef.current || !userId) return;

    const cursor: CursorPosition = {
      userId,
      userName,
      userColor: myColorRef.current,
      x: position.x,
      y: position.y,
    };

    cursorChannelRef.current.send({
      type: "broadcast",
      event: EVENTS.DOCUMENT_CURSOR_MOVED,
      payload: {
        documentId,
        userId,
        userName,
        action: "cursor_moved",
        cursor,
        timestamp: new Date().toISOString(),
      },
    });
  }, [documentId, userId, userName]);

  const broadcastSelectionChange = useCallback((selection: { start: number; end: number }) => {
    if (!cursorChannelRef.current || !userId) return;

    cursorChannelRef.current.send({
      type: "broadcast",
      event: EVENTS.DOCUMENT_SELECTION_CHANGED,
      payload: {
        documentId,
        userId,
        userName,
        action: "selection_changed",
        cursor: {
          userId,
          userName,
          userColor: myColorRef.current,
          x: 0,
          y: 0,
          selection,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }, [documentId, userId, userName]);

  const lockDocument = useCallback(() => {
    if (!userId) return;
    setIsLocked(true);
    setLockedBy({
      userId,
      userName,
      userColor: myColorRef.current,
      isActive: true,
      joinedAt: new Date().toISOString(),
    });
  }, [userId, userName]);

  const unlockDocument = useCallback(() => {
    setIsLocked(false);
    setLockedBy(null);
  }, []);

  const unsubscribe = useCallback(() => {
    leaveDocument();
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    if (cursorChannelRef.current) {
      cursorChannelRef.current.unsubscribe();
      cursorChannelRef.current = null;
    }
    
    setIsSubscribed(false);
    isJoinedRef.current = false;
  }, [leaveDocument]);

  // Subscribe to collaboration channel
  useEffect(() => {
    if (!enabled || !documentId) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.DOCUMENT_COLLAB(documentId);
    
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: {
          key: documentId,
        },
      },
    });

    // Subscribe to collaboration events
    channel
      .on("broadcast", { event: EVENTS.USER_JOINED_DOCUMENT }, (payload) => {
        handleUserJoined(payload.payload as DocumentCollaborationPayload);
      })
      .on("broadcast", { event: EVENTS.USER_LEFT_DOCUMENT }, (payload) => {
        handleUserLeft(payload.payload as DocumentCollaborationPayload);
      })
      .on("broadcast", { event: EVENTS.DOCUMENT_EDITED }, (payload) => {
        handleContentEdited(payload.payload as DocumentCollaborationPayload);
      });

    // Handle presence sync
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const users: Collaborator[] = [];
      
      Object.keys(state).forEach(key => {
        const presences = state[key] as any[];
        presences.forEach(presence => {
          if (presence.userId !== userId) {
            users.push({
              userId: presence.userId,
              userName: presence.userName,
              userColor: presence.userColor,
              isActive: true,
              joinedAt: presence.joinedAt,
            });
          }
        });
      });

      setCollaborators(users);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true);
        // Auto-join if userId is provided
        if (userId) {
          joinDocument();
        }
      }
    });

    channelRef.current = channel;

    return () => {
      unsubscribe();
    };
  }, [documentId, enabled, userId, joinDocument, handleUserJoined, handleUserLeft, handleContentEdited, unsubscribe]);

  // Subscribe to cursor channel
  useEffect(() => {
    if (!enabled || !documentId) return;

    const client = getRealtimeClient();
    const cursorChannelName = CHANNELS.DOCUMENT_CURSOR(documentId);
    
    const cursorChannel = client.channel(cursorChannelName, {
      config: {
        broadcast: { self: false },
      },
    });

    cursorChannel
      .on("broadcast", { event: EVENTS.DOCUMENT_CURSOR_MOVED }, (payload) => {
        handleCursorMoved(payload.payload as DocumentCollaborationPayload);
      })
      .on("broadcast", { event: EVENTS.DOCUMENT_SELECTION_CHANGED }, (payload) => {
        const data = payload.payload as DocumentCollaborationPayload;
        if (data.cursor) {
          onSelectionChanged?.(data.cursor);
        }
      });

    cursorChannel.subscribe();
    cursorChannelRef.current = cursorChannel;

    return () => {
      cursorChannel.unsubscribe();
    };
  }, [documentId, enabled, handleCursorMoved, onSelectionChanged]);

  return {
    isSubscribed,
    collaborators,
    activeCollaborators: getActiveCollaborators(),
    documentVersion,
    isLocked,
    lockedBy,
    joinDocument,
    leaveDocument,
    broadcastEdit,
    broadcastCursorMove,
    broadcastSelectionChange,
    lockDocument,
    unlockDocument,
    unsubscribe,
  };
}

export default useDocumentCollaboration;
