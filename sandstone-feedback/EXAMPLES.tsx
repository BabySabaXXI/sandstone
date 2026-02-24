/**
 * Feedback System Examples
 * 
 * This file demonstrates various ways to use the feedback system
 * in the Sandstone application.
 */

'use client';

import React, { useState } from 'react';
import {
  // Toast
  useToastFeedback,
  ToastMessages,
  
  // Feedback hook
  useFeedback,
  useAsyncFeedback,
  useConfirmation,
  useProgress,
  
  // Components
  LinearProgress,
  CircularProgress,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  ProcessingStatus,
  StatusMessage,
  StatusBadge,
  ConnectionStatus,
  EmptyState,
  Alert,
  AlertBanner,
  SuccessFeedback,
  ErrorFeedback,
  LoadingFeedback,
  ConfirmationDialog,
  DeleteDialog,
  
  // Store
  useFeedbackStore,
  feedbackActions,
} from './index';

// ============================================
// Example 1: Basic Toast Usage
// ============================================

export function ToastExample() {
  const toast = useToastFeedback();

  const showSuccessToast = () => {
    toast.success('Operation completed!', 'Your changes have been saved.');
  };

  const showErrorToast = () => {
    toast.error('Something went wrong', 'Please try again later.');
  };

  const showLoadingToast = async () => {
    const toastId = toast.loading('Processing...', 'Please wait');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.dismiss(toastId);
    toast.success('Done!');
  };

  const showPromiseToast = async () => {
    await toast.promise(
      fetch('/api/data'),
      {
        loading: 'Fetching data...',
        success: 'Data loaded!',
        error: 'Failed to load data',
      }
    );
  };

  return (
    <div className="space-y-2">
      <button onClick={showSuccessToast} className="btn btn-success">
        Show Success
      </button>
      <button onClick={showErrorToast} className="btn btn-error">
        Show Error
      </button>
      <button onClick={showLoadingToast} className="btn btn-primary">
        Show Loading
      </button>
      <button onClick={showPromiseToast} className="btn btn-secondary">
        Show Promise
      </button>
    </div>
  );
}

// ============================================
// Example 2: useFeedback Hook
// ============================================

export function FeedbackHookExample() {
  const {
    execute,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    reset,
  } = useFeedback({
    successMessage: 'Data saved successfully!',
    errorMessage: 'Failed to save data',
    showToast: true,
  });

  const handleSave = () => {
    execute(
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ data: 'example' }),
      })
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span>Status: {status}</span>
        {isLoading && <LoadingSpinner size="sm" />}
        {isSuccess && <span className="text-green-500">✓</span>}
        {isError && <span className="text-red-500">✗</span>}
      </div>
      
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Saving...' : 'Save Data'}
      </button>
      
      {isError && (
        <div className="text-red-500">
          Error: {error?.message}
          <button onClick={reset} className="ml-2 underline">
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 3: Progress Indicators
// ============================================

export function ProgressExample() {
  const { progress, increment, decrement, reset, complete } = useProgress(0);

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h3 className="font-medium mb-2">Linear Progress</h3>
        <LinearProgress progress={progress} showLabel variant="success" />
      </div>

      <div>
        <h3 className="font-medium mb-2">Circular Progress</h3>
        <CircularProgress progress={progress} size={80} />
      </div>

      <div className="flex gap-2">
        <button onClick={() => increment(10)} className="btn btn-sm">
          +10%
        </button>
        <button onClick={() => decrement(10)} className="btn btn-sm">
          -10%
        </button>
        <button onClick={reset} className="btn btn-sm">
          Reset
        </button>
        <button onClick={complete} className="btn btn-sm btn-success">
          Complete
        </button>
      </div>

      <div>
        <h3 className="font-medium mb-2">Processing Status</h3>
        <ProcessingStatus
          title="Uploading file"
          progress={progress}
          steps={[
            { label: 'Preparing', status: 'completed' },
            { label: 'Uploading', status: progress < 100 ? 'processing' : 'completed' },
            { label: 'Verifying', status: progress < 100 ? 'pending' : 'completed' },
          ]}
        />
      </div>
    </div>
  );
}

// ============================================
// Example 4: Confirmation Dialogs
// ============================================

export function ConfirmationExample() {
  const { isOpen, open, close, confirm, cancel, options, setOptions } = useConfirmation();
  const [deleted, setDeleted] = useState(false);

  const handleDeleteClick = () => {
    setOptions({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      isDestructive: true,
      onConfirm: () => {
        setDeleted(true);
        setTimeout(() => setDeleted(false), 2000);
      },
    });
    open();
  };

  return (
    <div className="space-y-4">
      <button onClick={handleDeleteClick} className="btn btn-danger">
        Delete Item
      </button>

      {deleted && (
        <StatusMessage type="success" title="Deleted!">
          Item has been successfully deleted.
        </StatusMessage>
      )}

      <ConfirmationDialog
        isOpen={isOpen}
        onClose={close}
        onConfirm={confirm}
        {...options}
      />
    </div>
  );
}

// ============================================
// Example 5: Status Messages
// ============================================

export function StatusMessageExample() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="space-y-4 max-w-md">
      <StatusMessage
        type="success"
        title="Success!"
        message="Your changes have been saved."
        dismissible
      />

      <StatusMessage
        type="error"
        title="Error!"
        message="Something went wrong. Please try again."
        action={{ label: 'Retry', onClick: () => console.log('Retry') }}
      />

      <StatusMessage
        type="warning"
        title="Warning"
        message="Your session will expire in 5 minutes."
      />

      <StatusMessage
        type="info"
        title="Information"
        message="New features are available!"
      />

      <div className="flex items-center gap-4">
        <StatusBadge status="active" pulse />
        <StatusBadge status="pending" />
        <StatusBadge status="error" />
      </div>

      <div>
        <button
          onClick={() => setIsOnline(!isOnline)}
          className="btn btn-sm mb-2"
        >
          Toggle Online Status
        </button>
        <ConnectionStatus
          isOnline={isOnline}
          lastSynced="2 minutes ago"
          onRetry={() => console.log('Retry connection')}
        />
      </div>
    </div>
  );
}

