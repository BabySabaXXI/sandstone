/**
 * Feedback Provider
 * 
 * Main provider component that integrates all feedback systems
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { useFeedbackStore, feedbackActions } from '@/store/feedback-store';
import { useNetworkStatus } from '@/hooks/use-feedback';
import { ConfirmationDialog, AlertDialog } from '@/components/ui/confirmation-dialog';
import { AlertGroup } from '@/components/ui/alert';
import { ProcessingStatus } from '@/components/ui/progress-indicator';
import { AnimatePresence } from 'framer-motion';

// ============================================
// Types
// ============================================

interface FeedbackProviderProps {
  children: React.ReactNode;
  toastPosition?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  toastDuration?: number;
  enableNetworkStatus?: boolean;
  enableKeyboardShortcuts?: boolean;
}

// ============================================
// Toast Integration Component
// ============================================

const ToastIntegration: React.FC = () => {
  const toasts = useFeedbackStore((state) => state.toasts);
  const dismissToast = useFeedbackStore((state) => state.dismissToast);

  // Sync store toasts with Sonner
  useEffect(() => {
    toasts.forEach((t) => {
      const existingToast = toast.getToasts().find((st) => st.id === t.id);
      if (!existingToast) {
        switch (t.type) {
          case 'success':
            toast.success(t.title, { id: t.id, description: t.message });
            break;
          case 'error':
            toast.error(t.title, { id: t.id, description: t.message });
            break;
          case 'warning':
            toast.warning(t.title, { id: t.id, description: t.message });
            break;
          case 'info':
            toast.info(t.title, { id: t.id, description: t.message });
            break;
          case 'loading':
            toast.loading(t.title, { id: t.id, description: t.message });
            break;
        }
      }
    });

    // Clean up dismissed toasts
    const storeToastIds = new Set(toasts.map((t) => t.id));
    toast.getToasts().forEach((st) => {
      if (!storeToastIds.has(st.id as string)) {
        toast.dismiss(st.id);
      }
    });
  }, [toasts]);

  return null;
};

// ============================================
// Dialog Manager Component
// ============================================

const DialogManager: React.FC = () => {
  const confirmationDialog = useFeedbackStore((state) => state.confirmationDialog);
  const alertDialog = useFeedbackStore((state) => state.alertDialog);
  const hideConfirmation = useFeedbackStore((state) => state.hideConfirmation);
  const hideAlert = useFeedbackStore((state) => state.hideAlert);
  const confirm = useFeedbackStore((state) => state.confirm);
  const cancel = useFeedbackStore((state) => state.cancel);

  return (
    <>
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={hideConfirmation}
        onConfirm={confirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type={confirmationDialog.type}
        confirmText={confirmationDialog.confirmText}
        cancelText={confirmationDialog.cancelText}
        isDestructive={confirmationDialog.isDestructive}
      />

      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={hideAlert}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        buttonText={alertDialog.buttonText}
      />
    </>
  );
};

// ============================================
// Progress Manager Component
// ============================================

const ProgressManager: React.FC = () => {
  const progressItems = useFeedbackStore((state) => state.progressItems);
  const removeProgress = useFeedbackStore((state) => state.removeProgress);

  const activeProgress = progressItems.filter((p) => p.status === 'processing');

  if (activeProgress.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {activeProgress.map((item) => (
          <ProcessingStatus
            key={item.id}
            title={item.title}
            message={item.message}
            progress={item.progress}
            className="shadow-lg"
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Notification Center Component
// ============================================

const NotificationCenter: React.FC = () => {
  const feedbacks = useFeedbackStore((state) => state.feedbacks);
  const removeFeedback = useFeedbackStore((state) => state.removeFeedback);
  const markFeedbackAsRead = useFeedbackStore((state) => state.markFeedbackAsRead);

  const unreadFeedbacks = feedbacks.filter((f) => !f.read && f.dismissible !== false);

  if (unreadFeedbacks.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30 space-y-2 max-w-sm w-full">
      <AlertGroup
        alerts={unreadFeedbacks.slice(0, 3).map((f) => ({
          id: f.id,
          variant: f.type,
          title: f.title,
          message: f.message || '',
          dismissible: true,
        }))}
        onDismiss={(id) => {
          markFeedbackAsRead(id);
          removeFeedback(id);
        }}
      />
    </div>
  );
};

// ============================================
// Keyboard Shortcuts Component
// ============================================

const KeyboardShortcuts: React.FC = () => {
  const dismissAllToasts = useFeedbackStore((state) => state.dismissAllToasts);
  const clearAllFeedbacks = useFeedbackStore((state) => state.clearAllFeedbacks);
  const hideConfirmation = useFeedbackStore((state) => state.hideConfirmation);
  const hideAlert = useFeedbackStore((state) => state.hideAlert);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close dialogs and dismiss toasts
      if (e.key === 'Escape') {
        hideConfirmation();
        hideAlert();
        dismissAllToasts();
      }

      // Ctrl/Cmd + Shift + X to clear all notifications
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        clearAllFeedbacks();
        dismissAllToasts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hideConfirmation, hideAlert, dismissAllToasts, clearAllFeedbacks]);

  return null;
};

// ============================================
// Network Status Handler
// ============================================

const NetworkStatusHandler: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const addFeedback = useFeedbackStore((state) => state.addFeedback);

  useEffect(() => {
    if (networkStatus.wasOffline && networkStatus.isOnline) {
      addFeedback({
        type: 'success',
        title: 'Back Online',
        message: 'Your connection has been restored.',
        dismissible: true,
        duration: 3000,
      });
    } else if (!networkStatus.isOnline) {
      addFeedback({
        type: 'warning',
        title: 'You are offline',
        message: 'Some features may be unavailable.',
        dismissible: true,
      });
    }
  }, [networkStatus.isOnline, networkStatus.wasOffline, addFeedback]);

  return null;
};

// ============================================
// Main Feedback Provider
// ============================================

export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  children,
  toastPosition = 'top-center',
  toastDuration = 4000,
  enableNetworkStatus = true,
  enableKeyboardShortcuts = true,
}) => {
  const updateSettings = useFeedbackStore((state) => state.updateSettings);

  // Initialize settings
  useEffect(() => {
    updateSettings({
      toastPosition,
      toastDuration,
    });
  }, [toastPosition, toastDuration, updateSettings]);

  return (
    <>
      {children}

      {/* Sonner Toaster */}
      <Toaster
        position={toastPosition}
        toastOptions={{
          style: {
            background: '#2D2D2D',
            color: '#FFFFFF',
            border: 'none',
          },
          duration: toastDuration,
        }}
        richColors
        closeButton
      />

      {/* Toast Integration */}
      <ToastIntegration />

      {/* Dialog Manager */}
      <DialogManager />

      {/* Progress Manager */}
      <ProgressManager />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Keyboard Shortcuts */}
      {enableKeyboardShortcuts && <KeyboardShortcuts />}

      {/* Network Status */}
      {enableNetworkStatus && <NetworkStatusHandler />}
    </>
  );
};

