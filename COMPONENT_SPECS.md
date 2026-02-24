# Sandstone Component Design Specifications

## Component Library Overview

This document provides detailed design specifications for all UI components in the Sandstone application.

---

## 1. Button Components

### PrimaryButton

**Usage:** Main call-to-action buttons

```tsx
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
```

**Design Specs:**
- Background: `bg-primary` (#E8D5C4)
- Text: `text-primary-foreground` (#1A1A17)
- Padding: `px-6 py-3` (md), `px-4 py-2` (sm), `px-8 py-4` (lg)
- Border Radius: `rounded-[10px]`
- Shadow: `shadow-soft-sm`
- Font: `font-medium text-sm`
- Hover: `bg-primary-hover shadow-soft-md`
- Active: `scale-[0.98] bg-primary-active`
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: Show spinner, disable interactions

**Example:**
```tsx
<PrimaryButton size="md" icon={<Sparkles className="w-4 h-4" />}>
  Grade Response
</PrimaryButton>
```

---

### SecondaryButton

**Usage:** Secondary actions, cancel buttons

```tsx
interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'outline' | 'ghost';
}
```

**Design Specs:**
- Outline: `bg-secondary border border-border`
- Ghost: `bg-transparent`
- Text: `text-secondary-foreground`
- Padding: `px-6 py-3`
- Border Radius: `rounded-[10px]`
- Hover: `bg-sand-200 border-sand-400`
- Active: `bg-sand-300`

---

### IconButton

**Usage:** Icon-only actions

```tsx
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label: string; // For accessibility
}
```

**Design Specs:**
- Size: `w-10 h-10` (md), `w-8 h-8` (sm), `w-12 h-12` (lg)
- Border Radius: `rounded-[10px]`
- Default: `bg-transparent text-sand-600`
- Hover: `bg-sand-100 text-sand-800`
- Active: `bg-sand-200 scale-[0.96]`

---

## 2. Card Components

### FeatureCard

**Usage:** Feature highlights on homepage

```tsx
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string; // Subject color
}
```

**Design Specs:**
- Background: `bg-card`
- Border: `border border-border`
- Border Radius: `rounded-2xl`
- Padding: `p-6`
- Shadow: `shadow-soft-md`
- Hover: `shadow-soft-lg -translate-y-0.5`
- Icon Container: `w-12 h-12 rounded-xl`
- Icon Background: `30% opacity` of subject color
- Title: `text-h4 font-semibold`
- Description: `text-body-sm text-muted-foreground`

**Example:**
```tsx
<FeatureCard
  title="AI Response Grading"
  description="Get instant feedback from AI examiners"
  icon={GraduationCap}
  href="/grade"
  color="#E8D5C4"
/>
```

---

### StatCard

**Usage:** Dashboard statistics

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; direction: 'up' | 'down' };
  icon?: React.ReactNode;
}
```

**Design Specs:**
- Background: `bg-card`
- Border: `border border-border`
- Border Radius: `rounded-xl`
- Padding: `p-4`
- Shadow: `shadow-soft-sm`
- Value: `text-2xl font-bold text-foreground`
- Label: `text-xs text-muted-foreground`
- Trend: Color-coded (green for up, red for down)

---

### EssayCard

**Usage:** Display graded essays

```tsx
interface EssayCardProps {
  essay: {
    id: string;
    question: string;
    overallScore?: number;
    createdAt: Date;
    subject: string;
  };
  onClick?: () => void;
}
```

**Design Specs:**
- Background: `bg-card`
- Border: `border border-border`
- Border Radius: `rounded-xl`
- Padding: `p-5`
- Shadow: `shadow-soft-sm`
- Hover: `shadow-soft-md border-sand-400`
- Score Badge: Circular badge with score
- Question: `text-body-sm line-clamp-2`
- Date: `text-caption text-muted-foreground`

---

## 3. Form Components

### TextInput

**Usage:** Single-line text input

```tsx
interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}
```

**Design Specs:**
- Background: `bg-sand-100`
- Border: `border border-sand-300`
- Border Radius: `rounded-[10px]`
- Padding: `px-4 py-3`
- Font: `text-sm`
- Text: `text-sand-900`
- Placeholder: `text-sand-500`
- Focus: `border-peach-300 ring-2 ring-peach-100`
- Error: `border-rose-200 bg-rose-100`
- Icon: Positioned left, `text-sand-500`

---

### TextArea

**Usage:** Multi-line text input for essay responses

```tsx
interface TextAreaProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
}
```

**Design Specs:**
- Min Height: `min-h-[120px]`
- Resize: `resize-y`
- Line Height: `leading-relaxed`
- All other specs same as TextInput

---

### Select

**Usage:** Dropdown selection

```tsx
interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

**Design Specs:**
- Chevron Icon: Right-aligned
- Dropdown: `bg-card border border-border rounded-xl shadow-soft-lg`
- Option Hover: `bg-sand-100`
- Selected: `bg-peach-100`

