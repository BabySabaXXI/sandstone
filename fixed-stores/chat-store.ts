import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject, ChatMessage, Chat } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

interface ChatStore {
  // State
  chats: Chat[];
  currentChatId: string | null;
  folders: string[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];
  
  // Abort controller for cancelling requests
  abortController: AbortController | null;

  // Actions
  setCurrentChat: (chatId: string | null) => void;
  createChat: (subject: Subject, initialMessage?: string) => Promise<string>;
  getChat: (chatId: string) => Chat | undefined;
  getChatsBySubject: (subject: Subject) => Chat[];
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  sendMessageToAI: (chatId: string, content: string, subject: Subject) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  createFolder: (name: string) => void;
  deleteFolder: (name: string) => void;
  fetchChats: () => Promise<void>;
  syncChatToSupabase: (chat: Chat) => Promise<void>;
  cancelPendingRequest: () => void;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'add_message';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// Type for Supabase chat row
interface SupabaseChatRow {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  messages: ChatMessage[];
  is_pinned: boolean;
  folder?: string;
  created_at: string;
  updated_at: string;
}

// Type for AI chat API request
interface ChatAPIRequestBody {
  message: string;
  subject: Subject;
  chatHistory: ChatMessage[];
}

// Type for AI chat API response
interface ChatAPIResponse {
  response: string;
}

// Custom storage with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to localStorage:`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please clear some data.');
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from localStorage:`, error);
    }
  },
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      folders: ["Essay Help", "Concept Review", "Practice Questions"],
      isLoading: false,
      error: null,
      isHydrated: false,
      pendingOperations: [],
      abortController: null,

      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),

      setCurrentChat: (chatId) => set({ currentChatId: chatId }),

      createChat: async (subject, initialMessage) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newChat: Chat = {
          id,
          title: initialMessage ? initialMessage.slice(0, 50) + "..." : `New ${subject.charAt(0).toUpperCase() + subject.slice(1)} Chat`,
          subject,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic update
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
          // Add to pending operations
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: crypto.randomUUID(),
                type: 'create',
                data: newChat,
                timestamp: Date.now(),
                retryCount: 0,
              },
            ],
          }));
        }

        return id;
      },

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

      addMessage: async (chatId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };

        // Get current chat before updating
        const currentChat = get().chats.find((c) => c.id === chatId);
        if (!currentChat) {
          set({ error: "Chat not found" });
          return;
        }

        // Calculate new title if first message
        const newTitle = currentChat.messages.length === 0 && message.role === "user" 
          ? message.content.slice(0, 50) + "..."
          : currentChat.title;

        // Optimistic update
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  updatedAt: new Date().toISOString(),
                  title: newTitle,
                }
              : chat
          ),
        }));

        // Sync to Supabase with updated chat
        const updatedChat: Chat = {
          ...currentChat,
          messages: [...currentChat.messages, newMessage],
          updatedAt: new Date().toISOString(),
          title: newTitle,
        };

        try {
          await get().syncChatToSupabase(updatedChat);
        } catch (error) {
          console.error("Failed to sync message:", error);
          // Add to pending operations
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: crypto.randomUUID(),
                type: 'add_message',
                data: { chatId, message: newMessage },
                timestamp: Date.now(),
                retryCount: 0,
              },
            ],
          }));
        }
      },

      sendMessageToAI: async (chatId, content, subject) => {
        // Cancel any pending request
        get().cancelPendingRequest();
        
        // Create new abort controller
        const abortController = new AbortController();
        set({ abortController });

        // Add user message
        await get().addMessage(chatId, { role: "user", content });

        set({ isLoading: true, error: null });

        try {
          const chat = get().chats.find((c) => c.id === chatId);
          
          // Call AI API
          const requestBody: ChatAPIRequestBody = {
            message: content,
            subject,
            chatHistory: chat?.messages || [],
          };

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortController.signal,
          });

          if (!response.ok) {
            throw new Error("Failed to get AI response");
          }

          const data = await response.json() as ChatAPIResponse;

          // Add AI response
          await get().addMessage(chatId, {
            role: "assistant",
            content: data.response,
          });
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log("AI request cancelled");
            return;
          }
          
          console.error("AI chat error:", error);
          set({ error: "Failed to get AI response" });
          
          await get().addMessage(chatId, {
            role: "assistant",
            content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          });
        } finally {
          set({ isLoading: false, abortController: null });
        }
      },

      deleteChat: async (chatId) => {
        // Optimistic update
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
          set({ error: "Failed to delete chat from server" });
        }
      },

      updateChat: async (chatId, updates) => {
        // Get current chat before updating
        const currentChat = get().chats.find((c) => c.id === chatId);
        if (!currentChat) {
          set({ error: "Chat not found" });
          return;
        }

        // Optimistic update
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, ...updates, updatedAt: new Date().toISOString() } : chat
          ),
        }));

        const updatedChat = { ...currentChat, ...updates };

        try {
          await get().syncChatToSupabase(updatedChat);
        } catch (error) {
          console.error("Failed to update chat:", error);
          set({ error: "Failed to update chat on server" });
        }
      },

      createFolder: (name) => {
        set((state) => ({
          folders: [...new Set([...state.folders, name])],
        }));
      },

      deleteFolder: (name) => {
        set((state) => ({
          folders: state.folders.filter((f) => f !== name),
          chats: state.chats.map((chat) =>
            chat.folder === name ? { ...chat, folder: undefined } : chat
          ),
        }));
      },

      fetchChats: async () => {
        // Prevent concurrent fetches
        if (get().isLoading) return;
        
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
            throw error;
          }

          if (data) {
            const parsedChats: Chat[] = (data as SupabaseChatRow[]).map((chat) => ({
              id: chat.id,
              title: chat.title,
              subject: chat.subject as Subject,
              messages: chat.messages || [],
              createdAt: chat.created_at,
              updatedAt: chat.updated_at,
              isPinned: chat.is_pinned,
              folder: chat.folder,
            }));

            set((state) => ({
              chats: parsedChats.length > 0 ? parsedChats : state.chats,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch chats:", error);
          set({ error: "Failed to fetch chats" });
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
            is_pinned: chat.isPinned ?? false,
            folder: chat.folder,
            created_at: chat.createdAt,
            updated_at: new Date().toISOString(),
          });

          if (error) {
            throw error;
          }
        } catch (error) {
          console.error("Failed to sync chat:", error);
          throw error;
        }
      },

      cancelPendingRequest: () => {
        const { abortController } = get();
        if (abortController) {
          abortController.abort();
          set({ abortController: null });
        }
      },
    }),
    {
      name: "chat-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        folders: state.folders,
        pendingOperations: state.pendingOperations,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useChat = (chatId: string) => 
  useChatStore((state) => state.chats.find((chat) => chat.id === chatId));

export const useChatsBySubject = (subject: Subject) => 
  useChatStore((state) => 
    state.chats
      .filter((chat) => chat.subject === subject)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
  );

export const useCurrentChat = () => 
  useChatStore((state) => state.currentChatId ? state.chats.find((chat) => chat.id === state.currentChatId) : undefined);

export const useChatMessages = (chatId: string) => 
  useChatStore((state) => state.chats.find((chat) => chat.id === chatId)?.messages || []);
