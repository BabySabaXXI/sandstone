"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, ChatMessage, ChatFolder } from "@/stores/chat-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useAuth } from "@/components/auth-provider";
import { 
  X, Bot, Send, Loader2, MoreVertical, Pin, 
  Trash2, Plus, Folder, ChevronDown, Clock, MessageSquare,
  Search, Edit2, Check, XCircle, Download, Upload,
  Sparkles, RefreshCw, Copy, CheckCheck, Settings,
  ChevronLeft, PanelLeft, PanelLeftClose, Wand2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { Subject } from "@/types";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: {
    essayText?: string;
    essayQuestion?: string;
    documentContent?: string;
    flashcardTopic?: string;
  };
}

// Message bubble component
function MessageBubble({ 
  message, 
  isStreaming = false,
  onRegenerate,
  onCopy,
  onDelete,
}: { 
  message: ChatMessage; 
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-[#E8D5C4] text-[#2D2D2D]" 
          : "bg-gradient-to-br from-[#2D2D2D] to-[#4D4D4D] text-white"
      )}>
        {isUser ? (
          <span className="text-sm font-medium">You</span>
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        "flex-1 max-w-[80%]",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-3 text-left",
          isUser 
            ? "bg-[#E8D5C4] text-[#2D2D2D] rounded-br-md" 
            : "bg-[#F5F5F0] dark:bg-[#3D3D3D] text-[#2D2D2D] dark:text-white rounded-bl-md"
        )}>
          {isStreaming && !message.content ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {message.content.split('\n').map((line, i) => (
                <p key={i} className={cn("mb-2 last:mb-0", !line && "hidden")}>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Message actions */}
        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-[#E5E5E0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
              title="Copy message"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#8A8A8A]" />
              )}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 hover:bg-[#E5E5E0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 hover:bg-[#E5E5E0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#8A8A8A]" />
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-[#8A8A8A] mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </p>
      </div>
    </motion.div>
  );
}

// Quick action buttons
const QUICK_ACTIONS = [
  { icon: Sparkles, label: "Explain concept", prompt: "Can you explain the key concept of " },
  { icon: Wand2, label: "Practice question", prompt: "Give me a practice question about " },
  { icon: Edit2, label: "Check my answer", prompt: "Can you check my answer to: " },
  { icon: RefreshCw, label: "Summarize", prompt: "Can you summarize " },
];

export function AIChat({ isOpen, onClose, initialContext }: AIChatProps) {
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
    pinChat,
    folders,
    fetchChats,
    isLoading,
    error,
    clearError,
    streamingMessageId,
  } = useChatStore();
  
  const [inputValue, setInputValue] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const subjectChats = getChatsBySubject(currentSubject);
  const filteredChats = subjectChats.filter((chat) => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder ? chat.folder === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  const currentChat = currentChatId ? getChat(currentChatId) : null;

  // Fetch chats on mount
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages, streamingMessageId]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentChatId]);

  // Create new chat with initial context if provided
  useEffect(() => {
    if (isOpen && initialContext && !currentChatId) {
      createChat(currentSubject, { context: initialContext });
    }
  }, [isOpen, initialContext]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId || isLoading) return;

    const content = inputValue.trim();
    setInputValue("");
    setShowQuickActions(false);

    await sendMessageToAI(currentChatId, content, { subject: currentSubject });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateChat = async () => {
    await createChat(currentSubject);
    setShowQuickActions(true);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      await deleteChat(chatId);
    }
  };

  const handlePinChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = getChat(chatId);
    if (chat) {
      await pinChat(chatId, !chat.isPinned);
    }
  };

  const startEditingTitle = (chat: typeof currentChat, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chat) {
      setEditingChatId(chat.id);
      setEditTitle(chat.title);
    }
  };

  const saveTitle = async () => {
    if (editingChatId && editTitle.trim()) {
      await updateChat(editingChatId, { title: editTitle.trim() });
      setEditingChatId(null);
      setEditTitle("");
    }
  };

  const cancelEditing = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleRegenerate = async (messageId: string) => {
    if (!currentChatId) return;
    // This would need to be implemented in the store
    console.log("Regenerate:", messageId);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed bottom-24 right-6 w-[900px] h-[650px] bg-white dark:bg-[#2D2D2D] rounded-2xl shadow-2xl border border-[#E5E5E0] dark:border-[#3D3D3D] overflow-hidden z-50 flex"
    >
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="border-r border-[#E5E5E0] dark:border-[#3D3D3D] flex flex-col bg-[#FAFAF8] dark:bg-[#252525]"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#2D2D2D]" />
                  </div>
                  <h3 className="font-semibold text-[#2D2D2D] dark:text-white">AI Tutor</h3>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1.5 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors"
                  title="Hide sidebar"
                >
                  <PanelLeftClose className="w-4 h-4 text-[#8A8A8A]" />
                </button>
              </div>
              <button
                onClick={handleCreateChat}
                className="w-full flex items-center justify-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] py-2.5 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors font-medium"
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
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] transition-all"
                />
              </div>
            </div>

            {/* Folder Filter */}
            <div className="px-3 pb-2">
              <select
                value={selectedFolder || ""}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="w-full text-sm border border-[#E5E5E0] dark:border-[#3D3D3D] dark:bg-[#1A1A1A] dark:text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] transition-all"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-[#8A8A8A]">No chats found</p>
                  <button
                    onClick={handleCreateChat}
                    className="mt-2 text-sm text-[#E8D5C4] hover:underline"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setCurrentChat(chat.id)}
                    className={cn(
                      "group relative p-3 hover:bg-[#E5E5E0] dark:hover:bg-[#3D3D3D] transition-colors border-b border-[#E5E5E0]/50 dark:border-[#3D3D3D]/50 cursor-pointer",
                      currentChatId === chat.id && "bg-[#E8D5C4]/20 dark:bg-[#E8D5C4]/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-8">
                        {editingChatId === chat.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveTitle();
                                if (e.key === "Escape") cancelEditing();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 text-sm border border-[#E8D5C4] rounded px-2 py-1 dark:bg-[#1A1A1A] dark:text-white"
                              autoFocus
                            />
                            <button onClick={(e) => { e.stopPropagation(); saveTitle(); }}>
                              <Check className="w-4 h-4 text-green-500" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); cancelEditing(); }}>
                              <XCircle className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={cn(
                              "font-medium text-sm truncate",
                              currentChatId === chat.id ? "text-[#2D2D2D] dark:text-white" : "text-[#5A5A5A] dark:text-[#A0A0A0]"
                            )}>
                              {chat.isPinned && <Pin className="w-3 h-3 inline mr-1 text-[#E8D5C4]" />}
                              {chat.title}
                            </p>
                            <p className="text-xs text-[#8A8A8A] truncate mt-1">
                              {chat.messages[chat.messages.length - 1]?.content.slice(0, 40)}...
                            </p>
                            <p className="text-xs text-[#8A8A8A] mt-1">
                              {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions - visible on hover */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => handlePinChat(chat.id, e)}
                        className="p-1.5 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
                        title={chat.isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className={cn("w-3.5 h-3.5", chat.isPinned ? "text-[#E8D5C4] fill-[#E8D5C4]" : "text-[#8A8A8A]")} />
                      </button>
                      <button
                        onClick={(e) => startEditingTitle(chat, e)}
                        className="p-1.5 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#8A8A8A]" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="p-1.5 hover:bg-[#D4D4D0] dark:hover:bg-[#4D4D4D] rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[#8A8A8A]" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E0] dark:border-[#3D3D3D]">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors"
                title="Show sidebar"
              >
                <PanelLeft className="w-5 h-5 text-[#8A8A8A]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2D2D2D] dark:text-white">
                {currentChat?.title || "AI Tutor"}
              </h3>
              <p className="text-xs text-[#8A8A8A] capitalize flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {currentSubject} Tutor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentChat && (
              <button
                onClick={handleCreateChat}
                className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors"
                title="New chat"
              >
                <Plus className="w-5 h-5 text-[#8A8A8A]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-[#8A8A8A]" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button onClick={clearError} className="text-red-600 dark:text-red-400 hover:underline text-sm">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {currentChat ? (
            <>
              {currentChat.messages.length === 0 && showQuickActions ? (
                <div className="h-full flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-[#2D2D2D]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2D2D2D] dark:text-white mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-sm text-[#8A8A8A] text-center mb-8 max-w-md">
                    I'm your AI tutor for {currentSubject}. Ask me anything about concepts, practice questions, or get feedback on your work.
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {QUICK_ACTIONS.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5E0] dark:border-[#3D3D3D] hover:bg-[#F5F5F0] dark:hover:bg-[#3D3D3D] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E8D5C4]/30 flex items-center justify-center flex-shrink-0">
                          <action.icon className="w-4 h-4 text-[#2D2D2D]" />
                        </div>
                        <span className="text-sm font-medium text-[#2D2D2D] dark:text-white">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E0]/50 dark:divide-[#3D3D3D]/50">
                  {currentChat.messages.map((message, index) => (
                    <div key={message.id} className="group">
                      <MessageBubble
                        message={message}
                        isStreaming={message.id === streamingMessageId}
                        onRegenerate={message.role === "assistant" ? () => handleRegenerate(message.id) : undefined}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-[#2D2D2D]" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D2D2D] dark:text-white mb-2">
                Start a new conversation
              </h3>
              <p className="text-sm text-[#8A8A8A] text-center mb-6">
                Select a chat from the sidebar or create a new one to get started.
              </p>
              <button
                onClick={handleCreateChat}
                className="flex items-center gap-2 bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] px-6 py-3 rounded-xl hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#E5E5E0] dark:border-[#3D3D3D] bg-white dark:bg-[#2D2D2D]">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentChat ? "Type your message..." : "Select or create a chat to start..."}
              disabled={!currentChat || isLoading}
              rows={1}
              className={cn(
                "w-full pr-14 pl-4 py-3.5 text-sm bg-[#F5F5F0] dark:bg-[#1A1A1A] border border-[#E5E5E0] dark:border-[#3D3D3D] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] transition-all",
                (!currentChat || isLoading) && "opacity-50 cursor-not-allowed"
              )}
              style={{ minHeight: "52px", maxHeight: "150px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 150) + "px";
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !currentChat || isLoading}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all",
                inputValue.trim() && currentChat && !isLoading
                  ? "bg-[#2D2D2D] dark:bg-[#E8D5C4] text-white dark:text-[#2D2D2D] hover:bg-[#1A1A1A] dark:hover:bg-[#D4C4B0]"
                  : "bg-[#E5E5E0] dark:bg-[#3D3D3D] text-[#8A8A8A] cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-[#8A8A8A] mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default AIChat;
