"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chat-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useAuth } from "@/components/auth-provider";
import { useResponsive } from "@/hooks/useResponsive";
import {
  X,
  Bot,
  Send,
  Loader2,
  Pin,
  Trash2,
  Plus,
  ChevronDown,
  MessageSquare,
  Search,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ResponsiveAIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResponsiveAIChat({ isOpen, onClose }: ResponsiveAIChatProps) {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { isMobile, isTablet } = useResponsive();
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
    fetchChats,
  } = useChatStore();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const subjectChats = getChatsBySubject(currentSubject);
  const filteredChats = subjectChats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const currentChat = currentChatId ? getChat(currentChatId) : null;

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Close sidebar on mobile when chat is selected
  useEffect(() => {
    if (isMobile && currentChatId) {
      setShowSidebar(false);
    }
  }, [currentChatId, isMobile]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;

    const content = inputValue;
    setInputValue("");
    setIsLoading(true);

    await sendMessageToAI(currentChatId, content, currentSubject);
    setIsLoading(false);
  };

  const handleCreateChat = async () => {
    await createChat(currentSubject);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat(chatId);
    }
  };

  const handlePinChat = async (chatId: string) => {
    const chat = getChat(chatId);
    if (chat) {
      await updateChat(chatId, { isPinned: !chat.isPinned });
    }
  };

  if (!isOpen) return null;

  // Mobile/Tablet: Full screen modal
  if (isMobile || isTablet) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-modal bg-white dark:bg-[#2D2D2D] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D] safe-area-inset">
          <div className="flex items-center gap-3">
            {(!showSidebar || currentChat) && (
              <button
                onClick={() => {
                  if (currentChat) {
                    setCurrentChat(null);
                  } else {
                    setShowSidebar(true);
                  }
                }}
                className="p-2 -ml-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg touch-target-sm"
              >
                <ChevronLeft className="w-5 h-5 text-[#8A8A8A]" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#2D2D2D]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D2D2D] dark:text-white text-sm">
                {currentChat?.title || "AI Tutor"}
              </h3>
              <p className="text-xs text-[#8A8A8A] capitalize">
                {currentSubject} Tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg touch-target-sm"
          >
            <X className="w-5 h-5 text-[#8A8A8A]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {showSidebar && !currentChat ? (
              /* Sidebar - Chat List */
              <motion.div
                key="sidebar"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="absolute inset-0 flex flex-col bg-[#FAFAF8] dark:bg-[#252525]"
              >
                {/* New Chat Button */}
                <div className="p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D]">
                  <button
                    onClick={handleCreateChat}
                    className="w-full flex items-center justify-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-3 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors touch-target"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                </div>

                {/* Search */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search chats..."
                      className="w-full pl-10 pr-3 py-3 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                    />
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {filteredChats.length === 0 ? (
                    <div className="text-center py-8 text-[#8A8A8A]">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs mt-1">
                        Start a new conversation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredChats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setCurrentChat(chat.id)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl transition-colors",
                            "border border-transparent",
                            currentChatId === chat.id
                              ? "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10 border-[#E8D5C4]/30"
                              : "bg-white dark:bg-[#1A1A1A] hover:bg-[#F5F5F0] dark:hover:bg-[#2A2A2A]"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium text-sm truncate",
                                  currentChatId === chat.id
                                    ? "text-[#2D2D2D] dark:text-white"
                                    : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                                )}
                              >
                                {chat.isPinned && (
                                  <Pin className="w-3 h-3 inline mr-1 text-[#E8D5C4]" />
                                )}
                                {chat.title}
                              </p>
                              <p className="text-xs text-[#8A8A8A] truncate mt-1">
                                {chat.messages[chat.messages.length - 1]?.content.slice(
                                  0,
                                  50
                                )}
                                ...
                              </p>
                              <p className="text-xs text-[#8A8A8A] mt-1">
                                {format(new Date(chat.updatedAt), "MMM d, h:mm a")}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePinChat(chat.id);
                                }}
                                className="p-2 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded-lg touch-target-sm"
                              >
                                <Pin
                                  className={cn(
                                    "w-4 h-4",
                                    chat.isPinned
                                      ? "text-[#E8D5C4]"
                                      : "text-[#8A8A8A]"
                                  )}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(chat.id);
                                }}
                                className="p-2 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded-lg touch-target-sm"
                              >
                                <Trash2 className="w-4 h-4 text-[#8A8A8A]" />
                              </button>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Chat View */
              <motion.div
                key="chat"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="absolute inset-0 flex flex-col"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat ? (
                    currentChat.messages.map((message, index) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isFirst={index === 0}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-[#2D2D2D]" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#2D2D2D] dark:text-white mb-2">
                        AI Tutor
                      </h3>
                      <p className="text-sm text-[#8A8A8A] max-w-xs">
                        Ask me anything about {currentSubject}. I&apos;m here to help
                        you learn!
                      </p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-[#E5E5E0] dark:border-[#3D3D3D] bg-white dark:bg-[#2D2D2D]">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-3 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none max-h-32"
                      style={{ minHeight: "48px" }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className={cn(
                        "p-3 rounded-xl transition-colors touch-target",
                        inputValue.trim() && !isLoading
                          ? "bg-[#E8D5C4] text-[#2D2D2D] hover:bg-[#D4C4B0]"
                          : "bg-[#E5E5E0] dark:bg-[#3D3D3D] text-[#8A8A8A]"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Desktop: Floating chat widget (original behavior)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-[800px] h-[600px] bg-white dark:bg-[#2D2D2D] rounded-2xl shadow-2xl border border-[#E5E5E0] dark:border-[#3D3D3D] overflow-hidden z-modal flex"
    >
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
                <h3 className="font-semibold text-[#2D2D2D] dark:text-white">
                  AI Tutor
                </h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] rounded-lg touch-target-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-[#8A8A8A]" />
                </button>
              </div>
              <button
                onClick={handleCreateChat}
                className="w-full flex items-center justify-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-2 rounded-lg hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors touch-target-sm"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChat(chat.id)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] transition-colors border-b border-[#E5E5E0]/50 dark:border-[#3D3D3D]/50 group",
                    currentChatId === chat.id &&
                      "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium text-sm truncate",
                          currentChatId === chat.id
                            ? "text-[#2D2D2D] dark:text-white"
                            : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                        )}
                      >
                        {chat.isPinned && (
                          <Pin className="w-3 h-3 inline mr-1 text-[#E8D5C4]" />
                        )}
                        {chat.title}
                      </p>
                      <p className="text-xs text-[#8A8A8A] truncate mt-1">
                        {chat.messages[chat.messages.length - 1]?.content.slice(
                          0,
                          50
                        )}
                        ...
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-1">
                        {format(new Date(chat.updatedAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinChat(chat.id);
                        }}
                        className="p-1 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded touch-target-sm"
                      >
                        <Pin
                          className={cn(
                            "w-3 h-3",
                            chat.isPinned ? "text-[#E8D5C4]" : "text-[#8A8A8A]"
                          )}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded touch-target-sm"
                      >
                        <Trash2 className="w-3 h-3 text-[#8A8A8A]" />
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
                className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg touch-target-sm"
              >
                <MessageSquare className="w-5 h-5 text-[#8A8A8A]" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#2D2D2D]" />
            </div>
            <div>
              <h3 className="font-medium text-[#2D2D2D] dark:text-white">
                {currentChat?.title || "AI Tutor"}
              </h3>
              <p className="text-xs text-[#8A8A8A] capitalize">
                {currentSubject} Tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors touch-target-sm"
          >
            <X className="w-5 h-5 text-[#8A8A8A]" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat ? (
            currentChat.messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isFirst={index === 0}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-[#2D2D2D]" />
              </div>
              <h3 className="text-lg font-semibold text-[#2D2D2D] dark:text-white mb-2">
                AI Tutor
              </h3>
              <p className="text-sm text-[#8A8A8A] max-w-xs">
                Ask me anything about {currentSubject}. I&apos;m here to help you
                learn!
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#E5E5E0] dark:border-[#3D3D3D]">
          <div className="flex items-end gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-2 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors touch-target-sm",
                inputValue.trim() && !isLoading
                  ? "bg-[#E8D5C4] text-[#2D2D2D] hover:bg-[#D4C4B0]"
                  : "bg-[#E5E5E0] dark:bg-[#3D3D3D] text-[#8A8A8A]"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Chat Message Component
interface ChatMessageProps {
  message: {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
  };
  isFirst: boolean;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          isUser
            ? "bg-[#E8D5C4]"
            : "bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3]"
        )}
      >
        {isUser ? (
          <span className="text-sm font-medium text-[#2D2D2D]">You</span>
        ) : (
          <Bot className="w-4 h-4 text-[#2D2D2D]" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-[#E8D5C4] text-[#2D2D2D] rounded-br-md"
            : "bg-[#F5F5F0] dark:bg-[#3D3D3D] text-[#2D2D2D] dark:text-white rounded-bl-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-[#8A8A8A] mt-1">
          {format(new Date(message.createdAt), "h:mm a")}
        </p>
      </div>
    </motion.div>
  );
}
