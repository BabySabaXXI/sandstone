# Sandstone App - Import/Export Fix Guide

## Summary of Issues Fixed

### 1. Missing Exports in Barrel Files

#### `stores/index.ts`
- **Issue**: Missing `useChatStore` export
- **Fix**: Added export for `useChatStore` and related types

#### `components/layout/index.ts`
- **Issue**: Missing exports for `AIChat` and `SubjectSwitcher`
- **Fix**: Added exports for both components

#### `components/ui/index.ts`
- **Issue**: Empty barrel file with no exports
- **Fix**: Added proper structure with `cn` utility re-export

### 2. Missing Barrel File

#### `lib/subjects/index.ts`
- **Issue**: Barrel file did not exist
- **Fix**: Created new barrel file exporting all subject-related functions

### 3. Enhanced Type Exports

#### `types/index.ts`
- **Issue**: Missing `Chat` and `ChatMessage` types
- **Fix**: Added chat-related types and organized all exports

### 4. Enhanced Utility Exports

#### `lib/utils.ts`
- **Issue**: Only had `cn` function
- **Fix**: Added additional utility functions (formatDate, truncateText, etc.)

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `stores/index.ts` | Modified | Added `useChatStore` export |
| `components/layout/index.ts` | Modified | Added `AIChat`, `SubjectSwitcher` exports |
| `components/ui/index.ts` | Modified | Added proper structure |
| `lib/subjects/index.ts` | Created | New barrel file |
| `types/index.ts` | Enhanced | Added chat types, organized exports |
| `lib/utils.ts` | Enhanced | Added utility functions |
| `lib/api/index.ts` | Enhanced | Added type exports |
| `lib/kimi/index.ts` | Enhanced | Added type exports |
| `lib/examiners/index.ts` | Enhanced | Added economics-config exports |
| `lib/supabase/index.ts` | Created | New barrel file for convenience |

## Recommended Import Patterns

### Before (Inconsistent)
```typescript
// Some files import directly from store files
import { useChatStore } from "@/stores/chat-store";

// Some import from barrel files
import { useEssayStore } from "@/stores";

// Some import from config directly
import { subjects } from "@/lib/subjects/config";
```

### After (Consistent)
```typescript
// Import all stores from barrel file
import { useChatStore, useEssayStore } from "@/stores";

// Import subjects from barrel file
import { subjects, getSubjectConfig } from "@/lib/subjects";

// Import types from types barrel
import { Subject, Chat, EssayResponse } from "@/types";

// Import components from barrel files
import { AIChat, SubjectSwitcher, Sidebar } from "@/components/layout";
import { Flashcard, DeckManager } from "@/components/flashcards";
```

## Path Alias Configuration

The `tsconfig.json` already has the correct path alias configuration:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Circular Dependency Check

✅ No circular dependencies detected in the codebase.

## Import Organization Best Practices

1. **Order imports by category:**
   ```typescript
   // 1. External libraries (React, Next.js, etc.)
   import React from "react";
   import { NextPage } from "next";
   
   // 2. Internal barrel exports (@/components, @/stores, etc.)
   import { useAuth } from "@/components/auth-provider";
   import { useEssayStore } from "@/stores";
   
   // 3. Internal direct imports (if needed)
   import { specificFunction } from "@/lib/some-file";
   
   // 4. Relative imports
   import { MyComponent } from "./MyComponent";
   
   // 5. CSS imports
   import "./styles.css";
   ```

2. **Use barrel files for cleaner imports:**
   - Prefer `@/stores` over `@/stores/specific-store`
   - Prefer `@/components/layout` over `@/components/layout/SpecificComponent`

3. **Export types explicitly:**
   ```typescript
   export type { MyType } from "./file";
   ```

## Updated Import Patterns by File

### app/page.tsx
```typescript
// Current imports (working)
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { AIChat } from "@/components/layout/AIChat";

// Can now be simplified to:
import { ThreePanel, SubjectSwitcher, AIChat } from "@/components/layout";
```

### components/layout/AIChat.tsx
```typescript
// Current imports (working)
import { useChatStore } from "@/stores/chat-store";

// Can now use:
import { useChatStore } from "@/stores";
```

### components/layout/SubjectSwitcher.tsx
```typescript
// Current imports (working)
import { subjects, getSubjectConfig } from "@/lib/subjects/config";

// Can now use:
import { subjects, getSubjectConfig } from "@/lib/subjects";
```

## Verification Steps

1. Run TypeScript type checking:
   ```bash
   npm run type-check
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Check for any import errors in the console

## Notes

- All existing imports will continue to work (backward compatible)
- New barrel file imports are optional but recommended for consistency
- No breaking changes to the existing codebase
