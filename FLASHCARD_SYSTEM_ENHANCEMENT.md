# Enhanced Flashcard System Documentation

## Overview

The enhanced flashcard system for Sandstone provides a complete, production-ready implementation with:

- **Enhanced SM-2 Algorithm**: FSRS-inspired improvements with difficulty tracking and adaptive intervals
- **Multiple Study Modes**: Standard, Cram, Review, and Learn modes
- **Comprehensive Progress Tracking**: Streaks, achievements, activity heatmaps
- **Improved Deck Management**: Search, filter, sort, and organize decks
- **Offline Support**: Pending operations queue with automatic sync

## File Structure

```
/mnt/okcomputer/
├── lib/flashcards/
│   ├── sm2-enhanced.ts    # Enhanced SM-2 algorithm
│   └── index.ts           # Library exports
├── stores/
│   └── flashcard-store-enhanced.ts  # Zustand store
└── components/flashcards/enhanced/
    ├── Flashcard.tsx       # Interactive flashcard component
    ├── StudyMode.tsx       # Study session component
    ├── DeckManager.tsx     # Deck management UI
    ├── ProgressTracker.tsx # Progress tracking UI
    └── index.ts            # Component exports
```

## Enhanced SM-2 Algorithm

### Key Improvements

1. **Difficulty Tracking**: Cards now track difficulty (0-1) based on performance
2. **Stability Factor**: Memory stability in days for better interval calculation
3. **Lapses Tracking**: Number of times a card was forgotten
4. **Relearning Phase**: Special handling for cards that were forgotten
5. **Enhanced Ease Factor**: More nuanced adjustments based on quality ratings

### Usage

```typescript
import { calculateSM2Enhanced, getCardStatus, isCardMastered } from '@/lib/flashcards/sm2-enhanced';

// Calculate next review
const result = calculateSM2Enhanced(
  quality,           // 0-5 rating
  currentInterval,   // days
  repetitionCount,   // successful reviews
  easeFactor,        // current ease factor
  lapses             // times forgotten
);

// Get card status
const status = getCardStatus(card); // 'new' | 'learning' | 'review' | 'relearning'

// Check if mastered
const mastered = isCardMastered(card);
```

## Study Modes

### Available Modes

1. **Standard**: Review all due cards in order
2. **Cram**: Focus on difficult cards with shuffling
3. **Review**: Only review cards already in the review phase
4. **Learn**: Focus on new cards only

### Configuration Options

```typescript
interface StudyModeConfig {
  mode: StudyMode;
  cardLimit?: number;        // Max cards to study (0 = unlimited)
  timeLimit?: number;        // Session time limit in minutes
  includeNew?: boolean;      // Include new cards
  includeReview?: boolean;   // Include review cards
  includeLearning?: boolean; // Include learning cards
  shuffle?: boolean;         // Shuffle card order
  focusOnWeak?: boolean;     // Prioritize weak cards
}
```

## Store Usage

### Basic Operations

```typescript
import { useFlashcardStore } from '@/stores/flashcard-store-enhanced';

function MyComponent() {
  const { 
    decks, 
    createDeck, 
    addCard, 
    startStudySession,
    reviewCard,
    getDeckStats 
  } = useFlashcardStore();

  // Create a deck
  const deck = await createDeck('Economics', 'Basic concepts', 'economics');

  // Add a card
  await addCard(deck.id, 'What is supply?', 'The amount of goods available');

  // Start studying
  startStudySession(deck.id, 'standard');

  // Review a card
  await reviewCard(cardId, 4); // 4 = Easy

  // Get stats
  const stats = getDeckStats(deck.id);
}
```

### Selector Hooks

```typescript
import { 
  useDeck, 
  useDecksBySubject, 
  useDueCards,
  useDeckStats,
  useStudyProgress,
  useGlobalStats 
} from '@/stores/flashcard-store-enhanced';

// Get specific deck
const deck = useDeck(deckId);

// Get decks by subject
const economicsDecks = useDecksBySubject('economics');

// Get due cards
const dueCards = useDueCards(deckId);

// Get deck stats
const stats = useDeckStats(deckId);

// Get study progress
const progress = useStudyProgress();

// Get global stats
const globalStats = useGlobalStats();
```

