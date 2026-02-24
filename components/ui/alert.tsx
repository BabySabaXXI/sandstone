"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Alert Component
 * 
 * A versatile alert component for displaying important messages.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Alert variant="info">
 *   <AlertTitle>Information</AlertTitle>
 *   <AlertDescription>This is an informational message.</AlertDescription>
 * </Alert>
 */

// ============================================
// Alert Variants
// ============================================

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 " +
  "transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-foreground",
        info: "bg-blue-100/50 border-blue-200 text-blue-800",
        success: "bg-sage-100/50 border-sage-200 text-sage-800",
        warning: "bg-amber-100/50 border-amber-200 text-amber-800",
        error: "bg-rose-100/50 border-rose-200 text-rose-800",
        primary: "bg-peach-100/50 border-peach-200 text-sand-800",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-4",
        lg: "p-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ============================================
// Alert Icon Mapping
// ============================================

const alertIcons = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  primary: Info,
};

// ============================================
// Alert Component
// ============================================

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = "default",
      size,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = alertIcons[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex gap-3">
          {icon !== null && (
            <div className="flex-shrink-0 mt-0.5">
              {icon || <IconComponent className="h-5 w-5 opacity-80" />}
            </div>
          )}
          <div className="flex-1">{children}</div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className={cn(
                "flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg",
                "opacity-60 hover:opacity-100",
                "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-peach-100",
                "transition-opacity duration-150"
              )}
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

// ============================================
// Alert Title
// ============================================

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-medium leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

// ============================================
// Alert Description
// ============================================

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm opacity-90 leading-relaxed",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// ============================================
// Alert Actions
// ============================================

const AlertActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 mt-3",
      className
    )}
    {...props}
  />
));
AlertActions.displayName = "AlertActions";

// ============================================
// Toast Alert - Compact Alert for Toasts
// ============================================

interface ToastAlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ToastAlert: React.FC<ToastAlertProps> = ({
  variant = "info",
  title,
  message,
  onClose,
  action,
}) => {
  const IconComponent = alertIcons[variant];

  const variantClasses = {
    info: "bg-blue-100 border-blue-200 text-blue-800",
    success: "bg-sage-100 border-sage-200 text-sage-800",
    warning: "bg-amber-100 border-amber-200 text-amber-800",
    error: "bg-rose-100 border-rose-200 text-rose-800",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-soft-md min-w-[320px] max-w-md",
        variantClasses[variant]
      )}
      role="alert"
    >
      <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-80" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm">{title}</p>}
        <p className={cn("text-sm opacity-90", title && "mt-0.5")}>{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline underline-offset-2 hover:opacity-80"
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// ============================================
// Inline Alert - For Form Validation
// ============================================

interface InlineAlertProps {
  message: string;
  variant?: "error" | "warning" | "success";
  className?: string;
}

const InlineAlert: React.FC<InlineAlertProps> = ({
  message,
  variant = "error",
  className,
}) => {
  const IconComponent = alertIcons[variant];

  const variantClasses = {
    error: "text-rose-200",
    warning: "text-amber-200",
    success: "text-sage-300",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm",
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      <IconComponent className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// ============================================
// Banner Alert - Full-width Alert
// ============================================

interface BannerAlertProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const BannerAlert: React.FC<BannerAlertProps> = ({
  variant = "info",
  title,
  message,
  onDismiss,
  action,
}) => {
  const IconComponent = alertIcons[variant];

  const variantClasses = {
    info: "bg-blue-100/80 border-blue-200 text-blue-900",
    success: "bg-sage-100/80 border-sage-200 text-sage-900",
    warning: "bg-amber-100/80 border-amber-200 text-amber-900",
    error: "bg-rose-100/80 border-rose-200 text-rose-900",
  };

  return (
    <div
      className={cn(
        "w-full border-b px-4 py-3",
        variantClasses[variant]
      )}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <IconComponent className="h-5 w-5 flex-shrink-0 opacity-80" />
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {title && <span className="font-semibold">{title}</span>}
          <span className={title ? "opacity-90" : ""}>{message}</span>
          {action && (
            <button
              onClick={action.onClick}
              className="font-medium underline underline-offset-2 hover:opacity-80 ml-2"
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// Alert Stack - Multiple Alerts
// ============================================

interface AlertItem {
  id: string;
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  message: string;
}

interface AlertStackProps {
  alerts: AlertItem[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const AlertStack: React.FC<AlertStackProps> = ({
  alerts,
  onDismiss,
  className,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          dismissible={!!onDismiss}
          onDismiss={() => onDismiss?.(alert.id)}
        >
          {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  ToastAlert,
  InlineAlert,
  BannerAlert,
  AlertStack,
  alertVariants,
  alertIcons,
};

export type {
  AlertProps,
  ToastAlertProps,
  InlineAlertProps,
  BannerAlertProps,
  AlertItem,
  AlertStackProps,
};
