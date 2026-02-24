/**
 * Collaboration Hooks
 * ===================
 * Export all collaboration hooks
 */

export { useComments } from './use-comments';
export { useShares } from './use-shares';
export { useStudyGroups } from './use-study-groups';
export { useNotifications } from './use-notifications';
export { useCollaborativeEditing } from './use-collaborative-editing';

// Re-export types
export type {
  UseCommentsReturn,
  UseSharesReturn,
  UseStudyGroupsReturn,
  UseNotificationsReturn,
  UseCollaborationReturn,
} from '@/lib/collaboration/types';