## Components

### Flashcard

```tsx
import { Flashcard } from '@/components/flashcards/enhanced';

<Flashcard
  id={card.id}
  front={card.front}
  back={card.back}
  interval={card.interval}
  repetitionCount={card.repetitionCount}
  easeFactor={card.easeFactor}
  onRate={(quality, timeSpent) => handleRate(quality, timeSpent)}
  onBookmark={(id) => handleBookmark(id)}
  isBookmarked={false}
  showRating={true}
  showShortcuts={true}
  flipOnSpace={true}
/>
```

### StudyMode

```tsx
import { StudyMode } from '@/components/flashcards/enhanced';

<StudyMode
  deckId={deckId}
  onExit={() => setShowStudyMode(false)}
  initialMode="standard"
/>
```

### DeckManager

```tsx
import { DeckManager } from '@/components/flashcards/enhanced';

<DeckManager
  onSelectDeck={(deckId) => navigateToDeck(deckId)}
  onStudyDeck={(deckId) => startStudying(deckId)}
/>
```

### ProgressTracker

```tsx
import { ProgressTracker } from '@/components/flashcards/enhanced';

// Global progress
<ProgressTracker />

// Deck-specific progress
<ProgressTracker deckId={deckId} />
```

## Progress Tracking

### Tracked Metrics

- **Daily Stats**: Cards reviewed, correct count, time spent
- **Streaks**: Current and longest study streaks
- **Achievements**: Unlockable milestones
- **Activity Heatmap**: Visual study history

### Achievements

1. **First Steps**: Review 10 cards
2. **Dedicated Learner**: Complete 10 sessions
3. **Streak Master**: 7-day streak
4. **Card Collector**: Create 50 cards
5. **Mastery**: Master 100 cards

## Database Schema

### flashcard_decks

```sql
create table flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  subject text not null,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### flashcards

```sql
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references flashcard_decks on delete cascade not null,
  user_id uuid references auth.users not null,
  front text not null,
  back text not null,
  tags text[] default '{}',
  interval integer default 0,
  repetition_count integer default 0,
  ease_factor decimal default 2.5,
  difficulty decimal default 0.3,
  stability decimal default 0,
  lapses integer default 0,
  next_review timestamptz,
  last_reviewed timestamptz,
  review_history jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Migration from Old Store

### Step 1: Update imports

```typescript
// Old
import { useFlashcardStore } from '@/stores/flashcard-store';

// New
import { useFlashcardStore } from '@/stores/flashcard-store-enhanced';
```

### Step 2: Update card interface

The new store adds these fields to cards:
- `difficulty`: number (0-1)
- `stability`: number (days)
- `lapses`: number
- `reviewHistory`: ReviewHistoryEntry[]

### Step 3: Update review calls

```typescript
// Old
reviewCard(deckId, cardId, quality);

// New
reviewCard(cardId, quality, timeSpent);
```

## Keyboard Shortcuts

### During Study

- `Space`: Flip card
- `1-5`: Rate card (1=Again, 5=Perfect)
- `P`: Pause session
- `S`: Skip card
- `Esc`: Exit session

## Performance Optimizations

1. **Memoized Components**: All components use React.memo
2. **Selector Hooks**: Optimized re-renders with Zustand selectors
3. **Lazy Loading**: Components loaded on demand
4. **Virtual Lists**: For large card collections

## Troubleshooting

### Common Issues

1. **Cards not appearing**: Check `nextReview` date and `getDueCards` filter
2. **Stats not updating**: Ensure `reviewCard` is being called correctly
3. **Sync failures**: Check `pendingOperations` queue and retry logic

### Debug Mode

```typescript
// Enable debug logging
useFlashcardStore.setState({ debug: true });

// Check store state
const state = useFlashcardStore.getState();
console.log(state);
```

## Future Enhancements

1. **Audio Support**: Text-to-speech for cards
2. **Image Cards**: Support for image-based flashcards
3. **Shared Decks**: Public deck sharing
4. **AI Generation**: Auto-generate cards from documents
5. **Mobile App**: React Native implementation
