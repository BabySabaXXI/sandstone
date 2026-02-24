/**
 * Feedback Components
 * 
 * Success, error, and loading feedback components for user actions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowRight,
  PartyPopper,
  ThumbsUp,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

// ============================================
// Success Feedback
// ============================================

interface SuccessFeedbackProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: 'check' | 'party' | 'thumbs' | 'shield' | 'zap' | 'sparkles';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoDismiss?: boolean;
  dismissDuration?: number;
  onDismiss?: () => void;
}

const successIcons = {
  check: CheckCircle2,
  party: PartyPopper,
  thumbs: ThumbsUp,
  shield: ShieldCheck,
  zap: Zap,
  sparkles: Sparkles,
};

const sizeClasses = {
  sm: {
    container: 'p-4',
    icon: 'w-10 h-10',
    title: 'text-base',
    message: 'text-sm',
  },
  md: {
    container: 'p-6',
    icon: 'w-16 h-16',
    title: 'text-xl',
    message: 'text-base',
  },
  lg: {
    container: 'p-8',
    icon: 'w-20 h-20',
    title: 'text-2xl',
    message: 'text-lg',
  },
};

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  title = 'Success!',
  message = 'Your action was completed successfully.',
  action,
  secondaryAction,
  icon = 'check',
  size = 'md',
  className,
  autoDismiss = false,
  dismissDuration = 3000,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = successIcons[icon];
  const sizes = sizeClasses[size];

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, dismissDuration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, dismissDuration, onDismiss]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'flex flex-col items-center text-center',
        'bg-white dark:bg-gray-900 rounded-xl border border-green-200 dark:border-green-800',
        sizes.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          'rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4',
          sizes.icon
        )}
      >
        <Icon className="w-1/2 h-1/2 text-green-500" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'font-bold text-gray-900 dark:text-gray-100 mb-2',
          sizes.title
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'text-gray-600 dark:text-gray-400 mb-6',
          sizes.message
        )}
      >
        {message}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              {action.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              {secondaryAction.label}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// Error Feedback
// ============================================

interface ErrorFeedbackProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while processing your request.',
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  size = 'md',
  className,
}) => {
  const sizes = sizeClasses[size];
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'flex flex-col items-center text-center',
        'bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800',
        sizes.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={cn(
          'rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4',
          sizes.icon
        )}
      >
        <XCircle className="w-1/2 h-1/2 text-red-500" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          'font-bold text-gray-900 dark:text-gray-100 mb-2',
          sizes.title
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'text-gray-600 dark:text-gray-400 mb-4',
          sizes.message
        )}
      >
        {message}
      </motion.p>

      {showDetails && errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-md mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
        >
          <p className="text-xs text-red-600 dark:text-red-400 font-mono break-all">
            {errorMessage}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-3"
      >
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Dismiss
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

// ============================================
// Loading Feedback
// ============================================

interface LoadingFeedbackProps {
  title?: string;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingFeedback: React.FC<LoadingFeedbackProps> = ({
  title = 'Loading...',
  message = 'Please wait while we process your request.',
  progress,
  showProgress = false,
  size = 'md',
  className,
}) => {
  const sizes = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center text-center',
        'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
        sizes.container,
        className
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={cn(
          'rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500',
          sizes.icon
        )}
      />

      <h3
        className={cn(
          'font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2',
          sizes.title
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'text-gray-600 dark:text-gray-400 mb-4',
          sizes.message
        )}
      >
        {message}
      </p>

      {showProgress && typeof progress === 'number' && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// Empty State Feedback
// ============================================

interface EmptyStateFeedbackProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyStateFeedback: React.FC<EmptyStateFeedbackProps> = ({
  title,
  message,
  icon,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center text-center py-12 px-4',
        className
      )}
    >
      {icon && (
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {message && (
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          {message}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// Action Feedback (Button with feedback state)
// ============================================

interface ActionFeedbackProps {
  children: React.ReactNode;
  status: 'idle' | 'loading' | 'success' | 'error';
  successMessage?: string;
  errorMessage?: string;
  onReset?: () => void;
  className?: string;
}

export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  children,
  status,
  successMessage = 'Success!',
  errorMessage = 'Failed',
  onReset,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}

      <AnimatePresence>
        {status !== 'idle' && status !== 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 p-3 rounded-lg text-sm text-center',
              status === 'success' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
              status === 'error' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {status === 'success' ? successMessage : errorMessage}
              {onReset && (
                <button
                  onClick={onReset}
                  className="ml-2 underline hover:no-underline"
                >
                  Reset
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Form Field Feedback
// ============================================

interface FormFieldFeedbackProps {
  status: 'idle' | 'valid' | 'invalid' | 'validating';
  message?: string;
  className?: string;
}

export const FormFieldFeedback: React.FC<FormFieldFeedbackProps> = ({
  status,
  message,
  className,
}) => {
  if (status === 'idle' || !message) return null;

  const config = {
    valid: {
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
    },
    invalid: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
    },
    validating: {
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
    },
  };

  const { icon: Icon, color } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn('flex items-center gap-1.5 mt-1.5', color, className)}
    >
      <Icon className={cn('w-4 h-4', status === 'validating' && 'animate-spin')} />
      <span className="text-sm">{message}</span>
    </motion.div>
  );
};

// ============================================
// Toast Feedback
// ============================================

interface ToastFeedbackProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ToastFeedback: React.FC<ToastFeedbackProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconColor: 'text-red-500',
    },
    info: {
      icon: Loader2,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const { icon: Icon, bg, border, iconColor } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm',
        'rounded-lg border shadow-lg p-4',
        bg,
        border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
          <Icon className={cn('w-5 h-5', type === 'info' && 'animate-spin')} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
          {message && (
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// Feedback Provider (Context for global feedback)
// ============================================

import { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';

interface FeedbackContextType {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showLoading: (title: string, message?: string) => string;
  dismiss: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const showSuccess = useCallback((title: string, message?: string) => {
    toast.success(title, { description: message });
  }, []);

  const showError = useCallback((title: string, message?: string) => {
    toast.error(title, { description: message });
  }, []);

  const showLoading = useCallback((title: string, message?: string) => {
    return toast.loading(title, { description: message });
  }, []);

  const dismiss = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  return (
    <FeedbackContext.Provider value={{ showSuccess, showError, showLoading, dismiss }}>
      {children}
    </FeedbackContext.Provider>
  );
};

// Export all feedback components
export const Feedback = {
  Success: SuccessFeedback,
  Error: ErrorFeedback,
  Loading: LoadingFeedback,
  Empty: EmptyStateFeedback,
  Action: ActionFeedback,
  FormField: FormFieldFeedback,
  Toast: ToastFeedback,
  Provider: FeedbackProvider,
  useFeedback,
};

export default Feedback;
