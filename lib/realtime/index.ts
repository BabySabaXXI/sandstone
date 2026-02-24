/**
 * Realtime Module Index
 * =====================
 * Central export point for all realtime functionality.
 */

// Export hooks
export {
  useRealtimeSubscription,
  useEssayGradingRealtime,
  useFlashcardSessionRealtime,
  useDocumentCollaboration,
  usePresence,
  useNotifications,
} from "./hooks";

// Export types from hooks
export type {
  UseRealtimeSubscriptionOptions,
  UseRealtimeSubscriptionReturn,
  UseEssayGradingRealtimeOptions,
  UseEssayGradingRealtimeReturn,
  UseFlashcardSessionRealtimeOptions,
  UseFlashcardSessionRealtimeReturn,
  UseDocumentCollaborationOptions,
  UseDocumentCollaborationReturn,
  UsePresenceOptions,
  UsePresenceReturn,
  UseNotificationsOptions,
  UseNotificationsReturn,
} from "./hooks";

// Export provider
export {
  RealtimeProvider,
  useRealtime,
  useRealtimeStatus,
} from "./realtime-provider";

// Re-export from realtime-client for convenience
export {
  getRealtimeClient,
  getOrCreateChannel,
  removeChannel,
  removeAllChannels,
  getActiveChannels,
  isRealtimeConfigured,
  CHANNELS,
  EVENTS,
} from "@/lib/supabase/realtime-client";

// Re-export types from realtime-client
export type {
  RealtimeEventPayload,
  PresenceState,
  CursorPosition,
  GradingProgressPayload,
  FlashcardSessionPayload,
  DocumentCollaborationPayload,
  NotificationPayload,
} from "@/lib/supabase/realtime-client";
