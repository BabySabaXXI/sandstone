/**
 * Notifications Bell Component
 * ============================
 * Bell icon with unread count and dropdown panel
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/collaboration/use-notifications';
import { NotificationsPanel } from './notifications-panel';
import { Bell, BellRing } from 'lucide-react';

interface NotificationsBellProps {
  className?: string;
}

export function NotificationsBell({ className }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const prevUnreadCountRef = useRef(0);
  const { unreadCount, notifications } = useNotifications();

  // Track new notifications for animation
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setHasNewNotifications(true);
      const timeout = setTimeout(() => setHasNewNotifications(false), 3000);
      return () => clearTimeout(timeout);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label={`${unreadCount} unread notifications`}
        >
          {hasNewNotifications ? (
            <BellRing className="w-5 h-5 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Unread indicator dot */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end"
        sideOffset={8}
      >
        <NotificationsPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export default NotificationsBell;
