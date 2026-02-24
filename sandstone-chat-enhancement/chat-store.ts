import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject } from "@/types";

export type MessageRole = "user" | "assistant" | "system";
export type UserLevel = "beginner" | "intermediate" | "advanced";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface ChatContext {
  essayText?: string;
  essayQuestion?: string;
  documentContent?: string;
  flashcardTopic?: string;
  quizResults?: Array<{
    question: string;
    userAnswer: string;
    correct: boolean;
  }>;
  userLevel?: UserLevel;
  learningGoal?: string;
}

export interface Chat {
  id: string;
  title: string;
  subject: Subject;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  folder?: string;
  context?: ChatContext;
  metadata?: {
    totalMessages?: number;
    lastActivity?: string;
  };
}

export interface ChatFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

interface ChatStore {
  // State
  chats: Chat[];
  currentChatId: string | null;
  folders: ChatFolder[];
  isLoading: boolean;
  error: string | null;
  streamingMessageId: string | null;
  
  // Getters
  getChat: (chatId: string) => Chat | undefined;
  getChatsBySubject: (subject: Subject) => Chat[];
  getChatsByFolder: (folderId: string) => Chat[];
  getPinnedChats: () => Chat[];
  getRecentChats: (limit?: number) => Chat[];
  getCurrentChat: () => Chat | undefined;
  
  // Actions
  setCurrentChat: (chatId: string | null) => void;
  createChat: (subject: Subject, options?: { 
    initialMessage?: string; 
    folderId?: string;
    context?: ChatContext;
  }) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  pinChat: (chatId: string, isPinned: boolean) => Promise<void>;
  moveToFolder: (chatId: string, folderId: string | null) => Promise<void>;
  clearAllChats: () => Promise<void>;
  
  // Message actions
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  sendMessageToAI: (chatId: string, content: string, options?: {
    subject?: Subject;
    stream?: boolean;
    onStreamUpdate?: (content: string) => void;
  }) => Promise<void>;
  regenerateMessage: (chatId: string, messageId: string) => Promise<void>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  
  // Folder actions
  createFolder: (name: string, color?: string) => Promise<string>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  
  // Sync actions
  fetchChats: () => Promise<void>;
  syncChatToSupabase: (chat: Chat) => Promise<void>;
  importChats: (chats: Partial<Chat>[]) => Promise<void>;
  exportChats: () => Chat[];
  
  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Generate a unique ID
const generateId = () => crypto.randomUUID();

// Generate chat title from first message
const generateChatTitle = (message: string): string => {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= 50) return cleanMessage;
  return cleanMessage.slice(0, 47) + "...";
};

