/**
 * Notification Hooks
 * ==================
 * React hooks for managing notifications in the Sandstone app.
 * Provides real-time notification updates and state management.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getRealtimeClient, CHANNELS, EVENTS } from "@/lib/supabase/realtime-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { NotificationService } from "./service";
import { PushNotificationService } from "./push-service";
import {
  type Notification,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
  type NotificationFilters,
  type NotificationListResponse,
  type NotificationPreferences,
  type CreateNotificationRequest,
  type SendNotificationResult,
} from "./types";

// ============================================
// USE NOTIFICATIONS HOOK
// ============================================

interface UseNotificationsOptions {
  enabled?: boolean;
  limit?: number;
  status?: NotificationStatus;
  autoMarkAsRead?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (request: CreateNotificationRequest) => Promise<SendNotificationResult>;
  // Real-time
  isSubscribed: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    enabled = true,
    limit = 20,
    status,
    autoMarkAsRead = false,
  } = options;

  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const notificationServiceRef = useRef<NotificationService | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cursorRef = useRef<string | undefined>(undefined);

  // Initialize notification service
  useEffect(() => {
    if (supabase) {
      notificationServiceRef.current = new NotificationService(supabase);
    }
  }, [supabase]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (isLoadMore = false) => {
    if (!user?.id || !notificationServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const filters: NotificationFilters = {
        limit,
        status,
        cursor: isLoadMore ? cursorRef.current : undefined,
      };

      const response = await notificationServiceRef.current.getNotifications(
        user.id,
        filters
      );

      if (isLoadMore) {
        setNotifications((prev) => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }

      setUnreadCount(response.unread_count);
      setTotalCount(response.total);
      setHasMore(response.has_more);
      cursorRef.current = response.next_cursor;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit, status]);

  // Initial fetch
  useEffect(() => {
    if (enabled && user?.id) {
      fetchNotifications();
    }
  }, [enabled, user?.id, fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!enabled || !user?.id) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.NOTIFICATIONS(user.id);

    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    // Listen for new notifications
    channel.on("broadcast", { event: EVENTS.NEW_NOTIFICATION }, (payload) => {
      const newNotification = payload.payload as Notification;
      
      setNotifications((prev) => {
        // Check for duplicates
        if (prev.some((n) => n.id === newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });

      setUnreadCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);

      // Auto mark as read if enabled
      if (autoMarkAsRead && notificationServiceRef.current) {
        notificationServiceRef.current.markAsRead(user.id, [newNotification.id]);
      }
    });

    // Listen for notification updates
    channel.on("broadcast", { event: EVENTS.NOTIFICATION_READ }, (payload) => {
      const { notificationId } = payload.payload as { notificationId: string };
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read", read_at: new Date().toISOString() } : n
        )
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true);
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      setIsSubscribed(false);
    };
  }, [enabled, user?.id, autoMarkAsRead]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    cursorRef.current = undefined;
    await fetchNotifications(false);
  }, [fetchNotifications]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchNotifications(true);
  }, [hasMore, isLoading, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id || !notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.markAsRead(user.id, [notificationId]);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "read", read_at: new Date().toISOString() } : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }, [user?.id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.markAllAsRead(user.id);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === "unread" ? { ...n, status: "read", read_at: new Date().toISOString() } : n
        )
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }, [user?.id]);

  // Dismiss notification
  const dismiss = useCallback(async (notificationId: string) => {
    if (!notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.dismissNotification(notificationId);
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      const dismissedNotification = notifications.find((n) => n.id === notificationId);
      if (dismissedNotification?.status === "unread") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  }, [notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.deleteNotification(notificationId);
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      if (deletedNotification?.status === "unread") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }, [notifications]);

  // Create notification
  const createNotification = useCallback(async (
    request: CreateNotificationRequest
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Notification service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createNotification(request);
  }, []);

  return {
    notifications,
    unreadCount,
    totalCount,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    deleteNotification,
    createNotification,
    isSubscribed,
  };
}

// ============================================
// USE NOTIFICATION PREFERENCES HOOK
// ============================================

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: Error | null;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  updateChannelPreferences: (channel: string, enabled: boolean) => Promise<void>;
  updateTypePreferences: (type: string, config: { enabled?: boolean; channels?: string[] }) => Promise<void>;
  toggleDoNotDisturb: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export function useNotificationPreferences(): UseNotificationPreferencesReturn {
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const notificationServiceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (supabase) {
      notificationServiceRef.current = new NotificationService(supabase);
    }
  }, [supabase]);

  // Fetch preferences
  useEffect(() => {
    if (!user?.id) return;

    const fetchPreferences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const prefs = await notificationServiceRef.current?.getPreferences(user.id);
        setPreferences(prefs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch preferences"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(async (
    updates: Partial<NotificationPreferences>
  ) => {
    if (!user?.id || !notificationServiceRef.current) return;

    setIsLoading(true);
    try {
      await notificationServiceRef.current.updatePreferences(user.id, updates);
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update preferences"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update channel preferences
  const updateChannelPreferences = useCallback(async (channel: string, enabled: boolean) => {
    if (!preferences) return;

    const updatedChannels = {
      ...preferences.channels,
      [channel]: enabled,
    };

    await updatePreferences({ channels: updatedChannels });
  }, [preferences, updatePreferences]);

  // Update type preferences
  const updateTypePreferences = useCallback(async (
    type: string,
    config: { enabled?: boolean; channels?: string[] }
  ) => {
    if (!preferences) return;

    const updatedTypePreferences = {
      ...preferences.type_preferences,
      [type]: {
        ...preferences.type_preferences[type as keyof typeof preferences.type_preferences],
        ...config,
      },
    };

    await updatePreferences({ type_preferences: updatedTypePreferences });
  }, [preferences, updatePreferences]);

  // Toggle do not disturb
  const toggleDoNotDisturb = useCallback(async () => {
    if (!preferences) return;

    await updatePreferences({ do_not_disturb: !preferences.do_not_disturb });
  }, [preferences, updatePreferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!user?.id || !notificationServiceRef.current) return;

    setIsLoading(true);
    try {
      // Delete existing preferences to trigger default creation
      await supabase
        .from("notification_preferences")
        .delete()
        .eq("user_id", user.id);

      const prefs = await notificationServiceRef.current.createDefaultPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to reset preferences"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    updateChannelPreferences,
    updateTypePreferences,
    toggleDoNotDisturb,
    resetToDefaults,
  };
}

// ============================================
// USE PUSH NOTIFICATIONS HOOK
// ============================================

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: Error | null;
  // Actions
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const user = useUser();
  
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const pushServiceRef = useRef<PushNotificationService | null>(null);

  useEffect(() => {
    const service = new PushNotificationService();
    pushServiceRef.current = service;
    
    setIsSupported(service.isSupported());
    setPermission(service.getPermissionStatus());

    // Check subscription status
    service.isSubscribed().then(setIsSubscribed);
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!pushServiceRef.current) return "denied";

    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await pushServiceRef.current.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to request permission"));
      return "denied";
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user?.id || !pushServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await pushServiceRef.current.subscribe(user.id);
      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to subscribe"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!user?.id || !pushServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      await pushServiceRef.current.unsubscribe(user.id);
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to unsubscribe"));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Show local notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!pushServiceRef.current) return;

    try {
      await pushServiceRef.current.showLocalNotification(title, options);
    } catch (err) {
      console.error("Failed to show notification:", err);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// ============================================
// USE UNREAD COUNT HOOK
// ============================================

interface UseUnreadCountReturn {
  count: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useUnreadCount(): UseUnreadCountReturn {
  const user = useUser();
  const supabase = useSupabaseClient<Database>();
  
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const notificationServiceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (supabase) {
      notificationServiceRef.current = new NotificationService(supabase);
    }
  }, [supabase]);

  const refresh = useCallback(async () => {
    if (!user?.id || !notificationServiceRef.current) return;

    setIsLoading(true);
    try {
      const unreadCount = await notificationServiceRef.current.getUnreadCount(user.id);
      setCount(unreadCount);
    } catch (err) {
      console.error("Failed to get unread count:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.NOTIFICATIONS(user.id);

    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    channel.on("broadcast", { event: EVENTS.NEW_NOTIFICATION }, () => {
      setCount((prev) => prev + 1);
    });

    channel.on("broadcast", { event: EVENTS.NOTIFICATION_READ }, () => {
      setCount((prev) => Math.max(0, prev - 1));
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  return { count, isLoading, refresh };
}

// ============================================
// USE NOTIFICATION TEMPLATES HOOK
// ============================================

interface UseNotificationTemplatesReturn {
  sendEssayGraded: (userId: string, essayTitle: string, score: number, grade: string) => Promise<SendNotificationResult>;
  sendFlashcardsDue: (userId: string, deckName: string, cardsDueCount: number) => Promise<SendNotificationResult>;
  sendStudyReminder: (userId: string, subject: string) => Promise<SendNotificationResult>;
  sendCollaborationInvite: (userId: string, collaboratorName: string, documentTitle: string) => Promise<SendNotificationResult>;
  sendAchievementUnlocked: (userId: string, achievementName: string) => Promise<SendNotificationResult>;
  sendNewMessage: (userId: string, senderName: string, chatTitle: string) => Promise<SendNotificationResult>;
}

export function useNotificationTemplates(): UseNotificationTemplatesReturn {
  const supabase = useSupabaseClient<Database>();
  const notificationServiceRef = useRef<NotificationService | null>(null);

  useEffect(() => {
    if (supabase) {
      notificationServiceRef.current = new NotificationService(supabase);
    }
  }, [supabase]);

  const sendEssayGraded = useCallback(async (
    userId: string,
    essayTitle: string,
    score: number,
    grade: string
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "essay_graded", {
      essay_title: essayTitle,
      score: score.toString(),
      grade,
    });
  }, []);

  const sendFlashcardsDue = useCallback(async (
    userId: string,
    deckName: string,
    cardsDueCount: number
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "flashcards_due", {
      deck_name: deckName,
      cards_due_count: cardsDueCount.toString(),
    });
  }, []);

  const sendStudyReminder = useCallback(async (
    userId: string,
    subject: string
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "study_reminder", {
      subject,
    });
  }, []);

  const sendCollaborationInvite = useCallback(async (
    userId: string,
    collaboratorName: string,
    documentTitle: string
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "collaboration_invite", {
      collaborator_name: collaboratorName,
      document_title: documentTitle,
    });
  }, []);

  const sendAchievementUnlocked = useCallback(async (
    userId: string,
    achievementName: string
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "achievement_unlocked", {
      achievement_name: achievementName,
    });
  }, []);

  const sendNewMessage = useCallback(async (
    userId: string,
    senderName: string,
    chatTitle: string
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createFromTemplate(userId, "new_message", {
      sender_name: senderName,
      chat_title: chatTitle,
    });
  }, []);

  return {
    sendEssayGraded,
    sendFlashcardsDue,
    sendStudyReminder,
    sendCollaborationInvite,
    sendAchievementUnlocked,
    sendNewMessage,
  };
}

export default useNotifications;
