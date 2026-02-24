"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  memo,
  ReactNode,
} from "react";
import { Toaster, toast } from "sonner";

// =============================================================================
// Types
// =============================================================================

type ToastPosition = "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface ToastOptions {
  description?: string;
  duration?: number;
  position?: ToastPosition;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
  closeButton?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  id?: string;
}

interface NotificationContextType {
  // Basic toast methods
  show: (message: string, options?: ToastOptions) => string;
  showSuccess: (message: string, options?: Omit<ToastOptions, "icon">) => string;
  showError: (message: string, options?: Omit<ToastOptions, "icon">) => string;
  showWarning: (message: string, options?: Omit<ToastOptions, "icon">) => string;
  showInfo: (message: string, options?: Omit<ToastOptions, "icon">) => string;
  showLoading: (message: string, options?: Omit<ToastOptions, "icon">) => string;
  
  // Promise-based toast
  showPromise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: Omit<ToastOptions, "icon">
  ) => Promise<T>;
  
  // Toast management
  dismiss: (toastId?: string) => void;
  dismissAll: () => void;
  update: (toastId: string, options: ToastOptions) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  visibleToasts?: number;
  toastOptions?: {
    style?: React.CSSProperties;
    className?: string;
  };
}

// =============================================================================
// Context
// =============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

function NotificationProviderComponent({
  children,
  position = "top-center",
  richColors = true,
  closeButton = true,
  duration = 4000,
  visibleToasts = 5,
  toastOptions = {
    style: {
      background: "var(--toast-bg, #2D2D2D)",
      color: "var(--toast-color, #FFFFFF)",
      border: "none",
    },
  },
}: NotificationProviderProps) {
  // =============================================================================
  // Toast Methods
  // =============================================================================

  const show = useCallback((message: string, options?: ToastOptions): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast(message, {
      ...options,
      id: toastId,
      duration: options?.duration ?? duration,
    });
    
    return toastId;
  }, [duration]);

  const showSuccess = useCallback((message: string, options?: Omit<ToastOptions, "icon">): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast.success(message, {
      ...options,
      id: toastId,
      duration: options?.duration ?? duration,
    });
    
    return toastId;
  }, [duration]);

  const showError = useCallback((message: string, options?: Omit<ToastOptions, "icon">): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast.error(message, {
      ...options,
      id: toastId,
      duration: options?.duration ?? 6000, // Errors stay longer
    });
    
    return toastId;
  }, []);

  const showWarning = useCallback((message: string, options?: Omit<ToastOptions, "icon">): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast.warning(message, {
      ...options,
      id: toastId,
      duration: options?.duration ?? duration,
    });
    
    return toastId;
  }, [duration]);

  const showInfo = useCallback((message: string, options?: Omit<ToastOptions, "icon">): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast.info(message, {
      ...options,
      id: toastId,
      duration: options?.duration ?? duration,
    });
    
    return toastId;
  }, [duration]);

  const showLoading = useCallback((message: string, options?: Omit<ToastOptions, "icon">): string => {
    const toastId = options?.id || crypto.randomUUID();
    
    toast.loading(message, {
      ...options,
      id: toastId,
      duration: Infinity, // Loading toasts don't auto-dismiss
    });
    
    return toastId;
  }, []);

  const showPromise = useCallback(<T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: Omit<ToastOptions, "icon">
  ): Promise<T> => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  const update = useCallback((toastId: string, options: ToastOptions) => {
    toast.custom((t) => ({
      ...options,
      id: toastId,
    }));
  }, []);

  // =============================================================================
  // Memoized Value
  // =============================================================================

  const value = useMemo<NotificationContextType>(
    () => ({
      show,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showLoading,
      showPromise,
      dismiss,
      dismissAll,
      update,
    }),
    [
      show,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showLoading,
      showPromise,
      dismiss,
      dismissAll,
      update,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position={position}
        richColors={richColors}
        closeButton={closeButton}
        duration={duration}
        visibleToasts={visibleToasts}
        toastOptions={toastOptions}
        gap={8}
        offset={16}
        mobileOffset={16}
        swipeDirections={["left", "right"]}
        pauseWhenPageIsHidden
      />
    </NotificationContext.Provider>
  );
}

// Memoize the provider
export const NotificationProvider = memo(NotificationProviderComponent);
NotificationProvider.displayName = "NotificationProvider";

// =============================================================================
// Hook
// =============================================================================

export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}

// =============================================================================
// Convenience Hooks
// =============================================================================

/**
 * Hook for showing toast notifications with a specific type
 */
export function useToast(type: ToastType = "info") {
  const { show, showSuccess, showError, showWarning, showInfo, showLoading } = useNotification();
  
  switch (type) {
    case "success":
      return showSuccess;
    case "error":
      return showError;
    case "warning":
      return showWarning;
    case "loading":
      return showLoading;
    case "info":
    default:
      return showInfo;
  }
}

/**
 * Hook for promise-based toast notifications
 */
export function usePromiseToast() {
  const { showPromise } = useNotification();
  return showPromise;
}

export default NotificationContext;