---

## 4. Feedback Components

### Toast

**Usage:** Temporary notifications

```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
```

**Design Specs:**
- Position: `top-center`
- Background: Dark mode `#2D2D2D`, Light mode `#1A1A1A`
- Text: `#FFFFFF`
- Border Radius: `rounded-xl`
- Shadow: `shadow-soft-lg`
- Icon: Type-specific color
- Duration: 4 seconds default

---

### Badge

**Usage:** Status indicators, labels

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}
```

**Design Specs:**
- Padding: `px-2.5 py-1`
- Border Radius: `rounded-full`
- Font: `text-xs font-medium`
- Variants:
  - Default: `bg-sand-200 text-sand-700`
  - Primary: `bg-peach-100 text-sand-800`
  - Success: `bg-sage-100 text-sage-300`
  - Warning: `bg-amber-100 text-amber-200`
  - Error: `bg-rose-100 text-rose-200`
  - Info: `bg-blue-100 text-blue-300`

---

### ScoreBadge

**Usage:** Display essay scores

```tsx
interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}
```

**Design Specs:**
- Size:
  - sm: `w-8 h-8 text-sm`
  - md: `w-12 h-12 text-lg`
  - lg: `w-16 h-16 text-2xl`
- Border Radius: `rounded-full`
- Color based on score:
  - 80-100: `bg-sage-200 text-white`
  - 60-79: `bg-amber-200 text-sand-900`
  - Below 60: `bg-rose-200 text-white`

---

## 5. Navigation Components

### Sidebar

**Usage:** Main navigation sidebar

```tsx
interface SidebarProps {
  items: NavItem[];
  activeItem?: string;
  onItemClick?: (item: NavItem) => void;
}
```

**Design Specs:**
- Width: `w-[280px]`
- Background: `bg-card`
- Border: `border-r border-border`
- Padding: `p-6`
- Logo: `mb-8`
- Nav Items: `gap-1`

---

### NavItem

**Usage:** Individual navigation item

```tsx
interface NavItemProps {
  icon: React.ComponentType;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}
```

**Design Specs:**
- Padding: `px-3.5 py-2.5`
- Border Radius: `rounded-[10px]`
- Font: `text-sm font-medium`
- Inactive: `text-sand-600`
- Hover: `bg-sand-200 text-sand-800`
- Active: `bg-peach-100 text-sand-900`
- Badge: `ml-auto bg-peach-300 text-white`

---

### SubjectSwitcher

**Usage:** Switch between subjects

```tsx
interface SubjectSwitcherProps {
  subjects: { id: string; name: string; icon: React.ReactNode }[];
  activeSubject: string;
  onChange: (subjectId: string) => void;
}
```

**Design Specs:**
- Trigger: `bg-card border border-border rounded-full px-4 py-2`
- Dropdown: `bg-card border border-border rounded-xl shadow-soft-lg`
- Item: `px-4 py-2.5 hover:bg-sand-100`
- Active: `bg-peach-100`
- Icon: Colored by subject

---

## 6. Layout Components

### ThreePanel

**Usage:** Main app layout with sidebar, content, and right panel

```tsx
interface ThreePanelProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}
```

**Design Specs:**
- Left Panel: `w-[280px] hidden lg:block`
- Main Content: `flex-1 min-w-0`
- Right Panel: `w-[320px] hidden xl:block`
- Gap: `gap-6`
- Padding: `p-6`

---

### PageHeader

**Usage:** Page title with actions

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}
```

**Design Specs:**
- Title: `text-h1 font-semibold`
- Subtitle: `text-body text-muted-foreground mt-1`
- Actions: `ml-auto flex items-center gap-3`
- Breadcrumbs: `text-sm text-muted-foreground mb-4`

---

## 7. Data Display Components

### EmptyState

**Usage:** Empty list placeholder

```tsx
interface EmptyStateProps {
  icon: React.ComponentType;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}
```

**Design Specs:**
- Icon: `w-16 h-16 text-sand-400 mb-4`
- Title: `text-h4 text-foreground`
- Description: `text-body-sm text-muted-foreground mt-2`
- Action: `mt-6 btn-primary`
- Alignment: `text-center py-16`

---

### LoadingState

**Usage:** Loading placeholder

```tsx
interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'shimmer';
  count?: number;
}
```

**Design Specs:**
- Spinner: `w-8 h-8 border-2 border-peach-300 border-t-transparent rounded-full animate-spin`
- Skeleton: `bg-sand-200 rounded-lg animate-pulse`
- Shimmer: Gradient animation effect

---

### ProgressBar

**Usage:** Show progress

```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
}
```

