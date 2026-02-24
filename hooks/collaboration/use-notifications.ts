/**
 * Use Notifications Hook
 * ======================
 * Hook for managing notifications with real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import { useCollaborationStore } from '@/lib/collaboration/store';
import { notificationApi } from '@/lib/collaboration/api';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';
import type { 
  Notification, 
  NotificationPreference, 
  NotificationType,
  NotificationPriority 
} from '@/lib/collaboration/types';

interface UseNotificationsOptions {
  autoLoad?: boolean;
  pollInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { autoLoad = true, pollInterval = 30000 } = options;
  const store = useCollaborationStore();
  const [channel, setChannel] = useState<ReturnType<typeof getRealtimeClient>['channel'] | null>(null);

  // Get notifications from store
  const notifications = store.notifications.items;
  const unreadCount = store.notifications.unreadCount;
  const isLoading = store.notifications.isLoading;
  const error = store.notifications.error;
  const preferences = store.notificationPreferences;

  // Load notifications
  const loadNotifications = useCallback(async (status?: 'unread' | 'read' | 'all') => {
    store.setNotificationsLoading(true);
    store.setNotificationsError(null);

    try {
      const { notifications: data, unreadCount } = await notificationApi.getNotifications({ status });
      store.setNotifications(data, unreadCount);
    } catch (err) {
      store.setNotificationsError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      store.setNotificationsLoading(false);
    }
  }, [store]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await notificationApi.getPreferences();
      store.setNotificationPreferences(prefs);
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    }
  }, [store]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      store.markNotificationAsRead(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      store.markAllNotificationsAsRead();
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Archive notification
  const archiveNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.archiveNotification(id);
      store.archiveNotification(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      store.removeNotification(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Update notification preference
  const updatePreference = useCallback(async (
    type: NotificationType, 
    updates: Partial<Omit<NotificationPreference, 'id' | 'user_id' | 'type' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const pref = await notificationApi.updatePreference(type, updates);
      store.updateNotificationPreference(type, pref);
      return pref;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Create a notification (for system use)
  const createNotification = useCallback(async (
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority;
      data?: Record<string, any>;
      actionUrl?: string;
      expiresAt?: string;
    }
  ) => {
    try {
      const notification = await notificationApi.createNotification(userId, type, title, message, options);
      return notification;
    } catch (err) {
      throw err;
    }
  }, []);

  // Get filtered notifications
  const getFilteredNotifications = useCallback((filter: 'all' | 'unread' = 'all') => {
    if (filter === 'unread') {
      return notifications.filter(n => n.status === 'unread');
    }
    return notifications;
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Setup real-time subscription
  useEffect(() => {
    const client = getRealtimeClient();
    const channelName = 'notifications:user';
    const newChannel = client.channel(channelName);

    newChannel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const notification = payload.new as Notification;
          store.addNotification(notification);
          
          // Show browser notification if enabled
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icon-192x192.png',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const notification = payload.new as Notification;
          // Update in store if exists
          const existing = notifications.find(n => n.id === notification.id);
          if (existing) {
            // The store will handle the update
            loadNotifications();
          }
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [loadNotifications, notifications, store]);

  // Auto-load notifications on mount
  useEffect(() => {
    if (autoLoad) {
      loadNotifications();
      loadPreferences();
    }
  }, [autoLoad, loadNotifications, loadPreferences]);

  // Poll for new notifications
  useEffect(() => {
    if (!pollInterval) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, loadNotifications]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    loadNotifications,
    loadPreferences,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updatePreference,
    createNotification,
    getFilteredNotifications,
    getNotificationsByType,
  };
}

export default useNotifications;
