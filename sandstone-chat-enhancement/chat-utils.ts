/**
 * Chat System Utilities for Sandstone
 * 
 * This file contains utility functions for the enhanced chat system.
 */

import { ChatMessage, Chat, ChatFolder, ChatExport, MessageRole } from "./chat-types";

// ============================================================================
// Message Utilities
// ============================================================================

/**
 * Generate a unique ID
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new message object
 */
export function createMessage(
  role: MessageRole,
  content: string,
  metadata?: ChatMessage["metadata"]
): ChatMessage {
  return {
    id: generateId(),
    role,
    content,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

/**
 * Generate a chat title from the first message
 */
export function generateChatTitle(message: string, maxLength: number = 50): string {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= maxLength) return cleanMessage;
  return cleanMessage.slice(0, maxLength - 3) + "...";
}

/**
 * Truncate message content for preview
 */
export function truncateMessage(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength - 3) + "...";
}

/**
 * Count words in a message
 */
export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate token count (rough approximation)
 * This is a simple estimation - actual token counts depend on the tokenizer
 */
export function estimateTokens(content: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(content.length / 4);
}

/**
 * Format message content with markdown-like syntax
 */
export function formatMessageContent(content: string): string {
  // Escape HTML to prevent XSS
  let formatted = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Format code blocks
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="code-block"><code>$2</code></pre>'
  );

  // Format inline code
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  );

  // Format bold text
  formatted = formatted.replace(
    /\*\*([^*]+)\*\*/g,
    "<strong>$1</strong>"
  );

  // Format italic text
  formatted = formatted.replace(
    /\*([^*]+)\*/g,
    "<em>$1</em>"
  );

  // Format bullet points
  formatted = formatted.replace(
    /^- (.+)$/gm,
    '<li class="bullet-point">$1</li>'
  );

  // Format numbered lists
  formatted = formatted.replace(
    /^\d+\. (.+)$/gm,
    '<li class="numbered-item">$1</li>'
  );

  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
}

// ============================================================================
// Chat Utilities
// ============================================================================

/**
 * Create a new chat object
 */
export function createChat(
  subject: string,
  options: {
    title?: string;
    folder?: string;
    context?: Chat["context"];
  } = {}
): Chat {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: options.title || `New ${subject.charAt(0).toUpperCase() + subject.slice(1)} Chat`,
    subject: subject as any,
    messages: [],
    createdAt: now,
    updatedAt: now,
    folder: options.folder,
    context: options.context,
    metadata: {
      totalMessages: 0,
      lastActivity: now,
    },
  };
}

/**
 * Sort chats by pin status and date
 */
