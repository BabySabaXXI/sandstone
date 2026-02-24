# Sandstone Accessibility - Quick Start Guide

## Installation

1. **Copy the accessibility components to your project:**

```bash
# Copy components
cp -r sandstone-a11y/components/ui/* components/ui/
cp -r sandstone-a11y/components/layout/* components/layout/
cp -r sandstone-a11y/components/flashcards/* components/flashcards/

# Copy hooks
cp -r sandstone-a11y/hooks/* hooks/

# Copy styles
cp sandstone-a11y/styles/accessibility.css styles/
```

2. **Import the accessibility CSS in your globals.css:**

```css
@import "./accessibility.css";
```

3. **Update your layout.tsx to include ToastProvider:**

```tsx
import { ToastProvider } from "@/components/ui";

export default function RootLayout({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
```

## Quick Component Usage

### Button with Loading State

```tsx
<AccessibleButton
  isLoading={saving}
  loadingText="Saving document..."
  onClick={handleSave}
>
  Save
</AccessibleButton>
```

### Form Input with Error

```tsx
<AccessibleInput
  label="Email"
  type="email"
  error={errors.email}
  helperText="We'll never share your email"
  required
/>
```

### Modal Dialog

```tsx
const { isOpen, open, close } = useModal();

<AccessibleModal
  isOpen={isOpen}
  onClose={close}
  title="Confirm Delete"
  closeOnEscape
>
  <p>Are you sure you want to delete this?</p>
</AccessibleModal>
```

### Toast Notifications

```tsx
const successToast = useSuccessToast();
const errorToast = useErrorToast();

// Usage
successToast("Saved!", "Your changes have been saved.");
errorToast("Error", "Failed to save changes.");
```

### Screen Reader Announcements

```tsx
const { announce, announcement } = useAnnounce();

// Announce something
announce("New message received");

// In JSX
<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate to next interactive element |
| `Shift + Tab` | Navigate to previous interactive element |
| `Enter` / `Space` | Activate button or link |
| `Escape` | Close modal/dropdown |
| `Arrow Keys` | Navigate within components |
| `Home` | First item in list |
| `End` | Last item in list |

## ARIA Checklist

- [ ] All buttons have accessible labels
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Dynamic content uses live regions
- [ ] Modals trap focus and restore on close
- [ ] Focus indicators are visible
- [ ] Color contrast is 4.5:1 or higher

## Common Patterns

### Skip Link

```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<main id="main-content">
  {/* Content */}
</main>
```

### Visually Hidden Text

```tsx
<button>
  <span aria-hidden="true">×</span>
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>
```

### Live Region

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>
```

## Testing

### Keyboard Testing

1. Unplug your mouse
2. Navigate using only Tab, Shift+Tab, Enter, Space, and Arrow keys
3. Verify all functionality is accessible

### Screen Reader Testing

1. Enable VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
2. Navigate through your application
3. Verify all content is announced correctly

### Automated Testing

```bash
# Install axe-core
npm install @axe-core/react

# Run in development
npm run dev
```

## Support

For detailed documentation, see [ACCESSIBILITY.md](./ACCESSIBILITY.md)
