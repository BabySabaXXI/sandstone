/**
 * Notification Service
 * ====================
 * Core service for managing notifications in the Sandstone app.
 * Handles creation, retrieval, updates, and deletion of notifications.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  type Notification,
  type NotificationType,
  type NotificationPriority,
  type NotificationStatus,
  type NotificationChannel,
  type NotificationPreferences,
  type CreateNotificationRequest,
  type UpdateNotificationRequest,
  type NotificationFilters,
  type NotificationListResponse,
  type SendNotificationResult,
  type BulkNotificationResult,
  type NotificationData,
  type NotificationAction,
} from "./types";

// ============================================
// SERVICE CONFIGURATION
// ============================================

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  batchSize: 100,
  defaultExpirationHours: 30 * 24, // 30 days
};

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

export class NotificationService {
  private supabase: SupabaseClient<Database>;
  private config: typeof DEFAULT_CONFIG;

  constructor(supabaseClient?: SupabaseClient<Database>, config?: Partial<typeof DEFAULT_CONFIG>) {
    this.supabase = supabaseClient || this.createClient();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private createClient(): SupabaseClient<Database> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Supabase environment variables are not configured");
    }

    return createBrowserClient<Database>(url, key);
  }

  // ============================================
  // NOTIFICATION CRUD OPERATIONS
  // ============================================

  /**
   * Create a new notification
   */
  async createNotification(request: CreateNotificationRequest): Promise<SendNotificationResult> {
    try {
      const expiresAt = request.expires_at || this.getDefaultExpiration();
      
      const { data, error } = await this.supabase
        .rpc("create_notification", {
          p_user_id: request.user_id,
          p_type: request.type,
          p_title: request.title,
          p_message: request.message,
          p_priority: request.priority || "normal",
          p_data: request.data || {},
          p_actions: request.actions || [],
          p_icon: request.icon,
          p_image_url: request.image_url,
          p_link: request.link,
          p_expires_at: expiresAt,
          p_delivered_via: request.channels || ["in_app"],
        });

      if (error) throw error;

      return {
        success: true,
        notificationId: data,
        deliveredChannels: request.channels || ["in_app"],
      };
    } catch (error) {
      console.error("Failed to create notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        deliveredChannels: [],
      };
    }
  }

  /**
   * Get notifications for a user with filtering and pagination
   */
  async getNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<NotificationListResponse> {
    try {
      let query = this.supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      } else {
        // Exclude deleted by default
        query = query.neq("status", "deleted");
      }

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const limit = filters.limit || 20;
      query = query.limit(limit);

      if (filters.cursor) {
        query = query.lt("created_at", filters.cursor);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Get unread count
      const { count: unreadCount } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "unread");

      const notifications = data as Notification[];
      const hasMore = notifications.length === limit;
      const nextCursor = hasMore ? notifications[notifications.length - 1]?.created_at : undefined;

      return {
        notifications,
        total: count || 0,
        unread_count: unreadCount || 0,
        has_more: hasMore,
        next_cursor: nextCursor,
      };
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return {
        notifications: [],
        total: 0,
        unread_count: 0,
        has_more: false,
      };
    }
  }

  /**
   * Get a single notification by ID
   */
  async getNotification(notificationId: string): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error) throw error;

      return data as Notification;
    } catch (error) {
      console.error("Failed to get notification:", error);
      return null;
    }
  }

  /**
   * Update a notification
   */
  async updateNotification(
    notificationId: string,
    updates: UpdateNotificationRequest
  ): Promise<boolean> {
    try {
      const updateData: Partial<Notification> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) {
        updateData.status = updates.status;
        if (updates.status === "read" && !updates.read_at) {
          updateData.read_at = new Date().toISOString();
        }
      }

      if (updates.read_at) {
        updateData.read_at = updates.read_at;
      }

      const { error } = await this.supabase
        .from("notifications")
        .update(updateData)
        .eq("id", notificationId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Failed to update notification:", error);
      return false;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, notificationIds?: string[]): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc("mark_notifications_as_read", {
          p_user_id: userId,
          p_notification_ids: notificationIds || null,
        });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      return 0;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    return this.markAsRead(userId);
  }

  /**
   * Dismiss a notification (soft delete)
   */
  async dismissNotification(notificationId: string): Promise<boolean> {
    return this.updateNotification(notificationId, { status: "archived" });
  }

  /**
   * Delete a notification (hard delete)
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return false;
    }
  }

  /**
   * Archive old notifications
   */
  async archiveOldNotifications(userId: string, daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await this.supabase
        .from("notifications")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("status", "read")
        .lt("created_at", cutoffDate.toISOString())
        .select();

      if (error) throw error;

      return data?.length || 0;
    } catch (error) {
      console.error("Failed to archive old notifications:", error);
      return 0;
    }
  }

  // ============================================
  // UNREAD COUNT
  // ============================================

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc("get_unread_notification_count", {
          p_user_id: userId,
        });

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  }

  // ============================================
  // NOTIFICATION PREFERENCES
  // ============================================

  /**
   * Get notification preferences for a user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No preferences found, create defaults
          return this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return data as NotificationPreferences;
    } catch (error) {
      console.error("Failed to get preferences:", error);
      return null;
    }
  }

  /**
   * Create default preferences for a user
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .insert({
          user_id: userId,
          global_enabled: true,
          do_not_disturb: false,
          channels: {
            in_app: true,
            push: true,
            email: true,
            sms: false,
          },
          type_preferences: {
            essay_graded: { enabled: true, channels: ["in_app", "push"], priority_threshold: "normal" },
            flashcard_due: { enabled: true, channels: ["in_app"], priority_threshold: "normal" },
            study_reminder: { enabled: true, channels: ["push", "email"], priority_threshold: "normal" },
            collaboration: { enabled: true, channels: ["in_app", "push"], priority_threshold: "normal" },
            achievement: { enabled: true, channels: ["in_app", "push"], priority_threshold: "low" },
            message: { enabled: true, channels: ["in_app", "push"], priority_threshold: "normal" },
            system: { enabled: true, channels: ["in_app"], priority_threshold: "high" },
          },
          category_preferences: {
            study: true,
            social: true,
            system: true,
            marketing: false,
          },
          quiet_hours: {
            enabled: false,
            start_time: "22:00",
            end_time: "08:00",
            timezone: "UTC",
            allow_urgent: true,
          },
        })
        .select()
        .single();

      if (error) throw error;

      return data as NotificationPreferences;
    } catch (error) {
      console.error("Failed to create default preferences:", error);
      return null;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notification_preferences")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Failed to update preferences:", error);
      return false;
    }
  }

  /**
   * Check if user should receive notification based on preferences
   */
  async shouldSendNotification(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    channel: NotificationChannel
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc("should_send_notification", {
          p_user_id: userId,
          p_type: type,
          p_priority: priority,
          p_channel: channel,
        });

      if (error) throw error;

      return data || false;
    } catch (error) {
      console.error("Failed to check notification eligibility:", error);
      return true; // Default to allowing notification on error
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Send notification to multiple users
   */
  async sendBulkNotification(
    userIds: string[],
    request: Omit<CreateNotificationRequest, "user_id">
  ): Promise<BulkNotificationResult> {
    const results: BulkNotificationResult = {
      total: userIds.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process in batches
    for (let i = 0; i < userIds.length; i += this.config.batchSize) {
      const batch = userIds.slice(i, i + this.config.batchSize);
      
      const promises = batch.map(async (userId) => {
        const result = await this.createNotification({
          ...request,
          user_id: userId,
        });
        
        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push({ userId, error: result.error || "Unknown error" });
        }
      });

      await Promise.all(promises);
    }

    return results;
  }

  // ============================================
  // NOTIFICATION HISTORY
  // ============================================

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<Array<{ id: string; action: string; created_at: string; notification?: Notification }>> {
    try {
      const { data, error } = await this.supabase
        .from("notification_history")
        .select(`
          id,
          action,
          created_at,
          notification:notifications(id, title, type, status)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Failed to get notification history:", error);
      return [];
    }
  }

  // ============================================
  // TEMPLATE OPERATIONS
  // ============================================

  /**
   * Get a notification template by name
   */
  async getTemplate(templateName: string): Promise<{
    name: string;
    type: NotificationType;
    title_template: string;
    message_template: string;
    default_priority: NotificationPriority;
    default_channels: NotificationChannel[];
    default_icon?: string;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from("notification_templates")
        .select("*")
        .eq("name", templateName)
        .eq("is_active", true)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Failed to get template:", error);
      return null;
    }
  }

  /**
   * Create notification from template
   */
  async createFromTemplate(
    userId: string,
    templateName: string,
    variables: Record<string, string>,
    extraData?: Partial<CreateNotificationRequest>
  ): Promise<SendNotificationResult> {
    const template = await this.getTemplate(templateName);
    
    if (!template) {
      return {
        success: false,
        error: `Template '${templateName}' not found`,
        deliveredChannels: [],
      };
    }

    // Replace template variables
    let title = template.title_template;
    let message = template.message_template;

    for (const [key, value] of Object.entries(variables)) {
      title = title.replace(new RegExp(`{${key}}`, "g"), value);
      message = message.replace(new RegExp(`{${key}}`, "g"), value);
    }

    return this.createNotification({
      user_id: userId,
      type: template.type,
      priority: template.default_priority,
      title,
      message,
      icon: template.default_icon,
      channels: template.default_channels,
      ...extraData,
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private getDefaultExpiration(): string {
    const date = new Date();
    date.setHours(date.getHours() + this.config.defaultExpirationHours);
    return date.toISOString();
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .rpc("cleanup_expired_notifications");

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error("Failed to cleanup expired notifications:", error);
      return 0;
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(
  supabaseClient?: SupabaseClient<Database>
): NotificationService {
  if (!notificationServiceInstance || supabaseClient) {
    notificationServiceInstance = new NotificationService(supabaseClient);
  }
  return notificationServiceInstance;
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function createNotification(
  request: CreateNotificationRequest
): Promise<SendNotificationResult> {
  const service = getNotificationService();
  return service.createNotification(request);
}

export async function getNotifications(
  userId: string,
  filters?: NotificationFilters
): Promise<NotificationListResponse> {
  const service = getNotificationService();
  return service.getNotifications(userId, filters);
}

export async function markAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<number> {
  const service = getNotificationService();
  return service.markAsRead(userId, notificationIds);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const service = getNotificationService();
  return service.getUnreadCount(userId);
}

export async function getPreferences(userId: string): Promise<NotificationPreferences | null> {
  const service = getNotificationService();
  return service.getPreferences(userId);
}

export async function updatePreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<boolean> {
  const service = getNotificationService();
  return service.updatePreferences(userId, updates);
}

export async function createFromTemplate(
  userId: string,
  templateName: string,
  variables: Record<string, string>,
  extraData?: Partial<CreateNotificationRequest>
): Promise<SendNotificationResult> {
  const service = getNotificationService();
  return service.createFromTemplate(userId, templateName, variables, extraData);
}

export default NotificationService;
