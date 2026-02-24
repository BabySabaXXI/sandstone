# Sandstone Store Migration Guide

## Overview

This guide helps you migrate from the old Zustand stores to the new optimized stores.

## Key Changes

### 1. State Structure

**Before (Old):**
```typescript
// Flat array structure
interface DocumentStore {
  documents: Document[];  // Array lookup O(n)
  folders: Folder[];
}

// Access: O(n) linear search
const doc = documents.find(d => d.id === id);
```

**After (New):**
```typescript
// Normalized structure
interface DocumentStore {
  documents: {
    byId: Record<string, Document>;  // Hash lookup O(1)
    allIds: string[];
  };
}

// Access: O(1) direct lookup
const doc = documents.byId[id];
```

### 2. Selectors

**Before:**
```tsx
function DocumentList() {
  // Component re-renders when ANY document changes
  const documents = useDocumentStore(state => state.documents);
  const userDocs = documents.filter(d => d.userId === userId);
  // ...
}
```

**After:**
```tsx
import { selectDocumentsBySubject } from '@/stores';

function DocumentList({ subject }: { subject: Subject }) {
  // Component only re-renders when filtered documents change
  const documents = useDocumentStore(selectDocumentsBySubject(subject));
  // ...
}
```

### 3. Actions

**Before:**
```typescript
const store = create<DocumentStore>((set, get) => ({
  updateDocument: async (id, updates) => {
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    }));
    // Sync logic mixed with state update
    await supabase.from('documents').update(updates).eq('id', id);
  }
}));
```

**After:**
```typescript
const store = create<DocumentStore>()(
  immer((set, get) => ({
    updateDocument: async (id, updates) => {
      // Optimistic update
      set(state => {
        state.documents = updateEntity(state.documents, id, updates);
      });
      
      // Async sync with rollback on error
      try {
        await supabase.from('documents').update(updates).eq('id', id);
      } catch (error) {
        // Rollback
        set(state => {
          state.documents.byId[id] = previousDoc;
        });
      }
    }
  }))
);
```

## Migration Steps

### Step 1: Update Dependencies

Add `zustand/middleware/immer` for immutable updates:

```bash
npm install immer
```

### Step 2: Update Store Imports

**Before:**
```typescript
import { useDocumentStore } from './stores/document-store';
```

**After:**
```typescript
import { 
  useDocumentStore,
  selectDocumentById,
  selectAllDocuments 
} from '@/stores';
```

### Step 3: Update Component Usage

**Before:**
```tsx
function DocumentViewer({ documentId }: { documentId: string }) {
  const document = useDocumentStore(state => 
    state.documents.find(d => d.id === documentId)
  );
  const updateDocument = useDocumentStore(state => state.updateDocument);
  // ...
}
```

**After:**
```tsx
function DocumentViewer({ documentId }: { documentId: string }) {
  // Use selector for better performance
  const document = useDocumentStore(selectDocumentById(documentId));
  
  // Destructure only needed actions
  const { updateDocument } = useDocumentStore(
    state => ({ updateDocument: state.updateDocument }),
    shallow  // Use shallow comparison for objects
  );
  // ...
}
```

### Step 4: Update Array Operations

**Before:**
```typescript
// Direct mutation risk
addBlock: (documentId, type) => {
  set(state => {
    const doc = state.documents.find(d => d.id === documentId);
    if (doc) {
      doc.blocks.push(createBlock(type));  // Mutation!
    }
  });
}
```

**After:**
```typescript
// Immutable update with immer
addBlock: (documentId, type) => {
  set(state => {
    const doc = state.documents.byId[documentId];
    if (doc) {
      // Immer handles immutability
      doc.blocks.push(createBlock(type));
    }
  });
}
```

### Step 5: Update Persistence

**Before:**
```typescript
export const useStore = create(
  persist(
    (set, get) => ({ ... }),
    { name: 'store' }
  )
);
```

**After:**
```typescript
export const useStore = create(
  persist(
    (set, get) => ({ ... }),
    { 
      name: 'store',
      version: 2,  // Add version for migrations
      partialize: (state) => ({
        // Only persist necessary state
        data: state.data,
        settings: state.settings,
      }),
    }
  )
);
```

## Store-Specific Changes

### Document Store

