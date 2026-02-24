/**
 * Study Groups Component
 * ======================
 * Component for managing study groups
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useStudyGroups } from '@/hooks/collaboration/use-study-groups';
import { useAuth } from '@/hooks/use-auth';
import type { StudyGroupWithMembers, GroupRole, CreateStudyGroupRequest } from '@/lib/collaboration/types';
import { 
  Users, 
  Plus, 
  MoreVertical, 
  LogOut, 
  UserPlus, 
  Settings, 
  Trash2,
  Crown,
  Shield,
  User,
  Eye,
  Copy,
  Check,
  Search,
  BookOpen,
  Lock,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface StudyGroupsProps {
  onSelectGroup?: (group: StudyGroupWithMembers) => void;
}

const roleIcons: Record<GroupRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleColors: Record<GroupRole, string> = {
  owner: 'text-yellow-500',
  admin: 'text-blue-500',
  member: 'text-gray-500',
  viewer: 'text-gray-400',
};

export function StudyGroups({ onSelectGroup }: StudyGroupsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupWithMembers | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    studyGroups,
    currentGroup,
    isLoading,
    createStudyGroup,
    joinGroup,
    leaveGroup,
    deleteStudyGroup,
    updateMemberRole,
    removeMember,
    regenerateJoinCode,
    getUserRole,
    isOwnerOrAdmin,
    loadStudyGroups,
  } = useStudyGroups();

  // Form state for creating group
  const [newGroup, setNewGroup] = useState<Partial<CreateStudyGroupRequest>>({
    name: '',
    description: '',
    subject: '',
    is_public: false,
    max_members: 50,
  });

  const handleCreateGroup = async () => {
    if (!newGroup.name) {
      toast({
        title: 'Name required',
        description: 'Please enter a group name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const group = await createStudyGroup(newGroup as CreateStudyGroupRequest);
      toast({
        title: 'Group created',
        description: `"${group.name}" has been created successfully.`,
      });
      setCreateDialogOpen(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        is_public: false,
        max_members: 50,
      });
      onSelectGroup?.(group);
    } catch (error) {
      toast({
        title: 'Failed to create group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      toast({
        title: 'Join code required',
        description: 'Please enter a join code.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find group by join code
      const group = studyGroups.find(g => g.join_code === joinCode.trim());
      if (!group) {
        toast({
          title: 'Invalid code',
          description: 'No group found with this join code.',
          variant: 'destructive',
        });
        return;
      }

      await joinGroup(group.id, joinCode.trim());
      toast({
        title: 'Joined group',
        description: `You've joined "${group.name}".`,
      });
      setJoinDialogOpen(false);
      setJoinCode('');
      onSelectGroup?.(group);
    } catch (error) {
      toast({
        title: 'Failed to join group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async (group: StudyGroupWithMembers) => {
    try {
      await leaveGroup(group.id);
      toast({
        title: 'Left group',
        description: `You've left "${group.name}".`,
      });
    } catch (error) {
      toast({
        title: 'Failed to leave group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGroup = async (group: StudyGroupWithMembers) => {
    if (!confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteStudyGroup(group.id);
      toast({
        title: 'Group deleted',
        description: `"${group.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete group',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (groupId: string, userId: string, newRole: GroupRole) => {
    try {
      await updateMemberRole(groupId, userId, newRole);
      toast({
        title: 'Role updated',
        description: `Member role has been updated to ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: 'Failed to update role',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await removeMember(groupId, userId);
      toast({
        title: 'Member removed',
        description: 'The member has been removed from the group.',
      });
    } catch (error) {
      toast({
        title: 'Failed to remove member',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: 'Code copied',
      description: 'Join code copied to clipboard.',
    });
  };

  const renderGroupCard = (group: StudyGroupWithMembers) => {
    const userRole = user ? getUserRole(group.id, user.id) : null;
    const canManage = user ? isOwnerOrAdmin(group.id, user.id) : false;
    const isOwner = userRole === 'owner';

    return (
      <Card key={group.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: group.color || '#6366f1' }}
              >
                {group.icon || group.name[0].toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {group.is_public ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {group.is_public ? 'Public' : 'Private'} • {group.member_count} members
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectGroup?.(group)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Group
                </DropdownMenuItem>
                {canManage && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedGroup(group)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleLeaveGroup(group)}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Group
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem 
                    onClick={() => handleDeleteGroup(group)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {group.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {group.description}
            </p>
          )}
          
          {/* Member Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {group.members?.slice(0, 5).map((member) => (
                <Avatar key={member.user_id} className="w-8 h-8 border-2 border-background">
                  <AvatarImage src={member.user?.avatar_url || undefined} />
                  <AvatarFallback>{member.user?.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
              ))}
              {(group.members?.length || 0) > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                  +{group.members!.length - 5}
                </div>
              )}
            </div>
            
            {/* Join Code (for admins) */}
            {canManage && group.join_code && (
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {group.join_code}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => copyJoinCode(group.join_code!)}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMemberList = (group: StudyGroupWithMembers) => {
    const canManage = user ? isOwnerOrAdmin(group.id, user.id) : false;
    const isOwner = user ? getUserRole(group.id, user.id) === 'owner' : false;

    return (
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>
              Manage members of "{group.name}"
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {group.members?.map((member) => {
                const RoleIcon = roleIcons[member.role];
                const isSelf = member.user_id === user?.id;
                const canModify = canManage && !isSelf && member.role !== 'owner';

                return (
                  <div 
                    key={member.user_id} 
                    className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.user?.avatar_url || undefined} />
                        <AvatarFallback>{member.user?.full_name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user?.full_name || 'Anonymous'}
                          {isSelf && <span className="text-muted-foreground ml-2">(You)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={roleColors[member.role]}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {member.role}
                      </Badge>
                      
                      {canModify && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isOwner && member.role !== 'admin' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(group.id, member.user_id, 'admin')}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'member' && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(group.id, member.user_id, 'member')}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveMember(group.id, member.user_id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">Collaborate with others on your studies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Join Group
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      ) : studyGroups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">No groups yet</p>
          <p className="text-sm text-muted-foreground">Create a group or join one with a code</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyGroups.map(renderGroupCard)}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Study Group</DialogTitle>
            <DialogDescription>
              Create a new group to collaborate with others
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., Biology Study Squad"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What is this group about?"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newGroup.subject}
                onChange={(e) => setNewGroup({ ...newGroup, subject: e.target.value })}
                placeholder="e.g., Biology"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newGroup.is_public}
                  onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_public" className="cursor-pointer">
                  Public group
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroup.name}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Study Group</DialogTitle>
            <DialogDescription>
              Enter a join code to join a private group
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="joinCode">Join Code</Label>
              <Input
                id="joinCode"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="text-center text-lg tracking-widest uppercase"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoinGroup} disabled={joinCode.length < 8}>
              Join Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      {selectedGroup && renderMemberList(selectedGroup)}
    </div>
  );
}

export default StudyGroups;
