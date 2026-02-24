# Data Fetching Optimization Implementation

## Overview

This document describes the optimized data fetching implementation for the Sandstone app using SWR (Stale-While-Revalidate).

## Files Created

### Core SWR Configuration

| File | Description |
|------|-------------|
| `/mnt/okcomputer/lib/swr/config.ts` | SWR configuration, cache keys, fetchers, and retry logic |
| `/mnt/okcomputer/lib/swr/provider.tsx` | SWR Provider component for app-wide configuration |
| `/mnt/okcomputer/lib/swr/index.ts` | SWR library exports |
| `/mnt/okcomputer/lib/swr/README.md` | Comprehensive documentation |

### Data Fetching Hooks

| File | Description | Features |
|------|-------------|----------|
| `/mnt/okcomputer/hooks/useDocuments.ts` | Document CRUD operations | Caching, optimistic updates, folder-based queries |
| `/mnt/okcomputer/hooks/useFolders.ts` | Folder management | Tree structure, hierarchical operations |
| `/mnt/okcomputer/hooks/useFlashcards.ts` | Flashcard operations | SM2 algorithm integration, deck management |
| `/mnt/okcomputer/hooks/useQuizzes.ts` | Quiz operations | Attempt tracking, scoring |
| `/mnt/okcomputer/hooks/useUser.ts` | User data management | Profile, settings, stats |
| `/mnt/okcomputer/hooks/useChat.ts` | Chat operations | Real-time subscriptions, session management |

### Updated Files

| File | Changes |
|------|---------|
| `/mnt/okcomputer/hooks/index.ts` | Added exports for all new SWR hooks |

## Key Features Implemented

### 1. SWR Configuration

```typescript
// Global SWR config with optimized settings
export const globalSWRConfig: SWRConfiguration = {
  refreshInterval: 5 * 60 * 1000,     // 5 minutes
  dedupingInterval: 2000,              // 2 seconds
  keepPreviousData: true,              // Prevent UI flicker
  shouldRetryOnError: retryWithBackoff, // Custom retry logic
  errorRetryCount: 3,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};
```

### 2. Entity-Specific Configurations

| Entity | Refresh Interval | Deduping | Focus Revalidation |
|--------|-----------------|----------|-------------------|
| User | 10 minutes | 5s | No |
| Documents | 30 seconds | 1s | Yes |
| Flashcards | 30 seconds | 1s | Yes |
| Quizzes | 30 seconds | 1s | Yes |
| Chat | Manual | 500ms | Yes |
| Static | Never | 1 minute | No |

### 3. Error Retry Logic

```typescript
// Exponential backoff with jitter
export const getRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  const delay = baseDelay * Math.pow(2, retryCount);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, 30000); // Max 30s
};

// Don't retry 4xx errors (client errors)
export const retryWithBackoff = (error: Error): boolean => {
  if (error.message.includes('4')) return false;
  return true;
};
```

### 4. Optimistic Updates

All mutation hooks include optimistic updates:

```typescript
// Example: useCreateDocument
export function useCreateDocument() {
  return useSWRMutation(
    cacheKeys.documents,
    createDocument,
    {
      onSuccess: (data) => {
        // Update cache immediately
        globalMutate(
          cacheKeys.documents,
          (current) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        toast.success('Document created');
      },
      onError: (error) => {
        // Rollback happens automatically
        toast.error(`Failed: ${error.message}`);
      },
    }
  );
}
```

### 5. Cache Management

Centralized cache keys and mutation helpers:

```typescript
export const cacheKeys = {
  documents: 'documents',
  document: (id: string) => `document/${id}`,
  documentsInFolder: (folderId: string | null) => `documents/folder/${folderId ?? 'root'}`,
  // ... more keys
};

export const cacheMutations = {
  addToList: <T extends { id: string }>(current: T[] | undefined, newItem: T): T[] =>
    current ? [newItem, ...current] : [newItem],
  updateInList: <T extends { id: string }>(current: T[] | undefined, updatedItem: T): T[] =>
    current?.map((item) => (item.id === updatedItem.id ? updatedItem : item)) || [updatedItem],
  removeFromList: <T extends { id: string }>(current: T[] | undefined, itemId: string): T[] =>
    current?.filter((item) => item.id !== itemId) || [],
};
```