// ============================================
// Example 6: Alerts
// ============================================

export function AlertExample() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="space-y-4">
      {showBanner && (
        <AlertBanner
          variant="info"
          message="New features are available! Check them out."
          action={{ label: 'Learn More', onClick: () => console.log('Learn more') }}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <Alert variant="success" title="Success!" dismissible>
        Your profile has been updated successfully.
      </Alert>

      <Alert variant="warning" title="Warning" dismissible>
        Please verify your email address to continue.
      </Alert>

      <Alert variant="error" title="Error" dismissible>
        Failed to process your request. Please try again.
      </Alert>
    </div>
  );
}

// ============================================
// Example 7: Success/Error Feedback
// ============================================

export function FeedbackStateExample() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const simulateAction = () => {
    setState('loading');
    setTimeout(() => {
      setState(Math.random() > 0.5 ? 'success' : 'error');
    }, 2000);
  };

  if (state === 'loading') {
    return (
      <LoadingFeedback
        title="Processing..."
        message="Please wait while we process your request."
        progress={65}
        showProgress
      />
    );
  }

  if (state === 'success') {
    return (
      <SuccessFeedback
        title="Success!"
        message="Your action was completed successfully."
        action={{ label: 'Continue', onClick: () => setState('idle') }}
        icon="party"
      />
    );
  }

  if (state === 'error') {
    return (
      <ErrorFeedback
        title="Something went wrong"
        message="We encountered an error while processing your request."
        onRetry={simulateAction}
        onDismiss={() => setState('idle')}
      />
    );
  }

  return (
    <button onClick={simulateAction} className="btn btn-primary">
      Simulate Action
    </button>
  );
}

// ============================================
// Example 8: Global Store Actions
// ============================================

export function GlobalStoreExample() {
  const showConfirmation = useFeedbackStore((state) => state.showConfirmation);
  const startProgress = useFeedbackStore((state) => state.startProgress);
  const updateProgress = useFeedbackStore((state) => state.updateProgress);
  const completeProgress = useFeedbackStore((state) => state.completeProgress);

  const handleDeleteWithStore = () => {
    showConfirmation({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      type: 'danger',
      isDestructive: true,
      onConfirm: () => {
        console.log('Document deleted');
      },
    });
  };

  const handleUploadWithStore = async () => {
    const progressId = startProgress({
      title: 'Uploading file...',
    });

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      updateProgress(progressId, i);
    }

    completeProgress(progressId, 'Upload complete!');
  };

  // Can also use actions outside components
  const handleActionOutsideComponent = () => {
    // This can be called from anywhere, even outside React components
    feedbackActions.success('Action completed!');
    feedbackActions.info('This is an info message');
  };

  return (
    <div className="space-y-2">
      <button onClick={handleDeleteWithStore} className="btn btn-danger">
        Delete (Store)
      </button>
      <button onClick={handleUploadWithStore} className="btn btn-primary">
        Upload (Store)
      </button>
      <button onClick={handleActionOutsideComponent} className="btn btn-secondary">
        Global Action
      </button>
    </div>
  );
}

