"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

/**
 * Modal/Dialog Component
 * 
 * A flexible modal dialog component built on Radix UI Dialog primitives.
 * Part of the Sandstone Design System.
 * 
 * @example
 * <Modal>
 *   <ModalTrigger>Open</ModalTrigger>
 *   <ModalContent>
 *     <ModalHeader>
 *       <ModalTitle>Title</ModalTitle>
 *       <ModalDescription>Description</ModalDescription>
 *     </ModalHeader>
 *     <ModalBody>Content</ModalBody>
 *     <ModalFooter>
 *       <Button>Action</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 */

// ============================================
// Modal Root Components
// ============================================

const Modal = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

// ============================================
// Modal Overlay
// ============================================

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

// ============================================
// Modal Content Variants
// ============================================

const modalContentVariants = cva(
  "fixed left-[50%] top-[50%] z-modal w-full translate-x-[-50%] translate-y-[-50%] " +
  "bg-card border border-border shadow-soft-lg " +
  "duration-300 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
  {
    variants: {
      size: {
        sm: "max-w-sm rounded-xl",
        md: "max-w-md rounded-xl",
        lg: "max-w-lg rounded-2xl",
        xl: "max-w-xl rounded-2xl",
        "2xl": "max-w-2xl rounded-2xl",
        "3xl": "max-w-3xl rounded-2xl",
        "4xl": "max-w-4xl rounded-2xl",
        full: "max-w-[95vw] max-h-[95vh] rounded-2xl",
      },
      position: {
        center: "",
        top: "top-[10%] translate-y-0",
        bottom: "top-auto bottom-[10%] translate-y-0",
      },
    },
    defaultVariants: {
      size: "md",
      position: "center",
    },
  }
);

// ============================================
// Modal Content
// ============================================

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  showCloseButton?: boolean;
  onClose?: () => void;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    { className, children, size, position, showCloseButton = true, onClose, ...props },
    ref
  ) => (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(modalContentVariants({ size, position }), className)}
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-lg p-1.5",
              "text-sand-500 opacity-70 transition-opacity",
              "hover:bg-sand-100 hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-peach-100",
              "disabled:pointer-events-none"
            )}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

// ============================================
// Modal Header
// ============================================

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 pb-4",
      className
    )}
    {...props}
  />
));
ModalHeader.displayName = "ModalHeader";

// ============================================
// Modal Footer
// ============================================

const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 gap-3 sm:gap-0",
      className
    )}
    {...props}
  />
));
ModalFooter.displayName = "ModalFooter";

// ============================================
// Modal Title
// ============================================

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

// ============================================
// Modal Description
// ============================================

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

// ============================================
// Modal Body
// ============================================

const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
ModalBody.displayName = "ModalBody";

// ============================================
// Confirm Modal - Specialized Component
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "destructive" | "secondary";
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isLoading = false,
  size = "sm",
}) => {
  const confirmButtonClass = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    destructive: "bg-rose-200 text-white hover:bg-rose-200/90",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-sand-200",
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size={size} showCloseButton={false}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-sand-700 bg-transparent rounded-[10px] hover:bg-sand-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-[10px] transition-all duration-200",
              "disabled:opacity-50 disabled:pointer-events-none",
              confirmButtonClass[confirmVariant]
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ============================================
// Alert Modal - Specialized Component
// ============================================

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  buttonText?: string;
  variant?: "info" | "success" | "warning" | "error";
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  buttonText = "OK",
  variant = "info",
}) => {
  const variantConfig = {
    info: { iconColor: "text-blue-300", bgColor: "bg-blue-100" },
    success: { iconColor: "text-sage-300", bgColor: "bg-sage-100" },
    warning: { iconColor: "text-amber-200", bgColor: "bg-amber-100" },
    error: { iconColor: "text-rose-200", bgColor: "bg-rose-100" },
  };

  const config = variantConfig[variant];

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="sm" showCloseButton={false}>
        <ModalHeader className="items-center text-center">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", config.bgColor)}>
            <svg
              className={cn("w-6 h-6", config.iconColor)}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {variant === "info" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
              {variant === "success" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
              {variant === "warning" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
              {variant === "error" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
          </div>
          <ModalTitle>{title}</ModalTitle>
          {description && <ModalDescription>{description}</ModalDescription>}
        </ModalHeader>
        <ModalFooter className="justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-[10px] hover:bg-primary-hover transition-colors"
          >
            {buttonText}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ConfirmModal,
  AlertModal,
  modalContentVariants,
};

export type { ModalContentProps, ConfirmModalProps, AlertModalProps };
