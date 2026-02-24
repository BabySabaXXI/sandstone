# Sandstone Feedback System

A comprehensive feedback system for the Sandstone application providing toast notifications, progress indicators, status messages, confirmation dialogs, alerts, and success/error feedback components.

## Features

- **Toast Notifications** - Success, error, warning, info, and loading toasts
- **Progress Indicators** - Linear, circular, step progress, and loading spinners
- **Status Messages** - Inline status, badges, connection status, and empty states
- **Confirmation Dialogs** - Delete, save, logout, and discard confirmations
- **Alert Components** - Banners, inline alerts, feature announcements, and system alerts
- **Success/Error Feedback** - Full-page feedback states with animations
- **Custom Hooks** - useFeedback, useAsyncFeedback, useConfirmation, and more
- **Global State Management** - Zustand-based store for feedback state

## Installation

Copy the feedback system files to your project:

```bash
# Copy to your project
cp -r sandstone-feedback/* /path/to/your/project/
```

## Setup

### 1. Wrap your app with FeedbackProvider

```tsx
// app/layout.tsx
import { FeedbackProvider } from '@/components/feedback';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FeedbackProvider
          toastPosition="top-center"
          toastDuration={4000}
          enableNetworkStatus={true}
          enableKeyboardShortcuts={true}
        >
          {children}
        </FeedbackProvider>
      </body>
    </html>
  );
}
```

### 2. Use toast notifications

```tsx
import { useToastFeedback } from '@/hooks';

function MyComponent() {
  const toast = useToastFeedback();

  const handleSave = async () => {
    toast.loading('Saving...');
    try {
      await saveData();
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### 3. Use the feedback hook for async operations

```tsx
import { useFeedback } from '@/hooks';

function MyComponent() {
  const { execute, isLoading, isSuccess, isError } = useFeedback({
    successMessage: 'Data loaded!',
    errorMessage: 'Failed to load data',
  });

  const handleLoad = () => {
    execute(fetchData());
  };

  return (
    <button onClick={handleLoad} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Load Data'}
    </button>
  );
}
```

## Components

### Progress Indicators

```tsx
import { LinearProgress, CircularProgress, LoadingSpinner } from '@/components/ui';

// Linear progress
<LinearProgress progress={75} variant="success" showLabel />

// Circular progress
<CircularProgress progress={50} size={64} />

// Loading spinner
<LoadingSpinner size="lg" text="Loading..." />

// Skeleton loading
<Skeleton width={200} height={20} />
<SkeletonCard lines={3} hasImage />

// File upload progress
<FileUploadProgress
  fileName="document.pdf"
  progress={65}
  fileSize="2.5 MB"
  status="uploading"
/>

// Processing status
<ProcessingStatus
  title="Processing document"
  progress={45}
  steps={[
    { label: 'Uploading', status: 'completed' },
    { label: 'Analyzing', status: 'processing' },
    { label: 'Saving', status: 'pending' },
  ]}
/>
```

### Status Messages

```tsx
import { StatusMessage, StatusBadge, ConnectionStatus } from '@/components/ui';

// Status message
<StatusMessage
  type="success"
  title="Success!"
  message="Your changes have been saved."
  dismissible
/>

// Inline status
<InlineStatus type="loading" message="Processing..." />

// Status badge
<StatusBadge status="active" pulse />

// Connection status
<ConnectionStatus
  isOnline={navigator.onLine}
  lastSynced="2 minutes ago"
  onRetry={checkConnection}
/>

// Empty state
<EmptyState
  title="No documents yet"
  description="Create your first document to get started"
  action={{ label: 'Create Document', onClick: createDoc }}
/>
```

### Confirmation Dialogs

```tsx
import { useConfirmation } from '@/hooks';

function MyComponent() {
  const { isOpen, open, close, confirm, cancel, options, setOptions } = useConfirmation();

  const handleDelete = () => {
    setOptions({
      title: 'Delete Document',
      message: 'Are you sure? This cannot be undone.',
      onConfirm: () => deleteDocument(),
    });
    open();
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={confirm}
        {...options}
      />
    </>
  );
}
```

Or use preset dialogs:

```tsx
import { DeleteDialog, SaveDialog, LogoutDialog } from '@/components/ui';

<DeleteDialog
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  itemName="My Document"
  itemType="document"
/>
```

### Alerts

```tsx
import { Alert, AlertBanner, AlertGroup } from '@/components/ui';

// Alert
<Alert variant="warning" title="Warning" dismissible>
  This action cannot be undone.
</Alert>