| Feature | Before | After |
|---------|--------|-------|
| Structure | `documents: Document[]` | `documents: { byId, allIds }` |
| Getters | `getDocument(id)` | `selectDocumentById(id)` |
| Block ops | Inline | Separate methods |
| Sync | Immediate | Debounced |

### Flashcard Store

| Feature | Before | After |
|---------|--------|-------|
| Cards | Nested in decks | Separate normalized state |
| Study stats | Inline calculation | Memoized selector |
| SM-2 | Inline | Separate function |

### Quiz Store

| Feature | Before | After |
|---------|--------|-------|
| Attempts | `attempts: QuizAttempt[]` | `attempts: { byId, allIds }` |
| Current attempt | Separate state | Integrated |
| Stats | Inline | Memoized selector |

### Essay Store

| Feature | Before | After |
|---------|--------|-------|
| Grading | Manual update | `updateGradingResult()` method |
| Stats | None | `getSubjectStats()` method |

### Chat Store

| Feature | Before | After |
|---------|--------|-------|
| Messages | Nested in chats | Separate normalized state |
| AI generation | Inline | Separate method with loading state |
| Folders | String array | Managed with updates |

### Layout Store

| Feature | Before | After |
|---------|--------|-------|
| Position | Fixed | Draggable with bounds |
| Mobile | None | Full support |
| Persistence | All state | Selective |

### Subject Store

| Feature | Before | After |
|---------|--------|-------|
| History | None | Tracked |
| Preferences | None | Per-subject |
| Last used | None | Tracked |

## Common Patterns

### Pattern 1: Fetching Data

```typescript
// In component
useEffect(() => {
  fetchDocuments();
}, []);

// In store
fetchDocuments: async () => {
  set(state => { state.documents = setLoading(state.documents); });
  
  try {
    const { data } = await supabase.from('documents').select('*');
    const documents = data.map(mapToDocument);
    
    set(state => {
      state.documents = setEntities(state.documents, documents);
      state.documents = setSuccess(state.documents);
    });
  } catch (error) {
    set(state => {
      state.documents = setError(state.documents, createErrorState(error));
    });
  }
}
```

### Pattern 2: Optimistic Updates

```typescript
updateItem: async (id, updates) => {
  const previous = get().items.byId[id];
  
  // Optimistic update
  set(state => {
    state.items = updateEntity(state.items, id, updates);
  });
  
  try {
    await api.update(id, updates);
  } catch (error) {
    // Rollback
    set(state => {
      state.items.byId[id] = previous;
    });
    throw error;
  }
}
```

### Pattern 3: Using Selectors

```tsx
// Create selector outside component
const selectUserDocuments = (userId: string) => 
  createSelector(
    state => [state.documents.byId, state.documents.allIds, userId],
    (byId, allIds, uid) => allIds
      .map(id => byId[id])
      .filter(doc => doc?.userId === uid)
  );

// Use in component
function UserDocuments({ userId }: { userId: string }) {
  const documents = useDocumentStore(selectUserDocuments(userId));
  // ...
}
```

## Troubleshooting

### Issue: Components re-render too often

**Solution:** Use selectors and `shallow` comparison:

```tsx
const { action1, action2 } = useStore(
  state => ({ action1: state.action1, action2: state.action2 }),
  shallow
);
```

### Issue: State not persisting

**Solution:** Check `partialize` configuration:

```typescript
partialize: (state) => ({
  // Only include serializable state
  data: state.data,
  // Don't include functions or non-serializable data
})
```

### Issue: Type errors with immer

**Solution:** Use type assertion or update types:

```typescript
set(state => {
  // TypeScript may need help with nested updates
  (state as DocumentStore).documents.byId[id] = updatedDoc;
});
```

## Performance Tips

1. **Always use selectors** for accessing state
2. **Split large stores** into smaller, focused stores
3. **Use `partialize`** to limit persisted state
4. **Debounce frequent updates** (e.g., typing)
5. **Use `shallow`** for object comparisons
6. **Memoize expensive computations** in selectors

## Testing

```typescript
import { useDocumentStore } from '@/stores';

describe('DocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().reset();
  });

  it('should create a document', async () => {
    const id = await useDocumentStore.getState().createDocument({
      title: 'Test',
      subject: 'economics',
    });
    
    const doc = useDocumentStore.getState().documents.byId[id];
    expect(doc).toBeDefined();
    expect(doc.title).toBe('Test');
  });
});
```

## Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Immer Documentation](https://immerjs.github.io/immer/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
