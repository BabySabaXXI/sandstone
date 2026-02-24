/**
 * useNotifications Hook
 * =====================
 * Real-time hook for notifications and broadcast messages.
 * Handles incoming notifications and system-wide broadcasts.
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { 
  getRealtimeClient, 
  CHANNELS, 
  EVENTS,
  type NotificationPayload 
} from "@/lib/supabase/realtime-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface Notification extends NotificationPayload {
  read: boolean;
  dismissed: boolean;
}

interface UseNotificationsOptions {
  userId?: string;
  enabled?: boolean;
  maxNotifications?: number;
  onNotification?: (notification: Notification) => void;
  onBroadcast?: (message: unknown) => void;
}

interface UseNotificationsReturn {
  isSubscribed: boolean;
  notifications: Notification[];
  unreadCount: number;
  sendNotification: (notification: Omit<NotificationPayload, "id" | "timestamp">) => void;
  sendBroadcast: (message: unknown) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  unsubscribe: () => void;
}

// Generate unique notification ID
const generateNotificationId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hook for real-time notifications and broadcasts
 */
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const {
    userId,
    enabled = true,
    maxNotifications = 50,
    onNotification,
    onBroadcast,
  } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null);

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;

  const handleNewNotification = useCallback((payload: NotificationPayload) => {
    const notification: Notification = {
      ...payload,
      read: false,
      dismissed: false,
    };

    setNotifications(prev => {
      // Check for duplicate
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;

      // Add new notification and limit total count
      const updated = [notification, ...prev];
      if (updated.length > maxNotifications) {
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    onNotification?.(notification);
  }, [maxNotifications, onNotification]);

  const sendNotification = useCallback((
    notification: Omit<NotificationPayload, "id" | "timestamp">
  ) => {
    if (!channelRef.current || !userId) return;

    const fullNotification: NotificationPayload = {
      ...notification,
      id: generateNotificationId(),
      timestamp: new Date().toISOString(),
    };

    channelRef.current.send({
      type: "broadcast",
      event: EVENTS.NEW_NOTIFICATION,
      payload: fullNotification,
    });
  }, [userId]);

  const sendBroadcast = useCallback((message: unknown) => {
    if (!broadcastChannelRef.current) return;

    broadcastChannelRef.current.send({
      type: "broadcast",
      event: EVENTS.BROADCAST_MESSAGE,
      payload: {
        message,
        senderId: userId,
        timestamp: new Date().toISOString(),
      },
    });
  }, [userId]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );

    // Broadcast read status
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: EVENTS.NOTIFICATION_READ,
        payload: {
          notificationId,
          userId,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }, [userId]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, dismissed: true } : n
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.unsubscribe();
      broadcastChannelRef.current = null;
    }
    
    setIsSubscribed(false);
  }, []);

  // Subscribe to user notifications channel
  useEffect(() => {
    if (!enabled || !userId) return;

    const client = getRealtimeClient();
    const channelName = CHANNELS.NOTIFICATIONS(userId);
    
    const channel = client.channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on("broadcast", { event: EVENTS.NEW_NOTIFICATION }, (payload) => {
        handleNewNotification(payload.payload as NotificationPayload);
      })
      .on("broadcast", { event: EVENTS.NOTIFICATION_READ }, (payload) => {
        // Handle notification read by another device/session
        const data = payload.payload as { notificationId: string; userId: string };
        if (data.userId === userId) {
          setNotifications(prev =>
            prev.map(n =>
              n.id === data.notificationId ? { ...n, read: true } : n
            )
          );
        }
      });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true);
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [userId, enabled, handleNewNotification]);

  // Subscribe to global broadcast channel
  useEffect(() => {
    if (!enabled) return;

    const client = getRealtimeClient();
    const broadcastChannelName = CHANNELS.BROADCAST_ALL;
    
    const broadcastChannel = client.channel(broadcastChannelName, {
      config: {
        broadcast: { self: false },
      },
    });

    broadcastChannel
      .on("broadcast", { event: EVENTS.BROADCAST_MESSAGE }, (payload) => {
        onBroadcast?.(payload.payload);
      });

    broadcastChannel.subscribe();
    broadcastChannelRef.current = broadcastChannel;

    return () => {
      broadcastChannel.unsubscribe();
    };
  }, [enabled, onBroadcast]);

  return {
    isSubscribed,
    notifications,
    unreadCount,
    sendNotification,
    sendBroadcast,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearNotifications,
    unsubscribe,
  };
}

export default useNotifications;
