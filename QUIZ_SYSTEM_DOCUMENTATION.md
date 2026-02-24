# Enhanced Quiz System Documentation

## Overview

The enhanced quiz system for Sandstone provides a comprehensive solution for creating, managing, and analyzing quizzes with support for multiple question types, advanced scoring, and detailed analytics.

## Features

### Question Types (11 Types)

1. **Multiple Choice** - Single correct answer from options
2. **Multiple Select** - Multiple correct answers with partial credit support
3. **True/False** - Binary choice questions
4. **Fill in the Blank** - Text with blanks to fill
5. **Short Answer** - Brief text responses with keyword matching
6. **Matching** - Match items from two columns
7. **Ordering** - Arrange items in correct sequence
8. **Essay** - Long-form written responses with word limits
9. **Calculation** - Numerical problems with tolerance
10. **Diagram Label** - Label parts of a diagram
11. **Case Study** - Multi-part questions based on a scenario

### Scoring System

- **Weighted Questions** - Assign different point values to questions
- **Partial Credit** - Support for partially correct answers
- **Tolerance** - Accept numerical answers within a range
- **Keyword Matching** - Grade short answers based on keywords
- **Manual Grading** - Support for essay questions

### Quiz Settings

- Time limits
- Passing score thresholds
- Question shuffling
- Answer visibility options
- Retake permissions
- Copy/paste prevention

### Analytics & Reporting

- Score distribution
- Question-level performance
- Time analysis
- Pass/fail rates
- Discrimination indices
- Study streaks
- Progress tracking

## File Structure

```
lib/quiz/
├── index.ts              # Main exports
├── quiz-types.ts         # TypeScript type definitions
├── quiz-engine.ts        # Core scoring and validation logic
├── quiz-creator.ts       # Quiz creation utilities
├── quiz-analytics.ts     # Analytics and reporting
└── quiz-hooks.ts         # React hooks for quiz functionality

components/quiz/
├── QuizCard.tsx          # Quiz display card
├── QuizPlayer.tsx        # Quiz taking interface
├── QuizResults.tsx       # Results display
├── QuizCreator.tsx       # Quiz creation interface
├── QuizAnalytics.tsx     # Analytics dashboard
├── QuestionEditor.tsx    # Question editing component
└── questions/            # Question type components
    ├── MultipleChoiceQuestion.tsx
    ├── MultipleSelectQuestion.tsx
    ├── TrueFalseQuestion.tsx
    ├── FillBlankQuestion.tsx
    ├── ShortAnswerQuestion.tsx
    ├── MatchingQuestion.tsx
    ├── OrderingQuestion.tsx
    ├── EssayQuestion.tsx
    └── CalculationQuestion.tsx
```

## Usage Examples

### Creating a Quiz

```typescript
import { createQuiz, addQuestion, createMultipleChoiceQuestion } from '@/lib/quiz';

const quiz = createQuiz({
  title: 'Economics Fundamentals',
  description: 'Test your knowledge of basic economics',
  subject: 'economics',
}, userId);

const question = createMultipleChoiceQuestion({
  question: 'What is the law of supply and demand?',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswer: 'Option A',
  explanation: 'The law states that...',
  difficulty: 'medium',
  points: 2,
});

const updatedQuiz = addQuestion(quiz, question);
```

### Using Quiz Hooks

```typescript
import { useQuiz, useQuizSession, useCreateQuiz } from '@/lib/quiz';

// Fetch a quiz
const { data: quiz, isLoading } = useQuiz(quizId);

// Create a quiz
const { trigger: createQuiz } = useCreateQuiz();

// Quiz session
const {
  startSession,
  answerQuestion,
  submitQuiz,
  currentQuestion,
  progress,
} = useQuizSession(quizId);
```

### Quiz Player Component

```tsx
import { QuizPlayer } from '@/components/quiz/QuizPlayer';

function QuizPage({ quiz }) {
  return (
    <QuizPlayer
      quiz={quiz}
      onComplete={(score, passed) => {
        console.log(`Score: ${score}%, Passed: ${passed}`);
      }}
      onExit={() => router.push('/quizzes')}
    />
  );
}
```

### Quiz Creator Component

```tsx
import { QuizCreator } from '@/components/quiz/QuizCreator';

function CreateQuizPage() {
  return (
    <QuizCreator
      onSave={(quiz) => console.log('Saved:', quiz)}
      onPublish={(quiz) => console.log('Published:', quiz)}
      onCancel={() => router.back()}
    />
  );
}
```

### Analytics

```typescript
import { generateQuizAnalytics, generateUserQuizStats } from '@/lib/quiz';

// Generate quiz analytics
const analytics = generateQuizAnalytics(quiz, attempts);

// Generate user statistics
const userStats = generateUserQuizStats(userId, allAttempts, quizzes);

// Performance analysis
const performance = analyzePerformance(userId, quiz, attempts);
```

## Database Schema

### Quizzes Table

```sql
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  subject text not null,
  source_type text default 'manual',
  source_id text,
  questions jsonb not null default '[]',
  settings jsonb not null default '{}',
  status text default 'draft',
  tags text[] default '{}',
  attempt_count integer default 0,
  average_score integer default 0,
  average_time_spent integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);
```

### Quiz Attempts Table

```sql
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes not null,
  user_id uuid references auth.users not null,
  answers jsonb not null default '[]',
  score integer not null,
  max_score integer not null,
  percentage integer not null,
  passed boolean not null,
  status text default 'completed',
  time_spent integer not null,
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone,
  question_results jsonb,
  created_at timestamp with time zone default now()
);
```

## API Integration

The quiz system uses Supabase for data persistence with the following features:

- **Optimistic Updates** - UI updates immediately before server confirmation
- **SWR Caching** - Automatic caching and revalidation
- **Offline Support** - Pending operations queue for retry
- **Real-time Sync** - Live updates when data changes

## Security Considerations

1. **Row Level Security** - Users can only access their own quizzes
2. **Answer Protection** - Correct answers hidden during quiz taking
3. **Time Limits** - Server-side validation of time constraints
4. **Anti-Cheating** - Copy/paste prevention options

## Performance Optimizations

1. **Question Shuffling** - Client-side to reduce server load
2. **Lazy Loading** - Analytics computed on demand
3. **Pagination** - Large quiz lists paginated
4. **Caching** - SWR for efficient data fetching

## Future Enhancements

1. AI-powered question generation
2. Adaptive testing based on performance
3. Collaborative quiz creation
4. Quiz templates library
5. Export to LMS formats (Moodle, Canvas)
6. Proctoring integration
7. Accessibility improvements

## Migration Guide

### From Old Quiz System

1. Update type imports:
   ```typescript
   // Old
   import { Quiz, QuizQuestion } from '@/stores/types';
   
   // New
   import { Quiz, QuizQuestion } from '@/lib/quiz';
   ```

2. Update hook usage:
   ```typescript
   // Old
   const { data } = useQuizzes();
   
   // New
   const { data } = useQuizzes({ subject: 'economics' });
   ```

3. Update question structure:
   - Add `points` field to all questions
   - Update `correctAnswer` to appropriate type
   - Add `difficulty` field

## Contributing

When adding new question types:

1. Add type definition in `quiz-types.ts`
2. Add validation in `quiz-engine.ts`
3. Add creator function in `quiz-creator.ts`
4. Create question component in `components/quiz/questions/`
5. Update `QuizPlayer.tsx` to render new type
6. Update `QuestionEditor.tsx` with editing UI