// Alert banner
<AlertBanner
  variant="info"
  message="New features available! Check them out."
  action={{ label: 'Learn More', onClick: showFeatures }}
/>

// Alert group
<AlertGroup
  alerts={[
    { id: '1', variant: 'success', message: 'Saved!' },
    { id: '2', variant: 'warning', message: 'Unsaved changes' },
  ]}
  onDismiss={(id) => removeAlert(id)}
/>

// Feature announcement
<FeatureAlert
  title="New AI Features"
  description="We've added powerful AI tools to help you learn faster."
  onLearnMore={showFeatures}
/>

// System alert
<SystemAlert
  title="System Maintenance"
  message="Scheduled maintenance in 2 hours"
  severity="medium"
/>
```

### Success/Error Feedback

```tsx
import { SuccessFeedback, ErrorFeedback, LoadingFeedback } from '@/components/ui';

// Success feedback
<SuccessFeedback
  title="Payment Successful!"
  message="Your subscription has been activated."
  action={{ label: 'Go to Dashboard', onClick: navigateToDashboard }}
  icon="party"
/>

// Error feedback
<ErrorFeedback
  title="Payment Failed"
  message="We couldn't process your payment."
  error={error}
  onRetry={retryPayment}
  showDetails
/>

// Loading feedback
<LoadingFeedback
  title="Processing Payment"
  message="Please don't close this window"
  progress={65}
  showProgress
/>
```

## Hooks

### useFeedback

```tsx
const {
  status,      // 'idle' | 'loading' | 'success' | 'error'
  message,     // Current feedback message
  error,       // Error object if failed
  isLoading,
  isSuccess,
  isError,
  setLoading,
  setSuccess,
  setError,
  reset,
  execute,     // Execute async function with automatic feedback
} = useFeedback({
  successMessage: 'Success!',
  errorMessage: 'Failed!',
  showToast: true,
});
```

### useAsyncFeedback

```tsx
const {
  execute,
  status,
  data,
  error,
  isLoading,
  isSuccess,
  isError,
  reset,
} = useAsyncFeedback(fetchData, {
  onSuccess: (data) => console.log(data),
  onError: (error) => console.error(error),
});
```

### useToastFeedback

```tsx
const toast = useToastFeedback();

toast.success('Saved!');
toast.error('Failed', 'Please try again');
toast.warning('Warning', 'Be careful');
toast.info('Info', 'Something happened');
toast.loading('Loading...');
toast.promise(
  fetchData(),
  { loading: 'Loading...', success: 'Loaded!', error: 'Failed!' }
);
toast.dismiss(toastId);
```

### useConfirmation

```tsx
const {
  isOpen,
  open,
  close,
  confirm,
  cancel,
  options,
  setOptions,
} = useConfirmation();
```

### useNetworkStatus

```tsx
const { isOnline, wasOffline, lastOnline, lastOffline, checkConnection } = useNetworkStatus();
```

### useFormFeedback

```tsx
const {
  fields,
  setField,
  validateField,
  validateAll,
  getFieldProps,
  isValid,
  reset,
} = useFormFeedback({ email: '', password: '' });
```

### useProgress

```tsx
const { progress, setProgress, increment, decrement, reset, complete, isComplete } = useProgress(0);
```

## Global Feedback Store

```tsx
import { useFeedbackStore, feedbackActions } from '@/store';

// In components
const { showToast, startProgress, showConfirmation } = useFeedbackStore();

// Outside components (actions)
feedbackActions.success('Saved!');
feedbackActions.error('Failed!');
feedbackActions.progress.start('Uploading...');
feedbackActions.progress.update(id, 50);
feedbackActions.progress.complete(id);
feedbackActions.confirm({
  title: 'Confirm',
  message: 'Are you sure?',
  onConfirm: () => console.log('Confirmed'),
});
```

## Toast Utilities

```tsx
import { showSuccess, showError, ToastMessages } from '@/lib';

// Direct toast calls
showSuccess('Saved!');
showError('Failed!', { description: 'Please try again' });
showWarning('Warning');
showInfo('Info');
showLoading('Loading...');
showPromise(
  fetchData(),
  { loading: 'Loading...', success: 'Done!', error: 'Failed!' }
);

// Preset messages
ToastMessages.auth.loginSuccess('John');
ToastMessages.documents.saved();
ToastMessages.flashcards.deckCreated();
ToastMessages.grading.submitted();
ToastMessages.ai.generating();
ToastMessages.general.copied();
```

## Keyboard Shortcuts

- `ESC` - Close dialogs and dismiss toasts
- `Ctrl/Cmd + Shift + X` - Clear all notifications

## License

MIT
