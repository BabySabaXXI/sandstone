/**
 * Folder Data Fetching Hooks with SWR
 * Features: caching, optimistic updates, hierarchical structure
 */

'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, documentSWRConfig, cacheMutations } from '@/lib/swr/config';
import type { Folder } from '@/stores/types';
import type { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface CreateFolderParams {
  name: string;
  parentId?: string | null;
  subject?: Subject;
}

interface UpdateFolderParams {
  id: string;
  updates: Partial<Omit<Folder, 'id' | 'createdAt'>>;
}

interface MoveFolderParams {
  folderId: string;
  newParentId: string | null;
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all folders for the current user
 */
async function fetchFolders(): Promise<Folder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((folder) => ({
    id: folder.id,
    name: folder.name,
    subject: folder.subject as Subject,
    parentId: folder.parent_id,
    userId: folder.user_id,
    createdAt: new Date(folder.created_at),
    updatedAt: new Date(folder.updated_at),
  }));
}

/**
 * Fetch a single folder
 */
async function fetchFolder(id: string): Promise<Folder | null> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    subject: data.subject as Subject,
    parentId: data.parent_id,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Fetch folders by parent (for tree structure)
 */
async function fetchFoldersByParent(parentId: string | null): Promise<Folder[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('folders')
    .select('*')
    .eq('user_id', user.id);

  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((folder) => ({
    id: folder.id,
    name: folder.name,
    subject: folder.subject as Subject,
    parentId: folder.parent_id,
    userId: folder.user_id,
    createdAt: new Date(folder.created_at),
    updatedAt: new Date(folder.updated_at),
  }));
}

/**
 * Fetch folder tree (all folders with hierarchy info)
 */
async function fetchFolderTree(): Promise<Folder[]> {
  const folders = await fetchFolders();
  return buildFolderTree(folders);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build folder tree structure from flat list
 */
function buildFolderTree(folders: Folder[]): Folder[] {
  const folderMap = new Map<string, Folder & { children?: Folder[] }>();
  const rootFolders: Folder[] = [];

  // First pass: create map
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Second pass: build tree
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parentId && folderMap.has(folder.parentId)) {
      const parent = folderMap.get(folder.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      rootFolders.push(node);
    }
  });

  return rootFolders;
}

/**
 * Get folder path (breadcrumb)
 */
export function getFolderPath(
  folders: Folder[],
  folderId: string
): Folder[] {
  const path: Folder[] = [];
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  let currentId: string | null | undefined = folderId;
  while (currentId) {
    const folder = folderMap.get(currentId);
    if (!folder) break;
    path.unshift(folder);
    currentId = folder.parentId;
  }

  return path;
}

/**
 * Get all descendant folder IDs
 */