export function sortChats(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    // Pinned chats first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by updated date (newest first)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * Filter chats by search query
 */
export function filterChatsBySearch(
  chats: Chat[],
  query: string
): Chat[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return chats;

  return chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(lowerQuery) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter chats by folder
 */
export function filterChatsByFolder(
  chats: Chat[],
  folderId: string | null
): Chat[] {
  if (folderId === null) return chats;
  return chats.filter((chat) => chat.folder === folderId);
}

/**
 * Get chat statistics
 */
export function getChatStats(chats: Chat[]) {
  const totalMessages = chats.reduce(
    (sum, chat) => sum + chat.messages.length,
    0
  );

  return {
    totalChats: chats.length,
    totalMessages,
    pinnedChats: chats.filter((c) => c.isPinned).length,
    averageMessagesPerChat: chats.length > 0 ? totalMessages / chats.length : 0,
    chatsBySubject: chats.reduce((acc, chat) => {
      acc[chat.subject] = (acc[chat.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Find a message in a chat by ID
 */
export function findMessage(
  chat: Chat,
  messageId: string
): ChatMessage | undefined {
  return chat.messages.find((m) => m.id === messageId);
}

/**
 * Get the last user message in a chat
 */
export function getLastUserMessage(chat: Chat): ChatMessage | undefined {
  return [...chat.messages].reverse().find((m) => m.role === "user");
}

/**
 * Get the last assistant message in a chat
 */
export function getLastAssistantMessage(chat: Chat): ChatMessage | undefined {
  return [...chat.messages].reverse().find((m) => m.role === "assistant");
}

// ============================================================================
// Export/Import Utilities
// ============================================================================

/**
 * Export chats to JSON format
 */
export function exportChatsToJSON(chats: Chat[]): string {
  const exportData: ChatExport = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    chats: chats.map((chat) => ({
      title: chat.title,
      subject: chat.subject,
      createdAt: chat.createdAt,
      messages: chat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download chats as a JSON file
 */
export function downloadChatsAsFile(chats: Chat[], filename?: string): void {
  const json = exportChatsToJSON(chats);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `chats-export-${formatDate(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Parse imported chat data
 */
export function parseImportedChats(json: string): Partial<Chat>[] {
  try {
    const data: ChatExport = JSON.parse(json);

    if (!data.chats || !Array.isArray(data.chats)) {
      throw new Error("Invalid chat export format");
    }

    return data.chats.map((chat) => ({
      title: chat.title,
      subject: chat.subject,
      messages: chat.messages.map((m) => createMessage(m.role, m.content)),
      createdAt: chat.createdAt,
    }));
  } catch (error) {
    throw new Error(`Failed to parse chat export: ${error}`);
  }
}

// ============================================================================
// Folder Utilities
// ============================================================================

/**
 * Create a new folder
 */
export function createFolder(
  name: string,
  color?: string
): ChatFolder {
  return {
    id: generateId(),
    name,
    color,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get default folders
 */
export function getDefaultFolders(): ChatFolder[] {
  return [
    createFolder("Essay Help", "#E8D5C4"),
    createFolder("Concept Review", "#A8C5A8"),
    createFolder("Practice Questions", "#A8C5D4"),
  ];
}

/**
 * Count chats in a folder
 */
export function countChatsInFolder(
  chats: Chat[],
  folderId: string
): number {
  return chats.filter((chat) => chat.folder === folderId).length;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time for display
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Group chats by date
 */
export function groupChatsByDate(chats: Chat[]): Record<string, Chat[]> {
  const groups: Record<string, Chat[]> = {
    Today: [],
    Yesterday: [],
    "Last 7 Days": [],
    "Last 30 Days": [],
    Older: [],
  };

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);

    if (isToday(chatDate)) {
      groups.Today.push(chat);
    } else if (chatDate.getDate() === yesterday.getDate()) {
      groups.Yesterday.push(chat);
    } else if (now.getTime() - chatDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      groups["Last 7 Days"].push(chat);
    } else if (now.getTime() - chatDate.getTime() < 30 * 24 * 60 * 60 * 1000) {
      groups["Last 30 Days"].push(chat);
    } else {
      groups.Older.push(chat);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, chats]) => chats.length > 0)
  );
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate a chat message
 */
export function validateMessage(message: Partial<ChatMessage>): string[] {
  const errors: string[] = [];

  if (!message.role || !["user", "assistant", "system"].includes(message.role)) {
    errors.push("Invalid message role");
  }

  if (!message.content || message.content.trim().length === 0) {
    errors.push("Message content is required");
  }

  if (message.content && message.content.length > 4000) {
    errors.push("Message content exceeds maximum length of 4000 characters");
  }

  return errors;
}

/**
 * Validate a chat
 */
export function validateChat(chat: Partial<Chat>): string[] {
  const errors: string[] = [];

  if (!chat.title || chat.title.trim().length === 0) {
    errors.push("Chat title is required");
  }

  if (!chat.subject) {
    errors.push("Chat subject is required");
  }

  if (chat.messages && !Array.isArray(chat.messages)) {
    errors.push("Messages must be an array");
  }

  return errors;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// ============================================================================
// Context Utilities
// ============================================================================

/**
 * Build system prompt with context
 */
export function buildSystemPrompt(
  basePrompt: string,
  context?: Record<string, unknown>
): string {
  let prompt = basePrompt;

  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      if (value) {
        prompt += `\n\n${key}: ${JSON.stringify(value)}`;
      }
    });
  }

  return prompt;
}

/**
 * Extract context from URL parameters
 */
export function extractContextFromURL(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const context: Record<string, string> = {};

  params.forEach((value, key) => {
    if (key.startsWith("context.")) {
      context[key.replace("context.", "")] = value;
    }
  });

  return context;
}

// ============================================================================
// Streaming Utilities
// ============================================================================

/**
 * Parse a streaming chunk from the API
 */
export function parseStreamChunk(chunk: string): { content: string; done: boolean } {
  const lines = chunk.split("\n");
  let content = "";
  let done = false;

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") {
        done = true;
        continue;
      }

      try {
        const parsed = JSON.parse(data);
        content += parsed.choices?.[0]?.delta?.content || "";
      } catch {
        // Ignore parsing errors for incomplete chunks
      }
    }
  }

  return { content, done };
}

/**
 * Create a readable stream from an API response
 */
export async function* createStreamGenerator(
  response: Response
): AsyncGenerator<string, void, unknown> {
  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const { content } = parseStreamChunk(chunk);
      if (content) {
        yield content;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
