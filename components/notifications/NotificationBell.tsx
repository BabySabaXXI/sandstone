/**
 * Notification Bell Component
 * ===========================
 * Bell icon with unread count badge for triggering notification panel.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { formatBadgeCount, getBadgeColorClass } from "@/lib/notifications/utils";

// ============================================
// PROPS INTERFACE
// ============================================

interface NotificationBellProps {
  count: number;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  isOpen?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function NotificationBell({
  count,
  onClick,
  className,
  size = "md",
  showBadge = true,
  isOpen = false,
}: NotificationBellProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      button: "w-8 h-8",
      icon: "w-4 h-4",
      badge: "text-[10px] min-w-[16px] h-4",
    },
    md: {
      button: "w-10 h-10",
      icon: "w-5 h-5",
      badge: "text-xs min-w-[18px] h-[18px]",
    },
    lg: {
      button: "w-12 h-12",
      icon: "w-6 h-6",
      badge: "text-sm min-w-[20px] h-5",
    },
  };

  const config = sizeConfig[size];
  const hasUnread = count > 0;
  const badgeColor = getBadgeColorClass(count);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full transition-all duration-200",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900",
        isOpen && "bg-gray-100 dark:bg-gray-800",
        config.button,
        className
      )}
      aria-label={`Notifications ${hasUnread ? `(${count} unread)` : ""}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {/* Bell Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "text-gray-600 dark:text-gray-400 transition-colors",
          hasUnread && "text-gray-900 dark:text-gray-100",
          config.icon
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread Badge */}
      {showBadge && hasUnread && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 flex items-center justify-center",
            "rounded-full text-white font-semibold px-1",
            "animate-in zoom-in duration-200",
            badgeColor,
            config.badge
          )}
          aria-hidden="true"
        >
          {formatBadgeCount(count)}
        </span>
      )}

      {/* Unread Indicator Dot (when badge is hidden) */}
      {showBadge && hasUnread && count === 0 && (
        <span
          className={cn(
            "absolute top-1.5 right-1.5 w-2 h-2 rounded-full",
            "bg-red-500 animate-pulse"
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// ============================================
// ANIMATED BELL VARIANT
// ============================================

interface AnimatedNotificationBellProps extends NotificationBellProps {
  animateOnNew?: boolean;
}

export function AnimatedNotificationBell({
  count,
  animateOnNew = true,
  ...props
}: AnimatedNotificationBellProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const prevCountRef = React.useRef(count);

  React.useEffect(() => {
    if (animateOnNew && count > prevCountRef.current) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = count;
  }, [count, animateOnNew]);

  return (
    <div className={cn(isAnimating && "animate-bounce")}>
      <NotificationBell count={count} {...props} />
    </div>
  );
}

export default NotificationBell;
