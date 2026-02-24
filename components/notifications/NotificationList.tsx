/**
 * Notification List Component
 * ===========================
 * List component for displaying notifications with actions.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  type Notification,
  type NotificationStatus,
} from "@/lib/notifications/types";
import {
  formatNotificationTime,
  formatNotificationTimeFull,
  getNotificationIcon,
  getNotificationBgClass,
  getNotificationIndicatorClass,
  groupNotificationsByDate,
  truncateText,
} from "@/lib/notifications/utils";

// ============================================
// PROPS INTERFACE
// ============================================

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  onClick?: (notification: Notification) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  onClick?: (notification: Notification) => void;
}

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (notificationId: string, actionId: string) => void;
  onClick?: (notification: Notification) => void;
}

// ============================================
// ICON COMPONENTS
// ============================================

const IconComponents: Record<string, React.FC<{ className?: string }>> = {
  Info: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AlertTriangle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  XCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  FileText: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Layers: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Award: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  MessageSquare: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Settings: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  MoreVertical: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  ),
  Trash: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Archive: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onDelete,
  onAction,
  onClick,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isUnread = notification.status === "unread";
  
  const iconName = notification.icon || getNotificationIcon(notification.type);
  const Icon = IconComponents[iconName] || IconComponents.Bell;
  const indicatorColor = getNotificationIndicatorClass(notification.type, notification.priority);
  const bgClass = getNotificationBgClass(notification.type, notification.priority, !isUnread);

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <div
      className={cn(
        "relative group flex items-start gap-3 p-4 rounded-lg transition-all duration-200",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "cursor-pointer",
        bgClass,
        isUnread && "ring-1 ring-inset ring-gray-200 dark:ring-gray-700"
      )}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full", indicatorColor)} />
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-medium text-gray-900 dark:text-gray-100",
              !isUnread && "font-normal"
            )}>
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {truncateText(notification.message, 150)}
            </p>
          </div>

          {/* Timestamp */}
          <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-500">
            {formatNotificationTime(notification.created_at)}
          </span>
        </div>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-2 flex gap-2">
            {notification.actions.map((action) => (
              <button
                key={action.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.(notification.id, action.id);
                }}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded transition-colors",
                  action.type === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
                  action.type === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200",
                  action.type === "danger" && "bg-red-600 text-white hover:bg-red-700"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions (visible on hover) */}
      <div className={cn(
        "flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
        showActions && "opacity-100"
      )}>
        {isUnread && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="Mark as read"
          >
            <IconComponents.Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Archive"
        >
          <IconComponents.Archive className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Delete"
        >
          <IconComponents.Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION GROUP COMPONENT
// ============================================

function NotificationGroup({
  title,
  notifications,
  onMarkAsRead,
  onDismiss,
  onDelete,
  onAction,
  onClick,
}: NotificationGroupProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDismiss={onDismiss}
            onDelete={onDelete}
            onAction={onAction}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <IconComponents.Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
        No notifications
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        You&apos;re all caught up! Check back later for updates.
      </p>
    </div>
  );
}

// ============================================
// MAIN NOTIFICATION LIST COMPONENT
// ============================================

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onDelete,
  onAction,
  onClick,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  emptyState,
  className,
}: NotificationListProps) {
  const grouped = groupNotificationsByDate(notifications);
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  if (notifications.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-900 rounded-lg", className)}>
        {emptyState || <DefaultEmptyState />}
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-900 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification groups */}
      <div className="max-h-[60vh] overflow-y-auto">
        <NotificationGroup
          title="Today"
          notifications={grouped.today}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
          onDelete={onDelete}
          onAction={onAction}
          onClick={onClick}
        />
        <NotificationGroup
          title="Yesterday"
          notifications={grouped.yesterday}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
          onDelete={onDelete}
          onAction={onAction}
          onClick={onClick}
        />
        <NotificationGroup
          title="This Week"
          notifications={grouped.thisWeek}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
          onDelete={onDelete}
          onAction={onAction}
          onClick={onClick}
        />
        <NotificationGroup
          title="Earlier"
          notifications={grouped.older}
          onMarkAsRead={onMarkAsRead}
          onDismiss={onDismiss}
          onDelete={onDelete}
          onAction={onAction}
          onClick={onClick}
        />

        {/* Load more */}
        {hasMore && (
          <div className="p-4 text-center">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationList;
