/**
 * Document Data Fetching Hooks with SWR
 * Features: caching, optimistic updates, error retry, automatic revalidation
 */

'use client';

import useSWR, { SWRResponse, mutate as globalMutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { cacheKeys, documentSWRConfig, cacheMutations } from '@/lib/swr/config';
import type { Document, Folder, DocumentBlock, BlockType } from '@/stores/types';
import type { Subject } from '@/types';

const supabase = createClient();

// ============================================================================
// Types
// ============================================================================

interface CreateDocumentParams {
  title?: string;
  folderId?: string;
  subject?: Subject;
  blocks?: DocumentBlock[];
}

interface UpdateDocumentParams {
  id: string;
  updates: Partial<Omit<Document, 'id' | 'createdAt'>>;
}

interface MoveDocumentParams {
  documentId: string;
  folderId: string | null;
}

// ============================================================================
// Fetch Functions
// ============================================================================

/**
 * Fetch all documents for the current user
 */
async function fetchDocuments(): Promise<Document[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    subject: doc.subject as Subject,
    blocks: doc.content || [],
    folderId: doc.folder_id,
    userId: doc.user_id,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  }));
}

/**
 * Fetch a single document by ID
 */
async function fetchDocument(id: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    subject: data.subject as Subject,
    blocks: data.content || [],
    folderId: data.folder_id,
    userId: data.user_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Fetch documents in a specific folder
 */
async function fetchDocumentsInFolder(folderId: string | null): Promise<Document[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id);

  if (folderId) {
    query = query.eq('folder_id', folderId);
  } else {
    query = query.is('folder_id', null);
  }

  const { data, error } = await query.order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    subject: doc.subject as Subject,
    blocks: doc.content || [],
    folderId: doc.folder_id,
    userId: doc.user_id,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  }));
}

/**
 * Fetch documents by subject
 */
async function fetchDocumentsBySubject(subject: Subject): Promise<Document[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .eq('subject', subject)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    subject: doc.subject as Subject,
    blocks: doc.content || [],
    folderId: doc.folder_id,
    userId: doc.user_id,
    createdAt: new Date(doc.created_at),
    updatedAt: new Date(doc.updated_at),
  }));
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new document
 */
async function createDocument(
  url: string,
  { arg }: { arg: CreateDocumentParams }
): Promise<Document> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date();
  const newDocument: Document = {
    id: crypto.randomUUID(),
    title: arg.title || 'Untitled',
    subject: arg.subject || 'economics',
    blocks: arg.blocks || [{ id: crypto.randomUUID(), type: 'paragraph' as BlockType, content: '', metadata: {} }],
    folderId: arg.folderId,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  const { error } = await supabase.from('documents').insert({
    id: newDocument.id,
    user_id: user.id,
    title: newDocument.title,
    subject: newDocument.subject,
    content: newDocument.blocks,
    folder_id: newDocument.folderId,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  });

  if (error) throw error;

  return newDocument;
}

/**
 * Update a document
 */
async function updateDocument(
  url: string,
  { arg }: { arg: UpdateDocumentParams }
): Promise<Document> {
  const { id, updates } = arg;

  const { error } = await supabase
    .from('documents')
    .update({
      title: updates.title,
      content: updates.blocks,
      folder_id: updates.folderId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;

  // Fetch the updated document
  const updated = await fetchDocument(id);
  if (!updated) throw new Error('Document not found after update');
  
  return updated;
}

/**
 * Delete a document
 */
async function deleteDocument(
  url: string,
  { arg }: { arg: string }
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', arg);

  if (error) throw error;
}

/**
 * Move document to folder
 */
async function moveDocument(
  url: string,
  { arg }: { arg: MoveDocumentParams }
): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ folder_id: arg.folderId })
    .eq('id', arg.documentId);

  if (error) throw error;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all documents
 */
export function useDocuments(options?: { subject?: Subject }) {
  const key = options?.subject 
    ? cacheKeys.documentsBySubject(options.subject)
    : cacheKeys.documents;
  
  const fetcher = options?.subject
    ? () => fetchDocumentsBySubject(options.subject!)
    : fetchDocuments;

  return useSWR<Document[]>(
    key,
    fetcher,
    documentSWRConfig
  );
}

/**
 * Hook to fetch a single document
 */
export function useDocument(id: string | null) {
  return useSWR<Document | null>(
    id ? cacheKeys.document(id) : null,
    () => fetchDocument(id!),
    documentSWRConfig
  );
}