// Default folders
const DEFAULT_FOLDERS: ChatFolder[] = [
  { id: "essay-help", name: "Essay Help", color: "#E8D5C4", createdAt: new Date().toISOString() },
  { id: "concept-review", name: "Concept Review", color: "#A8C5A8", createdAt: new Date().toISOString() },
  { id: "practice-questions", name: "Practice Questions", color: "#A8C5D4", createdAt: new Date().toISOString() },
];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: [],
      currentChatId: null,
      folders: DEFAULT_FOLDERS,
      isLoading: false,
      error: null,
      streamingMessageId: null,

      // Getters
      getChat: (chatId) => {
        return get().chats.find((chat) => chat.id === chatId);
      },

      getChatsBySubject: (subject) => {
        return get().chats
          .filter((chat) => chat.subject === subject)
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
      },

      getChatsByFolder: (folderId) => {
        return get().chats.filter((chat) => chat.folder === folderId);
      },

      getPinnedChats: () => {
        return get().chats.filter((chat) => chat.isPinned);
      },

      getRecentChats: (limit = 5) => {
        return get().chats
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit);
      },

      getCurrentChat: () => {
        const { currentChatId, chats } = get();
        return currentChatId ? chats.find((c) => c.id === currentChatId) : undefined;
      },

      // Actions
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),

      createChat: async (subject, options = {}) => {
        const { initialMessage, folderId, context } = options;
        const id = generateId();
        const now = new Date().toISOString();
        
        const newChat: Chat = {
          id,
          title: initialMessage ? generateChatTitle(initialMessage) : `New ${subject.charAt(0).toUpperCase() + subject.slice(1)} Chat`,
          subject,
          messages: [],
          createdAt: now,
          updatedAt: now,
          folder: folderId || undefined,
          context: context || undefined,
          metadata: {
            totalMessages: 0,
            lastActivity: now,
          },
        };

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: id,
        }));

        // Sync to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await get().syncChatToSupabase(newChat);
          }
        } catch (error) {
          console.error("Failed to sync new chat:", error);
        }

        return id;
      },

      deleteChat: async (chatId) => {
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));

        // Delete from Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("ai_chats").delete().eq("id", chatId).eq("user_id", user.id);
          }
        } catch (error) {
          console.error("Failed to delete chat from Supabase:", error);
        }
      },

      updateChat: async (chatId, updates) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId 
              ? { ...chat, ...updates, updatedAt: now } 
              : chat
          ),
        }));

        const chat = get().chats.find((c) => c.id === chatId);
        if (chat) {
          await get().syncChatToSupabase({ ...chat, ...updates, updatedAt: now });
        }
      },

      renameChat: async (chatId, newTitle) => {
        await get().updateChat(chatId, { title: newTitle });
      },

      pinChat: async (chatId, isPinned) => {
        await get().updateChat(chatId, { isPinned });
      },

      moveToFolder: async (chatId, folderId) => {
        await get().updateChat(chatId, { folder: folderId || undefined });
      },

      clearAllChats: async () => {
        set({ chats: [], currentChatId: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("ai_chats").delete().eq("user_id", user.id);
          }
        } catch (error) {
          console.error("Failed to clear chats from Supabase:", error);
        }
      },

      // Message actions
      addMessage: async (chatId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                  title: chat.messages.length === 0 && message.role === "user"
                    ? generateChatTitle(message.content)
                    : chat.title,
                  metadata: {
                    ...chat.metadata,
                    totalMessages: (chat.metadata?.totalMessages || 0) + 1,
                    lastActivity: new Date().toISOString(),
                  },
                }
              : chat
          ),
        }));

        // Sync to Supabase
        const chat = get().chats.find((c) => c.id === chatId);
        if (chat) {
          await get().syncChatToSupabase(chat);
        }

        return newMessage;
      },

      sendMessageToAI: async (chatId, content, options = {}) => {
        const { subject, stream = false, onStreamUpdate } = options;
        const chat = get().chats.find((c) => c.id === chatId);
        
        if (!chat) {
          set({ error: "Chat not found" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Add user message
          await get().addMessage(chatId, { role: "user", content });

          // Prepare chat history
          const chatHistory = chat.messages.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          }));

          // Call AI API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              subject: subject || chat.subject,
              chatHistory,
              context: chat.context,
              stream,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to get AI response");
          }

          // Handle streaming response
          if (stream && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";
            const streamingId = generateId();

            set({ streamingMessageId: streamingId });

            // Add placeholder message for streaming
            set((state) => ({
              chats: state.chats.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      messages: [
                        ...c.messages,
                        {
                          id: streamingId,
                          role: "assistant",
                          content: "",
                          timestamp: new Date().toISOString(),
                        },
                      ],
                    }
                  : c
              ),
            }));

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content || "";
                    accumulatedContent += content;

                    // Update streaming message
                    set((state) => ({
                      chats: state.chats.map((c) =>
                        c.id === chatId
                          ? {
                              ...c,
                              messages: c.messages.map((m) =>
                                m.id === streamingId
                                  ? { ...m, content: accumulatedContent }
                                  : m
                              ),
                            }
                          : c
                      ),
                    }));

                    onStreamUpdate?.(accumulatedContent);
                  } catch (e) {
                    // Ignore parsing errors for incomplete chunks
                  }
                }
              }
            }

            set({ streamingMessageId: null });
          } else {
            // Handle non-streaming response
            const data = await response.json();
            
            await get().addMessage(chatId, {
              role: "assistant",
              content: data.response,
              metadata: {
                tokensUsed: data.usage?.totalTokens,
                model: "kimi-latest",
              },
            });
          }
        } catch (error) {
          console.error("AI chat error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          set({ error: errorMessage });
          
          await get().addMessage(chatId, {
            role: "assistant",
            content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          });
        } finally {
          set({ isLoading: false });
        }
      },

      regenerateMessage: async (chatId, messageId) => {
        const chat = get().chats.find((c) => c.id === chatId);
        if (!chat) return;

        // Find the user message before this assistant message
        const messageIndex = chat.messages.findIndex((m) => m.id === messageId);
        if (messageIndex <= 0) return;

        const userMessage = chat.messages[messageIndex - 1];
        if (userMessage.role !== "user") return;

        // Remove the assistant message and all messages after it
        const truncatedMessages = chat.messages.slice(0, messageIndex);
        
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, messages: truncatedMessages } : c
          ),
        }));

        // Resend the user message
        await get().sendMessageToAI(chatId, userMessage.content, { subject: chat.subject });
      },

      deleteMessage: async (chatId, messageId) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter((m) => m.id !== messageId),
                  updatedAt: new Date().toISOString(),
                }
              : chat
          ),
        }));

        const chat = get().chats.find((c) => c.id === chatId);
        if (chat) {
          await get().syncChatToSupabase(chat);
        }
      },

      // Folder actions
      createFolder: async (name, color) => {
        const newFolder: ChatFolder = {
          id: generateId(),
          name,
          color,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          folders: [...state.folders, newFolder],
        }));

        return newFolder.id;
      },

      deleteFolder: async (folderId) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          chats: state.chats.map((chat) =>
            chat.folder === folderId ? { ...chat, folder: undefined } : chat
          ),
        }));
      },

      renameFolder: async (folderId, newName) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, name: newName } : f
          ),
        }));
      },

      // Sync actions
      fetchChats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from("ai_chats")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (error) {
            throw new Error(`Failed to fetch chats: ${error.message}`);
          }

          if (data && data.length > 0) {
            const parsedChats: Chat[] = data.map((chat) => ({
              id: chat.id,
              title: chat.title,
              subject: chat.subject as Subject,
              messages: chat.messages || [],
              createdAt: chat.created_at,
              updatedAt: chat.updated_at,
              isPinned: chat.is_pinned,
              folder: chat.folder,
              context: chat.context,
              metadata: chat.metadata,
            }));

            set((state) => ({
              chats: parsedChats,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch chats:", error);
          set({ error: error instanceof Error ? error.message : "Failed to fetch chats" });
        } finally {
          set({ isLoading: false });
        }
      },

      syncChatToSupabase: async (chat) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase.from("ai_chats").upsert({
            id: chat.id,
            user_id: user.id,
            title: chat.title,
            subject: chat.subject,
            messages: chat.messages,
            is_pinned: chat.isPinned || false,
            folder: chat.folder,
            context: chat.context,
            metadata: chat.metadata,
            created_at: chat.createdAt,
            updated_at: new Date().toISOString(),
          });

          if (error) {
            console.error("Failed to sync chat:", error);
          }
        } catch (error) {
          console.error("Failed to sync chat:", error);
        }
      },

      importChats: async (chats) => {
        const now = new Date().toISOString();
        const importedChats: Chat[] = chats.map((chat) => ({
          id: chat.id || generateId(),
          title: chat.title || "Imported Chat",
          subject: chat.subject || "general",
          messages: chat.messages || [],
          createdAt: chat.createdAt || now,
          updatedAt: now,
          isPinned: chat.isPinned || false,
          folder: chat.folder,
          context: chat.context,
          metadata: chat.metadata,
        }));

        set((state) => ({
          chats: [...importedChats, ...state.chats],
        }));

        // Sync all imported chats
        for (const chat of importedChats) {
          await get().syncChatToSupabase(chat);
        }
      },

      exportChats: () => {
        return get().chats;
      },

      // Utility
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "chat-store-v2",
      partialize: (state) => ({
        chats: state.chats,
        folders: state.folders,
        currentChatId: state.currentChatId,
      }),
    }
  )
);

// Selector hooks for better performance
export const useCurrentChat = () => useChatStore((state) => state.getCurrentChat());
export const useChatsBySubject = (subject: Subject) => useChatStore((state) => state.getChatsBySubject(subject));
export const usePinnedChats = () => useChatStore((state) => state.getPinnedChats());
export const useRecentChats = (limit?: number) => useChatStore((state) => state.getRecentChats(limit));
