/**
 * Notification Provider
 * =====================
 * Context provider for notifications with real-time updates,
 * toast notifications, and global notification state.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { getRealtimeClient, CHANNELS, EVENTS } from "@/lib/supabase/realtime-client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { NotificationService } from "./service";
import { PushNotificationService } from "./push-service";
import {
  type Notification,
  type CreateNotificationRequest,
  type SendNotificationResult,
  type NotificationPreferences,
} from "./types";

// ============================================
// CONTEXT TYPES
// ============================================

interface NotificationContextValue {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Toast notifications
  toasts: ToastNotification[];
  
  // Actions
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
  dismissToast: (id: string) => void;
  
  // Notification actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  createNotification: (request: CreateNotificationRequest) => Promise<SendNotificationResult>;
  
  // Push notifications
  pushPermission: NotificationPermission;
  isPushSubscribed: boolean;
  requestPushPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  
  // Preferences
  preferences: NotificationPreferences | null;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
}

interface ToastNotification {
  id: string;
  type: Notification["type"];
  priority: Notification["priority"];
  title: string;
  message: string;
  icon?: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  onDismiss?: () => void;
}

// ============================================
// CONTEXT
// ============================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ============================================
// PROVIDER PROPS
// ============================================

interface NotificationProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultToastDuration?: number;
  enablePushNotifications?: boolean;
}

// ============================================
// PROVIDER COMPONENT
// ============================================

export function NotificationProvider({
  children,
  maxToasts = 5,
  defaultToastDuration = 5000,
  enablePushNotifications = true,
}: NotificationProviderProps) {
  const user = useUser();
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Toast state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  
  // Push notification state
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  
  // Refs
  const notificationServiceRef = useRef<NotificationService | null>(null);
  const pushServiceRef = useRef<PushNotificationService | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const toastTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize services
  useEffect(() => {
    notificationServiceRef.current = new NotificationService();
    
    if (enablePushNotifications) {
      pushServiceRef.current = new PushNotificationService();
      setPushPermission(pushServiceRef.current.getPermissionStatus());
      pushServiceRef.current.isSubscribed().then(setIsPushSubscribed);
    }
  }, [enablePushNotifications]);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id || !notificationServiceRef.current) return;

    setIsLoading(true);
    try {
      const response = await notificationServiceRef.current.getNotifications(user.id, {
        limit: 50,
      });
      
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Fetch preferences
  useEffect(() => {
    if (!user?.id || !notificationServiceRef.current) return;

    const fetchPreferences = async () => {
      try {
        const prefs = await notificationServiceRef.current!.getPreferences(user.id);
        setPreferences(prefs);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.NOTIFICATIONS(user.id);

    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    // Handle new notifications
    channel.on("broadcast", { event: EVENTS.NEW_NOTIFICATION }, async (payload) => {
      const newNotification = payload.payload as Notification;
      
      // Add to notifications list
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotification.id)) {
          return prev;
        }
        return [newNotification, ...prev];
      });
      
      setUnreadCount((prev) => prev + 1);
      
      // Show toast notification
      addToast({
        type: newNotification.type,
        priority: newNotification.priority,
        title: newNotification.title,
        message: newNotification.message,
        icon: newNotification.icon,
        duration: newNotification.priority === "urgent" ? 0 : defaultToastDuration,
        actions: newNotification.actions?.map((action) => ({
          label: action.label,
          onClick: () => {
            // Handle action click
            console.log("Action clicked:", action);
          },
        })),
      });
      
      // Show push notification if enabled and permitted
      if (
        enablePushNotifications &&
        pushServiceRef.current &&
        pushPermission === "granted" &&
        isPushSubscribed
      ) {
        await pushServiceRef.current.showNotification(newNotification);
      }
    });

    // Handle notification read
    channel.on("broadcast", { event: EVENTS.NOTIFICATION_READ }, (payload) => {
      const { notificationId } = payload.payload as { notificationId: string };
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "read", read_at: new Date().toISOString() }
            : n
        )
      );
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, pushPermission, isPushSubscribed, enablePushNotifications, defaultToastDuration]);

  // ============================================
  // TOAST ACTIONS
  // ============================================

  const addToast = useCallback((toast: Omit<ToastNotification, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setToasts((prev) => {
      const newToasts = [{ ...toast, id }, ...prev];
      // Limit to max toasts
      if (newToasts.length > maxToasts) {
        const removedToast = newToasts.pop();
        if (removedToast) {
          removedToast.onDismiss?.();
        }
      }
      return newToasts;
    });

    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
      
      toastTimeoutsRef.current.set(id, timeout);
    }
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = toastTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutsRef.current.delete(id);
    }
    
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissToast = useCallback((id: string) => {
    const toast = toasts.find((t) => t.id === id);
    toast?.onDismiss?.();
    removeToast(id);
  }, [toasts, removeToast]);

  // ============================================
  // NOTIFICATION ACTIONS
  // ============================================

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id || !notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.markAsRead(user.id, [notificationId]);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, status: "read", read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id || !notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.markAllAsRead(user.id);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === "unread"
            ? { ...n, status: "read", read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, [user?.id]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    if (!notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.dismissNotification(notificationId);
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      const dismissedNotification = notifications.find((n) => n.id === notificationId);
      if (dismissedNotification?.status === "unread") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to dismiss notification:", error);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.deleteNotification(notificationId);
      
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      const deletedNotification = notifications.find((n) => n.id === notificationId);
      if (deletedNotification?.status === "unread") {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, [notifications]);

  const createNotification = useCallback(async (
    request: CreateNotificationRequest
  ): Promise<SendNotificationResult> => {
    if (!notificationServiceRef.current) {
      return { success: false, error: "Service not initialized", deliveredChannels: [] };
    }

    return notificationServiceRef.current.createNotification(request);
  }, []);

  // ============================================
  // PUSH NOTIFICATION ACTIONS
  // ============================================

  const requestPushPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!pushServiceRef.current) return "denied";

    try {
      const permission = await pushServiceRef.current.requestPermission();
      setPushPermission(permission);
      return permission;
    } catch (error) {
      console.error("Failed to request permission:", error);
      return "denied";
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!user?.id || !pushServiceRef.current) return;

    try {
      await pushServiceRef.current.subscribe(user.id);
      setIsPushSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  }, [user?.id]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!user?.id || !pushServiceRef.current) return;

    try {
      await pushServiceRef.current.unsubscribe(user.id);
      setIsPushSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    }
  }, [user?.id]);

  // ============================================
  // PREFERENCES ACTIONS
  // ============================================

  const updatePreferences = useCallback(async (
    updates: Partial<NotificationPreferences>
  ) => {
    if (!user?.id || !notificationServiceRef.current) return;

    try {
      await notificationServiceRef.current.updatePreferences(user.id, updates);
      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  }, [user?.id]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    isInitialized,
    toasts,
    addToast,
    removeToast,
    dismissToast,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    createNotification,
    pushPermission,
    isPushSubscribed,
    requestPushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    preferences,
    updatePreferences,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useNotificationContext(): NotificationContextValue {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  
  return context;
}

export default NotificationProvider;
