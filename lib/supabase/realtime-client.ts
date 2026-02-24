/**
 * Supabase Realtime Client for Sandstone
 * ======================================
 * Centralized realtime client configuration and channel management
 * for live updates, presence, and broadcast features.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Singleton instance
let realtimeClient: SupabaseClient<Database> | null = null;

// Channel registry for managing multiple channels
const channelRegistry = new Map<string, RealtimeChannel>();

/**
 * Get or create the Supabase realtime client
 */
export function getRealtimeClient(): SupabaseClient<Database> {
  if (realtimeClient) {
    return realtimeClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  realtimeClient = createBrowserClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return realtimeClient;
}

/**
 * Channel names for different features
 */
export const CHANNELS = {
  // Essay grading channels
  ESSAY_GRADING: (essayId: string) => `essay-grading:${essayId}`,
  USER_ESSAYS: (userId: string) => `user-essays:${userId}`,
  
  // Flashcard channels
  FLASHCARD_SESSION: (sessionId: string) => `flashcard-session:${sessionId}`,
  USER_FLASHCARDS: (userId: string) => `user-flashcards:${userId}`,
  DECK_UPDATES: (deckId: string) => `deck-updates:${deckId}`,
  
  // Document collaboration channels
  DOCUMENT_COLLAB: (documentId: string) => `document-collab:${documentId}`,
  DOCUMENT_CURSOR: (documentId: string) => `document-cursor:${documentId}`,
  
  // Presence channels
  USER_PRESENCE: (userId: string) => `user-presence:${userId}`,
  GLOBAL_PRESENCE: "global-presence",
  
  // Notification channels
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  BROADCAST_ALL: "broadcast-all",
  
  // Study session channels
  STUDY_SESSION: (sessionId: string) => `study-session:${sessionId}`,
} as const;

/**
 * Event types for broadcast messages
 */
export const EVENTS = {
  // Essay events
  ESSAY_GRADING_STARTED: "ESSAY_GRADING_STARTED",
  ESSAY_GRADING_PROGRESS: "ESSAY_GRADING_PROGRESS",
  ESSAY_GRADING_COMPLETED: "ESSAY_GRADING_COMPLETED",
  ESSAY_GRADING_FAILED: "ESSAY_GRADING_FAILED",
  
  // Flashcard events
  FLASHCARD_REVIEWED: "FLASHCARD_REVIEWED",
  FLASHCARD_SESSION_STARTED: "FLASHCARD_SESSION_STARTED",
  FLASHCARD_SESSION_ENDED: "FLASHCARD_SESSION_ENDED",
  DECK_UPDATED: "DECK_UPDATED",
  
  // Document events
  DOCUMENT_EDITED: "DOCUMENT_EDITED",
  DOCUMENT_CURSOR_MOVED: "DOCUMENT_CURSOR_MOVED",
  DOCUMENT_SELECTION_CHANGED: "DOCUMENT_SELECTION_CHANGED",
  USER_JOINED_DOCUMENT: "USER_JOINED_DOCUMENT",
  USER_LEFT_DOCUMENT: "USER_LEFT_DOCUMENT",
  
  // Presence events
  USER_ONLINE: "USER_ONLINE",
  USER_AWAY: "USER_AWAY",
  USER_OFFLINE: "USER_OFFLINE",
  
  // Notification events
  NEW_NOTIFICATION: "NEW_NOTIFICATION",
  NOTIFICATION_READ: "NOTIFICATION_READ",
  BROADCAST_MESSAGE: "BROADCAST_MESSAGE",
  
  // Study session events
  SESSION_STARTED: "SESSION_STARTED",
  SESSION_PAUSED: "SESSION_PAUSED",
  SESSION_RESUMED: "SESSION_RESUMED",
  SESSION_ENDED: "SESSION_ENDED",
  SESSION_PROGRESS: "SESSION_PROGRESS",
} as const;

/**
 * Create or get an existing channel
 */
export function getOrCreateChannel(channelName: string): RealtimeChannel {
  const client = getRealtimeClient();
  
  if (channelRegistry.has(channelName)) {
    return channelRegistry.get(channelName)!;
  }

  const channel = client.channel(channelName, {
    config: {
      broadcast: {
        self: true,
      },
      presence: {
        key: channelName,
      },
    },
  });

  channelRegistry.set(channelName, channel);
  return channel;
}

/**
 * Remove a channel from registry and unsubscribe
 */
export async function removeChannel(channelName: string): Promise<void> {
  const channel = channelRegistry.get(channelName);
  if (channel) {
    await channel.unsubscribe();
    channelRegistry.delete(channelName);
  }
}

/**
 * Remove all channels
 */
export async function removeAllChannels(): Promise<void> {
  const promises = Array.from(channelRegistry.values()).map(channel => 
    channel.unsubscribe()
  );
  await Promise.all(promises);
  channelRegistry.clear();
}

/**
 * Get all active channels
 */
export function getActiveChannels(): string[] {
  return Array.from(channelRegistry.keys());
}

/**
 * Check if realtime is configured
 */
export function isRealtimeConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key && url.startsWith("http");
}

/**
 * Type for realtime event payloads
 */
export interface RealtimeEventPayload<T = unknown> {
  type: string;
  payload: T;
  userId?: string;
  timestamp: string;
}

/**
 * Type for presence state
 */
export interface PresenceState {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: "online" | "away" | "offline";
  lastSeen: string;
  currentActivity?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Type for cursor position in document collaboration
 */
export interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  selection?: {
    start: number;
    end: number;
  };
}

/**
 * Type for grading progress updates
 */
export interface GradingProgressPayload {
  essayId: string;
  userId: string;
  status: "started" | "in_progress" | "completed" | "failed";
  progress: number; // 0-100
  currentExaminer?: string;
  examinersCompleted?: string[];
  partialResults?: {
    examinerId: string;
    score: number;
    feedback: string;
  }[];
  error?: string;
  timestamp: string;
}

/**
 * Type for flashcard session updates
 */
export interface FlashcardSessionPayload {
  sessionId: string;
  userId: string;
  action: "started" | "reviewed" | "paused" | "resumed" | "ended";
  flashcardId?: string;
  confidence?: "again" | "hard" | "good" | "easy";
  stats?: {
    cardsReviewed: number;
    correctCount: number;
    streak: number;
    timeSpent: number;
  };
  timestamp: string;
}

/**
 * Type for document collaboration updates
 */
export interface DocumentCollaborationPayload {
  documentId: string;
  userId: string;
  userName: string;
  action: "joined" | "left" | "edited" | "cursor_moved" | "selection_changed";
  content?: unknown;
  cursor?: CursorPosition;
  version?: number;
  timestamp: string;
}

/**
 * Type for notification broadcasts
 */
export interface NotificationPayload {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}
