# Sandstone Realtime Features

This document describes the real-time features implemented in the Sandstone application using Supabase Realtime.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

## Overview

The Sandstone realtime system provides live updates for:

1. **Essay Grading Progress** - Real-time tracking of AI examiner progress
2. **Flashcard Study Sessions** - Live session tracking and synchronization
3. **Document Collaboration** - Multi-user editing with cursor tracking
4. **User Presence** - Online/away/offline status detection
5. **Notifications** - Real-time broadcast messages

## Features

### 1. Essay Grading Progress

Track the progress of AI-powered essay grading in real-time:

```tsx
import { useEssayGradingRealtime, GradingProgress } from "@/lib/realtime";

// Using the hook
const { progress, status, currentExaminer } = useEssayGradingRealtime({
  essayId: "essay-123",
  userId: "user-456",
  onProgress: (payload) => console.log("Progress:", payload.progress),
  onCompleted: (payload) => console.log("Grading complete!"),
});

// Using the component
<GradingProgress
  essayId="essay-123"
  userId="user-456"
  examiners={[
    { id: "ao1", name: "AO1 Knowledge", color: "#3B82F6" },
    { id: "ao2", name: "AO2 Application", color: "#10B981" },
  ]}
/>
```

### 2. Flashcard Study Sessions

Track study sessions with real-time synchronization:

```tsx
import { useFlashcardSessionRealtime, FlashcardSession } from "@/lib/realtime";

// Using the hook
const { startSession, reviewCard, stats, currentStreak } = useFlashcardSessionRealtime({
  sessionId: "session-789",
  userId: "user-456",
  onStatsUpdate: (stats) => console.log("Stats:", stats),
});

// Using the component
<FlashcardSession
  sessionId="session-789"
  userId="user-456"
  deckId="deck-abc"
  onSessionEnd={(stats) => console.log("Session ended:", stats)}
/>
```

### 3. Document Collaboration

Enable multi-user document editing:

```tsx
import { useDocumentCollaboration } from "@/lib/realtime";

const {
  collaborators,
  broadcastEdit,
  broadcastCursorMove,
  joinDocument,
  leaveDocument,
} = useDocumentCollaboration({
  documentId: "doc-xyz",
  userId: "user-456",
  userName: "John Doe",
  onUserJoined: (user) => console.log(`${user.userName} joined`),
  onContentEdited: (edit) => applyEdit(edit),
  onCursorMoved: (cursor) => updateCursorPosition(cursor),
});
```

### 4. User Presence

Track user online status:

```tsx
import { usePresence, PresenceIndicator } from "@/lib/realtime";

// Using the hook
const { status, onlineUsers, setStatus, setActivity } = usePresence({
  userId: "user-456",
  email: "user@example.com",
  fullName: "John Doe",
  onStatusChange: (status) => console.log("Status changed:", status),
});

// Using the component
<PresenceIndicator
  userId="user-456"
  email="user@example.com"
  fullName="John Doe"
  showOnlineCount
/>
```

### 5. Notifications

Send and receive real-time notifications:

```tsx
import { useNotifications, NotificationToast } from "@/lib/realtime";

// Using the hook
const { sendNotification, notifications, unreadCount } = useNotifications({
  userId: "user-456",
  onNotification: (notif) => console.log("New notification:", notif),
});

// Send a notification
sendNotification({
  userId: "user-456",
  type: "success",
  title: "Essay Graded",
  message: "Your essay has been graded!",
  data: { essayId: "essay-123", score: 8.5 },
});

// Using the toast component
<NotificationToast userId="user-456" position="top-right" />
```

## Architecture

### Client-Side

```
lib/
├── supabase/
│   └── realtime-client.ts    # Core realtime client & channel management
├── realtime/
│   ├── hooks/
│   │   ├── useRealtimeSubscription.ts
│   │   ├── useEssayGradingRealtime.ts
│   │   ├── useFlashcardSessionRealtime.ts
│   │   ├── useDocumentCollaboration.ts
│   │   ├── usePresence.ts
│   │   └── useNotifications.ts
│   ├── realtime-provider.tsx  # Context provider for global state
│   ├── server.ts              # Server-side broadcast utilities
│   └── index.ts               # Main exports
components/
└── realtime/
    ├── GradingProgress.tsx
    ├── FlashcardSession.tsx
    ├── PresenceIndicator.tsx
    └── NotificationToast.tsx
```

### Server-Side

```
app/api/grade/
└── realtime-integration.ts    # Grading progress broadcasts
```

