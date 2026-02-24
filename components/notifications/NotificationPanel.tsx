/**
 * Notification Panel Component
 * ============================
 * Dropdown panel for notifications with bell trigger.
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { NotificationList } from "./NotificationList";
import { useNotifications } from "@/lib/notifications/hooks";
import { type Notification } from "@/lib/notifications/types";

// ============================================
// PROPS INTERFACE
// ============================================

interface NotificationPanelProps {
  className?: string;
  bellClassName?: string;
  panelClassName?: string;
  onNotificationClick?: (notification: Notification) => void;
  maxHeight?: string;
}

// ============================================
// COMPONENT
// ============================================

export function NotificationPanel({
  className,
  bellClassName,
  panelClassName,
  onNotificationClick,
  maxHeight = "500px",
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    deleteNotification,
    loadMore,
  } = useNotifications({
    enabled: true,
    limit: 20,
  });

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    
    // Navigate if link is provided
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    // Close panel
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={buttonRef}>
      {/* Bell Button */}
      <NotificationBell
        count={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
        className={bellClassName}
        isOpen={isOpen}
      />

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={cn(
            "absolute right-0 mt-2 w-[400px] max-w-[calc(100vw-2rem)]",
            "bg-white dark:bg-gray-900 rounded-xl shadow-2xl",
            "border border-gray-200 dark:border-gray-700",
            "z-50 overflow-hidden",
            "animate-in fade-in slide-in-from-top-2 duration-200",
            panelClassName
          )}
          style={{ maxHeight }}
        >
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// SIDEBAR VARIANT
// ============================================

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationSidebar({
  isOpen,
  onClose,
  onNotificationClick,
  className,
}: NotificationSidebarProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    deleteNotification,
    loadMore,
  } = useNotifications({
    enabled: isOpen,
    limit: 30,
  });

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[400px] max-w-full",
          "bg-white dark:bg-gray-900 shadow-2xl",
          "z-50 transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] overflow-y-auto">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}

// ============================================
// FULL PAGE VARIANT
// ============================================

interface NotificationPageProps {
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationPage({
  onNotificationClick,
  className,
}: NotificationPageProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "archived">("all");
  
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    markAsRead,
    markAllAsRead,
    dismiss,
    deleteNotification,
    loadMore,
  } = useNotifications({
    enabled: true,
    limit: 50,
    status: activeFilter === "all" ? undefined : activeFilter,
  });

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return n.status === "unread";
    if (activeFilter === "archived") return n.status === "archived";
    return n.status !== "deleted";
  });

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with your study progress and activities
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {(["all", "unread", "archived"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  activeFilter === filter
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {filter === "unread" && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && activeFilter !== "archived" && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDismiss={dismiss}
            onDelete={deleteNotification}
            onClick={handleNotificationClick}
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
