# Sandstone Accessibility (a11y) Implementation Guide

This document outlines the accessibility improvements made to the Sandstone application, ensuring WCAG 2.1 AA compliance.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Hooks](#hooks)
4. [CSS Utilities](#css-utilities)
5. [Implementation Guide](#implementation-guide)
6. [Testing Checklist](#testing-checklist)

## Overview

### Key Improvements

- **ARIA Labels & Roles**: Comprehensive semantic markup for screen readers
- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Focus Management**: Proper focus trapping in modals and focus restoration
- **Screen Reader Support**: Live regions and announcements for dynamic content
- **Color Contrast**: WCAG AA compliant color ratios (4.5:1 for text)
- **Reduced Motion**: Respects user preferences for animations

## Components

### AccessibleButton

A button component with built-in accessibility features.

```tsx
import { AccessibleButton } from "@/components/ui";

<AccessibleButton
  variant="primary"
  size="md"
  isLoading={isLoading}
  loadingText="Saving..."
  leftIcon={<SaveIcon />}
  onClick={handleSave}
>
  Save Document
</AccessibleButton>
```

**Features:**
- Loading state with announcement
- Icon support with proper aria-hidden
- Focus management
- Disabled state handling

### AccessibleInput / AccessibleTextarea / AccessibleSelect

Form components with labels, helper text, and error handling.

```tsx
import { AccessibleInput, AccessibleSelect } from "@/components/ui";

<AccessibleInput
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  helperText="We'll never share your email"
  error={errors.email}
  required
/>

<AccessibleSelect
  label="Subject"
  options={[
    { value: "math", label: "Mathematics" },
    { value: "science", label: "Science" },
  ]}
  placeholder="Select a subject"
/>
```

**Features:**
- Automatic label association
- Error announcement via role="alert"
- Helper text support
- Required field indicator

### AccessibleModal

Modal dialog with focus trapping and keyboard support.

```tsx
import { AccessibleModal, useModal } from "@/components/ui";

const { isOpen, open, close } = useModal();

<AccessibleModal
  isOpen={isOpen}
  onClose={close}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  closeOnEscape
  closeOnOverlayClick
  footer={
    <>
      <AccessibleButton variant="ghost" onClick={close}>Cancel</AccessibleButton>
      <AccessibleButton variant="danger" onClick={confirm}>Delete</AccessibleButton>
    </>
  }
>
  <p>This action cannot be undone.</p>
</AccessibleModal>
```

**Features:**
- Focus trap
- Escape key handling
- Focus restoration on close
- ARIA attributes (role="dialog", aria-modal)

### FocusTrap

Utility component for trapping focus within a container.

```tsx
import { FocusTrap } from "@/components/ui";

<FocusTrap isActive={isOpen} onEscape={handleClose}>
  <div>{/* Your content */}</div>
</FocusTrap>
```

### VisuallyHidden

Hide content visually while keeping it accessible to screen readers.

```tsx
import { VisuallyHidden, SkipLink, LiveRegion } from "@/components/ui";

// Screen reader only text
<VisuallyHidden>Additional context for screen readers</VisuallyHidden>

// Skip navigation link
<SkipLink href="#main-content" />

// Live announcements
<LiveRegion politeness="polite">
  {announcement}
</LiveRegion>
```

### AccessibleTabs

Keyboard-navigable tabs with proper ARIA attributes.

```tsx
import { AccessibleTabs } from "@/components/ui";

<AccessibleTabs
  tabs={[
    { id: "overview", label: "Overview", content: <Overview /> },
    { id: "details", label: "Details", content: <Details /> },
  ]}
  defaultTab="overview"
  onChange={(tabId) => console.log("Tab changed:", tabId)}
/>
```

**Keyboard Navigation:**
- Arrow keys: Navigate between tabs
- Home: First tab
- End: Last tab
- Tab: Move to tab panel

### AccessibleDropdown

Dropdown menu with keyboard navigation.

```tsx
import { AccessibleDropdown } from "@/components/ui";

<AccessibleDropdown
  trigger={<button>Menu</button>}
  sections={[
    {
      items: [
        { id: "edit", label: "Edit", icon: <EditIcon />, onClick: handleEdit },
        { id: "delete", label: "Delete", icon: <TrashIcon />, onClick: handleDelete },
      ],
    },
  ]}
/>
```

**Keyboard Navigation:**
- Enter/Space: Open menu
- Arrow keys: Navigate items
- Escape: Close menu
- Tab: Close and move focus

### AccessibleAlert & Toast

Alert and toast notifications with proper ARIA live regions.

```tsx
import { 
  AccessibleAlert, 
  ToastProvider, 
  useToast, 
  useSuccessToast, 
  useErrorToast 
} from "@/components/ui";

// Standalone alert
<AccessibleAlert
  type="error"
  title="Error"
  message="Something went wrong"
  onClose={() => setShowAlert(false)}
/>

// Toast notifications
function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
}

function YourComponent() {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      successToast("Success", "Data saved successfully");
    } catch (error) {
      errorToast("Error", "Failed to save data");
    }
  };
}
```

## Hooks

### useAnnounce

Programmatically announce messages to screen readers.

```tsx
import { useAnnounce } from "@/hooks";

function ChatComponent() {
  const { announce, announcement } = useAnnounce("polite");
  
  const handleNewMessage = (message) => {
    announce(`New message: ${message.content}`);
  };
  
  return (
    <div>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {/* Chat UI */}
    </div>
  );
}
```

### usePageAnnounce

Announce page navigation to screen readers.

```tsx
import { usePageAnnounce } from "@/hooks";

function DashboardPage() {
  usePageAnnounce("Dashboard");
  // ...
}
```

### useArrowNavigation

Add arrow key navigation to lists and menus.

```tsx
import { useArrowNavigation } from "@/hooks";

function MenuList() {
  const { containerRef, handleKeyDown } = useArrowNavigation({
    itemSelector: '[role="menuitem"]',
    onSelect: (element) => element.click(),
    loop: true,
    orientation: "vertical",
  });
  
  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} role="menu">
      {/* Menu items */}
    </div>
  );
}
```

### useShortcut

Add keyboard shortcuts to your application.

```tsx
import { useShortcut } from "@/hooks";

function Editor() {
  useShortcut("s", handleSave, { ctrl: true });
  useShortcut("k", openCommandPalette, { ctrl: true });
  // ...
}
```

## CSS Utilities

### Import

```tsx
import "@/styles/accessibility.css";
```

### Available Classes

| Class | Description |
|-------|-------------|
| `.sr-only` | Hide content visually, keep for screen readers |
| `.skip-link` | Skip navigation link |
| `.touch-target-min` | Minimum 44x44px touch target |
| `.keyboard-navigation` | Show focus styles for keyboard users |
| `.no-print` | Hide element when printing |

### Media Queries

```css
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}

/* High contrast */
@media (prefers-contrast: high) {
  /* Enhanced contrast styles */
}

/* Touch devices */
@media (pointer: coarse) {
  /* Larger touch targets */
}
```

## Implementation Guide

### 1. Update Sidebar Component

Replace your existing Sidebar with the accessible version:

```tsx
// components/layout/Sidebar.tsx
export { Sidebar } from "@/sandstone-a11y/components/layout/Sidebar";
```

### 2. Update AIChat Component

```tsx
// components/layout/AIChat.tsx
export { AIChat } from "@/sandstone-a11y/components/layout/AIChat";
```

### 3. Update Flashcard Component

```tsx
// components/flashcards/Flashcard.tsx
export { Flashcard } from "@/sandstone-a11y/components/flashcards/Flashcard";
```

### 4. Add Accessibility Styles

Import the CSS in your global styles:

```tsx
// app/globals.css
@import "@/sandstone-a11y/styles/accessibility.css";
```

### 5. Wrap App with ToastProvider

```tsx
// app/layout.tsx
import { ToastProvider } from "@/components/ui";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

## Testing Checklist

### Keyboard Navigation

- [ ] All interactive elements are reachable via Tab key
- [ ] Focus order is logical and follows visual order
- [ ] Focus is visible on all interactive elements
- [ ] Escape key closes modals and dropdowns
- [ ] Arrow keys navigate within components (tabs, menus, etc.)
- [ ] Enter/Space activates buttons and links

### Screen Readers

- [ ] All images have alt text or are marked decorative
- [ ] Form inputs have associated labels
- [ ] Headings are in logical order (h1 → h2 → h3)
- [ ] ARIA landmarks are used appropriately
- [ ] Dynamic content is announced via live regions
- [ ] Status messages are announced

### Visual

- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Information is not conveyed by color alone
- [ ] Text can be resized up to 200% without loss
- [ ] Focus indicators are visible
- [ ] Content is readable in high contrast mode

### Motion

- [ ] Animations respect `prefers-reduced-motion`
- [ ] No content flashes more than 3 times per second
- [ ] Auto-playing content can be paused

### Forms

- [ ] All required fields are indicated
- [ ] Error messages are associated with inputs
- [ ] Error messages are announced to screen readers
- [ ] Form validation is clear and helpful

## WCAG 2.1 Compliance

### Perceivable

- **1.1 Text Alternatives**: All non-text content has text alternatives
- **1.2 Time-based Media**: Captions/transcripts for media (if applicable)
- **1.3 Adaptable**: Content can be presented in different ways
- **1.4 Distinguishable**: Content is easy to see and hear

### Operable

- **2.1 Keyboard Accessible**: All functionality available via keyboard
- **2.2 Enough Time**: Users have enough time to read and use content
- **2.3 Seizures**: No content that causes seizures
- **2.4 Navigable**: Easy to navigate and find content
- **2.5 Input Modalities**: Easy to operate in various ways

### Understandable

- **3.1 Readable**: Text is readable and understandable
- **3.2 Predictable**: Interface appears and operates predictably
- **3.3 Input Assistance**: Helps users avoid and correct mistakes

### Robust

- **4.1 Compatible**: Works with current and future assistive technologies

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
