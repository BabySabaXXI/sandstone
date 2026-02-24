/**
 * Use Study Groups Hook
 * =====================
 * Hook for managing study groups with real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import { useCollaborationStore } from '@/lib/collaboration/store';
import { studyGroupApi } from '@/lib/collaboration/api';
import { getRealtimeClient } from '@/lib/supabase/realtime-client';
import type { 
  StudyGroupWithMembers, 
  StudyGroupMember, 
  GroupRole, 
  CreateStudyGroupRequest,
  ContentType 
} from '@/lib/collaboration/types';

interface UseStudyGroupsOptions {
  autoLoad?: boolean;
  groupId?: string;
}

export function useStudyGroups(options: UseStudyGroupsOptions = {}) {
  const { autoLoad = true, groupId } = options;
  const store = useCollaborationStore();
  const [channels, setChannels] = useState<ReturnType<typeof getRealtimeClient>['channel'][]>([]);

  // Get study groups from store
  const studyGroups = store.studyGroups.items;
  const currentGroup = store.studyGroups.currentGroup;
  const isLoading = store.studyGroups.isLoading;
  const error = store.studyGroups.error;

  // Load all study groups
  const loadStudyGroups = useCallback(async () => {
    store.setStudyGroupsLoading(true);
    store.setStudyGroupsError(null);

    try {
      const groups = await studyGroupApi.getStudyGroups();
      store.setStudyGroups(groups);
    } catch (err) {
      store.setStudyGroupsError(err instanceof Error ? err.message : 'Failed to load study groups');
    } finally {
      store.setStudyGroupsLoading(false);
    }
  }, [store]);

  // Load specific study group
  const loadStudyGroup = useCallback(async (id: string) => {
    try {
      const group = await studyGroupApi.getStudyGroup(id);
      store.setCurrentGroup(group);
      return group;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Create study group
  const createStudyGroup = useCallback(async (request: CreateStudyGroupRequest) => {
    try {
      const group = await studyGroupApi.createStudyGroup(request);
      store.addStudyGroup(group);
      return group;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Update study group
  const updateStudyGroup = useCallback(async (id: string, updates: Partial<StudyGroupWithMembers>) => {
    try {
      const group = await studyGroupApi.updateStudyGroup(id, updates);
      store.updateStudyGroup(id, group);
      return group;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Delete study group
  const deleteStudyGroup = useCallback(async (id: string) => {
    try {
      await studyGroupApi.deleteStudyGroup(id);
      store.removeStudyGroup(id);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Join study group
  const joinGroup = useCallback(async (groupId: string, joinCode?: string) => {
    try {
      const member = await studyGroupApi.joinGroup(groupId, joinCode);
      store.addGroupMember(groupId, member);
      
      // Reload group to get updated member list
      const group = await studyGroupApi.getStudyGroup(groupId);
      store.setCurrentGroup(group);
      
      return member;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Leave study group
  const leaveGroup = useCallback(async (groupId: string) => {
    try {
      await studyGroupApi.leaveGroup(groupId);
      
      // Get current user ID
      const { data: { user } } = await (await import('@/lib/supabase/client')).createClient().auth.getUser();
      if (user) {
        store.removeGroupMember(groupId, user.id);
      }
      
      // If current group is the one we left, clear it
      if (currentGroup?.id === groupId) {
        store.setCurrentGroup(null);
      }
    } catch (err) {
      throw err;
    }
  }, [store, currentGroup]);

  // Update member role
  const updateMemberRole = useCallback(async (groupId: string, userId: string, role: GroupRole) => {
    try {
      const member = await studyGroupApi.updateMemberRole(groupId, userId, role);
      store.updateGroupMemberRole(groupId, userId, role);
      return member;
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Remove member from group
  const removeMember = useCallback(async (groupId: string, userId: string) => {
    try {
      await studyGroupApi.removeMember(groupId, userId);
      store.removeGroupMember(groupId, userId);
    } catch (err) {
      throw err;
    }
  }, [store]);

  // Share content with group
  const shareContent = useCallback(async (groupId: string, contentType: ContentType, contentId: string, message?: string) => {
    try {
      await studyGroupApi.shareContent(groupId, contentType, contentId, message);
    } catch (err) {
      throw err;
    }
  }, []);

  // Get shared content
  const getSharedContent = useCallback(async (groupId: string) => {
    try {
      return await studyGroupApi.getSharedContent(groupId);
    } catch (err) {
      throw err;
    }
  }, []);

  // Regenerate join code
  const regenerateJoinCode = useCallback(async (groupId: string) => {
    try {
      return await studyGroupApi.regenerateJoinCode(groupId);
    } catch (err) {
      throw err;
    }
  }, []);

  // Get user's role in a group
  const getUserRole = useCallback((groupId: string, userId: string): GroupRole | null => {
    const group = studyGroups.find(g => g.id === groupId);
    if (!group) return null;
    
    const member = group.members?.find(m => m.user_id === userId);
    return member?.role || null;
  }, [studyGroups]);

  // Check if user is owner or admin
  const isOwnerOrAdmin = useCallback((groupId: string, userId: string): boolean => {
    const role = getUserRole(groupId, userId);
    return role === 'owner' || role === 'admin';
  }, [getUserRole]);

  // Setup real-time subscriptions
  useEffect(() => {
    const client = getRealtimeClient();
    const newChannels: ReturnType<typeof getRealtimeClient>['channel'][] = [];

    // Subscribe to study_groups table
    const groupsChannel = client.channel('study_groups');
    groupsChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups',
        },
        (payload) => {
          loadStudyGroups();
        }
      )
      .subscribe();
    newChannels.push(groupsChannel);

    // Subscribe to study_group_members table
    const membersChannel = client.channel('study_group_members');
    membersChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_group_members',
        },
        (payload) => {
          loadStudyGroups();
          if (groupId) {
            loadStudyGroup(groupId);
          }
        }
      )
      .subscribe();
    newChannels.push(membersChannel);

    setChannels(newChannels);

    return () => {
      newChannels.forEach(channel => channel.unsubscribe());
    };
  }, [loadStudyGroups, loadStudyGroup, groupId]);

  // Auto-load study groups on mount
  useEffect(() => {
    if (autoLoad) {
      loadStudyGroups();
    }
  }, [autoLoad, loadStudyGroups]);

  // Load specific group if groupId is provided
  useEffect(() => {
    if (groupId) {
      loadStudyGroup(groupId);
    }
  }, [groupId, loadStudyGroup]);

  return {
    studyGroups,
    currentGroup,
    isLoading,
    error,
    loadStudyGroups,
    loadStudyGroup,
    createStudyGroup,
    updateStudyGroup,
    deleteStudyGroup,
    joinGroup,
    leaveGroup,
    updateMemberRole,
    removeMember,
    shareContent,
    getSharedContent,
    regenerateJoinCode,
    getUserRole,
    isOwnerOrAdmin,
  };
}

export default useStudyGroups;
