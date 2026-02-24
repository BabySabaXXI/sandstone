/**
 * Notification Utilities
 * ======================
 * Helper functions for the notification system.
 */

import {
  type Notification,
  type NotificationType,
  type NotificationPriority,
  type NotificationPreferences,
} from "./types";

// ============================================
// TIME FORMATTING
// ============================================

/**
 * Format notification timestamp for display
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Less than a minute
  if (diffSecs < 60) {
    return "Just now";
  }

  // Less than an hour
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  // Less than a day
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  // Less than a week
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Format as date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format notification time with full date
 */
export function formatNotificationTimeFull(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

// ============================================
// ICON MAPPING
// ============================================

/**
 * Get the appropriate icon name for a notification type
 */
export function getNotificationIcon(type: NotificationType): string {
  const iconMap: Record<NotificationType, string> = {
    info: "Info",
    success: "CheckCircle",
    warning: "AlertTriangle",
    error: "XCircle",
    system: "Settings",
    essay_graded: "FileText",
    flashcard_due: "Layers",
    study_reminder: "Clock",
    collaboration: "Users",
    achievement: "Award",
    message: "MessageSquare",
  };

  return iconMap[type] || "Bell";
}

// ============================================
// COLOR MAPPING
// ============================================

/**
 * Get the appropriate color for a notification type or priority
 */
export function getNotificationColor(
  type: NotificationType,
  priority: NotificationPriority
): string {
  // Priority overrides type for urgent notifications
  if (priority === "urgent") {
    return "red";
  }

  const colorMap: Record<NotificationType, string> = {
    info: "blue",
    success: "green",
    warning: "yellow",
    error: "red",
    system: "purple",
    essay_graded: "indigo",
    flashcard_due: "cyan",
    study_reminder: "orange",
    collaboration: "teal",
    achievement: "amber",
    message: "violet",
  };

  return colorMap[type] || "gray";
}

/**
 * Get Tailwind classes for notification background
 */
export function getNotificationBgClass(
  type: NotificationType,
  priority: NotificationPriority,
  isRead: boolean
): string {
  if (isRead) {
    return "bg-white dark:bg-gray-900";
  }

  const color = getNotificationColor(type, priority);
  
  const bgClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/10",
    green: "bg-green-50 dark:bg-green-900/10",
    yellow: "bg-yellow-50 dark:bg-yellow-900/10",
    red: "bg-red-50 dark:bg-red-900/10",
    purple: "bg-purple-50 dark:bg-purple-900/10",
    indigo: "bg-indigo-50 dark:bg-indigo-900/10",
    cyan: "bg-cyan-50 dark:bg-cyan-900/10",
    orange: "bg-orange-50 dark:bg-orange-900/10",
    teal: "bg-teal-50 dark:bg-teal-900/10",
    amber: "bg-amber-50 dark:bg-amber-900/10",
    violet: "bg-violet-50 dark:bg-violet-900/10",
    gray: "bg-gray-50 dark:bg-gray-800",
  };

  return bgClasses[color] || "bg-white dark:bg-gray-900";
}

/**
 * Get Tailwind classes for notification border/indicator
 */
export function getNotificationIndicatorClass(
  type: NotificationType,
  priority: NotificationPriority
): string {
  const color = getNotificationColor(type, priority);
  
  const indicatorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    cyan: "bg-cyan-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    gray: "bg-gray-500",
  };

  return indicatorClasses[color] || "bg-gray-500";
}

// ============================================
// NOTIFICATION GROUPING
// ============================================

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(notifications: Notification[]): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notificationDate.getTime() === today.getTime()) {
      grouped.today.push(notification);
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(notification);
    } else if (notificationDate.getTime() > weekAgo.getTime()) {
      grouped.thisWeek.push(notification);
    } else {
      grouped.older.push(notification);
    }
  });

  return grouped;
}

// ============================================
// NOTIFICATION ELIGIBILITY
// ============================================

/**
 * Check if a notification should be sent based on user preferences
 */
