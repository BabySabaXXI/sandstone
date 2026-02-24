/**
 * Share Dialog Component
 * ======================
 * Dialog for sharing content with other users
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useShares } from '@/hooks/collaboration/use-shares';
import { shareApi } from '@/lib/collaboration/api';
import type { ContentType, SharePermission, ShareWithDetails } from '@/lib/collaboration/types';
import { 
  Share2, 
  Link, 
  Mail, 
  User, 
  Eye, 
  MessageSquare, 
  Edit3, 
  Shield,
  Copy,
  Check,
  X,
  Clock
} from 'lucide-react';

interface ShareDialogProps {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  trigger?: React.ReactNode;
  onShare?: () => void;
}

const permissionIcons = {
  view: Eye,
  comment: MessageSquare,
  edit: Edit3,
  admin: Shield,
};

const permissionLabels = {
  view: 'Can view',
  comment: 'Can comment',
  edit: 'Can edit',
  admin: 'Full access',
};

export function ShareDialog({ 
  contentType, 
  contentId, 
  contentTitle, 
  trigger,
  onShare 
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<SharePermission>('view');
  const [message, setMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { sentShares, createShare, revokeShare, updatePermission, loadShares } = useShares({ autoLoad: false });

  // Get shares for this content
  const contentShares = sentShares.filter(
    s => s.content_type === contentType && s.content_id === contentId
  );

  const handleShare = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address to share with.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createShare({
        content_type: contentType,
        content_id: contentId,
        shared_with_email: email,
        permission,
        message: message || undefined,
        expires_in_days: expiresInDays ? parseInt(expiresInDays) : undefined,
      });

      toast({
        title: 'Shared successfully',
        description: `Invitation sent to ${email}`,
      });

      setEmail('');
      setMessage('');
      onShare?.();
      
      // Reload shares
      await loadShares();
    } catch (error) {
      toast({
        title: 'Failed to share',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeShare(shareId);
      toast({
        title: 'Access revoked',
        description: 'The user no longer has access to this content.',
      });
      await loadShares();
    } catch (error) {
      toast({
        title: 'Failed to revoke',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermission = async (shareId: string, newPermission: SharePermission) => {
    try {
      await updatePermission(shareId, newPermission);
      toast({
        title: 'Permission updated',
        description: `Access level changed to ${permissionLabels[newPermission]}.`,
      });
      await loadShares();
    } catch (error) {
      toast({
        title: 'Failed to update',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/${contentType}/${contentId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Link copied',
      description: 'Share link copied to clipboard.',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'revoked':
        return <Badge variant="outline">Revoked</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share "{contentTitle}"</DialogTitle>
          <DialogDescription>
            Invite others to view, comment, or edit this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Share Link */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Link className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1 truncate">
              {typeof window !== 'undefined' && `${window.location.origin}/${contentType}/${contentId}`}
            </span>
            <Button variant="ghost" size="sm" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Add People */}
          <div className="space-y-3">
            <Label>Add people</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="admin">Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />

            <div className="flex gap-2">
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger className="w-[180px]">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Never expires" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Never expires</SelectItem>
                  <SelectItem value="1">Expires in 1 day</SelectItem>
                  <SelectItem value="7">Expires in 7 days</SelectItem>
                  <SelectItem value="30">Expires in 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleShare} 
                disabled={isLoading || !email}
                className="flex-1"
              >
                {isLoading ? 'Sharing...' : 'Share'}
              </Button>
            </div>
          </div>

          {/* People with Access */}
          <div className="space-y-2">
            <Label>People with access</Label>
            <ScrollArea className="h-[200px] border rounded-lg p-2">
              {contentShares.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No one has access yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contentShares.map((share) => (
                    <div 
                      key={share.id} 
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={share.shared_with?.avatar_url || undefined} />
                        <AvatarFallback>
                          {share.shared_with?.full_name?.[0] || share.shared_with_email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {share.shared_with?.full_name || share.shared_with_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {share.shared_with?.email || share.shared_with_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(share.status)}
                        <Select 
                          value={share.permission} 
                          onValueChange={(v) => handleUpdatePermission(share.id, v as SharePermission)}
                          disabled={share.status === 'revoked'}
                        >
                          <SelectTrigger className="w-[110px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View</SelectItem>
                            <SelectItem value="comment">Comment</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleRevoke(share.id)}
                          disabled={share.status === 'revoked'}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
