/**
 * Sandstone Collaboration Types
 * ==============================
 * TypeScript type definitions for collaboration features
 */

// ============================================
// ENUM TYPES
// ============================================

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin';
export type ShareStatus = 'pending' | 'accepted' | 'declined' | 'revoked';
export type CommentStatus = 'active' | 'resolved' | 'deleted';
export type GroupRole = 'owner' | 'admin' | 'member' | 'viewer';
export type GroupStatus = 'active' | 'archived' | 'deleted';
export type NotificationType = 
  | 'share_invite' 
  | 'share_accepted' 
  | 'comment_added' 
  | 'comment_reply'
  | 'group_invite'
  | 'group_joined'
  | 'document_edited'
  | 'mention'
  | 'study_session_started'
  | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type ContentType = 'essay' | 'document' | 'flashcard_deck' | 'quiz' | 'folder';

// ============================================
// SHARE TYPES
// ============================================

export interface Share {
  id: string;
  content_type: ContentType;
  content_id: string;
  owner_id: string;
  shared_with_id: string | null;
  shared_with_email: string | null;
  permission: SharePermission;
  status: ShareStatus;
  message: string | null;
  expires_at: string | null;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShareWithDetails extends Share {
  owner: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  shared_with: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  content_title: string;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string;
  content_type: ContentType;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  text: string;
  html_content: string | null;
  status: CommentStatus;
  resolved_at: string | null;
  resolved_by: string | null;
  selection_start: number | null;
  selection_end: number | null;
  selection_text: string | null;
  reactions: CommentReaction[];
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  replies?: CommentWithUser[];
}

export interface CommentReaction {
  user_id: string;
  emoji: string;
  created_at: string;
}

// ============================================
// STUDY GROUP TYPES
// ============================================

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  icon: string | null;
  color: string | null;
  owner_id: string;
  max_members: number;
  is_public: boolean;
  join_code: string | null;
  status: GroupStatus;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
  last_active_at: string | null;
}

export interface StudyGroupMemberWithUser extends StudyGroupMember {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface StudyGroupWithMembers extends StudyGroup {
  members: StudyGroupMemberWithUser[];
  owner: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export interface GroupSharedContent {
  id: string;
  group_id: string;
  content_type: ContentType;
  content_id: string;
  shared_by: string;
  message: string | null;
  created_at: string;
}

// ============================================
// COLLABORATIVE EDITING TYPES
// ============================================

export interface DocumentCollaborator {
  document_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  avatar_url: string | null;
  cursor_position: CursorPosition | null;
  selection: TextSelection | null;
  is_active: boolean;
  joined_at: string;
  last_activity_at: string;
}

export interface CursorPosition {
  block_id: string;
  offset: number;
}

export interface TextSelection {
  block_id: string;
  start_offset: number;
  end_offset: number;
}

export interface DocumentEdit {
  id: string;
  document_id: string;
  user_id: string;
  operation: EditOperation;
  version: number;
  timestamp: string;
  is_applied: boolean;
}

export type EditOperation =
  | { type: 'insert'; block_id: string; content: any; position: number }
  | { type: 'delete'; block_id: string }
  | { type: 'update'; block_id: string; content: any }
  | { type: 'move'; block_id: string; new_position: number };

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  created_by: string;
  content: any[];
  change_summary: string | null;
  created_at: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  data: NotificationData;
  action_url: string | null;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface NotificationData {
  share_id?: string;
  comment_id?: string;
  group_id?: string;
  document_id?: string;
  user_id?: string;
  user_name?: string;
  content_type?: ContentType;
  content_title?: string;
  [key: string]: any;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  content_type: ContentType | null;
  content_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLogWithUser extends ActivityLog {
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

// ============================================
// REALTIME EVENT TYPES
// ============================================

export interface ShareEventPayload {
  type: 'share_created' | 'share_accepted' | 'share_declined' | 'share_revoked';
  share_id: string;
  content_type: ContentType;
  content_id: string;
  user_id: string;
  recipient_id: string;
  timestamp: string;
}

export interface CommentEventPayload {
  type: 'comment_added' | 'comment_updated' | 'comment_deleted' | 'comment_resolved';
  comment_id: string;
  content_type: ContentType;
  content_id: string;
  user_id: string;
  parent_id: string | null;
  timestamp: string;
}

export interface GroupEventPayload {
  type: 'member_joined' | 'member_left' | 'member_role_changed' | 'content_shared';
  group_id: string;
  user_id: string;
  target_user_id: string | null;
  timestamp: string;
}

export interface CollaborationEventPayload {
  type: 'user_joined' | 'user_left' | 'cursor_moved' | 'selection_changed' | 'content_edited';
  document_id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  cursor?: CursorPosition;
  selection?: TextSelection;
  edit?: EditOperation;
  timestamp: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateShareRequest {
  content_type: ContentType;
  content_id: string;
  shared_with_email: string;
  permission: SharePermission;
  message?: string;
  expires_in_days?: number;
}

export interface CreateCommentRequest {
  content_type: ContentType;
  content_id: string;
  text: string;
  parent_id?: string;
  selection_start?: number;
  selection_end?: number;
  selection_text?: string;
}

export interface CreateStudyGroupRequest {
  name: string;
  description?: string;
  subject?: string;
  icon?: string;
  color?: string;
  max_members?: number;
  is_public?: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  type: NotificationType;
  email_enabled?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseCollaborationReturn {
  collaborators: DocumentCollaborator[];
  isConnected: boolean;
  sendCursorPosition: (position: CursorPosition) => void;
  sendSelection: (selection: TextSelection) => void;
  sendEdit: (operation: EditOperation) => void;
}

export interface UseCommentsReturn {
  comments: CommentWithUser[];
  isLoading: boolean;
  error: Error | null;
  addComment: (data: CreateCommentRequest) => Promise<Comment>;
  updateComment: (id: string, text: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  resolveComment: (id: string) => Promise<void>;
  addReaction: (commentId: string, emoji: string) => Promise<void>;
  removeReaction: (commentId: string, emoji: string) => Promise<void>;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  preferences: NotificationPreference[];
  updatePreferences: (data: UpdateNotificationPreferencesRequest) => Promise<void>;
}
