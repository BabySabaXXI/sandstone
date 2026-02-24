# Sandstone App - Barrel Exports Reference

Quick reference for all barrel file exports in the fixed codebase.

## Stores (`@/stores`)
```typescript
export { useEssayStore } from "./essay-store";
export type { Essay } from "./essay-store";

export { useFlashcardStore } from "./flashcard-store";
export type { Flashcard, FlashcardDeck } from "./flashcard-store";

export { useDocumentStore } from "./document-store";

export { useQuizStore } from "./quiz-store";

export { useLayoutStore } from "./layout-store";

export { useSubjectStore } from "./subject-store";

export { useChatStore } from "./chat-store";
export type { Chat, ChatMessage } from "./chat-store";
```

## Components

### Layout (`@/components/layout`)
```typescript
export { Sidebar } from "./Sidebar";
export { ThreePanel } from "./ThreePanel";
export { AIPopup, AIToggleButton } from "./AIPopup";
export { AIChat } from "./AIChat";
export { SubjectSwitcher } from "./SubjectSwitcher";
```

### Documents (`@/components/documents`)
```typescript
export { BlockEditor } from "./BlockEditor";
export { Block } from "./Block";
export { SlashCommand } from "./SlashCommand";
export { DocumentTree } from "./DocumentTree";
```

### Flashcards (`@/components/flashcards`)
```typescript
export { Flashcard } from "./Flashcard";
export { FlashcardDeck } from "./FlashcardDeck";
export { DeckManager } from "./DeckManager";
export { StudyMode } from "./StudyMode";
export { ProgressDashboard } from "./ProgressDashboard";
```

### Grading (`@/components/grading`)
```typescript
export { AgentCard } from "./AgentCard";
export { ScoreCard } from "./ScoreCard";
export { ExaminerSwarm } from "./ExaminerSwarm";
export { EssayHighlighter } from "./EssayHighlighter";
export { Annotation, AnnotationBadge } from "./Annotation";
export { FeedbackTooltip } from "./FeedbackTooltip";
export { FeedbackPanel } from "./FeedbackPanel";
export { FeedbackExport, ExportButton } from "./FeedbackExport";
export { ProgressIndicator, StepProgress } from "./ProgressIndicator";
```

### UI (`@/components/ui`)
```typescript
export { cn } from "@/lib/utils";
```

## Hooks (`@/hooks`)
```typescript
export { useAutoSave } from "./useAutoSave";
```

## Lib

### API (`@/lib/api`)
```typescript
export { checkRateLimit, getRateLimitHeaders } from "./rate-limit";
export type { RateLimitResult } from "./rate-limit";

export { handleAPIError, APIError, validateRequest } from "./error-handler";
export type { APIErrorOptions } from "./error-handler";
```

### Documents (`@/lib/documents`)
```typescript
export {
  blockTypes,
  createBlock,
  getBlockStyles,
  getPlaceholder,
} from "./blocks";
export type { BlockType } from "./blocks";
```

### Examiners (`@/lib/examiners`)
```typescript
export {
  getExaminers,
  economicsExaminers,
  geographyExaminers,
} from "./config";
export type { ExaminerConfig } from "./config";

export { gradingPrompts } from "./prompts";

export {
  getQuestionTypeConfig,
  calculateGrade,
  getExaminerPrompt,
  getDiagramFeedback,
} from "./economics-config";
export type { QuestionType, UnitCode } from "./economics-config";
```

### Flashcards (`@/lib/flashcards`)
```typescript
export {
  calculateSM2,
  getDueCards,
  calculateProgress,
} from "./sm2";
export type { SM2Card, SM2Result } from "./sm2";
```

### Kimi (`@/lib/kimi`)
```typescript
export {
  gradeEssayWithKimi,
  mockGradeEssay,
} from "./client";
export type { KimiMessage, KimiResponse } from "./client";
```

### Subjects (`@/lib/subjects`) - NEW
```typescript
export {
  subjects,
  defaultSubject,
  getSubjectConfig,
  getSubjectColor,
  getSubjectName,
} from "./config";
export type { SubjectConfig } from "@/types";
export type { Subject } from "@/types";
```

### Supabase (`@/lib/supabase`) - NEW
```typescript
export {
  supabase,
  isSupabaseConfigured,
} from "./client";

export { createClient } from "./server";
```

### Utils (`@/lib/utils`)
```typescript
export function cn(...inputs: ClassValue[]): string;
export function formatDate(date: Date | string): string;
export function formatDateTime(date: Date | string): string;
export function truncateText(text: string, maxLength: number): string;
export function generateId(): string;
export function deepClone<T>(obj: T): T;
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void;
export function isEmpty(value: unknown): boolean;
```

## Types (`@/types`)
```typescript
// Subject Types
export type Subject = "economics" | "geography";
export interface SubjectConfig { ... }

// Grading Types
export interface ExaminerScore { ... }
export interface Annotation { ... }
export interface GradingResult { ... }

// Flashcard Types
export interface Flashcard { ... }
export interface FlashcardDeck { ... }

// Document Types
export interface DocumentBlock { ... }
export interface Document { ... }
export interface Folder { ... }

// Quiz Types
export interface QuizQuestion { ... }
export interface Quiz { ... }
export interface QuizAttempt { ... }

// Essay/Response Types
export interface EssayResponse { ... }

// Layout Types
export interface PanelState { ... }

// User Types
export interface UserProfile { ... }

// Chat Types
export interface ChatMessage { ... }
export interface Chat { ... }

// Database Types
export interface DatabaseEssay { ... }
export interface DatabaseFlashcardDeck { ... }
export interface DatabaseFlashcard { ... }
export interface DatabaseDocument { ... }
export interface DatabaseFolder { ... }
export interface DatabaseQuiz { ... }
export interface DatabaseChat { ... }

// API Types (re-exported from api.ts)
export type { GradeRequest, GradeResponse, APIErrorResponse, RateLimitInfo };
```

## Import Quick Reference

| Import From | What's Available |
|-------------|------------------|
| `@/stores` | All store hooks and types |
| `@/components/layout` | Layout components (Sidebar, AIChat, etc.) |
| `@/components/documents` | Document system components |
| `@/components/flashcards` | Flashcard components |
| `@/components/grading` | Grading/feedback components |
| `@/components/ui` | UI utilities |
| `@/hooks` | Custom React hooks |
| `@/lib/api` | API utilities |
| `@/lib/documents` | Document block utilities |
| `@/lib/examiners` | Examiner configurations |
| `@/lib/flashcards` | SM-2 algorithm utilities |
| `@/lib/kimi` | Kimi API client |
| `@/lib/subjects` | Subject configurations |
| `@/lib/supabase` | Supabase clients |
| `@/lib/utils` | General utilities |
| `@/types` | All TypeScript types |