### 6. Real-time Subscriptions

Chat hooks include real-time message updates:

```typescript
export function useRealtimeChatMessages(sessionId: string | null) {
  const { mutate } = useChatMessages(sessionId);

  useEffect(() => {
    if (!sessionId) return;

    const subscription = supabase
      .channel(`chat_messages:${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
        // Update cache with new message
        mutate((current) => [...current, newMessage], { revalidate: false });
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [sessionId, mutate]);
}
```

## Usage Examples

### Basic Data Fetching

```tsx
import { useDocuments, useDocument } from '@/hooks';

function DocumentList() {
  const { data: documents, error, isLoading } = useDocuments();
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {documents?.map(doc => <li key={doc.id}>{doc.title}</li>)}
    </ul>
  );
}
```

### Mutations with Optimistic Updates

```tsx
import { useCreateDocument } from '@/hooks';

function CreateButton() {
  const { trigger: create, isMutating } = useCreateDocument();
  
  const handleClick = async () => {
    await create({ title: 'New Document', subject: 'economics' });
  };
  
  return (
    <button onClick={handleClick} disabled={isMutating}>
      {isMutating ? 'Creating...' : 'Create'}
    </button>
  );
}
```

### Real-time Chat

```tsx
import { useChat } from '@/hooks';

function Chat() {
  const { messages, sendMessage, isSending } = useChat();
  
  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={isSending} />
    </div>
  );
}
```

## Benefits Over Previous Implementation

### Before (Custom Hooks)
- Manual state management
- No built-in caching
- Custom error handling needed
- No automatic revalidation
- Duplicated request logic

### After (SWR Hooks)
- Automatic caching with configurable strategies
- Built-in error retry with exponential backoff
- Automatic background revalidation
- Request deduplication
- Optimistic updates
- TypeScript support
- Smaller bundle size (SWR is lightweight)

## Migration Guide

### Step 1: Install SWR
```bash
npm install swr
```

### Step 2: Add Provider
```tsx
// app/layout.tsx
import { SWRProvider } from '@/lib/swr';

export default function Layout({ children }) {
  return <SWRProvider>{children}</SWRProvider>;
}
```

### Step 3: Replace Custom Hooks
```tsx
// Before
const { data, error, isLoading } = useSupabaseQuery({ query: ... });

// After
const { data, error, isLoading } = useDocuments();
```

### Step 4: Update Mutations
```tsx
// Before
const createDocument = async (params) => {
  const { error } = await supabase.from('documents').insert(params);
  if (error) throw error;
  // Manual cache update needed
};

// After
const { trigger: createDocument } = useCreateDocument();
// Automatic optimistic updates and cache management
```

## Performance Improvements

1. **Reduced API Calls**: Deduplication prevents duplicate requests
2. **Faster UI**: Optimistic updates show changes immediately
3. **Better UX**: Background revalidation keeps data fresh
4. **Error Resilience**: Automatic retry with exponential backoff
5. **Bandwidth Savings**: Smart caching reduces unnecessary requests

## Testing

Test the implementation with:

```tsx
// Test caching
const { data: data1 } = useDocuments();
const { data: data2 } = useDocuments(); // Same request, cached result

// Test optimistic updates
const { trigger: create } = useCreateDocument();
await create({ title: 'Test' }); // UI updates immediately

// Test error handling
// Simulate network error, should retry 3 times with backoff
```

## Future Enhancements

1. **Prefetching**: Prefetch data on hover/link prefetch
2. **Pagination**: Infinite scroll with `useSWRInfinite`
3. **Offline Support**: Persist cache to localStorage/IndexedDB
4. **Optimistic UI**: More sophisticated rollback strategies
5. **Analytics**: Track cache hit rates and API usage