// ============================================
// Example 9: Skeleton Loading
// ============================================

export function SkeletonExample() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setLoading(!loading)}
        className="btn btn-sm"
      >
        Toggle Loading
      </button>

      {loading ? (
        <div className="space-y-4">
          <Skeleton width={200} height={24} />
          <Skeleton width="100%" height={16} />
          <Skeleton width="90%" height={16} />
          <Skeleton width="80%" height={16} />
          
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Content Loaded</h2>
          <p>This is the actual content that appears after loading.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 10: Empty States
// ============================================

export function EmptyStateExample() {
  return (
    <div className="space-y-8">
      <EmptyState
        title="No documents yet"
        message="Create your first document to get started with Sandstone."
        icon={<span className="text-4xl">📄</span>}
        action={{ label: 'Create Document', onClick: () => console.log('Create') }}
      />

      <EmptyState
        title="No flashcards"
        message="You haven't created any flashcards yet."
        icon={<span className="text-4xl">🎴</span>}
        action={{ label: 'Create Deck', onClick: () => console.log('Create deck') }}
        secondaryAction={{ label: 'Import', onClick: () => console.log('Import') }}
      />
    </div>
  );
}

// ============================================
// Example 11: Preset Toast Messages
// ============================================

export function PresetMessagesExample() {
  return (
    <div className="space-y-2">
      <button
        onClick={() => ToastMessages.auth.loginSuccess('John')}
        className="btn btn-sm"
      >
        Login Success
      </button>
      <button
        onClick={() => ToastMessages.documents.saved()}
        className="btn btn-sm"
      >
        Document Saved
      </button>
      <button
        onClick={() => ToastMessages.flashcards.deckCreated()}
        className="btn btn-sm"
      >
        Deck Created
      </button>
      <button
        onClick={() => ToastMessages.grading.submitted()}
        className="btn btn-sm"
      >
        Grading Submitted
      </button>
      <button
        onClick={() => ToastMessages.general.copied()}
        className="btn btn-sm"
      >
        Copied to Clipboard
      </button>
    </div>
  );
}

// ============================================
// Example 12: Async Feedback with Data
// ============================================

export function AsyncFeedbackWithDataExample() {
  const {
    execute,
    data,
    status,
    isLoading,
    isSuccess,
    isError,
    error,
    reset,
  } = useAsyncFeedback(
    async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    {
      successMessage: 'User data loaded!',
      errorMessage: 'Failed to load user data',
    }
  );

  return (
    <div className="space-y-4">
      <button
        onClick={() => execute()}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Loading...' : 'Load User Data'}
      </button>

      {isSuccess && data && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium">User: {data.name}</h3>
          <p>Email: {data.email}</p>
        </div>
      )}

      {isError && (
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-600">Error: {error?.message}</p>
          <button onClick={reset} className="text-sm underline mt-2">
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Example Page
// ============================================

export default function FeedbackExamplesPage() {
  return (
    <div className="p-8 space-y-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Feedback System Examples</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">1. Toast Notifications</h2>
        <ToastExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. useFeedback Hook</h2>
        <FeedbackHookExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Progress Indicators</h2>
        <ProgressExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Confirmation Dialogs</h2>
        <ConfirmationExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">5. Status Messages</h2>
        <StatusMessageExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">6. Alerts</h2>
        <AlertExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">7. Success/Error Feedback</h2>
        <FeedbackStateExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">8. Global Store Actions</h2>
        <GlobalStoreExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">9. Skeleton Loading</h2>
        <SkeletonExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">10. Empty States</h2>
        <EmptyStateExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">11. Preset Messages</h2>
        <PresetMessagesExample />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">12. Async with Data</h2>
        <AsyncFeedbackWithDataExample />
      </section>
    </div>
  );
}
