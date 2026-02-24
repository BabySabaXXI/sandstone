# SWR Data Fetching Implementation for Sandstone

This directory contains the optimized data fetching implementation using SWR (Stale-While-Revalidate) for the Sandstone app.

## Features

- **Intelligent Caching**: Automatic caching with configurable strategies per entity type
- **Optimistic Updates**: UI updates immediately before API confirmation
- **Error Retry**: Exponential backoff retry logic for failed requests
- **Automatic Revalidation**: Background data refresh on focus, reconnect, and intervals
- **Request Deduplication**: Prevents duplicate concurrent requests
- **TypeScript Support**: Fully typed hooks and responses

## Installation

```bash
npm install swr
```

## Setup

### 1. Add SWR Provider to your layout

```tsx
// app/layout.tsx
import { SWRProvider } from '@/lib/swr';

export default function RootLayout({ children }) {
  return (
    <SWRProvider>
      {children}
    </SWRProvider>
  );
}
```

### 2. Configure SWR (optional)

```tsx
// app/layout.tsx
import { SWRProvider } from '@/lib/swr';

export default function RootLayout({ children }) {
  return (
    <SWRProvider 
      config={{
        refreshInterval: 30000, // Custom refresh interval
        errorRetryCount: 5,     // Custom retry count
      }}
      fallback={{
        // Preload data from SSR
        '/api/user': userData,
      }}
    >
      {children}
    </SWRProvider>
  );
}
```

## Usage

### Documents

```tsx
import { 
  useDocuments, 
  useDocument, 
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument 
} from '@/hooks';

// List all documents
function DocumentList() {
  const { data: documents, error, isLoading } = useDocuments();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {documents?.map(doc => (
        <li key={doc.id}>{doc.title}</li>
      ))}
    </ul>
  );
}

// Single document
function DocumentView({ id }: { id: string }) {
  const { data: document, isLoading } = useDocument(id);
  return <div>{document?.title}</div>;
}

// Create document with optimistic update
function CreateDocumentButton() {
  const { trigger: createDocument, isMutating } = useCreateDocument();
  
  const handleCreate = async () => {
    await createDocument({ 
      title: 'New Document',
      subject: 'economics' 
    });
  };
  
  return (
    <button onClick={handleCreate} disabled={isMutating}>
      Create Document
    </button>
  );
}

// Update document
function UpdateDocumentButton({ id }: { id: string }) {
  const { trigger: updateDocument } = useUpdateDocument();
  
  const handleUpdate = async () => {
    await updateDocument({
      id,
      updates: { title: 'Updated Title' }
    });
  };
  
  return <button onClick={handleUpdate}>Update</button>;
}

// Delete document
function DeleteDocumentButton({ id }: { id: string }) {
  const { trigger: deleteDocument } = useDeleteDocument();
  
  const handleDelete = async () => {
    await deleteDocument(id);
  };
  
  return <button onClick={handleDelete}>Delete</button>;
}
```

### Flashcards

```tsx
import { 
  useFlashcards, 
  useDueFlashcards,
  useCreateFlashcard,
  useReviewFlashcard 
} from '@/hooks';

// Study due flashcards
function StudySession() {
  const { data: dueCards } = useDueFlashcards();
  const { trigger: reviewCard } = useReviewFlashcard();
  
  const handleReview = async (cardId: string, quality: number) => {
    // quality: 0-5 (0 = complete blackout, 5 = perfect response)
    await reviewCard({ id: cardId, quality });
  };
  
  return (
    <div>
      <h2>Due for Review: {dueCards?.length || 0}</h2>
      {/* Study UI */}
    </div>
  );
}
```

### Quizzes

```tsx
import { 
  useQuizzes, 
  useQuizAttempts,
  useCreateQuiz,
  useSubmitQuizAttempt 
} from '@/hooks';

// Quiz list with attempts
function QuizDashboard() {
  const { data: quizzes } = useQuizzes();
  
  return (
    <div>
      {quizzes?.map(quiz => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const { data: attempts } = useQuizAttempts(quiz.id);
  const { trigger: submitAttempt } = useSubmitQuizAttempt();
  
  const handleSubmit = async (answers: Record<string, string>) => {
    await submitAttempt({
      quizId: quiz.id,
      answers,
      timeSpent: 120, // seconds
    });
  };
  
  return (
    <div>
      <h3>{quiz.title}</h3>
      <p>Attempts: {attempts?.length || 0}</p>
      {/* Quiz UI */}
    </div>
  );
}
```

### User Data

```tsx
import { 
  useUser, 
  useUserProfile,
  useUserSettings,
  useUpdateProfile,
  useUpdateSettings 
} from '@/hooks';

function UserProfile() {
  const { data: user } = useUser();
  const { data: profile } = useUserProfile();
  const { data: settings } = useUserSettings();
  const { trigger: updateProfile } = useUpdateProfile();
  
  const handleUpdateName = async (fullName: string) => {
    await updateProfile({ fullName });
  };
  
  return (
    <div>
      <h1>{profile?.fullName || user?.email}</h1>
      <p>Theme: {settings?.theme}</p>
    </div>
  );
}
```

