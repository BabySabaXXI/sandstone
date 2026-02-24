/**
 * Sandstone Collaboration Module
 * ==============================
 * Centralized exports for all collaboration features
 */

// Types
export * from './types';

// Store
export { useCollaborationStore, selectShares, selectComments, selectStudyGroups, selectNotifications } from './store';

// API
export { 
  collaborationApi, 
  shareApi, 
  commentApi, 
  studyGroupApi, 
  notificationApi, 
  collaborativeEditingApi, 
  activityLogApi 
} from './api';

// Default export
export { default } from './api';
