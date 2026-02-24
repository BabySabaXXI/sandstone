/**
 * NotificationToast Component
 * ===========================
 * Real-time component for displaying notifications.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useNotifications } from "@/lib/realtime";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X,
  Bell
} from "lucide-react";

interface NotificationToastProps {
  userId?: string;
  maxVisible?: number;
  autoDismiss?: boolean;
  dismissAfter?: number; // in milliseconds
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

interface VisibleNotification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  isExiting: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
    titleColor: "text-blue-800",
    messageColor: "text-blue-600",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
    titleColor: "text-green-800",
    messageColor: "text-green-600",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-500",
    titleColor: "text-yellow-800",
    messageColor: "text-yellow-600",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-500",
    titleColor: "text-red-800",
    messageColor: "text-red-600",
  },
};

const positionConfig = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

export function NotificationToast({
  userId,
  maxVisible = 5,
  autoDismiss = true,
  dismissAfter = 5000,
  position = "top-right",
}: NotificationToastProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<VisibleNotification[]>([]);

  const {
    isSubscribed,
    notifications,
    unreadCount,
    markAsRead,
    dismissNotification,
  } = useNotifications({
    userId,
    enabled: !!userId,
    maxNotifications: maxVisible,
    onNotification: (notification) => {
      // Add to visible notifications
      setVisibleNotifications(prev => {
        const newNotification: VisibleNotification = {
          ...notification,
          isExiting: false,
        };
        return [newNotification, ...prev].slice(0, maxVisible);
      });

      // Auto dismiss
      if (autoDismiss) {
        setTimeout(() => {
          handleDismiss(notification.id);
        }, dismissAfter);
      }
    },
  });

  const handleDismiss = (notificationId: string) => {
    // Mark as exiting for animation
    setVisibleNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isExiting: true } : n
      )
    );

    // Actually remove after animation
    setTimeout(() => {
      setVisibleNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      dismissNotification(notificationId);
    }, 300);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${positionConfig[position]} z-50 space-y-2 max-w-sm w-full`}>
      {visibleNotifications.map((notification) => {
        const config = typeConfig[notification.type];
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={`
              transform transition-all duration-300 ease-in-out
              ${notification.isExiting 
                ? "opacity-0 translate-x-full scale-95" 
                : "opacity-100 translate-x-0 scale-100"
              }
            `}
          >
            <div
              className={`
                ${config.bgColor} 
                ${config.borderColor} 
                border rounded-lg shadow-lg p-4
                flex gap-3
              `}
            >
              <div className={`flex-shrink-0 ${config.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-sm ${config.titleColor}`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${config.messageColor}`}>
                  {notification.message}
                </p>

                {/* Additional Data */}
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(notification.data).map(([key, value]) => (
                      <div key={key} className="flex gap-1">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="p-1 hover:bg-black/5 rounded transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Unread Badge */}
      {unreadCount > maxVisible && (
        <div className="text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            <Bell className="w-4 h-4" />
            +{unreadCount - maxVisible} more
          </span>
        </div>
      )}

      {/* Connection Status */}
      {!isSubscribed && (
        <div className="text-center">
          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            Connecting to notifications...
          </span>
        </div>
      )}
    </div>
  );
}

interface NotificationBellProps {
  userId?: string;
  onClick?: () => void;
}

export function NotificationBell({ userId, onClick }: NotificationBellProps) {
  const { unreadCount } = useNotifications({
    userId,
    enabled: !!userId,
  });

  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      <Bell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}

export default NotificationToast;
