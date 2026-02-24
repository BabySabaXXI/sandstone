"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as ToastPrimitives from "@radix-ui/react-toast";

import { cn } from "@/lib/utils";

/**
 * Toast Component
 * 
 * A toast notification component built on Radix UI Toast primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <ToastProvider>
 *   <Toast>
 *     <ToastTitle>Success</ToastTitle>
 *     <ToastDescription>Your changes have been saved.</ToastDescription>
 *   </Toast>
 *   <ToastViewport />
 * </ToastProvider>
 */

// ============================================
// Toast Provider
// ============================================

const ToastProvider = ToastPrimitives.Provider;

// ============================================
// Toast Viewport
// ============================================

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-toast flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// ============================================
// Toast Variants
// ============================================

const toastVariants = cva(
  "group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-soft-lg transition-all " +
  "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none " +
  "data-[state=open]:animate-slide-in-right data-[state=closed]:animate-fade-out data-[swipe=end]:animate-slide-out-right",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-foreground",
        info: "bg-blue-100 border-blue-200 text-blue-900",
        success: "bg-sage-100 border-sage-200 text-sage-900",
        warning: "bg-amber-100 border-amber-200 text-amber-900",
        error: "bg-rose-100 border-rose-200 text-rose-900",
        primary: "bg-peach-100 border-peach-200 text-sand-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// ============================================
// Toast Component
// ============================================

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(
  ({ className, variant, ...props }, ref) => {
    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Toast.displayName = ToastPrimitives.Root.displayName;

// ============================================
// Toast Action
// ============================================

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-transparent " +
      "bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors " +
      "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 " +
      "disabled:pointer-events-none disabled:opacity-50 " +
      "group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

// ============================================
// Toast Close
// ============================================

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity " +
      "hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

// ============================================
// Toast Title
// ============================================

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

// ============================================
// Toast Description
// ============================================

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// ============================================
// Toast Icon
// ============================================

const toastIcons = {
  default: null,
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5 text-sage-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  primary: (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

// ============================================
// Simple Toast - Quick Usage Component
// ============================================

interface SimpleToastProps {
  variant?: "default" | "info" | "success" | "warning" | "error" | "primary";
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration?: number;
}

const SimpleToast: React.FC<SimpleToastProps> = ({
  variant = "default",
  title,
  description,
  action,
  open,
  onOpenChange,
  duration = 5000,
}) => {
  const icon = toastIcons[variant];

  return (
    <ToastProvider>
      <Toast
        variant={variant}
        open={open}
        onOpenChange={onOpenChange}
        duration={duration}
      >
        <div className="flex gap-3">
          {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
          <div className="flex-1 grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            <ToastDescription>{description}</ToastDescription>
          </div>
        </div>
        {action && (
          <ToastAction altText={action.label} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        )}
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

// ============================================
// Toast Hook
// ============================================

type ToastType = "default" | "info" | "success" | "warning" | "error" | "primary";

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState extends ToastOptions {
  id: string;
  open: boolean;
}

interface UseToastReturn {
  toasts: ToastState[];
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  const toast = React.useCallback((options: ToastOptions): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastState = {
      ...options,
      id,
      open: true,
      duration: options.duration || 5000,
    };
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, open: false } : t))
    );
    // Remove from state after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const dismissAll = React.useCallback(() => {
    setToasts((prev) => prev.map((t) => ({ ...t, open: false })));
    setTimeout(() => {
      setToasts([]);
    }, 300);
  }, []);

  return { toasts, toast, dismiss, dismissAll };
};

// ============================================
// Toast Container - For Multiple Toasts
// ============================================

interface ToastContainerProps {
  toasts: ToastState[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          variant={t.variant}
          open={t.open}
          onOpenChange={(open) => {
            if (!open) onDismiss(t.id);
          }}
          duration={t.duration}
        >
          <div className="flex gap-3">
            {toastIcons[t.variant || "default"] && (
              <div className="flex-shrink-0 mt-0.5">
                {toastIcons[t.variant || "default"]}
              </div>
            )}
            <div className="flex-1 grid gap-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              <ToastDescription>{t.description}</ToastDescription>
            </div>
          </div>
          {t.action && (
            <ToastAction altText={t.action.label} onClick={t.action.onClick}>
              {t.action.label}
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
};

// ============================================
// Toast Helper Functions
// ============================================

const createToastHelpers = (toastFn: (options: ToastOptions) => string) => ({
  success: (description: string, title?: string, duration?: number) =>
    toastFn({ variant: "success", title, description, duration }),
  error: (description: string, title?: string, duration?: number) =>
    toastFn({ variant: "error", title, description, duration }),
  warning: (description: string, title?: string, duration?: number) =>
    toastFn({ variant: "warning", title, description, duration }),
  info: (description: string, title?: string, duration?: number) =>
    toastFn({ variant: "info", title, description, duration }),
  default: (description: string, title?: string, duration?: number) =>
    toastFn({ variant: "default", title, description, duration }),
});

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  SimpleToast,
  ToastContainer,
  useToast,
  createToastHelpers,
  toastVariants,
  toastIcons,
};

export type {
  ToastProps,
  SimpleToastProps,
  ToastOptions,
  ToastState,
  UseToastReturn,
  ToastContainerProps,
  ToastType,
};
