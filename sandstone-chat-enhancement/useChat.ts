"use client";

import { useCallback, useEffect, useState } from "react";
import { useChatStore, ChatMessage, ChatContext } from "@/stores/chat-store";
import { Subject } from "@/types";

interface UseChatOptions {
  chatId?: string;
  subject?: Subject;
  autoFetch?: boolean;
}

interface UseChatReturn {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  streamingMessageId: string | null;
  
  // Actions
  sendMessage: (content: string, options?: { stream?: boolean; context?: ChatContext }) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  
  // Utility
  retryLastMessage: () => Promise<void>;
  exportChat: () => string;
}

/**
 * Hook for managing a single chat conversation
 */
export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { chatId, subject, autoFetch = true } = options;
  
  const store = useChatStore();
  const chat = chatId ? store.getChat(chatId) : null;
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Auto-fetch chats on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchChats();
    }
  }, [autoFetch]);

  // Track last user message for retry functionality
  useEffect(() => {
    if (chat?.messages.length) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.role === "user") {
        setLastUserMessage(lastMessage.content);
      }
    }
  }, [chat?.messages]);

  /**
   * Send a new message to the AI
   */
  const sendMessage = useCallback(async (
    content: string, 
    options: { stream?: boolean; context?: ChatContext } = {}
  ) => {
    if (!chatId) {
      store.setError("No active chat");
      return;
    }

    const { stream = false, context } = options;
    
    // Update chat context if provided
    if (context) {
      await store.updateChat(chatId, { context });
    }

    await store.sendMessageToAI(chatId, content, { 
      subject, 
      stream 
    });
  }, [chatId, subject, store]);

  /**
   * Regenerate an AI response
   */
  const regenerateMessage = useCallback(async (messageId: string) => {
    if (!chatId) return;
    await store.regenerateMessage(chatId, messageId);
  }, [chatId, store]);

  /**
   * Delete a specific message
   */
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatId) return;
    await store.deleteMessage(chatId, messageId);
  }, [chatId, store]);

  /**
   * Clear all messages in the chat
   */
  const clearMessages = useCallback(async () => {
    if (!chatId) return;
    await store.updateChat(chatId, { messages: [] });
  }, [chatId, store]);

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(async () => {
    if (!chatId || !lastUserMessage) return;
    
    // Remove the last AI error message if exists
    const lastMessage = chat?.messages[chat.messages.length - 1];
    if (lastMessage?.role === "assistant" && 
        lastMessage.content.includes("having trouble connecting")) {
      await store.deleteMessage(chatId, lastMessage.id);
    }
    
    // Resend the last user message
    await store.sendMessageToAI(chatId, lastUserMessage, { subject });
  }, [chatId, lastUserMessage, chat?.messages, subject, store]);

  /**
   * Export chat as JSON string
   */
  const exportChat = useCallback(() => {
    if (!chat) return "";
    
    const exportData = {
      title: chat.title,
      subject: chat.subject,
      createdAt: chat.createdAt,
      messages: chat.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [chat]);

  return {
    messages: chat?.messages || [],
    isLoading: store.isLoading,
    error: store.error,
    streamingMessageId: store.streamingMessageId,
    sendMessage,
    regenerateMessage,
    deleteMessage,
    clearMessages,
    retryLastMessage,
    exportChat,
  };
}

/**
 * Hook for managing chat list operations
 */
export function useChatList() {
  const store = useChatStore();

  const createChat = useCallback(async (subject: Subject, initialMessage?: string) => {
    return await store.createChat(subject, { initialMessage });
  }, [store]);

  const deleteChat = useCallback(async (chatId: string) => {
    await store.deleteChat(chatId);
  }, [store]);

  const renameChat = useCallback(async (chatId: string, newTitle: string) => {
    await store.renameChat(chatId, newTitle);
  }, [store]);

  const pinChat = useCallback(async (chatId: string, isPinned: boolean) => {
    await store.pinChat(chatId, isPinned);
  }, [store]);

  const moveToFolder = useCallback(async (chatId: string, folderId: string | null) => {
    await store.moveToFolder(chatId, folderId);
  }, [store]);

  return {
    chats: store.chats,
    folders: store.folders,
    currentChatId: store.currentChatId,
    isLoading: store.isLoading,
    setCurrentChat: store.setCurrentChat,
    createChat,
    deleteChat,
    renameChat,
    pinChat,
    moveToFolder,
    fetchChats: store.fetchChats,
  };
}

/**
 * Hook for managing chat folders
 */
export function useChatFolders() {
  const store = useChatStore();

  const createFolder = useCallback(async (name: string, color?: string) => {
    return await store.createFolder(name, color);
  }, [store]);

  const deleteFolder = useCallback(async (folderId: string) => {
    await store.deleteFolder(folderId);
  }, [store]);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    await store.renameFolder(folderId, newName);
  }, [store]);

  return {
    folders: store.folders,
    createFolder,
    deleteFolder,
    renameFolder,
  };
}

/**
 * Hook for chat search functionality
 */
export function useChatSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    chatId: string;
    chatTitle: string;
    message: ChatMessage;
    matchIndex: number;
  }>>([]);
  
  const store = useChatStore();

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: typeof searchResults = [];
    const lowerQuery = query.toLowerCase();

    store.chats.forEach((chat) => {
      chat.messages.forEach((message, index) => {
        if (message.content.toLowerCase().includes(lowerQuery)) {
          results.push({
            chatId: chat.id,
            chatTitle: chat.title,
            message,
            matchIndex: index,
          });
        }
      });
    });

    setSearchResults(results);
  }, [store.chats]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    searchResults,
    search,
    clearSearch,
  };
}

/**
 * Hook for chat statistics
 */
export function useChatStats() {
  const store = useChatStore();

  const stats = {
    totalChats: store.chats.length,
    totalMessages: store.chats.reduce((sum, chat) => sum + chat.messages.length, 0),
    pinnedChats: store.chats.filter((c) => c.isPinned).length,
    chatsBySubject: store.chats.reduce((acc, chat) => {
      acc[chat.subject] = (acc[chat.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    averageMessagesPerChat: store.chats.length > 0
      ? store.chats.reduce((sum, chat) => sum + chat.messages.length, 0) / store.chats.length
      : 0,
  };

  return stats;
}

export default useChat;
