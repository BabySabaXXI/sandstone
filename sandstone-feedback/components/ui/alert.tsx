/**
 * Alert Components
 * 
 * Alert banners, notifications, and inline alerts for user feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';

// ============================================
// Alert Types
// ============================================

type AlertVariant = 'info' | 'success' | 'warning' | 'error' | 'default';
type AlertSize = 'sm' | 'md' | 'lg';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: AlertSize;
}

const alertVariants = {
  default: {
    container: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
    icon: 'text-gray-500',
    title: 'text-gray-900 dark:text-gray-100',
    content: 'text-gray-600 dark:text-gray-400',
    Icon: Info,
  },
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-900 dark:text-blue-100',
    content: 'text-blue-700 dark:text-blue-300',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-900 dark:text-green-100',
    content: 'text-green-700 dark:text-green-300',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-900 dark:text-yellow-100',
    content: 'text-yellow-700 dark:text-yellow-300',
    Icon: AlertTriangle,
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-900 dark:text-red-100',
    content: 'text-red-700 dark:text-red-300',
    Icon: XCircle,
  },
};

const sizeClasses = {
  sm: 'p-3 text-sm',
  md: 'p-4',
  lg: 'p-6',
};

// ============================================
// Main Alert Component
// ============================================

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  title,
  children,
  icon: customIcon,
  dismissible = false,
  onDismiss,
  action,
  className,
  size = 'md',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = alertVariants[variant];
  const Icon = config.Icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'relative rounded-lg border',
        config.container,
        sizeClasses[size],
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', config.icon)}>
          {customIcon || <Icon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('font-semibold mb-1', config.title)}>
              {title}
            </h4>
          )}
          <div className={cn('text-sm leading-relaxed', config.content)}>
            {children}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 text-sm font-medium underline-offset-2 hover:underline',
                config.content
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              'flex-shrink-0 -mt-1 -mr-1 p-1 rounded-full transition-colors',
              'hover:bg-black/5 dark:hover:bg-white/10',
              config.icon
            )}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// Alert Banner (Full-width)
// ============================================

interface AlertBannerProps {
  variant?: AlertVariant;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  message,
  dismissible = true,
  onDismiss,
  action,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = alertVariants[variant];
  const Icon = config.Icon;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'w-full border-b',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className={cn('w-5 h-5 flex-shrink-0', config.icon)} />
            <span className={cn('text-sm', config.content)}>{message}</span>
          </div>
          <div className="flex items-center gap-3">
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  'text-sm font-medium underline-offset-2 hover:underline whitespace-nowrap',
                  config.content
                )}
              >
                {action.label}
              </button>
            )}
            {dismissible && (
              <button
                onClick={handleDismiss}
                className={cn(
                  'p-1 rounded-full transition-colors',
                  'hover:bg-black/5 dark:hover:bg-white/10',
                  config.icon
                )}
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Inline Alert
// ============================================

interface InlineAlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'info',
  message,
  className,
}) => {
  const config = alertVariants[variant];
  const Icon = config.Icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', config.content, className)}>
      <Icon className={cn('w-4 h-4', config.icon)} />
      {message}
    </span>
  );
};

// ============================================
// Alert Toast
// ============================================

interface AlertToastProps {
  variant?: AlertVariant;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export const AlertToast: React.FC<AlertToastProps> = ({
  variant = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = alertVariants[variant];
  const Icon = config.Icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm',
        'bg-white dark:bg-gray-900 rounded-lg shadow-lg border',
        'p-4 flex items-start gap-3',
        className
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0 mt-0.5', config.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        {message && (
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        )}
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// ============================================
// Alert Group (Multiple Alerts)
// ============================================

interface AlertItem {
  id: string;
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
}

interface AlertGroupProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export const AlertGroup: React.FC<AlertGroupProps> = ({
  alerts,
  onDismiss,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      <AnimatePresence>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            dismissible={alert.dismissible}
            onDismiss={() => onDismiss?.(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Feature Alert (New feature announcement)
// ============================================

interface FeatureAlertProps {
  title: string;
  description: string;
  onDismiss?: () => void;
  onLearnMore?: () => void;
  className?: string;
}

export const FeatureAlert: React.FC<FeatureAlertProps> = ({
  title,
  description,
  onDismiss,
  onLearnMore,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-r from-blue-500 to-purple-600',
        'p-6 text-white',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed">{description}</p>
            <div className="flex items-center gap-3 mt-4">
              {onLearnMore && (
                <button
                  onClick={onLearnMore}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Learn More
                </button>
              )}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// System Alert (Critical system messages)
// ============================================

interface SystemAlertProps {
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export const SystemAlert: React.FC<SystemAlertProps> = ({
  title,
  message,
  severity = 'medium',
  onDismiss,
  onAction,
  actionLabel = 'Take Action',
  className,
}) => {
  const severityConfig = {
    low: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
      Icon: Info,
    },
    medium: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-500',
      Icon: AlertTriangle,
    },
    high: {
      container: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      icon: 'text-orange-500',
      Icon: AlertOctagon,
    },
    critical: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-500',
      Icon: AlertOctagon,
    },
  };

  const config = severityConfig[severity];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'rounded-lg border p-4',
        config.container,
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-4">
        <div className={cn('flex-shrink-0', config.icon)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium uppercase',
                severity === 'critical' && 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
                severity === 'high' && 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300',
                severity === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
                severity === 'low' && 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
              )}
            >
              {severity}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{message}</p>
          <div className="flex items-center gap-3">
            {onAction && (
              <button
                onClick={onAction}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                  severity === 'critical' && 'bg-red-600 hover:bg-red-700',
                  severity === 'high' && 'bg-orange-600 hover:bg-orange-700',
                  severity === 'medium' && 'bg-yellow-600 hover:bg-yellow-700',
                  severity === 'low' && 'bg-blue-600 hover:bg-blue-700',
                )}
              >
                {actionLabel}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Notification Badge
// ============================================

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'default' | 'error' | 'warning' | 'success';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'default',
  className,
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  const variantClasses = {
    default: 'bg-blue-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    success: 'bg-green-500',
  };

  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[1.25rem] h-5 px-1',
        'text-xs font-bold text-white rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {displayCount}
    </span>
  );
};

// ============================================
// Alert Hook
// ============================================

import { create } from 'zustand';

interface AlertState {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ alerts: [...state.alerts, { ...alert, id }] }));
    return id;
  },
  removeAlert: (id) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },
  clearAlerts: () => set({ alerts: [] }),
}));

// Export all alert components
export const Alerts = {
  Alert,
  Banner: AlertBanner,
  Inline: InlineAlert,
  Toast: AlertToast,
  Group: AlertGroup,
  Feature: FeatureAlert,
  System: SystemAlert,
  Badge: NotificationBadge,
};

export default Alerts;