### Database

```sql
supabase/migrations/
└── 20250224_realtime_triggers.sql
```

## Installation

### 1. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side
```

### 2. Database Setup

Run the migration to set up realtime tables and triggers:

```bash
supabase db push
```

Or execute the SQL file directly in the Supabase SQL Editor.

### 3. Enable Realtime

In your Supabase dashboard:

1. Go to Database → Replication
2. Enable Realtime for the following tables:
   - `essays`
   - `flashcards`
   - `documents`
   - `user_presence`
   - `notifications`

### 4. Wrap Your App

```tsx
// app/layout.tsx
import { RealtimeProvider } from "@/lib/realtime";

export default function RootLayout({ children }) {
  return (
    <RealtimeProvider>
      {children}
    </RealtimeProvider>
  );
}
```

## Usage

### Basic Setup

```tsx
import { RealtimeProvider } from "@/lib/realtime";

function App() {
  return (
    <RealtimeProvider
      onConnect={() => console.log("Connected to realtime")}
      onDisconnect={() => console.log("Disconnected from realtime")}
      onError={(error) => console.error("Realtime error:", error)}
    >
      <YourApp />
    </RealtimeProvider>
  );
}
```

### Server-Side Broadcasting

```tsx
// In your API route
import { 
  broadcastGradingStarted,
  broadcastGradingProgress,
  broadcastGradingCompleted 
} from "@/lib/realtime/server";

export async function POST(request: Request) {
  const { essayId, userId } = await request.json();

  // Notify grading started
  await broadcastGradingStarted(essayId, userId);

  // ... grading logic ...

  // Update progress
  await broadcastGradingProgress(essayId, userId, 50, "AO1");

  // ... more grading ...

  // Notify completion
  await broadcastGradingCompleted(essayId, userId, {
    overallScore: 8.5,
    grade: "A",
    examiners: [...],
  });
}
```

## API Reference

### Hooks

#### `useEssayGradingRealtime`

| Option | Type | Description |
|--------|------|-------------|
| `essayId` | `string` | Essay ID to track |
| `userId` | `string` | User ID for notifications |
| `enabled` | `boolean` | Enable/disable subscription |
| `onProgress` | `(payload) => void` | Progress update callback |
| `onCompleted` | `(payload) => void` | Completion callback |
| `onFailed` | `(payload) => void` | Failure callback |

#### `useFlashcardSessionRealtime`

| Option | Type | Description |
|--------|------|-------------|
| `sessionId` | `string` | Session ID |
| `userId` | `string` | User ID |
| `deckId` | `string` | Deck ID |
| `enabled` | `boolean` | Enable/disable subscription |
| `onSessionStarted` | `(payload) => void` | Session start callback |
| `onCardReviewed` | `(payload) => void` | Card review callback |
| `onSessionEnded` | `(payload) => void` | Session end callback |

#### `useDocumentCollaboration`

| Option | Type | Description |
|--------|------|-------------|
| `documentId` | `string` | Document ID |
| `userId` | `string` | User ID |
| `userName` | `string` | Display name |
| `userColor` | `string` | Cursor color |
| `enabled` | `boolean` | Enable/disable subscription |
| `onUserJoined` | `(user) => void` | User joined callback |
| `onUserLeft` | `(user) => void` | User left callback |
| `onContentEdited` | `(edit) => void` | Content edit callback |
| `onCursorMoved` | `(cursor) => void` | Cursor move callback |

#### `usePresence`

| Option | Type | Description |
|--------|------|-------------|
| `userId` | `string` | User ID |
| `email` | `string` | User email |
| `fullName` | `string` | User display name |
| `avatarUrl` | `string` | Avatar URL |
| `enabled` | `boolean` | Enable/disable subscription |
| `heartbeatInterval` | `number` | Heartbeat interval (ms) |
| `awayTimeout` | `number` | Away status timeout (ms) |
| `onStatusChange` | `(status) => void` | Status change callback |

#### `useNotifications`

| Option | Type | Description |
|--------|------|-------------|
| `userId` | `string` | User ID |
| `enabled` | `boolean` | Enable/disable subscription |
| `maxNotifications` | `number` | Max notifications to keep |
| `onNotification` | `(notification) => void` | New notification callback |

### Server Functions

#### `broadcastGradingStarted`

```typescript
async function broadcastGradingStarted(
  essayId: string,
  userId: string,
  metadata?: { questionType?: string; subject?: string }
): Promise<{ success: boolean; error?: Error }>
```

#### `broadcastGradingProgress`

```typescript
async function broadcastGradingProgress(
  essayId: string,
  userId: string,
  progress: number,
  currentExaminer?: string,
  examinersCompleted?: string[],
  partialResults?: Array<{ examinerId: string; score: number; feedback: string }>
): Promise<{ success: boolean; error?: Error }>
```

#### `broadcastGradingCompleted`

```typescript
async function broadcastGradingCompleted(
  essayId: string,
  userId: string,
  result: { overallScore: number; grade: string; examiners: Array<{ id: string; name: string; score: number }> }
): Promise<{ success: boolean; error?: Error }>
```

#### `sendNotification`

```typescript
async function sendNotification(
  notification: Omit<NotificationPayload, "id" | "timestamp">
): Promise<{ success: boolean; error?: Error }>
```

## Database Schema

### New Tables

#### `flashcard_sessions`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User reference |
| `deck_id` | UUID | Deck reference |
| `session_type` | VARCHAR | review/learn/cram |
| `status` | VARCHAR | active/paused/completed/abandoned |
| `cards_reviewed` | INTEGER | Cards reviewed count |
| `correct_count` | INTEGER | Correct answers count |
| `streak` | INTEGER | Current streak |
| `time_spent_seconds` | INTEGER | Time spent |
| `started_at` | TIMESTAMPTZ | Session start |
| `ended_at` | TIMESTAMPTZ | Session end |

#### `document_collaborators`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `document_id` | UUID | Document reference |
| `user_id` | UUID | User reference |
| `permission_level` | VARCHAR | view/edit/admin |
| `joined_at` | TIMESTAMPTZ | Join timestamp |
| `last_active_at` | TIMESTAMPTZ | Last activity |
| `is_active` | BOOLEAN | Currently active |

#### `user_presence`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User reference |
| `status` | VARCHAR | online/away/offline/dnd |
| `last_seen_at` | TIMESTAMPTZ | Last seen |
| `current_activity` | TEXT | Current activity |
| `metadata` | JSONB | Additional data |

#### `notifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User reference |
| `type` | VARCHAR | info/success/warning/error |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification message |
| `data` | JSONB | Additional data |
| `is_read` | BOOLEAN | Read status |
| `is_dismissed` | BOOLEAN | Dismissed status |
| `read_at` | TIMESTAMPTZ | Read timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Enhanced Tables

