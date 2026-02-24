/**
 * Confirmation Dialog Components
 * 
 * Modal dialogs for user confirmations and decisions
 */

'use client';

import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Trash2,
  LogOut,
  Save,
  X,
  CheckCircle2,
  Info,
  AlertCircle,
} from 'lucide-react';

// ============================================
// Dialog Types
// ============================================

type DialogType = 'danger' | 'warning' | 'info' | 'success' | 'confirm';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  confirmIcon?: React.ReactNode;
  isLoading?: boolean;
  isDestructive?: boolean;
  showCancel?: boolean;
  className?: string;
}

const dialogConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  confirm: {
    icon: Info,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    confirmButton: 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
};

// ============================================
// Main Confirmation Dialog
// ============================================

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmIcon,
  isLoading = false,
  isDestructive = false,
  showCancel = true,
  className,
}) => {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (e.key === 'Enter' && isOpen) {
        onConfirm();
      }
    },
    [isOpen, onClose, onConfirm]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const config = dialogConfig[isDestructive ? 'danger' : type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-md z-50',
              className
            )}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      config.iconBg
                    )}
                  >
                    <Icon className={cn('w-5 h-5', config.iconColor)} />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                {showCancel && (
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    config.confirmButton
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {confirmIcon}
                      {confirmText}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================
// Preset Dialogs
// ============================================

// Delete Confirmation
interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  isLoading = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      message={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
      }
      type="danger"
      confirmText="Delete"
      confirmIcon={<Trash2 className="w-4 h-4" />}
      isLoading={isLoading}
      isDestructive
    />
  );
};

// Save Confirmation
interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDiscard?: () => void;
  isLoading?: boolean;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  isLoading = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Unsaved Changes"
      message="You have unsaved changes. Do you want to save them before leaving?"
      type="warning"
      confirmText="Save Changes"
      confirmIcon={<Save className="w-4 h-4" />}
      isLoading={isLoading}
    />
  );
};

// Logout Confirmation
interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const LogoutDialog: React.FC<LogoutDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log Out"
      message="Are you sure you want to log out?"
      type="info"
      confirmText="Log Out"
      confirmIcon={<LogOut className="w-4 h-4" />}
      isLoading={isLoading}
    />
  );
};

// Discard Changes Confirmation
interface DiscardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DiscardDialog: React.FC<DiscardDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Discard Changes"
      message="Are you sure you want to discard your changes? This action cannot be undone."
      type="warning"
      confirmText="Discard"
      isLoading={isLoading}
      isDestructive
    />
  );
};

// ============================================
// Alert Dialog (non-confirm)
// ============================================

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: DialogType;
  buttonText?: string;
  className?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
  className,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title={title}
      message={message}
      type={type}
      confirmText={buttonText}
      showCancel={false}
      className={className}
    />
  );
};

// ============================================
// Custom Dialog Hook
// ============================================

import { useState } from 'react';

interface UseConfirmationDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  ConfirmationDialogComponent: React.FC<Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>>;
}

export const useConfirmationDialog = (): UseConfirmationDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const ConfirmationDialogComponent = useCallback(
    (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => (
      <ConfirmationDialog isOpen={isOpen} onClose={close} {...props} />
    ),
    [isOpen]
  );

  return {
    isOpen,
    open,
    close,
    ConfirmationDialogComponent,
  };
};

// ============================================
// Dialog Stack Manager
// ============================================

interface DialogStackItem {
  id: string;
  component: React.ReactNode;
}

interface DialogManagerProps {
  dialogs: DialogStackItem[];
  onClose: (id: string) => void;
}

export const DialogManager: React.FC<DialogManagerProps> = ({
  dialogs,
  onClose,
}) => {
  return (
    <>
      {dialogs.map((dialog, index) => (
        <div key={dialog.id} style={{ zIndex: 50 + index }}>
          {dialog.component}
        </div>
      ))}
    </>
  );
};

// Export all dialog components
export const Dialogs = {
  Confirmation: ConfirmationDialog,
  Delete: DeleteDialog,
  Save: SaveDialog,
  Logout: LogoutDialog,
  Discard: DiscardDialog,
  Alert: AlertDialog,
  Manager: DialogManager,
};

export default Dialogs;
