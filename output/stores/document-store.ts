import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentBlock, Folder, DatabaseDocument, DatabaseFolder, Subject } from "@/types";
import { toast } from "sonner";
import { BlockType, createBlock } from "@/lib/documents/blocks";

// =============================================================================
// STORE VERSION FOR MIGRATIONS
// =============================================================================

const STORE_VERSION = 2;

// =============================================================================
// DEBOUNCE UTILITY
// =============================================================================

function createDebouncedFunction<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): { debounced: T; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debounced, cancel };
}

// =============================================================================
// PENDING OPERATION TYPES
// =============================================================================

type PendingOperationType = 
  | "create_doc" 
  | "update_doc" 
  | "delete_doc" 
  | "create_folder" 
  | "update_folder" 
  | "delete_folder" 
  | "move_doc" 
  | "duplicate_doc";

interface PendingOperation {
  id: string;
  type: PendingOperationType;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// =============================================================================
// SORT OPTIONS
// =============================================================================

export type SortOption = "name" | "dateCreated" | "dateModified" | "subject";
export type SortDirection = "asc" | "desc";

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface DocumentStore {
  // State
  documents: Document[];
  folders: Folder[];
  currentDocumentId: string | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  isHydrated: boolean;
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  selectedTags: string[];
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];
  
  // Debounced sync cancel function
  cancelDebouncedSync: (() => void) | null;
  
  // Document operations
  createDocument: (title?: string, folderId?: string, subject?: Subject, tags?: string[]) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<string>;
  moveDocument: (id: string, folderId: string | null) => Promise<void>;
  setCurrentDocument: (id: string | null) => void;
  addTagToDocument: (id: string, tag: string) => Promise<void>;
  removeTagFromDocument: (id: string, tag: string) => Promise<void>;
  
  // Block operations
  addBlock: (documentId: string, type: BlockType, index?: number) => void;
  updateBlock: (documentId: string, blockId: string, content: string, metadata?: Record<string, unknown>) => void;
  deleteBlock: (documentId: string, blockId: string) => void;
  moveBlock: (documentId: string, blockId: string, newIndex: number) => void;
  convertBlock: (documentId: string, blockId: string, newType: BlockType) => void;
  duplicateBlock: (documentId: string, blockId: string) => void;
  mergeBlocks: (documentId: string, blockId1: string, blockId2: string) => void;
  
  // Folder operations
  createFolder: (name: string, parentId?: string, subject?: Subject, color?: string) => Promise<string>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string, moveDocumentsToRoot?: boolean) => Promise<void>;
  moveFolder: (id: string, parentId: string | null) => Promise<void>;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  
  // Getters
  getDocument: (id: string) => Document | undefined;
  getFolder: (id: string) => Folder | undefined;
  getDocumentsInFolder: (folderId?: string) => Document[];
  getDocumentsBySubject: (subject: Subject) => Document[];
  getFilteredDocuments: () => Document[];
  getAllTags: () => string[];
  getRecentDocuments: (limit?: number) => Document[];
  getDocumentCount: () => number;
  getFolderCount: () => number;
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  debouncedSyncDocument: (documentId: string) => void;
  processPendingOperations: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
  
  // Export operations
  exportDocument: (id: string, format: "markdown" | "json" | "txt") => string;
  exportAllDocuments: (format: "markdown" | "json" | "txt") => string;
}

// =============================================================================
// CUSTOM STORAGE WITH ERROR HANDLING
// =============================================================================

const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to localStorage:`, error);
      if (error instanceof Error && error.name === "QuotaExceededError") {
        toast.error("Storage limit exceeded. Please clear some data.");
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from localStorage:`, error);
    }
  },
};

