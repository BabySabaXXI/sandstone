/**
 * Notification System
 * ===================
 * Complete notification system for the Sandstone app.
 * 
 * @module notifications
 * 
 * @example
 * ```tsx
 * import { 
 *   useNotifications, 
 *   useNotificationPreferences,
 *   usePushNotifications,
 *   NotificationProvider 
 * } from "@/lib/notifications";
 * 
 * function MyComponent() {
 *   const { notifications, unreadCount, markAsRead } = useNotifications();
 *   
 *   return (
 *     <NotificationBell count={unreadCount} onClick={() => {}} />
 *   );
 * }
 * ```
 */

// ============================================
// TYPES
// ============================================

export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationData,
  NotificationAction,
  NotificationPreferences,
  ChannelPreferences,
  TypePreferences,
  TypeConfig,
  CategoryPreferences,
  QuietHoursConfig,
  NotificationHistory,
  PushSubscription,
  DeviceInfo,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  NotificationFilters,
  NotificationListResponse,
  SendNotificationResult,
  BulkNotificationResult,
  RealtimeNotificationEvent,
  NotificationToastProps,
  NotificationBellProps,
  NotificationListProps,
  NotificationPreferencesProps,
  NotificationServiceConfig,
} from "./types";

// ============================================
// SERVICES
// ============================================

export {
  NotificationService,
  getNotificationService,
  createNotification,
  getNotifications,
  markAsRead,
  getUnreadCount,
  getPreferences,
  updatePreferences,
  createFromTemplate,
} from "./service";

export {
  PushNotificationService,
  getPushNotificationService,
  isPushSupported,
  requestPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
} from "./push-service";

// ============================================
// HOOKS
// ============================================

export {
  useNotifications,
  useNotificationPreferences,
  usePushNotifications,
  useUnreadCount,
  useNotificationTemplates,
} from "./hooks";

// ============================================
// PROVIDER
// ============================================

export {
  NotificationProvider,
  useNotificationContext,
} from "./provider";

// ============================================
// UTILITIES
// ============================================

export {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  groupNotificationsByDate,
  shouldNotify,
} from "./utils";