// ============================================
// Feedback Consumer Hook
// ============================================

export const useGlobalFeedback = () => {
  const store = useFeedbackStore();

  return {
    // Toast methods
    toast: {
      success: (title: string, message?: string) =>
        store.showToast({ type: 'success', title, message }),
      error: (title: string, message?: string) =>
        store.showToast({ type: 'error', title, message }),
      warning: (title: string, message?: string) =>
        store.showToast({ type: 'warning', title, message }),
      info: (title: string, message?: string) =>
        store.showToast({ type: 'info', title, message }),
      loading: (title: string, message?: string) =>
        store.showToast({ type: 'loading', title, message, duration: Infinity }),
      dismiss: store.dismissToast,
      dismissAll: store.dismissAllToasts,
    },

    // Feedback methods
    feedback: {
      add: store.addFeedback,
      remove: store.removeFeedback,
      markAsRead: store.markFeedbackAsRead,
      clearAll: store.clearAllFeedbacks,
      clearRead: store.clearReadFeedbacks,
      unreadCount: store.getUnreadCount(),
      items: store.feedbacks,
    },

    // Progress methods
    progress: {
      start: store.startProgress,
      update: store.updateProgress,
      complete: store.completeProgress,
      error: store.errorProgress,
      items: store.progressItems,
    },

    // Dialog methods
    dialog: {
      confirm: store.showConfirmation,
      alert: store.showAlert,
      hideConfirmation: store.hideConfirmation,
      hideAlert: store.hideAlert,
    },

    // Settings
    settings: store.settings,
    updateSettings: store.updateSettings,
  };
};

export default FeedbackProvider;
