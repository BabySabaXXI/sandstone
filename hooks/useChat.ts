/**
 * Chat Data Fetching Hooks with SWR
 * Features: caching, optimistic updates, real-time message handling
 */

'use client';

import { useCallback, useEffect } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, documentSWRConfig, cacheMutations } from '@/lib/swr/config';
import type { ChatMessage, ChatSession } from '@/stores/types';
import type { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface CreateSessionParams {
  title?: string;
  subject?: Subject;
  documentId?: string;
}

interface SendMessageParams {
  sessionId: string;
  content: string;
  role?: 'user' | 'assistant';
}

interface UpdateSessionParams {
  id: string;
  title?: string;
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all chat sessions for the current user
 */
async function fetchChatSessions(): Promise<ChatSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((session) => ({
    id: session.id,
    title: session.title,
    subject: session.subject as Subject,
    documentId: session.document_id,
    userId: session.user_id,
    messageCount: session.message_count || 0,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
  }));
}

/**
 * Fetch a single chat session
 */
async function fetchChatSession(id: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    subject: data.subject as Subject,
    documentId: data.document_id,
    userId: data.user_id,
    messageCount: data.message_count || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Fetch messages for a chat session
 */
async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((msg) => ({
    id: msg.id,
    sessionId: msg.session_id,
    content: msg.content,
    role: msg.role as 'user' | 'assistant',
    metadata: msg.metadata || {},
    createdAt: new Date(msg.created_at),
  }));
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new chat session
 */
async function createSession(
  url: string,
  { arg }: { arg: CreateSessionParams }
): Promise<ChatSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newSession: ChatSession = {
    id: crypto.randomUUID(),
    title: arg.title || 'New Chat',
    subject: arg.subject || 'economics',
    documentId: arg.documentId,
    userId: user.id,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('chat_sessions').insert({
    id: newSession.id,
    user_id: user.id,
    title: newSession.title,
    subject: newSession.subject,
    document_id: newSession.documentId,
    message_count: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newSession;
}

/**
 * Send a message
 */
async function sendMessage(
  url: string,
  { arg }: { arg: SendMessageParams }
): Promise<ChatMessage> {
  const now = new Date();
  const message: ChatMessage = {
    id: crypto.randomUUID(),
    sessionId: arg.sessionId,
    content: arg.content,
    role: arg.role || 'user',
    metadata: {},
    createdAt: now,
  };

  const { error } = await supabase.from('chat_messages').insert({
    id: message.id,
    session_id: message.sessionId,
    content: message.content,
    role: message.role,
    metadata: message.metadata,
    created_at: now.toISOString(),
  });

  if (error) throw error;

  // Update session message count and timestamp
  await supabase
    .from('chat_sessions')
    .update({
      message_count: supabase.rpc('increment', { x: 1 }),
      updated_at: now.toISOString(),
    })
    .eq('id', arg.sessionId);

  return message;
}

/**
 * Update a chat session
 */
async function updateSession(
  url: string,
  { arg }: { arg: UpdateSessionParams }
): Promise<ChatSession> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      title: arg.title,
      updated_at: new Date().toISOString(),
    })
    .eq('id', arg.id);

  if (error) throw error;

  const updated = await fetchChatSession(arg.id);
  if (!updated) throw new Error('Session not found after update');
  
  return updated;
}

/**
 * Delete a chat session
 */
async function deleteSession(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  // Delete all messages first
  const { error: msgError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', arg);

  if (msgError) throw msgError;

  // Delete the session
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', arg);

  if (error) throw error;
}

/**
 * Clear chat session messages
 */
async function clearSessionMessages(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', arg);

  if (error) throw error;

  // Reset message count
  await supabase
    .from('chat_sessions')
    .update({
      message_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', arg);
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all chat sessions
 */
export function useChatSessions() {
  return useSWR<ChatSession[]>(
    cacheKeys.chatSessions,
    fetchChatSessions,
    documentSWRConfig
  );
}

/**
 * Hook to fetch a single chat session
 */
export function useChatSession(id: string | null) {
  return useSWR<ChatSession | null>(
    id ? cacheKeys.chatSession(id) : null,
    () => fetchChatSession(id!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch chat messages
 */
export function useChatMessages(sessionId: string | null) {
  return useSWR<ChatMessage[]>(
    sessionId ? cacheKeys.chatMessages(sessionId) : null,
    () => fetchChatMessages(sessionId!),
    { ...documentSWRConfig, refreshInterval: 0 } // Don't auto-refresh, use realtime
  );
}

/**
 * Hook to create a chat session with optimistic updates
 */
export function useCreateChatSession() {
  return useSWRMutation<ChatSession, Error, string, CreateSessionParams>(
    cacheKeys.chatSessions,
    createSession,
    {
      onSuccess: (data) => {
        globalMutate(
          cacheKeys.chatSessions,
          (current: ChatSession[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.chatSession(data.id), data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to create chat session: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to send a message with optimistic updates
 */
export function useSendMessage() {
  return useSWRMutation<ChatMessage, Error, string, SendMessageParams>(
    cacheKeys.chatSessions,
    sendMessage,
    {
      onSuccess: (data, { arg }) => {
        // Update messages cache
        globalMutate(
          cacheKeys.chatMessages(arg.sessionId),
          (current: ChatMessage[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        // Revalidate session to update message count
        globalMutate(cacheKeys.chatSession(arg.sessionId));
        globalMutate(cacheKeys.chatSessions);
      },
      onError: (error) => {
        toast.error(`Failed to send message: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update a chat session
 */
export function useUpdateChatSession() {
  return useSWRMutation<ChatSession, Error, string, UpdateSessionParams>(
    cacheKeys.chatSessions,
    updateSession,
    {
      onSuccess: (data, { arg }) => {
        globalMutate(
          cacheKeys.chatSessions,
          (current: ChatSession[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.chatSession(arg.id), data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to update chat session: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to delete a chat session
 */
export function useDeleteChatSession() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.chatSessions,
    deleteSession,
    {
      onSuccess: (_, sessionId) => {
        toast.success('Chat session deleted');
        
        globalMutate(
          cacheKeys.chatSessions,
          (current: ChatSession[] | undefined) => cacheMutations.removeFromList(current, sessionId),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.chatSession(sessionId), null, { revalidate: false });
        globalMutate(cacheKeys.chatMessages(sessionId), [], { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to delete chat session: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to clear session messages
 */
export function useClearSessionMessages() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.chatSessions,
    clearSessionMessages,
    {
      onSuccess: (_, sessionId) => {
        toast.success('Messages cleared');
        
        globalMutate(cacheKeys.chatMessages(sessionId), [], { revalidate: false });
        globalMutate(cacheKeys.chatSession(sessionId));
      },
      onError: (error) => {
        toast.error(`Failed to clear messages: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Real-time Subscription Hook
// ============================================================================

/**
 * Hook to subscribe to real-time chat messages
 */
export function useRealtimeChatMessages(sessionId: string | null) {
  const { mutate } = useChatMessages(sessionId);

  useEffect(() => {
    if (!sessionId) return;

    const subscription = supabase
      .channel(`chat_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage: ChatMessage = {
            id: payload.new.id,
            sessionId: payload.new.session_id,
            content: payload.new.content,
            role: payload.new.role as 'user' | 'assistant',
            metadata: payload.new.metadata || {},
            createdAt: new Date(payload.new.created_at),
          };

          // Update cache with new message
          mutate(
            (current: ChatMessage[] | undefined) => {
              if (!current) return [newMessage];
              // Avoid duplicates
              if (current.some((m) => m.id === newMessage.id)) return current;
              return [...current, newMessage];
            },
            { revalidate: false }
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, mutate]);
}

// ============================================================================
// Combined Hook for Full Chat Experience
// ============================================================================

interface UseChatReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  sendMessage: (content: string) => Promise<void>;
  createSession: (params?: CreateSessionParams) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  switchSession: (id: string) => void;
}

/**
 * Combined hook for full chat experience
 * Manages sessions, messages, and real-time updates
 */
export function useChat(
  initialSessionId?: string
): UseChatReturn {
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    initialSessionId || null
  );

  const { data: sessions = [], isLoading: isLoadingSessions } = useChatSessions();
  const { data: currentSession } = useChatSession(currentSessionId);
  const { data: messages = [], isLoading: isLoadingMessages } = useChatMessages(currentSessionId);
  const { trigger: sendMessageTrigger, isMutating: isSending } = useSendMessage();
  const { trigger: createSessionTrigger } = useCreateChatSession();
  const { trigger: deleteSessionTrigger } = useDeleteChatSession();

  // Subscribe to real-time updates
  useRealtimeChatMessages(currentSessionId);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentSessionId) return;
      await sendMessageTrigger({ sessionId: currentSessionId, content });
    },
    [currentSessionId, sendMessageTrigger]
  );

  const createSession = useCallback(
    async (params: CreateSessionParams = {}) => {
      const result = await createSessionTrigger(params);
      if (result) {
        setCurrentSessionId(result.id);
      }
    },
    [createSessionTrigger]
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await deleteSessionTrigger(id);
      if (currentSessionId === id) {
        setCurrentSessionId(null);
      }
    },
    [currentSessionId, deleteSessionTrigger]
  );

  const switchSession = useCallback((id: string) => {
    setCurrentSessionId(id);
  }, []);

  return {
    sessions,
    currentSession: currentSession || null,
    messages,
    isLoading: isLoadingSessions || isLoadingMessages,
    isSending,
    sendMessage,
    createSession,
    deleteSession,
    switchSession,
  };
}

// ============================================================================
// Exports
// ============================================================================

export type {
  CreateSessionParams,
  SendMessageParams,
  UpdateSessionParams,
  UseChatReturn,
};

// Need to import React for the useChat hook
import React from 'react';
