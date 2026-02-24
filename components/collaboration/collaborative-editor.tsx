/**
 * Collaborative Editor Component
 * ==============================
 * Real-time collaborative document editor with cursors and presence
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useCollaborativeEditing } from '@/hooks/collaboration/use-collaborative-editing';
import { useAuth } from '@/hooks/use-auth';
import type { CursorPosition, TextSelection } from '@/lib/collaboration/types';
import { 
  Users, 
  Save, 
  History, 
  Share2,
  Check,
  Wifi,
  WifiOff
} from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  content: any[];
  onChange: (content: any[]) => void;
  onSave: (content: any[], changeSummary?: string) => Promise<void>;
  readOnly?: boolean;
}

// Generate a consistent color for a user
function getUserColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  ];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function CollaborativeEditor({
  documentId,
  content,
  onChange,
  onSave,
  readOnly = false,
}: CollaborativeEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    collaborators,
    otherCollaborators,
    isConnected,
    userColor,
    versions,
    sendCursorPosition,
    sendSelection,
    saveVersion,
    loadVersions,
  } = useCollaborativeEditing({ documentId, autoJoin: !readOnly });

  // Track cursor position
  const handleSelectionChange = useCallback(() => {
    if (readOnly || !editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Send cursor position
    // This is a simplified version - in production you'd calculate
    // the actual position within your document structure
    sendCursorPosition({
      block_id: 'current-block',
      offset: range.startOffset,
    });

    // Send selection if not collapsed
    if (!range.collapsed) {
      sendSelection({
        block_id: 'current-block',
        start_offset: range.startOffset,
        end_offset: range.endOffset,
      });
    } else {
      sendSelection(null);
    }
  }, [readOnly, sendCursorPosition, sendSelection]);

  // Handle content change
  const handleContentChange = useCallback((newContent: any[]) => {
    onChange(newContent);
  }, [onChange]);

  // Save document
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      await saveVersion(content, 'Manual save');
      setLastSaved(new Date());
      toast({
        title: 'Saved',
        description: 'Document saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave, saveVersion, toast]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    if (readOnly) return;

    const timeout = setTimeout(() => {
      if (content.length > 0) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timeout);
  }, [content, handleSave, readOnly]);

  // Listen for selection changes
  useEffect(() => {
    if (readOnly) return;

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange, readOnly]);

  // Render collaborator cursors
  const renderCollaboratorCursors = () => {
    return otherCollaborators
      .filter(c => c.isActive && c.cursor)
      .map((collaborator) => (
        <TooltipProvider key={collaborator.userId}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="absolute pointer-events-none z-50"
                style={{
                  left: `${(collaborator.cursor?.offset || 0) * 10}px`,
                  top: '0',
                }}
              >
                <div
                  className="w-0.5 h-5"
                  style={{ backgroundColor: collaborator.userColor }}
                />
                <div
                  className="px-1.5 py-0.5 rounded text-xs text-white whitespace-nowrap"
                  style={{ backgroundColor: collaborator.userColor }}
                >
                  {collaborator.userName}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{collaborator.userName} is editing</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ));
  };

  // Render collaborator avatars
  const renderCollaboratorAvatars = () => {
    const activeCollaborators = otherCollaborators.filter(c => c.isActive);
    
    if (activeCollaborators.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">
          {activeCollaborators.length} editing
        </span>
        <div className="flex -space-x-2">
          {activeCollaborators.slice(0, 4).map((collaborator) => (
            <TooltipProvider key={collaborator.userId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar 
                    className="w-8 h-8 border-2 border-background"
                    style={{ borderColor: collaborator.userColor }}
                  >
                    <AvatarImage src={collaborator.avatarUrl || undefined} />
                    <AvatarFallback style={{ backgroundColor: collaborator.userColor }}>
                      {collaborator.userName[0]}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{collaborator.userName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {activeCollaborators.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
              +{activeCollaborators.length - 4}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-background">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline
              </>
            )}
          </Badge>

          {/* Collaborators */}
          {renderCollaboratorAvatars()}
        </div>

        <div className="flex items-center gap-2">
          {/* Last Saved */}
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}

          {/* Version History */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersions(!showVersions)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>

          {/* Share Button */}
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          {/* Save Button */}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <div
          ref={editorRef}
          className="h-full p-6 outline-none"
          contentEditable={!readOnly}
          onInput={(e) => {
            // Parse content from editor and call onChange
            // This is simplified - you'd need proper content parsing
            const html = e.currentTarget.innerHTML;
            handleContentChange([{ type: 'paragraph', content: html }]);
          }}
          suppressContentEditableWarning
        >
          {/* Render content blocks */}
          {content.map((block, index) => (
            <div key={index} className="mb-4">
              {block.type === 'paragraph' && (
                <p>{block.content}</p>
              )}
              {block.type === 'heading' && (
                <h2 className="text-2xl font-bold">{block.content}</h2>
              )}
              {/* Add more block types as needed */}
            </div>
          ))}
        </div>

        {/* Collaborator Cursors */}
        {renderCollaboratorCursors()}
      </div>

      {/* Version History Sidebar */}
      {showVersions && (
        <div className="w-64 border-l bg-muted/30 p-4">
          <h3 className="font-semibold mb-4">Version History</h3>
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-3 bg-background rounded-lg cursor-pointer hover:bg-accent"
              >
                <p className="text-sm font-medium">Version {version.version_number}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(version.created_at).toLocaleString()}
                </p>
                {version.change_summary && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {version.change_summary}
                  </p>
                )}
              </div>
            ))}
            {versions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No versions yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CollaborativeEditor;