export function getDescendantFolderIds(
  folders: Folder[],
  folderId: string
): string[] {
  const ids: string[] = [];
  const folderMap = new Map(folders.map((f) => [f.id, f]));

  function collectDescendants(parentId: string) {
    folders
      .filter((f) => f.parentId === parentId)
      .forEach((f) => {
        ids.push(f.id);
        collectDescendants(f.id);
      });
  }

  collectDescendants(folderId);
  return ids;
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new folder
 */
async function createFolder(
  url: string,
  { arg }: { arg: CreateFolderParams }
): Promise<Folder> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name: arg.name,
    subject: arg.subject || 'economics',
    parentId: arg.parentId || null,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('folders').insert({
    id: newFolder.id,
    user_id: user.id,
    name: newFolder.name,
    subject: newFolder.subject,
    parent_id: newFolder.parentId,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newFolder;
}

/**
 * Update a folder
 */
async function updateFolder(
  url: string,
  { arg }: { arg: UpdateFolderParams }
): Promise<Folder> {
  const { id, updates } = arg;

  const { error } = await supabase
    .from('folders')
    .update({
      name: updates.name,
      parent_id: updates.parentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  const updated = await fetchFolder(id);
  if (!updated) throw new Error('Folder not found after update');
  
  return updated;
}

/**
 * Delete a folder
 */
async function deleteFolder(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  // First, move all documents in this folder to root
  const { error: docError } = await supabase
    .from('documents')
    .update({ folder_id: null })
    .eq('folder_id', arg);

  if (docError) throw docError;

  // Move all child folders to root
  const { error: childError } = await supabase
    .from('folders')
    .update({ parent_id: null })
    .eq('parent_id', arg);

  if (childError) throw childError;

  // Delete the folder
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', arg);

  if (error) throw error;
}

/**
 * Move a folder to a new parent
 */
async function moveFolder(
  url: string,
  { arg }: { arg: MoveFolderParams }
): Promise<void> {
  // Prevent moving a folder into itself or its descendants
  if (arg.newParentId) {
    const folders = await fetchFolders();
    const descendantIds = getDescendantFolderIds(folders, arg.folderId);
    if (descendantIds.includes(arg.newParentId)) {
      throw new Error('Cannot move a folder into its own descendants');
    }
  }

  const { error } = await supabase
    .from('folders')
    .update({
      parent_id: arg.newParentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', arg.folderId);

  if (error) throw error;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all folders
 */
export function useFolders() {
  return useSWR<Folder[]>(
    cacheKeys.folders,
    fetchFolders,
    documentSWRConfig
  );
}

/**
 * Hook to fetch a single folder
 */
export function useFolder(id: string | null) {
  return useSWR<Folder | null>(
    id ? cacheKeys.folder(id) : null,
    () => fetchFolder(id!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch folders by parent
 */
export function useFoldersByParent(parentId: string | null) {
  return useSWR<Folder[]>(
    cacheKeys.foldersByParent(parentId),
    () => fetchFoldersByParent(parentId),
    documentSWRConfig
  );
}

/**
 * Hook to fetch folder tree
 */
export function useFolderTree() {
  return useSWR<Folder[]>(
    `${cacheKeys.folders}/tree`,
    fetchFolderTree,
    documentSWRConfig
  );
}

/**
 * Hook to create a folder with optimistic updates
 */
export function useCreateFolder() {
  return useSWRMutation<Folder, Error, string, CreateFolderParams>(
    cacheKeys.folders,
    createFolder,
    {
      onSuccess: (data) => {
        toast.success('Folder created successfully');
        
        // Update folders list
        globalMutate(
          cacheKeys.folders,
          (current: Folder[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        // Update parent folder cache if applicable
        if (data.parentId) {
          globalMutate(
            cacheKeys.foldersByParent(data.parentId),
            (current: Folder[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        } else {
          globalMutate(
            cacheKeys.foldersByParent(null),
            (current: Folder[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        }
        
        // Update tree cache
        globalMutate(`${cacheKeys.folders}/tree`);
        
        // Set individual folder cache
        globalMutate(cacheKeys.folder(data.id), data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to create folder: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update a folder with optimistic updates
 */
export function useUpdateFolder() {
  return useSWRMutation<Folder, Error, string, UpdateFolderParams>(
    cacheKeys.folders,
    updateFolder,
    {
      onSuccess: (data, { arg }) => {
        toast.success('Folder updated successfully');
        
        // Update all relevant caches
        globalMutate(
          cacheKeys.folders,
          (current: Folder[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.folder(arg.id), data, { revalidate: false });
        
        // Update parent caches
        if (data.parentId) {
          globalMutate(cacheKeys.foldersByParent(data.parentId));
        }
        
        // Update tree
        globalMutate(`${cacheKeys.folders}/tree`);
      },
      onError: (error) => {
        toast.error(`Failed to update folder: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to delete a folder
 */
export function useDeleteFolder() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.folders,
    deleteFolder,
    {
      onSuccess: (_, folderId) => {
        toast.success('Folder deleted successfully');
        
        // Remove from all caches
        globalMutate(
          cacheKeys.folders,
          (current: Folder[] | undefined) => cacheMutations.removeFromList(current, folderId),
          { revalidate: false }
        );
        
        globalMutate(cacheKeys.folder(folderId), null, { revalidate: false });
        
        // Revalidate related caches
        globalMutate(cacheKeys.foldersByParent(null));
        globalMutate(`${cacheKeys.folders}/tree`);
        
        // Revalidate documents (they were moved to root)
        globalMutate(cacheKeys.documents);
      },
      onError: (error) => {
        toast.error(`Failed to delete folder: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to move a folder
 */
export function useMoveFolder() {
  return useSWRMutation<void, Error, string, MoveFolderParams>(
    cacheKeys.folders,
    moveFolder,
    {
      onSuccess: (_, { arg }) => {
        toast.success('Folder moved successfully');
        
        // Revalidate all folder caches
        globalMutate(cacheKeys.folders);
        globalMutate(cacheKeys.foldersByParent(null));
        globalMutate(cacheKeys.foldersByParent(arg.newParentId));
        globalMutate(`${cacheKeys.folders}/tree`);
      },
      onError: (error) => {
        toast.error(`Failed to move folder: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Exports
// ============================================================================

export type {
  CreateFolderParams,
  UpdateFolderParams,
  MoveFolderParams,
};