### Chat

```tsx
import { useChat, useRealtimeChatMessages } from '@/hooks';

function ChatInterface() {
  const {
    sessions,
    currentSession,
    messages,
    isLoading,
    isSending,
    sendMessage,
    createSession,
    deleteSession,
    switchSession,
  } = useChat();
  
  // Real-time updates are automatically enabled
  
  return (
    <div>
      <SessionList 
        sessions={sessions} 
        currentId={currentSession?.id}
        onSwitch={switchSession}
      />
      <MessageList messages={messages} />
      <MessageInput 
        onSend={sendMessage} 
        disabled={isSending} 
      />
    </div>
  );
}
```

### Folders

```tsx
import { 
  useFolders, 
  useFolderTree,
  useCreateFolder,
  useMoveFolder,
  getFolderPath 
} from '@/hooks';

function FolderTree() {
  const { data: tree } = useFolderTree();
  const { data: allFolders } = useFolders();
  const { trigger: createFolder } = useCreateFolder();
  const { trigger: moveFolder } = useMoveFolder();
  
  const handleCreate = async (name: string, parentId?: string) => {
    await createFolder({ name, parentId });
  };
  
  const handleMove = async (folderId: string, newParentId: string | null) => {
    await moveFolder({ folderId, newParentId });
  };
  
  // Get breadcrumb path
  const breadcrumb = folderId ? getFolderPath(allFolders || [], folderId) : [];
  
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb path={breadcrumb} />
      
      {/* Folder tree */}
      <TreeView 
        folders={tree || []} 
        onMove={handleMove}
      />
    </div>
  );
}
```

## Cache Configuration

Different entity types have different cache strategies:

| Entity Type | Refresh Interval | Deduping | Revalidate on Focus |
|------------|------------------|----------|---------------------|
| User | 10 minutes | 5s | No |
| Documents | 30 seconds | 1s | Yes |
| Flashcards | 30 seconds | 1s | Yes |
| Quizzes | 30 seconds | 1s | Yes |
| Chat | Manual/Realtime | 500ms | Yes |
| Static Data | Never | 1 minute | No |

## Error Handling

All hooks include built-in error handling with retry logic:

```tsx
function DocumentList() {
  const { data, error, isLoading } = useDocuments();
  
  if (isLoading) return <Loading />;
  
  if (error) {
    // Error will be retried automatically with exponential backoff
    // 4xx errors are not retried
    return (
      <ErrorDisplay 
        message={error.message}
        retry={() => window.location.reload()}
      />
    );
  }
  
  return <DocumentList data={data} />;
}
```

## Optimistic Updates

Mutations automatically update the cache optimistically:

```tsx
const { trigger: createDocument } = useCreateDocument();

// When called:
// 1. Cache is updated immediately with new document
// 2. UI shows new document instantly
// 3. API request is made in background
// 4. On success: cache is confirmed
// 5. On error: cache is rolled back, error shown
```

## Manual Cache Revalidation

```tsx
import { revalidateDocument, revalidateUser } from '@/hooks';

// Revalidate specific document
await revalidateDocument('doc-id');

// Revalidate all documents
await revalidateDocument();

// Revalidate user data
await revalidateUser();
```

## Cache Keys

All cache keys are centralized in `lib/swr/config.ts`:

```tsx
import { cacheKeys } from '@/lib/swr';

// Access cache keys
cacheKeys.documents
cacheKeys.document('doc-id')
cacheKeys.flashcards
cacheKeys.userProfile
```

## Best Practices

1. **Use the right hook for your use case**:
   - `useDocuments()` - List all documents
   - `useDocument(id)` - Single document
   - `useDocumentsInFolder(folderId)` - Filtered list

2. **Handle loading and error states**:
   ```tsx
   const { data, error, isLoading } = useDocuments();
   if (isLoading) return <Loading />;
   if (error) return <Error />;
   ```

3. **Use mutations for updates**:
   ```tsx
   const { trigger, isMutating } = useCreateDocument();
   ```

4. **Leverage optimistic updates**:
   - Mutations automatically handle optimistic updates
   - No manual cache management needed

5. **Use real-time subscriptions where needed**:
   ```tsx
   useRealtimeChatMessages(sessionId);
   ```

## Performance Tips

1. **Component-level caching**: Data is shared across components using the same key
2. **Automatic deduplication**: Concurrent requests for the same key are merged
3. **Background revalidation**: Stale data is refreshed in the background
4. **Keep previous data**: `keepPreviousData` prevents UI flicker

## API Reference

See individual hook files for complete API documentation:
- `useDocuments.ts` - Document CRUD operations
- `useFolders.ts` - Folder management with tree structure
- `useFlashcards.ts` - Flashcards with SM2 algorithm
- `useQuizzes.ts` - Quiz creation and attempts
- `useUser.ts` - User profile and settings
- `useChat.ts` - Chat with real-time updates
