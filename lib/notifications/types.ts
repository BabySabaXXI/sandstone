/**
 * Notification System Types
 * =========================
 * Type definitions for the Sandstone notification system
 */

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'system'
  | 'essay_graded'
  | 'flashcard_due'
  | 'study_reminder'
  | 'collaboration'
  | 'achievement'
  | 'message';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted';

export type NotificationChannel = 
  | 'in_app' 
  | 'push' 
  | 'email' 
  | 'sms'
  | 'all';

// ============================================
// CORE NOTIFICATION INTERFACE
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  // Optional data payload
  data?: NotificationData;
  // Action buttons
  actions?: NotificationAction[];
  // Metadata
  icon?: string;
  image_url?: string;
  link?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
  read_at?: string | null;
  expires_at?: string | null;
  // Delivery tracking
  delivered_via: NotificationChannel[];
  // Grouping
  group_id?: string;
  group_count?: number;
}

// ============================================
// NOTIFICATION DATA PAYLOADS
// ============================================

export interface NotificationData {
  // Essay related
  essay_id?: string;
  essay_title?: string;
  score?: number;
  grade?: string;
  
  // Flashcard related
  deck_id?: string;
  deck_name?: string;
  cards_due_count?: number;
  
  // Study related
  study_session_id?: string;
  subject?: string;
  
  // Collaboration related
  document_id?: string;
  document_title?: string;
  collaborator_id?: string;
  collaborator_name?: string;
  
  // Achievement related
  achievement_id?: string;
  achievement_name?: string;
  badge_url?: string;
  
  // Message related
  sender_id?: string;
  sender_name?: string;
  chat_id?: string;
  
  // Generic
  entity_type?: string;
  entity_id?: string;
  url?: string;
  [key: string]: unknown;
}

// ============================================
// NOTIFICATION ACTION
// ============================================

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'open' | 'dismiss' | 'delete' | 'custom';
  url?: string;
  custom_data?: Record<string, unknown>;
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export interface NotificationPreferences {
  id: string;
  user_id: string;
  // Global settings
  global_enabled: boolean;
  do_not_disturb: boolean;
  do_not_disturb_start?: string | null; // HH:MM format
  do_not_disturb_end?: string | null;   // HH:MM format
  
  // Channel preferences
  channels: ChannelPreferences;
  
  // Type-specific preferences
  types: TypePreferences;
  
  // Category preferences
  categories: CategoryPreferences;
  
  // Quiet hours
  quiet_hours: QuietHoursConfig;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ChannelPreferences {
  in_app: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface TypePreferences {
  essay_graded: TypeConfig;
  flashcard_due: TypeConfig;
  study_reminder: TypeConfig;
  collaboration: TypeConfig;
  achievement: TypeConfig;
  message: TypeConfig;
  system: TypeConfig;
}

export interface TypeConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  priority_threshold: NotificationPriority;
}

export interface CategoryPreferences {
  study: boolean;
  social: boolean;
  system: boolean;
  marketing: boolean;
}

export interface QuietHoursConfig {
  enabled: boolean;
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  timezone: string;
  allow_urgent: boolean;
}

// ============================================
// NOTIFICATION HISTORY
// ============================================

export interface NotificationHistory {
  id: string;
  user_id: string;
  notification_id: string;
  action: 'created' | 'read' | 'dismissed' | 'clicked' | 'deleted' | 'action_taken';
  action_data?: Record<string, unknown>;
  created_at: string;
}

// ============================================
// PUSH NOTIFICATION SUBSCRIPTION
// ============================================

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  device_info?: DeviceInfo;
  is_active: boolean;
  created_at: string;
  last_used_at: string;
}

export interface DeviceInfo {
  device_id?: string;
  platform: 'web' | 'ios' | 'android';
  browser?: string;
  os?: string;
  user_agent?: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateNotificationRequest {
  user_id: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  data?: NotificationData;
  actions?: NotificationAction[];
  icon?: string;
  image_url?: string;
  link?: string;
  expires_at?: string;
  channels?: NotificationChannel[];
}

export interface UpdateNotificationRequest {
  status?: NotificationStatus;
  read_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  has_more: boolean;
  next_cursor?: string;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  cursor?: string;
}

// ============================================
// REALTIME NOTIFICATION EVENTS
// ============================================

export interface RealtimeNotificationEvent {
  type: 'new_notification' | 'notification_updated' | 'notification_deleted' | 'bulk_update';
  notification?: Notification;
  notifications?: Notification[];
  unread_count?: number;
  timestamp: string;
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
}

export interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notificationId: string, actionId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => void;
  isLoading?: boolean;
}

// ============================================
// NOTIFICATION SERVICE TYPES
// ============================================

export interface NotificationServiceConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  defaultExpirationHours: number;
}

export interface SendNotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  deliveredChannels: NotificationChannel[];
}

export interface BulkNotificationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
}
