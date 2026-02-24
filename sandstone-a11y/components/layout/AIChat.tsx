"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, ChatMessage } from "@/stores/chat-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useAuth } from "@/components/auth-provider";
import { 
  X, Bot, Send, Loader2, Pin, 
  Trash2, Plus, MessageSquare,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { 
    chats, 
    currentChatId, 
    createChat, 
    setCurrentChat, 
    getChat, 
    getChatsBySubject,
    addMessage,
    sendMessageToAI,
    deleteChat,
    updateChat,
    folders,
    fetchChats,
  } = useChatStore();
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const subjectChats = getChatsBySubject(currentSubject);
  const filteredChats = subjectChats.filter((chat) => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder ? chat.folder === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const currentChat = currentChatId ? getChat(currentChatId) : null;

  // Focus trap for modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the close button when modal opens
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Announce new messages to screen readers
  useEffect(() => {
    if (currentChat?.messages.length) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      if (lastMessage.role === "assistant") {
        setAnnouncement(`New message from AI Tutor: ${lastMessage.content.slice(0, 100)}${lastMessage.content.length > 100 ? "..." : ""}`);
      }
    }
  }, [currentChat?.messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;

    const content = inputValue;
    setInputValue("");
    setIsLoading(true);
    setAnnouncement("Sending message...");

    await sendMessageToAI(currentChatId, content, currentSubject);
    setIsLoading(false);
  };

  const handleCreateChat = async () => {
    await createChat(currentSubject);
    setAnnouncement("New chat created");
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
      setAnnouncement("Chat deleted");
    }
  };

  const handlePinChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = getChat(chatId);
    if (chat) {
      await updateChat(chatId, { isPinned: !chat.isPinned });
      setAnnouncement(chat.isPinned ? "Chat unpinned" : "Chat pinned");
    }
  };

  // Focus management when sidebar toggles
  useEffect(() => {
    if (!showSidebar) {
      // Focus the show sidebar button when sidebar is hidden
      const showSidebarBtn = document.querySelector('[aria-label="Show chat sidebar"]') as HTMLButtonElement;
      showSidebarBtn?.focus();
    }
  }, [showSidebar]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      className="fixed bottom-24 right-6 w-[800px] h-[600px] bg-white dark:bg-[#2D2D2D] rounded-2xl shadow-2xl border border-[#E5E5E0] dark:border-[#3D3D3D] overflow-hidden z-50 flex"
    >
      {/* Live region for screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[#E5E5E0] dark:border-[#3D3D3D] flex flex-col bg-[#FAFAF8] dark:bg-[#252525]"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D]">
              <div className="flex items-center justify-between mb-3">
                <h3 id="chat-sidebar-title" className="font-semibold text-[#2D2D2D] dark:text-white">
                  AI Tutor
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  aria-label="Hide chat sidebar"
                  className="p-1 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                >
                  <X className="w-4 h-4 text-[#8A8A8A]" aria-hidden="true" />
                </button>
              </div>
              <button
                onClick={handleCreateChat}
                aria-label="Create new chat"
                className="w-full flex items-center justify-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-2 rounded-lg hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                New Chat
              </button>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  aria-label="Search chats"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                />
              </div>
            </div>

            {/* Folder Filter */}
            <div className="px-3 pb-2">
              <label htmlFor="folder-filter" className="sr-only">Filter by folder</label>
              <select
                id="folder-filter"
                value={selectedFolder || ""}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                aria-label="Filter chats by folder"
                className="w-full text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </div>

            {/* Chat List */}
            <div 
              className="flex-1 overflow-y-auto"
              role="listbox"
              aria-label="Chat list"
            >
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChat(chat.id)}
                  role="option"
                  aria-selected={currentChatId === chat.id}
                  className={cn(
                    "w-full text-left p-3 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] transition-colors border-b border-[#E5E5E0]/50 dark:border-[#3D3D3D]/50 group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E8D5C4]",
                    currentChatId === chat.id && "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate",
                        currentChatId === chat.id ? "text-[#2D2D2D] dark:text-white" : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                      )}>
                        {chat.isPinned && (
                          <Pin className="w-3 h-3 inline mr-1 text-[#E8D5C4]" aria-hidden="true" />
                        )}
                        {chat.title}
                      </p>
                      <p className="text-xs text-[#8A8A8A] truncate mt-1">
                        {chat.messages[chat.messages.length - 1]?.content.slice(0, 50)}...
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-1">
                        {format(new Date(chat.updatedAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => handlePinChat(chat.id, e)}
                        aria-label={chat.isPinned ? "Unpin chat" : "Pin chat"}
                        className="p-1 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                      >
                        <Pin className={cn("w-3 h-3", chat.isPinned ? "text-[#E8D5C4]" : "text-[#8A8A8A]")} aria-hidden="true" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        aria-label="Delete chat"
                        className="p-1 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                      >
                        <Trash2 className="w-3 h-3 text-[#8A8A8A]" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D]">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                aria-label="Show chat sidebar"
                className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
              >
                <MessageSquare className="w-5 h-5 text-[#8A8A8A]" aria-hidden="true" />
              </button>
            )}
            <div 
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center"
              aria-hidden="true"
            >
              <Bot className="w-4 h-4 text-[#2D2D2D]" aria-hidden="true" />
            </div>
            <div>
              <h3 id="chat-title" className="font-medium text-[#2D2D2D] dark:text-white">
                {currentChat?.title || "AI Tutor"}
              </h3>
              <p className="text-xs text-[#8A8A8A] capitalize">{currentSubject} Tutor</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
          >
            <X className="w-5 h-5 text-[#8A8A8A]" aria-hidden="true" />
          </button>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
        >
          {currentChat ? (
            currentChat.messages.map((message, index) => (
              <ChatMessageComponent 
                key={message.id} 
                message={message} 
                isFirst={index === 0}
              />
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center mb-4"
                aria-hidden="true"
              >
                <Bot className="w-8 h-8 text-[#2D2D2D]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-[#2D2D2D] dark:text-white mb-2">
                Start a new conversation
              </h3>
              <p className="text-sm text-[#8A8A8A] max-w-sm mb-4">
                Ask me anything about {currentSubject}. I can help with concepts, essays, practice questions, and more.
              </p>
              <button
                onClick={handleCreateChat}
                aria-label="Start new chat"
                className="flex items-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] px-4 py-2 rounded-lg hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Start New Chat
              </button>
            </div>
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
              aria-live="polite"
            >
              <div 
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <Bot className="w-4 h-4 text-[#2D2D2D]" aria-hidden="true" />
              </div>
              <div className="bg-[#F5F5F0] dark:bg-[#3D3D3D] rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#8A8A8A] animate-spin" aria-hidden="true" />
                <span className="text-sm text-[#8A8A8A]">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {currentChat && (
          <div className="p-4 border-t border-[#E5E5E0] dark:border-[#3D3D3D]">
            <div className="flex gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Type your message about {currentSubject}
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder={`Ask about ${currentSubject}...`}
                aria-label={`Type your message about ${currentSubject}`}
                className="flex-1 px-4 py-3 bg-[#F5F5F0] dark:bg-[#1A1A1A] dark:text-white border border-transparent focus:border-[#E8D5C4] rounded-xl text-sm outline-none transition-all placeholder:text-[#8A8A8A] focus:ring-2 focus:ring-[#E8D5C4]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="w-10 h-10 bg-[#2D2D2D] dark:bg-[#E8D5C4] hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] focus:ring-offset-2"
              >
                <Send className="w-4 h-4 text-white dark:text-[#2D2D2D]" aria-hidden="true" />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#8A8A8A] mt-2">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ChatMessageComponent({ message, isFirst }: { message: ChatMessage; isFirst: boolean }) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isAssistant ? "" : "flex-row-reverse")}
    >
      {isAssistant ? (
        <div 
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <Bot className="w-4 h-4 text-[#2D2D2D]" aria-hidden="true" />
        </div>
      ) : (
        <div 
          className="w-8 h-8 rounded-lg bg-[#2D2D2D] flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-white text-xs font-medium">You</span>
        </div>
      )}
      <div 
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3",
          isAssistant 
            ? "bg-[#F5F5F0] dark:bg-[#3D3D3D] text-[#2D2D2D] dark:text-white" 
            : "bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D]"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <time 
          className={cn(
            "text-[10px] mt-1 block",
            isAssistant ? "text-[#8A8A8A]" : "text-white/60 dark:text-[#2D2D2D]/60"
          )}
          dateTime={new Date(message.timestamp).toISOString()}
        >
          {format(new Date(message.timestamp), "h:mm a")}
        </time>
      </div>
    </motion.div>
  );
}
