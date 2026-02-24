/**
 * Server-Side Realtime Utilities
 * ==============================
 * Utilities for broadcasting realtime events from server-side code (API routes).
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { 
  CHANNELS, 
  EVENTS,
  type GradingProgressPayload,
  type FlashcardSessionPayload,
  type DocumentCollaborationPayload,
  type NotificationPayload,
} from "@/lib/supabase/realtime-client";

// Server-side Supabase client
let serverClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create server-side Supabase client
 */
function getServerClient(): ReturnType<typeof createClient<Database>> {
  if (serverClient) {
    return serverClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase environment variables are not configured. " +
      "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  serverClient = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serverClient;
}

/**
 * Broadcast a message to a channel
 */
async function broadcast<T = unknown>(
  channelName: string,
  event: string,
  payload: T
): Promise<{ success: boolean; error?: Error }> {
  try {
    const client = getServerClient();
    const channel = client.channel(channelName);

    const result = await channel.send({
      type: "broadcast",
      event,
      payload: {
        ...payload,
        timestamp: new Date().toISOString(),
      },
    });

    // Clean up channel
    await channel.unsubscribe();

    return { success: true };
  } catch (error) {
    console.error("Broadcast error:", error);
    return { success: false, error: error as Error };
  }
}

// ============================================
// Essay Grading Broadcasts
// ============================================

/**
 * Broadcast essay grading started event
 */
export async function broadcastGradingStarted(
  essayId: string,
  userId: string,
  metadata?: { questionType?: string; subject?: string }
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<GradingProgressPayload, "timestamp"> = {
    essayId,
    userId,
    status: "started",
    progress: 0,
    ...metadata,
  };

  // Broadcast to essay-specific channel
  const essayResult = await broadcast(
    CHANNELS.ESSAY_GRADING(essayId),
    EVENTS.ESSAY_GRADING_STARTED,
    payload
  );

  // Broadcast to user's essays channel
  await broadcast(
    CHANNELS.USER_ESSAYS(userId),
    EVENTS.ESSAY_GRADING_STARTED,
    payload
  );

  return essayResult;
}

/**
 * Broadcast essay grading progress update
 */
export async function broadcastGradingProgress(
  essayId: string,
  userId: string,
  progress: number,
  currentExaminer?: string,
  examinersCompleted?: string[],
  partialResults?: GradingProgressPayload["partialResults"]
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<GradingProgressPayload, "timestamp"> = {
    essayId,
    userId,
    status: "in_progress",
    progress,
    currentExaminer,
    examinersCompleted,
    partialResults,
  };

  return broadcast(
    CHANNELS.ESSAY_GRADING(essayId),
    EVENTS.ESSAY_GRADING_PROGRESS,
    payload
  );
}

/**
 * Broadcast essay grading completed event
 */
export async function broadcastGradingCompleted(
  essayId: string,
  userId: string,
  result: {
    overallScore: number;
    grade: string;
    examiners: Array<{ id: string; name: string; score: number }>;
  }
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<GradingProgressPayload, "timestamp"> = {
    essayId,
    userId,
    status: "completed",
    progress: 100,
    partialResults: result.examiners.map(e => ({
      examinerId: e.id,
      score: e.score,
      feedback: "",
    })),
  };

  // Broadcast to essay-specific channel
  const essayResult = await broadcast(
    CHANNELS.ESSAY_GRADING(essayId),
    EVENTS.ESSAY_GRADING_COMPLETED,
    { ...payload, result }
  );

  // Broadcast to user's essays channel
  await broadcast(
    CHANNELS.USER_ESSAYS(userId),
    EVENTS.ESSAY_GRADING_COMPLETED,
    { ...payload, result }
  );

  // Send notification
  await sendNotification({
    userId,
    type: "success",
    title: "Essay Grading Complete",
    message: `Your essay has been graded. Overall score: ${result.overallScore}/10 (${result.grade})`,
    data: { essayId, grade: result.grade, score: result.overallScore },
  });

  return essayResult;
}

/**
 * Broadcast essay grading failed event
 */
export async function broadcastGradingFailed(
  essayId: string,
  userId: string,
  error: string
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<GradingProgressPayload, "timestamp"> = {
    essayId,
    userId,
    status: "failed",
    progress: 0,
    error,
  };

  // Broadcast to essay-specific channel
  const essayResult = await broadcast(
    CHANNELS.ESSAY_GRADING(essayId),
    EVENTS.ESSAY_GRADING_FAILED,
    payload
  );

  // Broadcast to user's essays channel
  await broadcast(
    CHANNELS.USER_ESSAYS(userId),
    EVENTS.ESSAY_GRADING_FAILED,
    payload
  );

  // Send notification
  await sendNotification({
    userId,
    type: "error",
    title: "Essay Grading Failed",
    message: "There was an error grading your essay. Please try again.",
    data: { essayId, error },
  });

  return essayResult;
}

// ============================================
// Flashcard Session Broadcasts
// ============================================

/**
 * Broadcast flashcard session started event
 */
export async function broadcastFlashcardSessionStarted(
  sessionId: string,
  userId: string,
  deckId?: string
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<FlashcardSessionPayload, "timestamp"> = {
    sessionId,
    userId,
    action: "started",
    stats: {
      cardsReviewed: 0,
      correctCount: 0,
      streak: 0,
      timeSpent: 0,
    },
  };

  return broadcast(
    CHANNELS.FLASHCARD_SESSION(sessionId),
    EVENTS.FLASHCARD_SESSION_STARTED,
    { ...payload, deckId }
  );
}

/**
 * Broadcast flashcard reviewed event
 */
export async function broadcastFlashcardReviewed(
  sessionId: string,
  userId: string,
  flashcardId: string,
  confidence: "again" | "hard" | "good" | "easy",
  stats: FlashcardSessionPayload["stats"]
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<FlashcardSessionPayload, "timestamp"> = {
    sessionId,
    userId,
    action: "reviewed",
    flashcardId,
    confidence,
    stats,
  };

  return broadcast(
    CHANNELS.FLASHCARD_SESSION(sessionId),
    EVENTS.FLASHCARD_REVIEWED,
    payload
  );
}

/**
 * Broadcast flashcard session ended event
 */
export async function broadcastFlashcardSessionEnded(
  sessionId: string,
  userId: string,
  stats: FlashcardSessionPayload["stats"]
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<FlashcardSessionPayload, "timestamp"> = {
    sessionId,
    userId,
    action: "ended",
    stats,
  };

  // Broadcast to session channel
  const result = await broadcast(
    CHANNELS.FLASHCARD_SESSION(sessionId),
    EVENTS.FLASHCARD_SESSION_ENDED,
    payload
  );

  // Send notification with session summary
  const accuracy = stats.cardsReviewed > 0 
    ? Math.round((stats.correctCount / stats.cardsReviewed) * 100) 
    : 0;

  await sendNotification({
    userId,
    type: "info",
    title: "Study Session Complete",
    message: `You reviewed ${stats.cardsReviewed} cards with ${accuracy}% accuracy!`,
    data: { sessionId, stats },
  });

  return result;
}

/**
 * Broadcast deck update event
 */
export async function broadcastDeckUpdated(
  deckId: string,
  userId: string,
  updateType: "card_added" | "card_updated" | "card_deleted" | "deck_renamed"
): Promise<{ success: boolean; error?: Error }> {
  return broadcast(
    CHANNELS.DECK_UPDATES(deckId),
    EVENTS.DECK_UPDATED,
    {
      deckId,
      userId,
      updateType,
      timestamp: new Date().toISOString(),
    }
  );
}

// ============================================
// Document Collaboration Broadcasts
// ============================================

/**
 * Broadcast user joined document event
 */
export async function broadcastUserJoinedDocument(
  documentId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<DocumentCollaborationPayload, "timestamp"> = {
    documentId,
    userId,
    userName,
    action: "joined",
  };

  return broadcast(
    CHANNELS.DOCUMENT_COLLAB(documentId),
    EVENTS.USER_JOINED_DOCUMENT,
    payload
  );
}

/**
 * Broadcast user left document event
 */
export async function broadcastUserLeftDocument(
  documentId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<DocumentCollaborationPayload, "timestamp"> = {
    documentId,
    userId,
    userName,
    action: "left",
  };

  return broadcast(
    CHANNELS.DOCUMENT_COLLAB(documentId),
    EVENTS.USER_LEFT_DOCUMENT,
    payload
  );
}

/**
 * Broadcast document edited event
 */
export async function broadcastDocumentEdited(
  documentId: string,
  userId: string,
  userName: string,
  edit: {
    operation: "insert" | "delete" | "replace";
    position: number;
    content?: string;
    length?: number;
  },
  version: number
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<DocumentCollaborationPayload, "timestamp"> = {
    documentId,
    userId,
    userName,
    action: "edited",
    content: edit,
    version,
  };

  return broadcast(
    CHANNELS.DOCUMENT_COLLAB(documentId),
    EVENTS.DOCUMENT_EDITED,
    payload
  );
}

/**
 * Broadcast cursor moved event
 */
export async function broadcastCursorMoved(
  documentId: string,
  userId: string,
  userName: string,
  position: { x: number; y: number }
): Promise<{ success: boolean; error?: Error }> {
  const payload: Omit<DocumentCollaborationPayload, "timestamp"> = {
    documentId,
    userId,
    userName,
    action: "cursor_moved",
    cursor: {
      userId,
      userName,
      userColor: "", // Will be set by client
      x: position.x,
      y: position.y,
    },
  };

  return broadcast(
    CHANNELS.DOCUMENT_CURSOR(documentId),
    EVENTS.DOCUMENT_CURSOR_MOVED,
    payload
  );
}

// ============================================
// Notification Broadcasts
// ============================================

/**
 * Send a notification to a user
 */
export async function sendNotification(
  notification: Omit<NotificationPayload, "id" | "timestamp">
): Promise<{ success: boolean; error?: Error }> {
  const fullNotification: NotificationPayload = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  return broadcast(
    CHANNELS.NOTIFICATIONS(notification.userId),
    EVENTS.NEW_NOTIFICATION,
    fullNotification
  );
}

/**
 * Send a broadcast message to all users
 */
export async function sendGlobalBroadcast(
  message: {
    title: string;
    content: string;
    type?: "info" | "warning" | "announcement";
    data?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: Error }> {
  return broadcast(
    CHANNELS.BROADCAST_ALL,
    EVENTS.BROADCAST_MESSAGE,
    {
      ...message,
      timestamp: new Date().toISOString(),
    }
  );
}

// ============================================
// Presence Broadcasts
// ============================================

/**
 * Broadcast user presence update
 */
export async function broadcastPresence(
  userId: string,
  status: "online" | "away" | "offline",
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: Error }> {
  const eventMap: Record<string, string> = {
    online: EVENTS.USER_ONLINE,
    away: EVENTS.USER_AWAY,
    offline: EVENTS.USER_OFFLINE,
  };

  return broadcast(
    CHANNELS.USER_PRESENCE(userId),
    eventMap[status],
    {
      userId,
      status,
      metadata,
      timestamp: new Date().toISOString(),
    }
  );
}

// ============================================
// Utility Functions
// ============================================

/**
 * Batch broadcast multiple events
 */
export async function batchBroadcast(
  broadcasts: Array<{
    channel: string;
    event: string;
    payload: unknown;
  }>
): Promise<{ success: boolean; results: Array<{ success: boolean; error?: Error }> }> {
  const results = await Promise.all(
    broadcasts.map(({ channel, event, payload }) =>
      broadcast(channel, event, payload)
    )
  );

  const allSuccess = results.every(r => r.success);

  return {
    success: allSuccess,
    results,
  };
}

/**
 * Check if realtime is available (server-side)
 */
export function isRealtimeAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!url && !!key;
}
