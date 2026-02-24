# Sandstone Collaboration System

A comprehensive collaboration system for the Sandstone learning platform, enabling users to share content, comment, form study groups, edit documents together, and receive notifications.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Installation](#installation)
6. [Usage](#usage)
7. [API Reference](#api-reference)
8. [Components](#components)
9. [Hooks](#hooks)
10. [Real-time Features](#real-time-features)

## Overview

The collaboration system provides five core features:

- **Sharing**: Share essays, documents, flashcards, and quizzes with other users
- **Comments**: Add comments and replies to content with text selection support
- **Study Groups**: Create and join study groups for collaborative learning
- **Collaborative Editing**: Real-time document editing with cursors and presence
- **Notifications**: In-app and browser notifications for collaboration events

## Features

### Sharing System

- Share content with specific users by email
- Four permission levels: view, comment, edit, admin
- Expiring share links
- Access tracking
- Real-time share status updates

### Comments System

- Threaded comments and replies
- Text selection for contextual comments
- Reactions (emoji) support
- Comment resolution
- Real-time comment updates

### Study Groups

- Create public or private study groups
- Join codes for private groups
- Role-based access (owner, admin, member, viewer)
- Share content within groups
- Member management

### Collaborative Editing

- Real-time cursor tracking
- User presence indicators
- Document version history
- Auto-save functionality
- Conflict-free editing

### Notifications

- In-app notification panel
- Browser push notifications
- Configurable notification preferences
- Priority levels (low, normal, high, urgent)
- Action URLs for direct navigation

## Architecture

```
lib/collaboration/
├── types.ts          # TypeScript type definitions
├── schema.sql        # Database schema
├── store.ts          # Zustand state management
├── api.ts            # API functions
└── index.ts          # Module exports

hooks/collaboration/
├── use-comments.ts           # Comments hook
├── use-shares.ts             # Shares hook
├── use-study-groups.ts       # Study groups hook
├── use-notifications.ts      # Notifications hook
├── use-collaborative-editing.ts  # Collaborative editing hook
└── index.ts                  # Hooks exports

components/collaboration/
├── share-dialog.tsx          # Share dialog component
├── comments-panel.tsx        # Comments panel component
├── notifications-panel.tsx   # Notifications panel
├── notifications-bell.tsx    # Notification bell with badge
├── study-groups.tsx          # Study groups management
└── collaborative-editor.tsx  # Collaborative editor
```

## Database Schema

### Tables

#### shares
- Content sharing between users
- Tracks permission levels and status
- Supports expiring shares

#### comments
- Threaded comments on content
- Supports text selection
- Reactions stored as JSONB

#### study_groups
- Study group information
- Public/private visibility
- Join codes for access

#### study_group_members
- Group membership tracking
- Role-based permissions

#### notifications
- User notifications
- Configurable types and priorities
- Read/Unread tracking

#### document_collaborators
- Real-time collaboration state
- Cursor positions and selections

#### document_versions
- Version history for documents
- Change summaries

## Installation

### 1. Apply Database Schema

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL file directly in Supabase SQL Editor
cat lib/collaboration/schema.sql
```

### 2. Enable Realtime

Ensure realtime is enabled for collaboration tables in your Supabase dashboard:
- shares
- comments
- study_groups
- study_group_members
- notifications

### 3. Install Dependencies

```bash
npm install zustand immer
```

## Usage

### Basic Setup

```tsx
import { CollaborationProvider } from '@/lib/collaboration/provider';

function App() {
  return (
    <CollaborationProvider>
      <YourApp />
    </CollaborationProvider>
  );
}
```

### Sharing Content

```tsx
import { ShareDialog } from '@/components/collaboration';

function DocumentPage({ document }) {
  return (
    <ShareDialog
      contentType="document"
      contentId={document.id}
      contentTitle={document.title}
    />
  );
}
```

### Adding Comments

```tsx
import { CommentsPanel } from '@/components/collaboration';

function EssayPage({ essay }) {
  return (
    <div className="flex">
      <EssayContent essay={essay} />
      <CommentsPanel
        contentType="essay"
        contentId={essay.id}
      />
    </div>
  );
}
```

### Managing Study Groups

```tsx
import { StudyGroups } from '@/components/collaboration';

function StudyGroupsPage() {
  return (
    <StudyGroups 
      onSelectGroup={(group) => router.push(`/groups/${group.id}`)}
    />
  );
}
```

### Collaborative Editing

```tsx
import { CollaborativeEditor } from '@/components/collaboration';

function DocumentEditor({ document }) {
  const [content, setContent] = useState(document.content);
  
  const handleSave = async (content, changeSummary) => {
    await saveDocument(document.id, content);
  };
  
  return (
    <CollaborativeEditor
      documentId={document.id}
      content={content}
      onChange={setContent}
      onSave={handleSave}
    />
  );
}
```

### Notifications

```tsx
import { NotificationsBell } from '@/components/collaboration';

function Header() {
  return (
    <header>
      <NotificationsBell />
    </header>
  );
}
```

## API Reference

### Share API

```typescript
import { shareApi } from '@/lib/collaboration/api';

// Get all shares
const { sent, received } = await shareApi.getShares();

// Create a share
const share = await shareApi.createShare({
  content_type: 'document',
  content_id: 'doc-id',
  shared_with_email: 'user@example.com',
  permission: 'edit',
  message: 'Please review this',
});

// Accept/Decline/Revoke
await shareApi.acceptShare(shareId);
await shareApi.declineShare(shareId);
await shareApi.revokeShare(shareId);

// Check access
const { hasAccess, permission } = await shareApi.checkAccess('document', 'doc-id');
```

### Comments API

```typescript
import { commentApi } from '@/lib/collaboration/api';

// Get comments
const { comments, totalCount } = await commentApi.getComments('document', 'doc-id');

// Add comment
const comment = await commentApi.createComment({
  content_type: 'document',
  content_id: 'doc-id',
  text: 'Great work!',
  selection_start: 10,
  selection_end: 20,
  selection_text: 'selected text',
});

// Reply to comment
const reply = await commentApi.createComment({
  content_type: 'document',
  content_id: 'doc-id',
  text: 'Thanks!',
  parent_id: comment.id,
});

// Resolve comment
await commentApi.resolveComment(comment.id);

// Add reaction
await commentApi.addReaction(comment.id, '👍');
```

### Study Groups API

```typescript
import { studyGroupApi } from '@/lib/collaboration/api';

// Get groups
const groups = await studyGroupApi.getStudyGroups();

// Create group
const group = await studyGroupApi.createStudyGroup({
  name: 'Biology Study Squad',
  description: 'Studying for finals',
  subject: 'Biology',
  is_public: false,
});

// Join group
await studyGroupApi.joinGroup(group.id, 'JOINCODE');

// Share content
await studyGroupApi.shareContent(group.id, 'document', 'doc-id', 'Check this out!');
```

### Notifications API

```typescript
import { notificationApi } from '@/lib/collaboration/api';

// Get notifications
const { notifications, unreadCount } = await notificationApi.getNotifications();

// Mark as read
await notificationApi.markAsRead(notificationId);
await notificationApi.markAllAsRead();

// Update preferences
await notificationApi.updatePreference('comment_reply', {
  email_enabled: true,
  push_enabled: false,
});
```

## Components

### ShareDialog

Dialog for sharing content with other users.

**Props:**
- `contentType`: Type of content (essay, document, flashcard_deck, quiz, folder)
- `contentId`: ID of the content
- `contentTitle`: Title for display
- `trigger?`: Custom trigger element
- `onShare?`: Callback when share is created

### CommentsPanel

Panel for viewing and adding comments.

**Props:**
- `contentType`: Type of content
- `contentId`: ID of the content
- `selectedText?`: Currently selected text
- `selectionRange?`: Start and end positions
- `onClearSelection?`: Callback to clear selection

### NotificationsBell

Bell icon with unread count badge.

**Props:**
- `className?`: Additional CSS classes

### NotificationsPanel

Full notifications panel with tabs.

**Props:**
- `onClose?`: Callback when panel closes

### StudyGroups

Study groups management interface.

**Props:**
- `onSelectGroup?`: Callback when a group is selected

### CollaborativeEditor

Real-time collaborative document editor.

**Props:**
- `documentId`: Document ID
- `content`: Document content
- `onChange`: Content change callback
- `onSave`: Save callback
- `readOnly?`: Read-only mode

## Hooks

### useShares

```typescript
const {
  sentShares,
  receivedShares,
  isLoading,
  createShare,
  acceptShare,
  declineShare,
  revokeShare,
  checkAccess,
} = useShares();
```

### useComments

```typescript
const {
  comments,
  isLoading,
  addComment,
  updateComment,
  deleteComment,
  resolveComment,
  addReaction,
} = useComments({ contentType: 'document', contentId: 'doc-id' });
```

### useStudyGroups

```typescript
const {
  studyGroups,
  currentGroup,
  createStudyGroup,
  joinGroup,
  leaveGroup,
  shareContent,
  isOwnerOrAdmin,
} = useStudyGroups({ groupId: 'group-id' });
```

### useNotifications

```typescript
const {
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  updatePreference,
} = useNotifications();
```

### useCollaborativeEditing

```typescript
const {
  collaborators,
  isConnected,
  sendCursorPosition,
  sendSelection,
  saveVersion,
  versions,
} = useCollaborativeEditing({ documentId: 'doc-id' });
```

## Real-time Features

The collaboration system uses Supabase Realtime for live updates:

### Subscribed Tables
- `shares` - Share creation and status changes
- `comments` - New comments, updates, and deletions
- `study_groups` - Group creation and updates
- `study_group_members` - Membership changes
- `notifications` - New notifications

### Broadcast Channels
- `document-collab:{documentId}` - Document collaboration events
- `document-cursor:{documentId}` - Cursor position updates

### Events
- `USER_JOINED_DOCUMENT` - User joined collaboration
- `USER_LEFT_DOCUMENT` - User left collaboration
- `DOCUMENT_CURSOR_MOVED` - Cursor position changed
- `DOCUMENT_SELECTION_CHANGED` - Text selection changed
- `DOCUMENT_EDITED` - Content edited

## Security

Row Level Security (RLS) policies ensure:
- Users can only see their own notifications
- Share recipients can only see shares they're part of
- Group members can only see their groups
- Comment visibility is controlled by content access

## Performance Considerations

1. **Pagination**: Comments and notifications are paginated
2. **Lazy Loading**: Study groups load on demand
3. **Debouncing**: Cursor updates are debounced
4. **Optimistic Updates**: UI updates before API confirmation
5. **Caching**: Zustand store provides client-side caching

## Troubleshooting

### Real-time not working
1. Check Supabase realtime is enabled
2. Verify RLS policies allow reading
3. Check browser console for errors

### Notifications not showing
1. Verify notification preferences
2. Check browser notification permissions
3. Ensure service worker is registered

### Collaborative editing issues
1. Check user is authenticated
2. Verify document access permissions
3. Ensure channel subscription succeeded

## Contributing

When adding new collaboration features:

1. Add types to `lib/collaboration/types.ts`
2. Update schema in `lib/collaboration/schema.sql`
3. Add API functions to `lib/collaboration/api.ts`
4. Create hook in `hooks/collaboration/`
5. Build component in `components/collaboration/`
6. Export from index files
7. Add documentation

## License

MIT License - See LICENSE file for details