// =============================================================================
// MAIN STORE
// =============================================================================

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      documents: [],
      folders: [],
      currentDocumentId: null,
      loading: false,
      syncing: false,
      error: null,
      isHydrated: false,
      searchQuery: "",
      sortBy: "dateModified",
      sortDirection: "desc",
      selectedTags: [],
      pendingOperations: [],
      cancelDebouncedSync: null,

      // =======================================================================
      // STATE SETTERS
      // =======================================================================
      
      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSortDirection: (direction) => set({ sortDirection: direction }),
      
      toggleTag: (tag) => set((state) => ({
        selectedTags: state.selectedTags.includes(tag)
          ? state.selectedTags.filter((t) => t !== tag)
          : [...state.selectedTags, tag],
      })),
      
      clearFilters: () => set({
        searchQuery: "",
        selectedTags: [],
        sortBy: "dateModified",
        sortDirection: "desc",
      }),

      // =======================================================================
      // DOCUMENT OPERATIONS
      // =======================================================================
      
      createDocument: async (title = "Untitled", folderId, subject = "economics", tags = []) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const newDocument: Document = {
          id,
          title,
          subject,
          blocks: [createBlock("paragraph")],
          folderId,
          tags,
          createdAt: now,
          updatedAt: now,
        };
        
        // Optimistic update
        set((state) => ({ documents: [...state.documents, newDocument] }));
        toast.success("Document created");

        // Sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("documents").insert({
              id: newDocument.id,
              user_id: user.id,
              title: newDocument.title,
              subject: newDocument.subject,
              content: newDocument.blocks,
              folder_id: folderId,
              tags,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving document:", error);
          set({ error: "Failed to save document to server" });
          toast.error("Failed to save document");
        }

        return id;
      },

      updateDocument: async (id, updates) => {
        const now = new Date();
        
        // Optimistic update
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates, updatedAt: now } : doc
          ),
        }));

        try {
          const updateData: Record<string, unknown> = {};
          if (updates.title !== undefined) updateData.title = updates.title;
          if (updates.blocks !== undefined) updateData.content = updates.blocks;
          if (updates.folderId !== undefined) updateData.folder_id = updates.folderId;
          if (updates.subject !== undefined) updateData.subject = updates.subject;
          if (updates.tags !== undefined) updateData.tags = updates.tags;
          updateData.updated_at = now.toISOString();

          const { error } = await supabase.from("documents").update(updateData).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating document:", error);
          set({ error: "Failed to update document on server" });
          toast.error("Failed to update document");
        }
      },

      deleteDocument: async (id) => {
        // Optimistic update
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          currentDocumentId: state.currentDocumentId === id ? null : state.currentDocumentId,
        }));

        try {
          const { error } = await supabase.from("documents").delete().eq("id", id);
          if (error) throw error;
          toast.success("Document deleted");
        } catch (error) {
          console.error("Error deleting document:", error);
          set({ error: "Failed to delete document from server" });
          toast.error("Failed to delete document");
        }
      },

      duplicateDocument: async (id) => {
        const doc = get().getDocument(id);
        if (!doc) {
          toast.error("Document not found");
          throw new Error("Document not found");
        }

        const newId = crypto.randomUUID();
        const now = new Date();
        const duplicatedDoc: Document = {
          ...doc,
          id: newId,
          title: `${doc.title} (Copy)`,
          blocks: doc.blocks.map((block) => ({
            ...block,
            id: crypto.randomUUID(),
          })),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ documents: [...state.documents, duplicatedDoc] }));
        toast.success("Document duplicated");

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("documents").insert({
              id: duplicatedDoc.id,
              user_id: user.id,
              title: duplicatedDoc.title,
              subject: duplicatedDoc.subject,
              content: duplicatedDoc.blocks,
              folder_id: duplicatedDoc.folderId,
              tags: duplicatedDoc.tags,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error duplicating document:", error);
          set({ error: "Failed to duplicate document" });
        }

        return newId;
      },

      moveDocument: async (id, folderId) => {
        const now = new Date();
        
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, folderId: folderId || undefined, updatedAt: now } : doc
          ),
        }));

        try {
          const { error } = await supabase
            .from("documents")
            .update({ folder_id: folderId, updated_at: now.toISOString() })
            .eq("id", id);
          if (error) throw error;
          toast.success("Document moved");
        } catch (error) {
          console.error("Error moving document:", error);
          set({ error: "Failed to move document" });
          toast.error("Failed to move document");
        }
      },

      setCurrentDocument: (id) => set({ currentDocumentId: id }),

      addTagToDocument: async (id, tag) => {
        const doc = get().getDocument(id);
        if (!doc) return;

        const tags = [...(doc.tags || []), tag];
        await get().updateDocument(id, { tags });
      },

      removeTagFromDocument: async (id, tag) => {
        const doc = get().getDocument(id);
        if (!doc) return;

        const tags = (doc.tags || []).filter((t) => t !== tag);
        await get().updateDocument(id, { tags });
      },

      // =======================================================================
      // BLOCK OPERATIONS
      // =======================================================================
      
      addBlock: (documentId, type, index) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            const newBlock = createBlock(type);
            const blocks = [...doc.blocks];
            if (index !== undefined) {
              blocks.splice(index, 0, newBlock);
            } else {
              blocks.push(newBlock);
            }
            return { ...doc, blocks, updatedAt: new Date() };
          }),
        }));

        get().debouncedSyncDocument(documentId);
      },

      updateBlock: (documentId, blockId, content, metadata) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  blocks: doc.blocks.map((block) =>
                    block.id === blockId 
                      ? { ...block, content, ...(metadata && { metadata }) } 
                      : block
                  ),
                  updatedAt: new Date(),
                }
              : doc
          ),
        }));

        get().debouncedSyncDocument(documentId);
      },

      deleteBlock: (documentId, blockId) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  blocks: doc.blocks.filter((block) => block.id !== blockId),
                  updatedAt: new Date(),
                }
              : doc
          ),
        }));

        get().debouncedSyncDocument(documentId);
      },

      moveBlock: (documentId, blockId, newIndex) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            const blocks = [...doc.blocks];
            const oldIndex = blocks.findIndex((b) => b.id === blockId);
            if (oldIndex === -1) return doc;
            const [movedBlock] = blocks.splice(oldIndex, 1);
            blocks.splice(newIndex, 0, movedBlock);
            return { ...doc, blocks, updatedAt: new Date() };
          }),
        }));

        get().debouncedSyncDocument(documentId);
      },

      convertBlock: (documentId, blockId, newType) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  blocks: doc.blocks.map((block) =>
                    block.id === blockId
                      ? { ...createBlock(newType), id: block.id, content: block.content }
                      : block
                  ),
                  updatedAt: new Date(),
                }
              : doc
          ),
        }));

        get().debouncedSyncDocument(documentId);
      },

      duplicateBlock: (documentId, blockId) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            const blockIndex = doc.blocks.findIndex((b) => b.id === blockId);
            if (blockIndex === -1) return doc;
            const block = doc.blocks[blockIndex];
            const duplicatedBlock = {
              ...block,
              id: crypto.randomUUID(),
            };
            const blocks = [...doc.blocks];
            blocks.splice(blockIndex + 1, 0, duplicatedBlock);
            return { ...doc, blocks, updatedAt: new Date() };
          }),
        }));

        get().debouncedSyncDocument(documentId);
      },

      mergeBlocks: (documentId, blockId1, blockId2) => {
        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== documentId) return doc;
            const block1 = doc.blocks.find((b) => b.id === blockId1);
            const block2 = doc.blocks.find((b) => b.id === blockId2);
            if (!block1 || !block2) return doc;

            const mergedContent = `${block1.content} ${block2.content}`.trim();
            const blocks = doc.blocks
              .map((b) => (b.id === blockId1 ? { ...b, content: mergedContent } : b))
              .filter((b) => b.id !== blockId2);

            return { ...doc, blocks, updatedAt: new Date() };
          }),
        }));

        get().debouncedSyncDocument(documentId);
      },

      debouncedSyncDocument: (documentId: string) => {
        const { cancelDebouncedSync } = get();
        
        if (cancelDebouncedSync) {
          cancelDebouncedSync();
        }

        const { debounced, cancel } = createDebouncedFunction(async () => {
          const doc = get().getDocument(documentId);
          if (doc) {
            await get().updateDocument(documentId, { blocks: doc.blocks });
          }
        }, 1000);

        set({ cancelDebouncedSync: cancel });
        debounced();
      },

      // =======================================================================
      // FOLDER OPERATIONS
      // =======================================================================
      
      createFolder: async (name, parentId, subject = "economics", color) => {
        const id = crypto.randomUUID();
        const newFolder: Folder = {
          id,
          name,
          subject,
          parentId,
          color,
          createdAt: new Date(),
        };
        
        set((state) => ({ folders: [...state.folders, newFolder] }));
        toast.success("Folder created");

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("folders").insert({
              id: newFolder.id,
              user_id: user.id,
              name: newFolder.name,
              subject: newFolder.subject,
              parent_id: parentId,
              color,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving folder:", error);
          set({ error: "Failed to save folder to server" });
          toast.error("Failed to save folder");
        }

        return id;
      },

      updateFolder: async (id, updates) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        }));

        try {
          const updateData: Record<string, unknown> = {};
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;
          if (updates.color !== undefined) updateData.color = updates.color;

          const { error } = await supabase.from("folders").update(updateData).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating folder:", error);
          set({ error: "Failed to update folder on server" });
          toast.error("Failed to update folder");
        }
      },

      deleteFolder: async (id, moveDocumentsToRoot = true) => {
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          documents: moveDocumentsToRoot
            ? state.documents.map((doc) =>
                doc.folderId === id ? { ...doc, folderId: undefined } : doc
              )
            : state.documents.filter((doc) => doc.folderId !== id),
        }));

        try {
          const { error } = await supabase.from("folders").delete().eq("id", id);
          if (error) throw error;
          toast.success("Folder deleted");
        } catch (error) {
          console.error("Error deleting folder:", error);
          set({ error: "Failed to delete folder from server" });
          toast.error("Failed to delete folder");
        }
      },

      moveFolder: async (id, parentId) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, parentId: parentId || undefined } : folder
          ),
        }));

        try {
          const { error } = await supabase
            .from("folders")
            .update({ parent_id: parentId })
            .eq("id", id);
          if (error) throw error;
          toast.success("Folder moved");
        } catch (error) {
          console.error("Error moving folder:", error);
          set({ error: "Failed to move folder" });
          toast.error("Failed to move folder");
        }
      },

      // =======================================================================
      // GETTERS
      // =======================================================================
      
      getDocument: (id) => get().documents.find((doc) => doc.id === id),
      getFolder: (id) => get().folders.find((folder) => folder.id === id),
      
      getDocumentsInFolder: (folderId) =>
        get().documents.filter((doc) => doc.folderId === folderId),
      
      getDocumentsBySubject: (subject) =>
        get().documents.filter((doc) => doc.subject === subject),
      
      getFilteredDocuments: () => {
        const { documents, searchQuery, selectedTags, sortBy, sortDirection } = get();
        
        let filtered = documents;
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (doc) =>
              doc.title.toLowerCase().includes(query) ||
              doc.blocks.some((block) =>
                block.content.toLowerCase().includes(query)
              )
          );
        }
        
        // Filter by tags
        if (selectedTags.length > 0) {
          filtered = filtered.filter((doc) =>
            selectedTags.every((tag) => doc.tags?.includes(tag))
          );
        }
        
        // Sort
        filtered = [...filtered].sort((a, b) => {
          let comparison = 0;
          switch (sortBy) {
            case "name":
              comparison = a.title.localeCompare(b.title);
              break;
            case "dateCreated":
              comparison = a.createdAt.getTime() - b.createdAt.getTime();
              break;
            case "dateModified":
              comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
              break;
            case "subject":
              comparison = a.subject.localeCompare(b.subject);
              break;
          }
          return sortDirection === "asc" ? comparison : -comparison;
        });
        
        return filtered;
      },
      
      getAllTags: () => {
        const tags = new Set<string>();
        get().documents.forEach((doc) => {
          doc.tags?.forEach((tag) => tags.add(tag));
        });
        return Array.from(tags).sort();
      },
      
      getRecentDocuments: (limit = 5) => {
        return [...get().documents]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, limit);
      },
      
      getDocumentCount: () => get().documents.length,
      getFolderCount: () => get().folders.length,

      // =======================================================================
      // SYNC OPERATIONS
      // =======================================================================
      
      fetchDocuments: async () => {
        if (get().loading) return;
        
        set({ loading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }

          // Fetch documents
          const { data: docsData, error: docsError } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });

          if (docsError) throw docsError;

          // Fetch folders
          const { data: foldersData, error: foldersError } = await supabase
            .from("folders")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

          if (foldersError) throw foldersError;

          // Map to local format
          const mappedDocuments: Document[] = (docsData || []).map((doc: DatabaseDocument) => ({
            id: doc.id,
            title: doc.title,
            subject: doc.subject as Subject,
            blocks: doc.content || [createBlock("paragraph")],
            folderId: doc.folder_id,
            tags: doc.tags || [],
            createdAt: new Date(doc.created_at),
            updatedAt: new Date(doc.updated_at),
          }));

          const mappedFolders: Folder[] = (foldersData || []).map((folder: DatabaseFolder) => ({
            id: folder.id,
            name: folder.name,
            subject: folder.subject as Subject,
            parentId: folder.parent_id,
            color: folder.color,
            createdAt: new Date(folder.created_at),
          }));

          set({ documents: mappedDocuments, folders: mappedFolders });
        } catch (error) {
          console.error("Error fetching documents:", error);
          set({ error: "Failed to fetch documents" });
          toast.error("Failed to fetch documents");
        } finally {
          set({ loading: false });
        }
      },

      syncWithSupabase: async () => {
        set({ syncing: true });
        
        try {
          await get().fetchDocuments();
          await get().processPendingOperations();
          toast.success("Documents synced");
        } catch (error) {
          console.error("Error syncing documents:", error);
          set({ error: "Sync failed" });
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },

      processPendingOperations: async () => {
        const { pendingOperations } = get();
        if (pendingOperations.length === 0) return;

        const processedIds: string[] = [];

        for (const operation of pendingOperations) {
          if (operation.retryCount >= 3) continue;

          try {
            // Process operation based on type
            processedIds.push(operation.id);
          } catch (error) {
            console.error("Failed to process pending operation:", error);
            operation.retryCount++;
          }
        }

        set((state) => ({
          pendingOperations: state.pendingOperations.filter(
            (op) => !processedIds.includes(op.id)
          ),
        }));
      },

      // =======================================================================
      // EXPORT OPERATIONS
      // =======================================================================
      
      exportDocument: (id, format) => {
        const doc = get().getDocument(id);
        if (!doc) return "";

        switch (format) {
          case "markdown":
            return exportToMarkdown(doc);
          case "json":
            return JSON.stringify(doc, null, 2);
          case "txt":
            return doc.blocks.map((b) => b.content).join("\n\n");
          default:
            return "";
        }
      },

      exportAllDocuments: (format) => {
        const { documents } = get();
        
        switch (format) {
          case "markdown":
            return documents.map((doc) => exportToMarkdown(doc)).join("\n\n---\n\n");
          case "json":
            return JSON.stringify(documents, null, 2);
          case "txt":
            return documents
              .map((doc) => `=== ${doc.title} ===\n\n${doc.blocks.map((b) => b.content).join("\n\n")}`)
              .join("\n\n---\n\n");
          default:
            return "";
        }
      },
    }),
    {
      name: "document-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ 
        documents: state.documents,
        folders: state.folders,
        currentDocumentId: state.currentDocumentId,
        pendingOperations: state.pendingOperations,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// =============================================================================
// EXPORT HELPERS
// =============================================================================

function exportToMarkdown(doc: Document): string {
  let markdown = `# ${doc.title}\n\n`;
  
  doc.blocks.forEach((block) => {
    switch (block.type) {
      case "heading1":
        markdown += `# ${block.content}\n\n`;
        break;
      case "heading2":
        markdown += `## ${block.content}\n\n`;
        break;
      case "heading3":
        markdown += `### ${block.content}\n\n`;
        break;
      case "bullet":
        markdown += `- ${block.content}\n`;
        break;
      case "numbered":
        markdown += `1. ${block.content}\n`;
        break;
      case "checklist":
        const checked = block.metadata?.checked ? "x" : " ";
        markdown += `- [${checked}] ${block.content}\n`;
        break;
      case "quote":
        markdown += `> ${block.content}\n\n`;
        break;
      case "code":
        const lang = block.metadata?.language || "";
        markdown += "\n```" + lang + "\n" + block.content + "\n```\n\n";
        break;
      case "divider":
        markdown += "---\n\n";
        break;
      default:
        markdown += `${block.content}\n\n`;
    }
  });
  
  return markdown;
}

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

export const useDocument = (id: string) => 
  useDocumentStore((state) => state.documents.find((doc) => doc.id === id));

export const useDocumentsBySubject = (subject: Subject) => 
  useDocumentStore((state) => state.documents.filter((doc) => doc.subject === subject));

export const useDocumentsInFolder = (folderId?: string) => 
  useDocumentStore((state) => state.documents.filter((doc) => doc.folderId === folderId));

export const useCurrentDocument = () => 
  useDocumentStore((state) => 
    state.currentDocumentId ? state.documents.find((doc) => doc.id === state.currentDocumentId) : undefined
  );

export const useFolder = (id: string) => 
  useDocumentStore((state) => state.folders.find((folder) => folder.id === id));

export const useFoldersBySubject = (subject: Subject) => 
  useDocumentStore((state) => state.folders.filter((folder) => folder.subject === subject));

export const useRecentDocuments = (limit = 5) => 
  useDocumentStore((state) => 
    [...state.documents]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit)
  );
