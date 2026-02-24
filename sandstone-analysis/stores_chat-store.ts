import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject } from "@/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  folders: string[];
  setCurrentChat: (chatId: string | null) => void;
  createChat: (subject: Subject, initialMessage?: string) => Promise<string>;
  getChat: (chatId: string) => Chat | undefined;
  getChatsBySubject: (subject: Subject) => Chat[];
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void;
  sendMessageToAI: (chatId: string, content: string, subject: Subject) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  createFolder: (name: string) => void;
  deleteFolder: (name: string) => void;
  fetchChats: () => Promise<void>;
  syncChatToSupabase: (chat: Chat) => Promise<void>;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      folders: ["Essay Help", "Concept Review", "Practice Questions"],

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

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: id,
        }));

        // Sync to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await get().syncChatToSupabase(newChat);
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

      addMessage: (chatId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
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
                    ? message.content.slice(0, 50) + "..."
                    : chat.title,
                }
              : chat
          ),
        }));

        // Sync to Supabase
        const chat = get().chats.find((c) => c.id === chatId);
        if (chat) {
          get().syncChatToSupabase({
            ...chat,
            messages: [...chat.messages, newMessage],
          });
        }
      },

      sendMessageToAI: async (chatId, content, subject) => {
        // Add user message
        get().addMessage(chatId, { role: "user", content });

        try {
          // Call AI API
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content,
              subject,
              chatHistory: get().chats.find((c) => c.id === chatId)?.messages || [],
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to get AI response");
          }

          const data = await response.json();

          // Add AI response
          get().addMessage(chatId, {
            role: "assistant",
            content: data.response,
          });
        } catch (error) {
          console.error("AI chat error:", error);
          get().addMessage(chatId, {
            role: "assistant",
            content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          });
        }
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
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, ...updates, updatedAt: new Date().toISOString() } : chat
          ),
        }));

        const chat = get().chats.find((c) => c.id === chatId);
        if (chat) {
          await get().syncChatToSupabase({ ...chat, ...updates });
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
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from("ai_chats")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (error) {
            console.error("Failed to fetch chats:", error);
            return;
          }

          if (data) {
            const parsedChats: Chat[] = data.map((chat) => ({
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
    }),
    {
      name: "chat-store",
    }
  )
);
