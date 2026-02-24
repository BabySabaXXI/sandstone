# Sandstone AI Tutor Chat System - Enhanced

A comprehensive, context-aware AI chat system for the Sandstone educational platform.

## Features

### Core Features
- **Context-Aware Conversations**: AI understands context from essays, documents, quizzes, and flashcards
- **Real-time Streaming**: Stream AI responses for better UX
- **Chat Organization**: Folders, pinning, and search functionality
- **Persistent Storage**: Sync chats to Supabase with offline support
- **Message Management**: Edit, delete, regenerate, and copy messages

### Enhanced Features
- **Subject-Specific Prompts**: Customized system prompts for Economics and Geography
- **User Level Adaptation**: Adjusts explanations based on student proficiency
- **Quick Actions**: Pre-built prompts for common tasks
- **Chat Statistics**: Track usage and engagement
- **Export/Import**: Backup and restore chat history

## File Structure

```
sandstone-chat-enhancement/
├── route.ts                    # Enhanced API route with Kimi integration
├── chat-store.ts               # Zustand store with persistence
├── AIChat.tsx                  # Main chat component
├── useChat.ts                  # React hooks for chat operations
├── chat-types.ts               # TypeScript type definitions
├── chat-utils.ts               # Utility functions
├── 20240101000000_enhance_chat_schema.sql  # Database migration
└── README.md                   # This file
```

## Installation

### 1. Copy Files

Copy all files to their respective locations in your project:

```bash
# API Route
cp route.ts app/api/chat/route.ts

# Store
cp chat-store.ts stores/chat-store.ts

# Components
cp AIChat.tsx components/layout/AIChat.tsx

# Hooks
cp useChat.ts hooks/useChat.ts

# Types
cp chat-types.ts types/chat.ts

# Utilities
cp chat-utils.ts lib/chat-utils.ts
```

### 2. Run Database Migration

Execute the SQL migration in your Supabase SQL editor:

```sql
-- Run the contents of 20240101000000_enhance_chat_schema.sql
```

### 3. Set Environment Variables

Add to your `.env.local`:

```env
KIMI_API_KEY=sk-CkE2F9GDFElGSZSA6NCozb2VKJ6r1qqmR6JoloLOq7ClRe1m
```

### 4. Update Imports

Ensure all imports are correctly resolved:

```typescript
// In components/layout/AIChat.tsx
import { useChatStore } from "@/stores/chat-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useAuth } from "@/components/auth-provider";
```

## Usage

### Basic Usage

```tsx
import { AIChat } from "@/components/layout/AIChat";

function MyComponent() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsChatOpen(true)}>
        Open AI Tutor
      </button>
      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
```

### With Context

```tsx
<AIChat 
  isOpen={isChatOpen} 
  onClose={() => setIsChatOpen(false)}
  initialContext={{
    essayText: "My essay content...",
    essayQuestion: "Discuss the impact of...",
    userLevel: "intermediate",
  }}
/>
```

### Using Hooks

```tsx
import { useChat, useChatList } from "@/hooks/useChat";

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useChat({
    chatId: "chat-123",
    subject: "economics",
  });

  const { createChat, deleteChat } = useChatList();

  // Use the chat functionality...
}
```

## API Reference

### POST /api/chat

Send a message to the AI tutor.

**Request Body:**

```json
{
  "message": "Explain supply and demand",
  "subject": "economics",
  "chatHistory": [
    { "role": "user", "content": "What is inflation?" },
    { "role": "assistant", "content": "Inflation is..." }
  ],
  "context": {
    "essayText": "...",
    "userLevel": "intermediate",
    "learningGoal": "Exam preparation"
  },
  "stream": false
}
```

**Response:**

```json
{
  "response": "Supply and demand is...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 200,
    "totalTokens": 350
  }
}
```

## Store API

### ChatStore State

```typescript
interface ChatStoreState {
  chats: Chat[];
  currentChatId: string | null;
  folders: ChatFolder[];
  isLoading: boolean;
  error: string | null;
  streamingMessageId: string | null;
}
```

### ChatStore Actions

| Action | Description |
|--------|-------------|
| `createChat(subject, options)` | Create a new chat |
| `deleteChat(chatId)` | Delete a chat |
| `sendMessageToAI(chatId, content, options)` | Send message and get AI response |
| `pinChat(chatId, isPinned)` | Pin/unpin a chat |
| `createFolder(name, color)` | Create a new folder |
| `fetchChats()` | Fetch chats from Supabase |

## Database Schema

### ai_chats Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | Text | Chat title |
| subject | Text | economics/geography/general |
| messages | JSONB | Array of messages |
| is_pinned | Boolean | Whether chat is pinned |
| folder | Text | Folder ID |
| context | JSONB | Chat context data |
| metadata | JSONB | Additional metadata |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

### chat_folders Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| name | Text | Folder name |
| color | Text | Folder color (hex) |
| created_at | Timestamp | Creation time |

## Context Types

The chat system supports various context types for better AI responses:

### Essay Context
```typescript
{
  essayText: string;
  essayQuestion: string;
  userLevel: "beginner" | "intermediate" | "advanced";
}
```

### Document Context
```typescript
{
  documentContent: string;
  documentTitle: string;
}
```

### Quiz Context
```typescript
{
  quizResults: Array<{
    question: string;
    userAnswer: string;
    correct: boolean;
  }>;
}
```

### Flashcard Context
```typescript
{
  flashcardTopic: string;
  flashcardDeck: string;
}
```

## Customization

### Adding New Subjects

1. Update the `Subject` type in `types/index.ts`:

```typescript
export type Subject = "economics" | "geography" | "history";
```

2. Add a system prompt in `app/api/chat/route.ts`:

```typescript
const SUBJECT_SYSTEM_PROMPTS: Record<string, (context: any) => string> = {
  history: (ctx) => `You are a history tutor...`,
  // ...
};
```

### Customizing Quick Actions

Edit the `QUICK_ACTIONS` array in `AIChat.tsx`:

```typescript
const QUICK_ACTIONS = [
  { icon: Sparkles, label: "Explain concept", prompt: "Can you explain..." },
  // Add your own actions
];
```

## Troubleshooting

### Common Issues

**Issue**: Chats not persisting
- Check Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors

**Issue**: AI responses not streaming
- Ensure `stream: true` is passed in options
- Check network tab for SSE connection
- Verify Kimi API key is valid

**Issue**: Type errors
- Run `npm run type-check`
- Ensure all imports are correct
- Check TypeScript version compatibility

### Debug Mode

Enable debug logging:

```typescript
// In chat-store.ts
const DEBUG = true;

if (DEBUG) {
  console.log("Chat store action:", action, payload);
}
```

## Performance Considerations

1. **Message Limiting**: Only last 10 messages sent to AI for context
2. **Lazy Loading**: Chats fetched on demand
3. **Debounced Search**: Search queries debounced at 300ms
4. **Virtual Scrolling**: Consider for very long chat histories

## Security

- All API calls require authentication
- RLS policies restrict data access
- Input sanitization prevents XSS
- API keys stored server-side only

## Contributing

When contributing to the chat system:

1. Follow TypeScript best practices
2. Add tests for new features
3. Update this README
4. Ensure backward compatibility

## License

Part of the Sandstone educational platform.
