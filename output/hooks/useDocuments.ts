"use client";

import { useCallback, useEffect, useState } from "react";
import { useDocumentStore } from "@/stores/document-store";
import { Document, Subject } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface UseDocumentsOptions {
  subject?: Subject;
  folderId?: string;
  autoFetch?: boolean;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDocument: (title?: string) => Promise<string>;
  deleteDocument: (id: string) => Promise<void>;
}

// =============================================================================
// HOOK
// =============================================================================

export function useDocuments(options: UseDocumentsOptions = {}): UseDocumentsReturn {
  const { subject, folderId, autoFetch = true } = options;
  
  const store = useDocumentStore();
  const [localLoading, setLocalLoading] = useState(false);

  // Filter documents based on options
  const documents = subject
    ? store.getDocumentsBySubject(subject)
    : folderId !== undefined
    ? store.getDocumentsInFolder(folderId)
    : store.documents;

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      store.fetchDocuments();
    }
  }, [autoFetch]);

  // Refresh function
  const refresh = useCallback(async () => {
    setLocalLoading(true);
    try {
      await store.fetchDocuments();
    } finally {
      setLocalLoading(false);
    }
  }, [store]);

  // Create document wrapper
  const createDocument = useCallback(
    async (title?: string) => {
      return await store.createDocument(title, folderId, subject);
    },
    [store, folderId, subject]
  );

  // Delete document wrapper
  const deleteDocument = useCallback(
    async (id: string) => {
      await store.deleteDocument(id);
    },
    [store]
  );

  return {
    documents,
    loading: store.loading || localLoading,
    error: store.error,
    refresh,
    createDocument,
    deleteDocument,
  };
}

// =============================================================================
// USE DOCUMENT HOOK
// =============================================================================

interface UseDocumentReturn {
  document: Document | undefined;
  loading: boolean;
  error: string | null;
  updateDocument: (updates: Partial<Document>) => Promise<void>;
  deleteDocument: () => Promise<void>;
  addBlock: (type: Parameters<typeof useDocumentStore.getState().addBlock>[1]) => void;
  updateBlock: (blockId: string, content: string) => void;
  deleteBlock: (blockId: string) => void;
}

export function useDocument(documentId: string | null): UseDocumentReturn {
  const store = useDocumentStore();
  const document = documentId ? store.getDocument(documentId) : undefined;

  const updateDocument = useCallback(
    async (updates: Partial<Document>) => {
      if (documentId) {
        await store.updateDocument(documentId, updates);
      }
    },
    [store, documentId]
  );

  const deleteDocument = useCallback(async () => {
    if (documentId) {
      await store.deleteDocument(documentId);
    }
  }, [store, documentId]);

  const addBlock = useCallback(
    (type: Parameters<typeof useDocumentStore.getState().addBlock>[1]) => {
      if (documentId) {
        store.addBlock(documentId, type);
      }
    },
    [store, documentId]
  );

  const updateBlock = useCallback(
    (blockId: string, content: string) => {
      if (documentId) {
        store.updateBlock(documentId, blockId, content);
      }
    },
    [store, documentId]
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      if (documentId) {
        store.deleteBlock(documentId, blockId);
      }
    },
    [store, documentId]
  );

  return {
    document,
    loading: store.loading,
    error: store.error,
    updateDocument,
    deleteDocument,
    addBlock,
    updateBlock,
    deleteBlock,
  };
}

// =============================================================================
// USE FOLDERS HOOK
// =============================================================================

interface UseFoldersReturn {
  folders: ReturnType<typeof useDocumentStore.getState>["folders"];
  loading: boolean;
  createFolder: (name: string, parentId?: string) => Promise<string>;
  deleteFolder: (id: string) => Promise<void>;
  updateFolder: (id: string, updates: Partial<ReturnType<typeof useDocumentStore.getState>["folders"][0]>) => Promise<void>;
}

export function useFolders(): UseFoldersReturn {
  const store = useDocumentStore();

  const createFolder = useCallback(
    async (name: string, parentId?: string) => {
      return await store.createFolder(name, parentId);
    },
    [store]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      await store.deleteFolder(id);
    },
    [store]
  );

  const updateFolder = useCallback(
    async (id: string, updates: Parameters<typeof store.updateFolder>[1]) => {
      await store.updateFolder(id, updates);
    },
    [store]
  );

  return {
    folders: store.folders,
    loading: store.loading,
    createFolder,
    deleteFolder,
    updateFolder,
  };
}

export default useDocuments;
