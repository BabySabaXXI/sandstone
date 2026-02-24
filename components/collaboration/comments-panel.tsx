/**
 * Comments Panel Component
 * ========================
 * Panel for viewing and adding comments on content
 */

'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/hooks/collaboration/use-comments';
import { useAuth } from '@/hooks/use-auth';
import type { ContentType, CommentWithUser } from '@/lib/collaboration/types';
import { 
  MessageSquare, 
  Send, 
  MoreVertical, 
  Check, 
  Trash2, 
  Edit2, 
  CornerDownRight,
  Smile,
  X,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface CommentsPanelProps {
  contentType: ContentType;
  contentId: string;
  selectedText?: string;
  selectionRange?: { start: number; end: number };
  onClearSelection?: () => void;
}

const REACTIONS = ['👍', '👎', '❤️', '🎉', '🤔', '👏'];

export function CommentsPanel({ 
  contentType, 
  contentId, 
  selectedText,
  selectionRange,
  onClearSelection 
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    comments, 
    isLoading, 
    error, 
    totalCount,
    addComment, 
    updateComment, 
    deleteComment, 
    resolveComment,
    addReaction,
    removeReaction 
  } = useComments({ contentType, contentId });

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment({
        text: newComment,
        selection_start: selectionRange?.start,
        selection_end: selectionRange?.end,
        selection_text: selectedText,
      });
      setNewComment('');
      onClearSelection?.();
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    } catch (error) {
      toast({
        title: 'Failed to add comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      await addComment({
        text: replyText,
        parent_id: parentId,
      });
      setReplyText('');
      setReplyingTo(null);
      toast({
        title: 'Reply added',
        description: 'Your reply has been posted.',
      });
    } catch (error) {
      toast({
        title: 'Failed to add reply',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await updateComment(commentId, editText);
      setEditingComment(null);
      setEditText('');
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Failed to delete comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await resolveComment(commentId);
      toast({
        title: 'Comment resolved',
        description: 'The comment has been marked as resolved.',
      });
    } catch (error) {
      toast({
        title: 'Failed to resolve comment',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      const hasReaction = comment?.reactions?.some(
        r => r.user_id === user?.id && r.emoji === emoji
      );
      
      if (hasReaction) {
        await removeReaction(commentId, emoji);
      } else {
        await addReaction(commentId, emoji);
      }
    } catch (error) {
      toast({
        title: 'Failed to add reaction',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'resolved') return comment.status === 'resolved';
    if (filter === 'unresolved') return comment.status === 'active';
    return true;
  });

  const renderComment = (comment: CommentWithUser, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.user?.avatar_url || undefined} />
          <AvatarFallback>{comment.user?.full_name?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.user?.full_name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at))}
            </span>
            {comment.status === 'resolved' && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" />
                Resolved
              </Badge>
            )}
          </div>

          {/* Selected Text Quote */}
          {!isReply && comment.selection_text && (
            <div className="mt-2 p-2 bg-muted rounded text-sm text-muted-foreground border-l-2 border-primary">
              "{comment.selection_text}"
            </div>
          )}

          {/* Comment Content */}
          {editingComment === comment.id ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleUpdateComment(comment.id)}
                >
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setEditingComment(null);
                    setEditText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm">{comment.text}</p>
          )}

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {comment.reactions.map((reaction, idx) => (
                <button
                  key={`${reaction.user_id}-${reaction.emoji}-${idx}`}
                  onClick={() => handleReaction(comment.id, reaction.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    reaction.user_id === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {reaction.emoji}
                  <span>
                    {comment.reactions?.filter(r => r.emoji === reaction.emoji).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {!isReply && comment.status === 'active' && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>
            )}

            {/* Reaction Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <Smile className="w-3 h-3" />
                  React
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <div className="flex gap-1 p-1">
                  {REACTIONS.map(emoji => (
                    <DropdownMenuItem
                      key={emoji}
                      onClick={() => handleReaction(comment.id, emoji)}
                      className="px-2 py-1 cursor-pointer"
                    >
                      {emoji}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {comment.user_id === user?.id && comment.status === 'active' && (
              <>
                <button
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditText(comment.text);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </>
            )}

            {comment.status === 'active' && (
              <button
                onClick={() => handleResolveComment(comment.id)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Resolve
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button 
                  size="icon" 
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Comments</h3>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {filter === 'all' ? 'All' : filter === 'resolved' ? 'Resolved' : 'Unresolved'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('all')}>
              All comments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('unresolved')}>
              Unresolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('resolved')}>
              Resolved
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {error}
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div>
            {filteredComments.map(comment => renderComment(comment))}
          </div>
        )}
      </ScrollArea>

      {/* New Comment Input */}
      <div className="p-4 border-t">
        {selectedText && (
          <div className="mb-2 p-2 bg-muted rounded text-sm flex items-center justify-between">
            <span className="truncate">Commenting on: "{selectedText.substring(0, 50)}..."</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClearSelection}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="flex-1 resize-none"
          />
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isLoading}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CommentsPanel;