/**
 * Hook to fetch documents in a folder
 */
export function useDocumentsInFolder(folderId: string | null) {
  return useSWR<Document[]>(
    cacheKeys.documentsInFolder(folderId),
    () => fetchDocumentsInFolder(folderId),
    documentSWRConfig
  );
}

/**
 * Hook to fetch documents by subject
 */
export function useDocumentsBySubject(subject: Subject) {
  return useSWR<Document[]>(
    cacheKeys.documentsBySubject(subject),
    () => fetchDocumentsBySubject(subject),
    documentSWRConfig
  );
}

/**
 * Hook to create a document with optimistic updates
 */
export function useCreateDocument() {
  return useSWRMutation<Document, Error, string, CreateDocumentParams>(
    cacheKeys.documents,
    createDocument,
    {
      onSuccess: (data) => {
        toast.success('Document created successfully');
        
        // Update the documents list cache
        globalMutate(
          cacheKeys.documents,
          (current: Document[] | undefined) => cacheMutations.addToList(current, data),
          { revalidate: false }
        );
        
        // Update folder cache if applicable
        if (data.folderId) {
          globalMutate(
            cacheKeys.documentsInFolder(data.folderId),
            (current: Document[] | undefined) => cacheMutations.addToList(current, data),
            { revalidate: false }
          );
        }
        
        // Set the individual document cache
        globalMutate(cacheKeys.document(data.id), data, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to create document: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to update a document with optimistic updates
 */
export function useUpdateDocument() {
  return useSWRMutation<Document, Error, string, UpdateDocumentParams>(
    cacheKeys.documents,
    updateDocument,
    {
      onSuccess: (data, { arg }) => {
        toast.success('Document updated successfully');
        
        // Update the documents list cache
        globalMutate(
          cacheKeys.documents,
          (current: Document[] | undefined) => cacheMutations.updateInList(current, data),
          { revalidate: false }
        );
        
        // Update the individual document cache
        globalMutate(cacheKeys.document(arg.id), data, { revalidate: false });
        
        // Update folder caches
        if (data.folderId) {
          globalMutate(
            cacheKeys.documentsInFolder(data.folderId),
            (current: Document[] | undefined) => cacheMutations.updateInList(current, data),
            { revalidate: false }
          );
        }
      },
      onError: (error) => {
        toast.error(`Failed to update document: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to delete a document with optimistic updates
 */
export function useDeleteDocument() {
  return useSWRMutation<void, Error, string, string>(
    cacheKeys.documents,
    deleteDocument,
    {
      onSuccess: (_, documentId) => {
        toast.success('Document deleted successfully');
        
        // Remove from documents list cache
        globalMutate(
          cacheKeys.documents,
          (current: Document[] | undefined) => cacheMutations.removeFromList(current, documentId),
          { revalidate: false }
        );
        
        // Remove from individual cache
        globalMutate(cacheKeys.document(documentId), null, { revalidate: false });
      },
      onError: (error) => {
        toast.error(`Failed to delete document: ${error.message}`);
      },
    }
  );
}

/**
 * Hook to move a document with optimistic updates
 */
export function useMoveDocument() {
  return useSWRMutation<void, Error, string, MoveDocumentParams>(
    cacheKeys.documents,
    moveDocument,
    {
      onSuccess: (_, { arg }) => {
        toast.success('Document moved successfully');
        
        // Revalidate both source and destination folder caches
        globalMutate(cacheKeys.documentsInFolder(arg.folderId));
        globalMutate(cacheKeys.documents);
      },
      onError: (error) => {
        toast.error(`Failed to move document: ${error.message}`);
      },
    }
  );
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Optimistically update a document in the cache
 */
export function optimisticUpdateDocument(
  documentId: string,
  updates: Partial<Document>
): Promise<void> {
  const key = cacheKeys.document(documentId);
  
  return globalMutate(
    key,
    (current: Document | undefined) => {
      if (!current) return current;
      return { ...current, ...updates, updatedAt: new Date() };
    },
    { revalidate: false }
  );
}

/**
 * Revalidate document data
 */
export function revalidateDocument(documentId?: string): Promise<void> {
  if (documentId) {
    return globalMutate(cacheKeys.document(documentId));
  }
  return globalMutate(cacheKeys.documents);
}

// ============================================================================
// Exports
// ============================================================================

export type {
  CreateDocumentParams,
  UpdateDocumentParams,
  MoveDocumentParams,
};