#### `essays`

Added columns:
- `grading_status` - pending/in_progress/completed/failed
- `grading_progress` - 0-100
- `grading_started_at` - Start timestamp
- `grading_completed_at` - Completion timestamp
- `current_grader` - Current AI grader
- `graders_completed` - Array of completed graders
- `grading_error` - Error message if failed

#### `documents`

Added columns:
- `is_collaborative` - Enable collaboration
- `collaborators` - Array of collaborator IDs
- `last_edited_by` - Last editor
- `last_edited_at` - Last edit timestamp
- `version` - Document version
- `edit_history` - JSON edit history

## Troubleshooting

### Common Issues

#### 1. Realtime not connecting

- Check environment variables are set correctly
- Verify Supabase URL and anon key
- Check browser console for errors
- Ensure Realtime is enabled in Supabase dashboard

#### 2. Messages not receiving

- Verify channel names match between sender and receiver
- Check that both users are subscribed to the same channel
- Ensure `enabled` prop is `true`
- Check for typos in event names

#### 3. Presence not updating

- Verify user is authenticated
- Check heartbeat interval settings
- Ensure `track()` is called after subscription
- Check for network connectivity issues

#### 4. High memory usage

- Unsubscribe from channels when components unmount
- Use `removeAllChannels()` on logout
- Limit number of active subscriptions
- Set appropriate `maxNotifications` limit

### Debug Mode

Enable debug logging:

```tsx
<RealtimeProvider
  onConnect={() => console.log("[Realtime] Connected")}
  onDisconnect={() => console.log("[Realtime] Disconnected")}
  onError={(error) => console.error("[Realtime] Error:", error)}
>
```

### Performance Tips

1. **Batch Updates**: Use `batchBroadcast()` for multiple events
2. **Debounce Cursor**: Throttle cursor position updates to 50ms
3. **Limit Channels**: Only subscribe to necessary channels
4. **Use Presence**: Track active users instead of polling
5. **Cleanup**: Always unsubscribe on unmount

## License

MIT License - See LICENSE file for details
