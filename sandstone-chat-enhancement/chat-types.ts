/**
 * Chat System Type Definitions for Sandstone
 * 
 * This file contains all TypeScript types and interfaces for the enhanced chat system.
 */

import { Subject } from "@/types";

// ============================================================================
// Enums
// ============================================================================

export type MessageRole = "user" | "assistant" | "system";

export type UserLevel = "beginner" | "intermediate" | "advanced";

export type ChatStatus = "active" | "archived" | "deleted";

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * A single message in a chat conversation
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Role of the message sender */
  role: MessageRole;
  /** Message content */
  content: string;
  /** ISO timestamp when message was created */
  timestamp: string;
  /** Optional metadata about the message */
  metadata?: {
    /** Number of tokens used for this message */
    tokensUsed?: number;
    /** AI model used for generation */
    model?: string;
    /** Processing time in milliseconds */
    processingTime?: number;
    /** Whether the message was edited */
    isEdited?: boolean;
    /** Original content if edited */
    originalContent?: string;
  };
}

/**
 * Context information for a chat session
 * This provides additional context to the AI for better responses
 */
export interface ChatContext {
  /** Essay text being discussed */
  essayText?: string;
  /** The essay question or prompt */
  essayQuestion?: string;
  /** Document content for reference */
  documentContent?: string;
  /** Flashcard topic being studied */
  flashcardTopic?: string;
  /** Recent quiz results for context */
  quizResults?: QuizResult[];
  /** User's proficiency level */
  userLevel?: UserLevel;
  /** User's current learning goal */
  learningGoal?: string;
  /** Additional custom context data */
  customData?: Record<string, unknown>;
}

/**
 * Quiz result for context
 */
export interface QuizResult {
  /** The quiz question */
  question: string;
  /** User's answer */
  userAnswer: string;
  /** Whether the answer was correct */
  correct: boolean;
  /** Correct answer if applicable */
  correctAnswer?: string;
  /** Explanation of the answer */
  explanation?: string;
}

/**
 * A chat conversation
 */
export interface Chat {
  /** Unique chat identifier */
  id: string;
  /** Chat title */
  title: string;
  /** Subject of the chat */
  subject: Subject;
  /** Array of messages in the chat */
  messages: ChatMessage[];
  /** ISO timestamp when chat was created */
  createdAt: string;
  /** ISO timestamp when chat was last updated */
  updatedAt: string;
  /** Whether the chat is pinned */
  isPinned?: boolean;
  /** ID of the folder containing this chat */
  folder?: string;
  /** Context information for the chat */
  context?: ChatContext;
  /** Additional metadata */
  metadata?: ChatMetadata;
  /** Chat status */
  status?: ChatStatus;
}

/**
 * Chat metadata
 */
export interface ChatMetadata {
  /** Total number of messages */
  totalMessages?: number;
  /** ISO timestamp of last activity */
  lastActivity?: string;
  /** User who created the chat */
  createdBy?: string;
  /** Tags for the chat */
  tags?: string[];
  /** Whether the chat is a template */
  isTemplate?: boolean;
}

/**
 * A folder for organizing chats
 */
export interface ChatFolder {
  /** Unique folder identifier */
  id: string;
  /** Folder name */
  name: string;
  /** Folder color (hex code) */
  color?: string;
  /** ISO timestamp when folder was created */
  createdAt: string;
  /** ISO timestamp when folder was last updated */
  updatedAt?: string;
  /** Number of chats in this folder */
  chatCount?: number;
}

// ============================================================================
// API Types
// ============================================================================

/**
 * Request body for sending a chat message
 */
export interface SendMessageRequest {
  /** The message content */
  message: string;
  /** Subject for context */
  subject: Subject;
  /** Previous messages for context */
  chatHistory?: Array<{
    role: MessageRole;
    content: string;
  }>;
  /** Additional context */
  context?: ChatContext;
  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * Response from the chat API
 */
export interface SendMessageResponse {
  /** AI response content */
  response: string;
  /** Token usage information */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model used for generation */
  model?: string;
}

/**
 * Streaming chunk from the chat API
 */
export interface StreamChunk {
  /** Chunk content */
  content: string;
  /** Whether this is the final chunk */
  done: boolean;
}

/**
 * Error response from the chat API
 */
export interface ChatErrorResponse {
  /** Error message */
  error: string;
  /** Additional error details */
  details?: string | Array<{ message: string; path: string[] }>;
  /** HTTP status code */
  status?: number;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * State for the chat store
 */
export interface ChatStoreState {
  /** All chats */
  chats: Chat[];
  /** Currently selected chat ID */
  currentChatId: string | null;
  /** All folders */
  folders: ChatFolder[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** ID of message being streamed */
  streamingMessageId: string | null;
}

/**
 * Actions for the chat store
 */
export interface ChatStoreActions {
  // Getters
  getChat: (chatId: string) => Chat | undefined;
  getChatsBySubject: (subject: Subject) => Chat[];
  getChatsByFolder: (folderId: string) => Chat[];
  getPinnedChats: () => Chat[];
  getRecentChats: (limit?: number) => Chat[];
  getCurrentChat: () => Chat | undefined;