export function shouldNotify(
  preferences: NotificationPreferences | null,
  type: NotificationType,
  priority: NotificationPriority,
  channel: "in_app" | "push" | "email" | "sms"
): boolean {
  if (!preferences) {
    return true; // Default to allowing if no preferences
  }

  // Check global enabled
  if (!preferences.global_enabled) {
    return false;
  }

  // Check channel preference
  if (!preferences.channels[channel]) {
    return false;
  }

  // Check type-specific preference
  const typeConfig = preferences.type_preferences[type as keyof typeof preferences.type_preferences];
  if (typeConfig && !typeConfig.enabled) {
    return false;
  }

  // Check priority threshold
  if (typeConfig) {
    const priorityOrder = ["low", "normal", "high", "urgent"];
    const notificationPriorityIndex = priorityOrder.indexOf(priority);
    const thresholdIndex = priorityOrder.indexOf(typeConfig.priority_threshold);
    
    if (notificationPriorityIndex < thresholdIndex) {
      return false;
    }

    // Check if channel is allowed for this type
    if (!typeConfig.channels.includes(channel)) {
      return false;
    }
  }

  // Check do not disturb
  if (preferences.do_not_disturb && priority !== "urgent") {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    if (preferences.do_not_disturb_start && preferences.do_not_disturb_end) {
      const inQuietHours =
        preferences.do_not_disturb_start <= preferences.do_not_disturb_end
          ? currentTime >= preferences.do_not_disturb_start && currentTime <= preferences.do_not_disturb_end
          : currentTime >= preferences.do_not_disturb_start || currentTime <= preferences.do_not_disturb_end;
      
      if (inQuietHours) {
        return false;
      }
    }
  }

  // Check quiet hours
  if (preferences.quiet_hours?.enabled && priority !== "urgent") {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const { start_time, end_time, allow_urgent } = preferences.quiet_hours;
    
    const inQuietHours =
      start_time <= end_time
        ? currentTime >= start_time && currentTime <= end_time
        : currentTime >= start_time || currentTime <= end_time;
    
    if (inQuietHours && !allow_urgent) {
      return false;
    }
  }

  return true;
}

// ============================================
// NOTIFICATION FILTERS
// ============================================

/**
 * Filter notifications by type
 */
export function filterByType(
  notifications: Notification[],
  type: NotificationType
): Notification[] {
  return notifications.filter((n) => n.type === type);
}

/**
 * Filter notifications by status
 */
export function filterByStatus(
  notifications: Notification[],
  status: NotificationStatus
): Notification[] {
  return notifications.filter((n) => n.status === status);
}

/**
 * Filter notifications by priority
 */
export function filterByPriority(
  notifications: Notification[],
  priority: NotificationPriority
): Notification[] {
  return notifications.filter((n) => n.priority === priority);
}

/**
 * Search notifications by text
 */
export function searchNotifications(
  notifications: Notification[],
  query: string
): Notification[] {
  const lowerQuery = query.toLowerCase();
  return notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(lowerQuery) ||
      n.message.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// NOTIFICATION SORTING
// ============================================

/**
 * Sort notifications by date (newest first)
 */
export function sortByDateDesc(notifications: Notification[]): Notification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Sort notifications by priority (highest first)
 */
export function sortByPriorityDesc(notifications: Notification[]): Notification[] {
  const priorityOrder = ["urgent", "high", "normal", "low"];
  return [...notifications].sort(
    (a, b) =>
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
  );
}

/**
 * Sort notifications by status (unread first)
 */
export function sortByStatus(notifications: Notification[]): Notification[] {
  const statusOrder = ["unread", "read", "archived", "deleted"];
  return [...notifications].sort(
    (a, b) =>
      statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );
}

// ============================================
// TEXT UTILITIES
// ============================================

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Format notification title for display
 */
export function formatNotificationTitle(title: string): string {
  return truncateText(title, 100);
}

/**
 * Format notification message for display
 */
export function formatNotificationMessage(message: string): string {
  return truncateText(message, 200);
}

// ============================================
// BADGE UTILITIES
// ============================================

/**
 * Format badge count for display (e.g., 99+)
 */
export function formatBadgeCount(count: number): string {
  if (count > 99) {
    return "99+";
  }
  return count.toString();
}

/**
 * Get badge color based on count
 */
export function getBadgeColorClass(count: number): string {
  if (count === 0) {
    return "bg-gray-400";
  }
  if (count > 10) {
    return "bg-red-500";
  }
  if (count > 5) {
    return "bg-orange-500";
  }
  return "bg-blue-500";
}
