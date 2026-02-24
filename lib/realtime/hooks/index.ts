/**
 * Realtime Hooks Index
 * ====================
 * Export all realtime hooks for easy importing.
 */

export { useRealtimeSubscription } from "./useRealtimeSubscription";
export { useEssayGradingRealtime } from "./useEssayGradingRealtime";
export { useFlashcardSessionRealtime } from "./useFlashcardSessionRealtime";
export { useDocumentCollaboration } from "./useDocumentCollaboration";
export { usePresence } from "./usePresence";
export { useNotifications } from "./useNotifications";

// Re-export types
export type { 
  UseRealtimeSubscriptionOptions,
  UseRealtimeSubscriptionReturn 
} from "./useRealtimeSubscription";

export type { 
  UseEssayGradingRealtimeOptions,
  UseEssayGradingRealtimeReturn 
} from "./useEssayGradingRealtime";

export type { 
  UseFlashcardSessionRealtimeOptions,
  UseFlashcardSessionRealtimeReturn 
} from "./useFlashcardSessionRealtime";

export type { 
  UseDocumentCollaborationOptions,
  UseDocumentCollaborationReturn 
} from "./useDocumentCollaboration";

export type { 
  UsePresenceOptions,
  UsePresenceReturn 
} from "./usePresence";

export type { 
  UseNotificationsOptions,
  UseNotificationsReturn 
} from "./useNotifications";