**Design Specs:**
- Container: `bg-sand-200 rounded-full overflow-hidden`
- Height: `h-1.5` (sm), `h-2` (md), `h-3` (lg)
- Fill: `bg-primary transition-all duration-500`
- Label: `text-xs text-muted-foreground mt-1`

---

## 8. Modal Components

### Dialog

**Usage:** Modal dialogs

```tsx
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Design Specs:**
- Overlay: `bg-black/50 backdrop-blur-sm`
- Container: `bg-card rounded-2xl shadow-soft-xl`
- Width: `max-w-md` (sm), `max-w-lg` (md), `max-w-2xl` (lg), `max-w-4xl` (xl)
- Padding: `p-6`
- Header: `border-b border-border pb-4 mb-4`
- Title: `text-h3`
- Description: `text-body-sm text-muted-foreground mt-1`
- Close Button: Top-right, `btn-icon`
- Animation: `animate-scale-in`

---

### ConfirmDialog

**Usage:** Confirmation dialogs

```tsx
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}
```

**Design Specs:**
- Icon: Type-specific, `w-12 h-12 rounded-full`
- Danger: `bg-rose-100 text-rose-200`
- Warning: `bg-amber-100 text-amber-200`
- Info: `bg-blue-100 text-blue-300`
- Buttons: Cancel (secondary), Confirm (primary/danger)

---

## 9. Chat Components

### AIChat

**Usage:** AI tutor chat interface

```tsx
interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
}
```

**Design Specs:**
- Container: `fixed bottom-24 right-6 w-[400px] max-h-[600px]`
- Header: `bg-card border-b border-border p-4`
- Messages: `flex-1 overflow-y-auto p-4 space-y-4`
- User Message: `bg-primary text-primary-foreground rounded-2xl rounded-br-md`
- AI Message: `bg-sand-100 text-sand-900 rounded-2xl rounded-bl-md`
- Input: `border-t border-border p-4`
- Send Button: `btn-primary w-10 h-10 p-0`

---

### ChatMessage

**Usage:** Individual chat message

```tsx
interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

**Design Specs:**
- User:
  - Alignment: `ml-auto`
  - Background: `bg-primary`
  - Text: `text-primary-foreground`
  - Border Radius: `rounded-2xl rounded-br-md`
- Assistant:
  - Alignment: `mr-auto`
  - Background: `bg-sand-100`
  - Text: `text-sand-900`
  - Border Radius: `rounded-2xl rounded-bl-md`
- Max Width: `max-w-[80%]`
- Padding: `px-4 py-3`

---

## 10. Flashcard Components

### Flashcard

**Usage:** Study flashcard with flip animation

```tsx
interface FlashcardProps {
  card: {
    id: string;
    front: string;
    back: string;
  };
  onFlip?: () => void;
  onRate?: (rating: 'again' | 'hard' | 'good' | 'easy') => void;
}
```

**Design Specs:**
- Container: `w-full aspect-[3/2] perspective-1000`
- Card: `relative w-full h-full transition-transform duration-500 transform-style-preserve-3d`
- Front/Back: `absolute inset-0 backface-hidden`
- Front Background: `bg-card border border-border rounded-2xl`
- Back Background: `bg-peach-100 border border-peach-300 rounded-2xl`
- Content: `flex items-center justify-center p-8 text-center`
- Text: `text-h3`
- Flip: `rotate-y-180`

---

### DeckCard

**Usage:** Flashcard deck preview

```tsx
interface DeckCardProps {
  deck: {
    id: string;
    name: string;
    description?: string;
    cardCount: number;
    dueCount: number;
    subject: string;
  };
  onClick?: () => void;
}
```

**Design Specs:**
- Background: `bg-card border border-border rounded-xl`
- Padding: `p-5`
- Shadow: `shadow-soft-sm`
- Hover: `shadow-soft-md border-sand-400`
- Title: `text-h4 font-semibold`
- Description: `text-body-sm text-muted-foreground mt-1 line-clamp-2`
- Stats: `flex items-center gap-4 mt-4`
- Card Count: `text-sm text-sand-600`
- Due Badge: `bg-peach-100 text-sand-800 px-2 py-0.5 rounded-full text-xs`

---

## Component Usage Patterns

### Responsive Patterns

```tsx
// Grid that adapts to screen size
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Hide on mobile
<div className="hidden lg:block">Sidebar</div>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div>Content</div>
  <div>Sidebar</div>
</div>
```

### Animation Patterns

```tsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  Content
</motion.div>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Form Patterns

```tsx
// Form with validation
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="form-label">Question</label>
    <input
      className="input-field"
      value={question}
      onChange={e => setQuestion(e.target.value)}
      placeholder="Enter your question..."
    />
    {error && <p className="form-error">{error}</p>}
  </div>
  
  <div className="flex gap-3">
    <button type="submit" className="btn-primary">Submit</button>
    <button type="button" className="btn-secondary" onClick={onCancel}>
      Cancel
    </button>
  </div>
</form>
```
