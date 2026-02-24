/**
 * PresenceIndicator Component
 * ===========================
 * Real-time component for displaying user presence status.
 */

"use client";

import React from "react";
import { usePresence } from "@/lib/realtime";
import { 
  Circle, 
  Moon, 
  Zap, 
  MinusCircle,
  Users 
} from "lucide-react";

interface PresenceIndicatorProps {
  userId?: string;
  email?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  showOnlineCount?: boolean;
  size?: "sm" | "md" | "lg";
  onStatusChange?: (status: "online" | "away" | "offline") => void;
}

const statusConfig = {
  online: {
    color: "bg-green-500",
    icon: Zap,
    label: "Online",
    ringColor: "ring-green-500",
  },
  away: {
    color: "bg-yellow-500",
    icon: Moon,
    label: "Away",
    ringColor: "ring-yellow-500",
  },
  offline: {
    color: "bg-gray-400",
    icon: MinusCircle,
    label: "Offline",
    ringColor: "ring-gray-400",
  },
  dnd: {
    color: "bg-red-500",
    icon: Circle,
    label: "Do Not Disturb",
    ringColor: "ring-red-500",
  },
};

const sizeConfig = {
  sm: {
    avatar: "w-8 h-8",
    indicator: "w-2.5 h-2.5",
    ring: "ring-2",
    text: "text-xs",
  },
  md: {
    avatar: "w-10 h-10",
    indicator: "w-3 h-3",
    ring: "ring-2",
    text: "text-sm",
  },
  lg: {
    avatar: "w-12 h-12",
    indicator: "w-3.5 h-3.5",
    ring: "ring-3",
    text: "text-base",
  },
};

export function PresenceIndicator({
  userId,
  email,
  fullName,
  avatarUrl,
  showOnlineCount = false,
  size = "md",
  onStatusChange,
}: PresenceIndicatorProps) {
  const {
    isSubscribed,
    status,
    onlineUsers,
    onlineCount,
    setStatus,
  } = usePresence({
    userId,
    email,
    fullName,
    avatarUrl,
    enabled: !!userId,
    onStatusChange,
  });

  const config = statusConfig[status === "dnd" ? "dnd" : status];
  const sizeStyles = sizeConfig[size];
  const StatusIcon = config.icon;

  const handleStatusClick = () => {
    const statuses: Array<"online" | "away" | "offline" | "dnd"> = ["online", "away", "dnd", "offline"];
    const currentIndex = statuses.indexOf(status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    setStatus(nextStatus);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar with Status Indicator */}
      <div className="relative">
        <div 
          className={`${sizeStyles.avatar} rounded-full overflow-hidden ${sizeStyles.ring} ring-offset-2 ${config.ringColor} bg-gray-200`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {(fullName?.[0] || email?.[0] || "?").toUpperCase()}
            </div>
          )}
        </div>

        {/* Status Indicator Dot */}
        <button
          onClick={handleStatusClick}
          className={`absolute -bottom-0.5 -right-0.5 ${sizeStyles.indicator} ${config.color} rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform`}
          title={`Status: ${config.label} (click to change)`}
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-gray-900 truncate ${sizeStyles.text}`}>
          {fullName || email || "Anonymous"}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">{config.label}</span>
          {!isSubscribed && (
            <span className="text-yellow-600 ml-1">(connecting...)</span>
          )}
        </div>
      </div>

      {/* Online Count */}
      {showOnlineCount && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{onlineCount}</span>
        </div>
      )}
    </div>
  );
}

interface OnlineUsersListProps {
  users?: Array<{
    userId: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
    status: "online" | "away" | "offline";
    currentActivity?: string;
  }>;
  maxDisplay?: number;
}

export function OnlineUsersList({ users = [], maxDisplay = 5 }: OnlineUsersListProps) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = Math.max(0, users.length - maxDisplay);

  if (users.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No users online
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayUsers.map((user) => {
        const config = statusConfig[user.status];
        const StatusIcon = config.icon;

        return (
          <div key={user.userId} className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                    {(user.fullName?.[0] || user.email[0] || "?").toUpperCase()}
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${config.color} rounded-full border-2 border-white`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.fullName || user.email}
              </div>
              {user.currentActivity && (
                <div className="text-xs text-gray-500 truncate">
                  {user.currentActivity}
                </div>
              )}
            </div>
            <StatusIcon className="w-4 h-4 text-gray-400" />
          </div>
        );
      })}

      {remainingCount > 0 && (
        <div className="text-sm text-gray-500 text-center py-1">
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}

export default PresenceIndicator;