  // Chat actions
  setCurrentChat: (chatId: string | null) => void;
  createChat: (subject: Subject, options?: CreateChatOptions) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  renameChat: (chatId: string, newTitle: string) => Promise<void>;
  pinChat: (chatId: string, isPinned: boolean) => Promise<void>;
  moveToFolder: (chatId: string, folderId: string | null) => Promise<void>;
  clearAllChats: () => Promise<void>;

  // Message actions
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "timestamp">) => Promise<void>;
  sendMessageToAI: (chatId: string, content: string, options?: SendMessageOptions) => Promise<void>;
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

/**
 * Options for creating a new chat
 */
export interface CreateChatOptions {
  /** Initial message to start the chat */
  initialMessage?: string;
  /** Folder ID to place the chat in */
  folderId?: string;
  /** Context information */
  context?: ChatContext;
}

/**
 * Options for sending a message
 */
export interface SendMessageOptions {
  /** Subject override */
  subject?: Subject;
  /** Whether to stream the response */
  stream?: boolean;
  /** Callback for streaming updates */
  onStreamUpdate?: (content: string) => void;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for the AIChat component
 */
export interface AIChatProps {
  /** Whether the chat is open */
  isOpen: boolean;
  /** Callback when chat is closed */
  onClose: () => void;
  /** Initial context for the chat */
  initialContext?: Partial<ChatContext>;
  /** Initial chat ID to open */
  initialChatId?: string;
  /** Callback when a message is sent */
  onMessageSent?: (message: ChatMessage) => void;
  /** Callback when a response is received */
  onResponseReceived?: (message: ChatMessage) => void;
}

/**
 * Props for the MessageBubble component
 */
export interface MessageBubbleProps {
  /** The message to display */
  message: ChatMessage;
  /** Whether the message is being streamed */
  isStreaming?: boolean;
  /** Callback to regenerate the message */
  onRegenerate?: () => void;
  /** Callback to copy the message */
  onCopy?: () => void;
  /** Callback to delete the message */
  onDelete?: () => void;
  /** Callback to edit the message */
  onEdit?: (newContent: string) => void;
}

/**
 * Props for the ChatSidebar component
 */
export interface ChatSidebarProps {
  /** Whether the sidebar is visible */
  isOpen: boolean;
  /** Callback to toggle sidebar */
  onToggle: () => void;
  /** Search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Selected folder filter */
  selectedFolder: string | null;
  /** Callback when folder filter changes */
  onFolderChange: (folderId: string | null) => void;
  /** Callback when a chat is selected */
  onSelectChat: (chatId: string) => void;
  /** Callback to create a new chat */
  onCreateChat: () => void;
  /** Callback to delete a chat */
  onDeleteChat: (chatId: string) => void;
  /** Callback to pin a chat */
  onPinChat: (chatId: string) => void;
  /** Callback to rename a chat */
  onRenameChat: (chatId: string, newTitle: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Chat statistics
 */
export interface ChatStatistics {
  totalChats: number;
  totalMessages: number;
  pinnedChats: number;
  chatsBySubject: Record<string, number>;
  averageMessagesPerChat: number;
}

/**
 * Search result
 */
export interface ChatSearchResult {
  chatId: string;
  chatTitle: string;
  message: ChatMessage;
  matchIndex: number;
  matchContext?: string;
}

/**
 * Chat export format
 */
export interface ChatExport {
  version: string;
  exportedAt: string;
  chats: Array<{
    title: string;
    subject: Subject;
    createdAt: string;
    messages: Array<{
      role: MessageRole;
      content: string;
      timestamp: string;
    }>;
  }>;
}

/**
 * API usage record
 */
export interface ChatUsageRecord {
  id: string;
  userId: string;
  chatId?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  createdAt: string;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_FOLDERS: Omit<ChatFolder, "id" | "createdAt">[] = [
  { name: "Essay Help", color: "#E8D5C4" },
  { name: "Concept Review", color: "#A8C5A8" },
  { name: "Practice Questions", color: "#A8C5D4" },
];

export const MAX_CHAT_HISTORY = 10;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_TITLE_LENGTH = 100;

export const QUICK_ACTIONS = [
  { icon: "Sparkles", label: "Explain concept", prompt: "Can you explain the key concept of " },
  { icon: "Wand2", label: "Practice question", prompt: "Give me a practice question about " },
  { icon: "Edit2", label: "Check my answer", prompt: "Can you check my answer to: " },
  { icon: "RefreshCw", label: "Summarize", prompt: "Can you summarize " },
] as const;
