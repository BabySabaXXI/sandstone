/**
 * Notifications Panel Component
 * =============================
 * Panel for viewing and managing notifications
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/collaboration/use-notifications';
import type { Notification, NotificationType } from '@/lib/collaboration/types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Archive, 
  Trash2, 
  MoreVertical,
  Share2,
  MessageSquare,
  Users,
  FileEdit,
  AtSign,
  BookOpen,
  Info,
  X
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import Link from 'next/link';

interface NotificationsPanelProps {
  onClose?: () => void;
}

const notificationIcons: Record<NotificationType, React.ElementType> = {
  share_invite: Share2,
  share_accepted: Share2,
  comment_added: MessageSquare,
  comment_reply: MessageSquare,
  group_invite: Users,
  group_joined: Users,
  document_edited: FileEdit,
  mention: AtSign,
  study_session_started: BookOpen,
  system: Info,
};

const notificationColors: Record<NotificationType, string> = {
  share_invite: 'bg-blue-500',
  share_accepted: 'bg-green-500',
  comment_added: 'bg-purple-500',
  comment_reply: 'bg-purple-500',
  group_invite: 'bg-orange-500',
  group_joined: 'bg-orange-500',
  document_edited: 'bg-yellow-500',
  mention: 'bg-pink-500',
  study_session_started: 'bg-teal-500',
  system: 'bg-gray-500',
};

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const { toast } = useToast();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    getFilteredNotifications,
  } = useNotifications();

  const filteredNotifications = getFilteredNotifications(activeTab);

  const handleMarkAsRead = async (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.status === 'unread') {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        toast({
          title: 'Failed to mark as read',
          variant: 'destructive',
        });
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      toast({
        title: 'Failed to mark all as read',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveNotification(id);
      toast({
        title: 'Notification archived',
      });
    } catch (error) {
      toast({
        title: 'Failed to archive',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      toast({
        title: 'Notification deleted',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'normal':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const renderNotification = (notification: Notification) => {
    const Icon = notificationIcons[notification.type] || Info;
    const isUnread = notification.status === 'unread';

    return (
      <div
        key={notification.id}
        className={`relative p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer ${
          isUnread ? 'bg-muted/30' : ''
        }`}
        onClick={(e) => handleMarkAsRead(notification, e)}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notificationColors[notification.type]} text-white shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`font-medium text-sm ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {notification.message}
                </p>
              </div>
              
              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isUnread && (
                    <DropdownMenuItem onClick={(e) => handleMarkAsRead(notification, e)}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={(e) => handleArchive(notification.id, e)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => handleDelete(notification.id, e)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at))}
              </span>
              {notification.priority !== 'normal' && (
                <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                  {notification.priority}
                </Badge>
              )}
              {notification.action_url && (
                <Link 
                  href={notification.action_url}
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              )}
            </div>
          </div>

          {/* Unread Indicator */}
          {isUnread && (
            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unread" className="m-0">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No unread notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificationsPanel;
