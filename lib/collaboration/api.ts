/**
 * Sandstone Collaboration API
 * ===========================
 * API functions for collaboration features
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Share,
  ShareWithDetails,
  Comment,
  CommentWithUser,
  StudyGroup,
  StudyGroupWithMembers,
  StudyGroupMember,
  Notification,
  NotificationPreference,
  ActivityLog,
  ContentType,
  SharePermission,
  ShareStatus,
  GroupRole,
  CommentStatus,
  NotificationType,
  NotificationPriority,
  CreateShareRequest,
  CreateCommentRequest,
  CreateStudyGroupRequest,
  UpdateNotificationPreferencesRequest,
  CursorPosition,
  TextSelection,
  EditOperation,
} from './types';

const supabase = createClient();

// ============================================
// SHARE API
// ============================================

export const shareApi = {
  /**
   * Get shares for the current user
   */
  async getShares(): Promise<{ sent: ShareWithDetails[]; received: ShareWithDetails[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get sent shares
    const { data: sent, error: sentError } = await supabase
      .from('shares_with_details')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (sentError) throw sentError;

    // Get received shares
    const { data: received, error: receivedError } = await supabase
      .from('shares_with_details')
      .select('*')
      .or(`shared_with_id.eq.${user.id},shared_with_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (receivedError) throw receivedError;

    return { sent: sent || [], received: received || [] };
  },

  /**
   * Create a new share
   */
  async createShare(request: CreateShareRequest): Promise<Share> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find user by email if shared_with_id not provided
    let sharedWithId: string | null = null;
    if (request.shared_with_email) {
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', request.shared_with_email)
        .single();
      
      if (userData) {
        sharedWithId = userData.id;
      }
    }

    const { data, error } = await supabase
      .from('shares')
      .insert({
        content_type: request.content_type,
        content_id: request.content_id,
        owner_id: user.id,
        shared_with_id: sharedWithId,
        shared_with_email: request.shared_with_email,
        permission: request.permission,
        message: request.message,
        expires_at: request.expires_in_days 
          ? new Date(Date.now() + request.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
          : null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a share
   */
  async updateShare(id: string, updates: Partial<Share>): Promise<Share> {
    const { data, error } = await supabase
      .from('shares')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Accept a share invitation
   */
  async acceptShare(id: string): Promise<Share> {
    return this.updateShare(id, { status: 'accepted' });
  },

  /**
   * Decline a share invitation
   */
  async declineShare(id: string): Promise<Share> {
    return this.updateShare(id, { status: 'declined' });
  },

  /**
   * Revoke a share
   */
  async revokeShare(id: string): Promise<Share> {
    return this.updateShare(id, { status: 'revoked' });
  },

  /**
   * Delete a share
   */
  async deleteShare(id: string): Promise<void> {
    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Record share access
   */
  async recordAccess(id: string): Promise<void> {
    const { error } = await supabase
      .from('shares')
      .update({
        access_count: supabase.rpc('increment_access_count'),
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Check if user has access to content
   */
  async checkAccess(contentType: ContentType, contentId: string): Promise<{ hasAccess: boolean; permission: SharePermission | null }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { hasAccess: false, permission: null };

    // Check if user is the owner
    const { data: content } = await supabase
      .from(contentType === 'essay' ? 'essays' : contentType === 'document' ? 'documents' : 'quizzes')
      .select('user_id')
      .eq('id', contentId)
      .single();

    if (content?.user_id === user.id) {
      return { hasAccess: true, permission: 'admin' };
    }

    // Check shares
    const { data: share } = await supabase
      .from('shares')
      .select('permission')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .or(`shared_with_id.eq.${user.id},shared_with_email.eq.${user.email}`)
      .eq('status', 'accepted')
      .single();

    if (share) {
      return { hasAccess: true, permission: share.permission };
    }

    return { hasAccess: false, permission: null };
  },
};

// ============================================
// COMMENT API
// ============================================

export const commentApi = {
  /**
   * Get comments for content
   */
  async getComments(
    contentType: ContentType,
    contentId: string,
    options?: { status?: CommentStatus; parentId?: string | null; page?: number; limit?: number }
  ): Promise<{ comments: CommentWithUser[]; totalCount: number }> {
    let query = supabase
      .from('comments_with_users')
      .select('*', { count: 'exact' })
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.parentId !== undefined) {
      if (options.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', options.parentId);
      }
    }

    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Build comment tree
    const comments = (data || []) as CommentWithUser[];
    const rootComments = comments.filter(c => !c.parent_id);
    
    rootComments.forEach(root => {
      root.replies = comments.filter(c => c.parent_id === root.id);
    });

    return { comments: rootComments, totalCount: count || 0 };
  },

  /**
   * Create a comment
   */
  async createComment(request: CreateCommentRequest): Promise<Comment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content_type: request.content_type,
        content_id: request.content_id,
        user_id: user.id,
        parent_id: request.parent_id || null,
        text: request.text,
        html_content: request.text, // Could use a markdown/html converter
        selection_start: request.selection_start,
        selection_end: request.selection_end,
        selection_text: request.selection_text,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a comment
   */
  async updateComment(id: string, text: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({
        text,
        html_content: text,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a comment (soft delete)
   */
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Resolve a comment
   */
  async resolveComment(id: string): Promise<Comment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add reaction to comment
   */
  async addReaction(commentId: string, emoji: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: comment } = await supabase
      .from('comments')
      .select('reactions')
      .eq('id', commentId)
      .single();

    const reactions = comment?.reactions || [];
    const existingIndex = reactions.findIndex((r: any) => r.user_id === user.id && r.emoji === emoji);

    if (existingIndex === -1) {
      reactions.push({
        user_id: user.id,
        emoji,
        created_at: new Date().toISOString(),
      });

      const { error } = await supabase
        .from('comments')
        .update({ reactions })
        .eq('id', commentId);

      if (error) throw error;
    }
  },

  /**
   * Remove reaction from comment
   */
  async removeReaction(commentId: string, emoji: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: comment } = await supabase
      .from('comments')
      .select('reactions')
      .eq('id', commentId)
      .single();

    const reactions = (comment?.reactions || []).filter(
      (r: any) => !(r.user_id === user.id && r.emoji === emoji)
    );

    const { error } = await supabase
      .from('comments')
      .update({ reactions })
      .eq('id', commentId);

    if (error) throw error;
  },
};

// ============================================
// STUDY GROUP API
// ============================================

export const studyGroupApi = {
  /**
   * Get all study groups for the current user
   */
  async getStudyGroups(): Promise<StudyGroupWithMembers[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('study_groups_with_stats')
      .select('*')
      .or(`owner_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single study group by ID
   */
  async getStudyGroup(id: string): Promise<StudyGroupWithMembers> {
    const { data, error } = await supabase
      .from('study_groups_with_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new study group
   */
  async createStudyGroup(request: CreateStudyGroupRequest): Promise<StudyGroupWithMembers> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: group, error } = await supabase
      .from('study_groups')
      .insert({
        name: request.name,
        description: request.description,
        subject: request.subject,
        icon: request.icon,
        color: request.color,
        owner_id: user.id,
        max_members: request.max_members || 50,
        is_public: request.is_public ?? false,
      })
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await supabase
      .from('study_group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'owner',
      });

    return this.getStudyGroup(group.id);
  },

  /**
   * Update a study group
   */
  async updateStudyGroup(id: string, updates: Partial<StudyGroup>): Promise<StudyGroup> {
    const { data, error } = await supabase
      .from('study_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a study group
   */
  async deleteStudyGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('study_groups')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Join a study group
   */
  async joinGroup(groupId: string, joinCode?: string): Promise<StudyGroupMember> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify join code if group is not public
    if (joinCode) {
      const { data: group } = await supabase
        .from('study_groups')
        .select('join_code, is_public')
        .eq('id', groupId)
        .single();

      if (!group?.is_public && group?.join_code !== joinCode) {
        throw new Error('Invalid join code');
      }
    }

    const { data, error } = await supabase
      .from('study_group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Leave a study group
   */
  async leaveGroup(groupId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Update member role
   */
  async updateMemberRole(groupId: string, userId: string, role: GroupRole): Promise<StudyGroupMember> {
    const { data, error } = await supabase
      .from('study_group_members')
      .update({ role })
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Share content with group
   */
  async shareContent(
    groupId: string,
    contentType: ContentType,
    contentId: string,
    message?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('group_shared_content')
      .insert({
        group_id: groupId,
        content_type: contentType,
        content_id: contentId,
        shared_by: user.id,
        message,
      });

    if (error) throw error;
  },

  /**
   * Get shared content for group
   */
  async getSharedContent(groupId: string) {
    const { data, error } = await supabase
      .from('group_shared_content')
      .select(`
        *,
        shared_by:profiles(id, full_name, email, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Generate new join code
   */
  async regenerateJoinCode(groupId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('generate_join_code');

    if (error) throw error;

    await supabase
      .from('study_groups')
      .update({ join_code: data })
      .eq('id', groupId);

    return data;
  },
};

// ============================================
// NOTIFICATION API
// ============================================

export const notificationApi = {
  /**
   * Get notifications for the current user
   */
  async getNotifications(options?: { status?: 'unread' | 'read' | 'all'; limit?: number }): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get unread count
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'unread');

    return { notifications: data || [], unreadCount: count || 0 };
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase.rpc('mark_all_notifications_read', {
      user_uuid: user.id,
    });
  },

  /**
   * Archive a notification
   */
  async archiveNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreference[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data || [];
  },

  /**
   * Update notification preference
   */
  async updatePreference(type: NotificationType, updates: Partial<Omit<NotificationPreference, 'id' | 'user_id' | 'type' | 'created_at' | 'updated_at'>>): Promise<NotificationPreference> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        type,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a notification (for system use)
   */
  async createNotification(
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
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        priority: options?.priority || 'normal',
        data: options?.data || {},
        action_url: options?.actionUrl,
        expires_at: options?.expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// COLLABORATIVE EDITING API
// ============================================

export const collaborativeEditingApi = {
  /**
   * Get document collaborators
   */
  async getCollaborators(documentId: string) {
    const { data, error } = await supabase
      .from('document_collaborators')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_active', true)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Join document collaboration
   */
  async joinDocument(documentId: string, userColor: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('document_collaborators')
      .upsert({
        document_id: documentId,
        user_id: user.id,
        user_name: profile?.full_name || user.email?.split('@')[0] || 'Anonymous',
        user_color: userColor,
        avatar_url: profile?.avatar_url,
        is_active: true,
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Leave document collaboration
   */
  async leaveDocument(documentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('document_collaborators')
      .update({ is_active: false })
      .eq('document_id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Update cursor position
   */
  async updateCursorPosition(documentId: string, position: CursorPosition): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('document_collaborators')
      .update({
        cursor_position: position,
        last_activity_at: new Date().toISOString(),
      })
      .eq('document_id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Update selection
   */
  async updateSelection(documentId: string, selection: TextSelection | null): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('document_collaborators')
      .update({
        selection,
        last_activity_at: new Date().toISOString(),
      })
      .eq('document_id', documentId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  /**
   * Save document version
   */
  async saveVersion(documentId: string, content: any[], changeSummary?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get next version number
    const { data: lastVersion } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = (lastVersion?.version_number || 0) + 1;

    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: versionNumber,
        created_by: user.id,
        content,
        change_summary: changeSummary,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get document versions
   */
  async getVersions(documentId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        created_by:profiles(id, full_name, email, avatar_url)
      `)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get specific version
   */
  async getVersion(documentId: string, versionNumber: number) {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .eq('version_number', versionNumber)
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================
// ACTIVITY LOG API
// ============================================

export const activityLogApi = {
  /**
   * Get activity logs for the current user
   */
  async getLogs(options?: { limit?: number; offset?: number }): Promise<{ logs: ActivityLog[]; hasMore: boolean }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit);

    if (error) throw error;

    // Check if there are more logs
    const { count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const hasMore = (count || 0) > offset + limit;

    return { logs: data || [], hasMore };
  },

  /**
   * Log an activity
   */
  async logActivity(
    action: string,
    contentType?: ContentType,
    contentId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    await supabase.rpc('log_activity', {
      p_user_id: user.id,
      p_action: action,
      p_content_type: contentType,
      p_content_id: contentId,
      p_metadata: metadata || {},
    });
  },
};

// ============================================
// EXPORT ALL APIs
// ============================================

export const collaborationApi = {
  shares: shareApi,
  comments: commentApi,
  studyGroups: studyGroupApi,
  notifications: notificationApi,
  collaborativeEditing: collaborativeEditingApi,
  activityLogs: activityLogApi,
};

export default collaborationApi;
