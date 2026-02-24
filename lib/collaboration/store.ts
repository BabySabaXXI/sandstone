/**
 * Sandstone Collaboration Store
 * =============================
 * Zustand store for managing collaboration state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
  GroupRole,
  CreateShareRequest,
  CreateCommentRequest,
  CreateStudyGroupRequest,
} from './types';

// ============================================
// STORE STATE
// ============================================

interface CollaborationState {
  // Shares
  shares: {
    sent: ShareWithDetails[];
    received: ShareWithDetails[];
    isLoading: boolean;
    error: string | null;
  };
  
  // Comments
  comments: {
    items: CommentWithUser[];
    isLoading: boolean;
    error: string | null;
    totalCount: number;
  };
  
  // Study Groups
  studyGroups: {
    items: StudyGroupWithMembers[];
    currentGroup: StudyGroupWithMembers | null;
    isLoading: boolean;
    error: string | null;
  };
  
  // Notifications
  notifications: {
    items: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
  };
  
  // Notification Preferences
  notificationPreferences: NotificationPreference[];
  
  // Activity Logs
  activityLogs: {
    items: ActivityLog[];
    isLoading: boolean;
    hasMore: boolean;
  };
  
  // UI State
  ui: {
    selectedShareId: string | null;
    selectedGroupId: string | null;
    commentFilter: 'all' | 'resolved' | 'unresolved';
    notificationFilter: 'all' | 'unread';
  };
}

// ============================================
// STORE ACTIONS
// ============================================

interface CollaborationActions {
  // Share Actions
  setShares: (shares: { sent: ShareWithDetails[]; received: ShareWithDetails[] }) => void;
  addShare: (share: ShareWithDetails) => void;
  updateShare: (id: string, updates: Partial<Share>) => void;
  removeShare: (id: string) => void;
  setSharesLoading: (isLoading: boolean) => void;
  setSharesError: (error: string | null) => void;
  
  // Comment Actions
  setComments: (comments: CommentWithUser[], totalCount: number) => void;
  addComment: (comment: CommentWithUser) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  removeComment: (id: string) => void;
  setCommentsLoading: (isLoading: boolean) => void;
  setCommentsError: (error: string | null) => void;
  addReply: (parentId: string, reply: CommentWithUser) => void;
  
  // Study Group Actions
  setStudyGroups: (groups: StudyGroupWithMembers[]) => void;
  setCurrentGroup: (group: StudyGroupWithMembers | null) => void;
  addStudyGroup: (group: StudyGroupWithMembers) => void;
  updateStudyGroup: (id: string, updates: Partial<StudyGroup>) => void;
  removeStudyGroup: (id: string) => void;
  addGroupMember: (groupId: string, member: StudyGroupMember) => void;
  removeGroupMember: (groupId: string, userId: string) => void;
  updateGroupMemberRole: (groupId: string, userId: string, role: GroupRole) => void;
  setStudyGroupsLoading: (isLoading: boolean) => void;
  setStudyGroupsError: (error: string | null) => void;
  
  // Notification Actions
  setNotifications: (notifications: Notification[], unreadCount: number) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  archiveNotification: (id: string) => void;
  removeNotification: (id: string) => void;
  setNotificationsLoading: (isLoading: boolean) => void;
  setNotificationsError: (error: string | null) => void;
  setUnreadCount: (count: number) => void;
  
  // Notification Preference Actions
  setNotificationPreferences: (preferences: NotificationPreference[]) => void;
  updateNotificationPreference: (type: string, updates: Partial<NotificationPreference>) => void;
  
  // Activity Log Actions
  setActivityLogs: (logs: ActivityLog[], hasMore: boolean) => void;
  addActivityLog: (log: ActivityLog) => void;
  setActivityLogsLoading: (isLoading: boolean) => void;
  
  // UI Actions
  setSelectedShareId: (id: string | null) => void;
  setSelectedGroupId: (id: string | null) => void;
  setCommentFilter: (filter: 'all' | 'resolved' | 'unresolved') => void;
  setNotificationFilter: (filter: 'all' | 'unread') => void;
  
  // Reset
  reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: CollaborationState = {
  shares: {
    sent: [],
    received: [],
    isLoading: false,
    error: null,
  },
  comments: {
    items: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  },
  studyGroups: {
    items: [],
    currentGroup: null,
    isLoading: false,
    error: null,
  },
  notifications: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  notificationPreferences: [],
  activityLogs: {
    items: [],
    isLoading: false,
    hasMore: true,
  },
  ui: {
    selectedShareId: null,
    selectedGroupId: null,
    commentFilter: 'all',
    notificationFilter: 'all',
  },
};

// ============================================
// STORE CREATION
// ============================================

export const useCollaborationStore = create<CollaborationState & CollaborationActions>()(
  devtools(
    immer((set) => ({
      ...initialState,
      
      // Share Actions
      setShares: (shares) => set((state) => {
        state.shares.sent = shares.sent;
        state.shares.received = shares.received;
      }, false, 'shares/setShares'),
      
      addShare: (share) => set((state) => {
        if (share.owner_id === share.shared_with_id) {
          state.shares.sent.unshift(share);
        } else {
          state.shares.received.unshift(share);
        }
      }, false, 'shares/addShare'),
      
      updateShare: (id, updates) => set((state) => {
        const sentIndex = state.shares.sent.findIndex(s => s.id === id);
        if (sentIndex !== -1) {
          Object.assign(state.shares.sent[sentIndex], updates);
        }
        const receivedIndex = state.shares.received.findIndex(s => s.id === id);
        if (receivedIndex !== -1) {
          Object.assign(state.shares.received[receivedIndex], updates);
        }
      }, false, 'shares/updateShare'),
      
      removeShare: (id) => set((state) => {
        state.shares.sent = state.shares.sent.filter(s => s.id !== id);
        state.shares.received = state.shares.received.filter(s => s.id !== id);
      }, false, 'shares/removeShare'),
      
      setSharesLoading: (isLoading) => set((state) => {
        state.shares.isLoading = isLoading;
      }, false, 'shares/setLoading'),
      
      setSharesError: (error) => set((state) => {
        state.shares.error = error;
      }, false, 'shares/setError'),
      
      // Comment Actions
      setComments: (comments, totalCount) => set((state) => {
        state.comments.items = comments;
        state.comments.totalCount = totalCount;
      }, false, 'comments/setComments'),
      
      addComment: (comment) => set((state) => {
        if (comment.parent_id) {
          const parent = state.comments.items.find(c => c.id === comment.parent_id);
          if (parent) {
            if (!parent.replies) parent.replies = [];
            parent.replies.push(comment);
          }
        } else {
          state.comments.items.unshift(comment);
        }
        state.comments.totalCount++;
      }, false, 'comments/addComment'),
      
      updateComment: (id, updates) => set((state) => {
        const comment = state.comments.items.find(c => c.id === id);
        if (comment) {
          Object.assign(comment, updates);
        }
        // Also check in replies
        state.comments.items.forEach(c => {
          if (c.replies) {
            const reply = c.replies.find(r => r.id === id);
            if (reply) {
              Object.assign(reply, updates);
            }
          }
        });
      }, false, 'comments/updateComment'),
      
      removeComment: (id) => set((state) => {
        state.comments.items = state.comments.items.filter(c => c.id !== id);
        state.comments.items.forEach(c => {
          if (c.replies) {
            c.replies = c.replies.filter(r => r.id !== id);
          }
        });
        state.comments.totalCount--;
      }, false, 'comments/removeComment'),
      
      setCommentsLoading: (isLoading) => set((state) => {
        state.comments.isLoading = isLoading;
      }, false, 'comments/setLoading'),
      
      setCommentsError: (error) => set((state) => {
        state.comments.error = error;
      }, false, 'comments/setError'),
      
      addReply: (parentId, reply) => set((state) => {
        const parent = state.comments.items.find(c => c.id === parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(reply);
          parent.reply_count++;
        }
      }, false, 'comments/addReply'),
      
      // Study Group Actions
      setStudyGroups: (groups) => set((state) => {
        state.studyGroups.items = groups;
      }, false, 'studyGroups/setStudyGroups'),
      
      setCurrentGroup: (group) => set((state) => {
        state.studyGroups.currentGroup = group;
      }, false, 'studyGroups/setCurrentGroup'),
      
      addStudyGroup: (group) => set((state) => {
        state.studyGroups.items.unshift(group);
      }, false, 'studyGroups/addStudyGroup'),
      
      updateStudyGroup: (id, updates) => set((state) => {
        const group = state.studyGroups.items.find(g => g.id === id);
        if (group) {
          Object.assign(group, updates);
        }
        if (state.studyGroups.currentGroup?.id === id) {
          Object.assign(state.studyGroups.currentGroup, updates);
        }
      }, false, 'studyGroups/updateStudyGroup'),
      
      removeStudyGroup: (id) => set((state) => {
        state.studyGroups.items = state.studyGroups.items.filter(g => g.id !== id);
        if (state.studyGroups.currentGroup?.id === id) {
          state.studyGroups.currentGroup = null;
        }
      }, false, 'studyGroups/removeStudyGroup'),
      
      addGroupMember: (groupId, member) => set((state) => {
        const group = state.studyGroups.items.find(g => g.id === groupId);
        if (group && group.members) {
          group.members.push(member as any);
          group.member_count++;
        }
      }, false, 'studyGroups/addGroupMember'),
      
      removeGroupMember: (groupId, userId) => set((state) => {
        const group = state.studyGroups.items.find(g => g.id === groupId);
        if (group && group.members) {
          group.members = group.members.filter(m => m.user_id !== userId);
          group.member_count--;
        }
      }, false, 'studyGroups/removeGroupMember'),
      
      updateGroupMemberRole: (groupId, userId, role) => set((state) => {
        const group = state.studyGroups.items.find(g => g.id === groupId);
        if (group && group.members) {
          const member = group.members.find(m => m.user_id === userId);
          if (member) {
            member.role = role;
          }
        }
      }, false, 'studyGroups/updateGroupMemberRole'),
      
      setStudyGroupsLoading: (isLoading) => set((state) => {
        state.studyGroups.isLoading = isLoading;
      }, false, 'studyGroups/setLoading'),
      
      setStudyGroupsError: (error) => set((state) => {
        state.studyGroups.error = error;
      }, false, 'studyGroups/setError'),
      
      // Notification Actions
      setNotifications: (notifications, unreadCount) => set((state) => {
        state.notifications.items = notifications;
        state.notifications.unreadCount = unreadCount;
      }, false, 'notifications/setNotifications'),
      
      addNotification: (notification) => set((state) => {
        state.notifications.items.unshift(notification);
        if (notification.status === 'unread') {
          state.notifications.unreadCount++;
        }
      }, false, 'notifications/addNotification'),
      
      markNotificationAsRead: (id) => set((state) => {
        const notification = state.notifications.items.find(n => n.id === id);
        if (notification && notification.status === 'unread') {
          notification.status = 'read';
          notification.read_at = new Date().toISOString();
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
      }, false, 'notifications/markAsRead'),
      
      markAllNotificationsAsRead: () => set((state) => {
        state.notifications.items.forEach(n => {
          if (n.status === 'unread') {
            n.status = 'read';
            n.read_at = new Date().toISOString();
          }
        });
        state.notifications.unreadCount = 0;
      }, false, 'notifications/markAllAsRead'),
      
      archiveNotification: (id) => set((state) => {
        const notification = state.notifications.items.find(n => n.id === id);
        if (notification) {
          notification.status = 'archived';
          if (notification.status === 'unread') {
            state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
          }
        }
      }, false, 'notifications/archive'),
      
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.items.find(n => n.id === id);
        if (notification && notification.status === 'unread') {
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
        state.notifications.items = state.notifications.items.filter(n => n.id !== id);
      }, false, 'notifications/remove'),
      
      setNotificationsLoading: (isLoading) => set((state) => {
        state.notifications.isLoading = isLoading;
      }, false, 'notifications/setLoading'),
      
      setNotificationsError: (error) => set((state) => {
        state.notifications.error = error;
      }, false, 'notifications/setError'),
      
      setUnreadCount: (count) => set((state) => {
        state.notifications.unreadCount = count;
      }, false, 'notifications/setUnreadCount'),
      
      // Notification Preference Actions
      setNotificationPreferences: (preferences) => set((state) => {
        state.notificationPreferences = preferences;
      }, false, 'notificationPreferences/set'),
      
      updateNotificationPreference: (type, updates) => set((state) => {
        const pref = state.notificationPreferences.find(p => p.type === type);
        if (pref) {
          Object.assign(pref, updates);
        }
      }, false, 'notificationPreferences/update'),
      
      // Activity Log Actions
      setActivityLogs: (logs, hasMore) => set((state) => {
        state.activityLogs.items = logs;
        state.activityLogs.hasMore = hasMore;
      }, false, 'activityLogs/set'),
      
      addActivityLog: (log) => set((state) => {
        state.activityLogs.items.unshift(log);
      }, false, 'activityLogs/add'),
      
      setActivityLogsLoading: (isLoading) => set((state) => {
        state.activityLogs.isLoading = isLoading;
      }, false, 'activityLogs/setLoading'),
      
      // UI Actions
      setSelectedShareId: (id) => set((state) => {
        state.ui.selectedShareId = id;
      }, false, 'ui/setSelectedShareId'),
      
      setSelectedGroupId: (id) => set((state) => {
        state.ui.selectedGroupId = id;
      }, false, 'ui/setSelectedGroupId'),
      
      setCommentFilter: (filter) => set((state) => {
        state.ui.commentFilter = filter;
      }, false, 'ui/setCommentFilter'),
      
      setNotificationFilter: (filter) => set((state) => {
        state.ui.notificationFilter = filter;
      }, false, 'ui/setNotificationFilter'),
      
      // Reset
      reset: () => set(initialState, false, 'collaboration/reset'),
    })),
    {
      name: 'collaboration-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectShares = (state: ReturnType<typeof useCollaborationStore.getState>) => state.shares;
export const selectComments = (state: ReturnType<typeof useCollaborationStore.getState>) => state.comments;
export const selectStudyGroups = (state: ReturnType<typeof useCollaborationStore.getState>) => state.studyGroups;
export const selectNotifications = (state: ReturnType<typeof useCollaborationStore.getState>) => state.notifications;
export const selectNotificationPreferences = (state: ReturnType<typeof useCollaborationStore.getState>) => state.notificationPreferences;
export const selectActivityLogs = (state: ReturnType<typeof useCollaborationStore.getState>) => state.activityLogs;
export const selectCollaborationUI = (state: ReturnType<typeof useCollaborationStore.getState>) => state.ui;

// Filtered selectors
export const selectUnreadNotifications = (state: ReturnType<typeof useCollaborationStore.getState>) => 
  state.notifications.items.filter(n => n.status === 'unread');

export const selectActiveComments = (state: ReturnType<typeof useCollaborationStore.getState>) =>
  state.comments.items.filter(c => c.status === 'active');

export const selectResolvedComments = (state: ReturnType<typeof useCollaborationStore.getState>) =>
  state.comments.items.filter(c => c.status === 'resolved');
