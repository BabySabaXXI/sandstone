import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentBlock, Folder, DatabaseDocument, DatabaseFolder, Subject } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

// Debounce utility with cleanup
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

// Block type for creating blocks
type BlockType = 
  | "heading1" 
  | "heading2" 
  | "heading3" 
  | "paragraph" 
  | "bullet" 
  | "numbered" 
  | "quote" 
  | "divider";

// Create a new block
function createBlock(type: BlockType): DocumentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content: "",
  };
}

interface DocumentStore {
  // State
  documents: Document[];
  folders: Folder[];
  currentDocumentId: string | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];
  
  // Debounced sync cancel function
  cancelDebouncedSync: (() => void) | null;
  
  // Document operations
  createDocument: (title?: string, folderId?: string, subject?: Subject) => Promise<string>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (id: string | null) => void;
  
  // Block operations
  addBlock: (documentId: string, type: BlockType, index?: number) => void;
  updateBlock: (documentId: string, blockId: string, content: string) => void;
  deleteBlock: (documentId: string, blockId: string) => void;
  moveBlock: (documentId: string, blockId: string, newIndex: number) => void;
  
  // Folder operations
  createFolder: (name: string, parentId?: string, subject?: Subject) => Promise<string>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  
  // Getters
  getDocument: (id: string) => Document | undefined;
  getFolder: (id: string) => Folder | undefined;
  getDocumentsInFolder: (folderId?: string) => Document[];
  getDocumentsBySubject: (subject: Subject) => Document[];
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  debouncedSyncDocument: (documentId: string) => void;
  processPendingOperations: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: 'create_doc' | 'update_doc' | 'delete_doc' | 'create_folder' | 'update_folder' | 'delete_folder';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// Custom storage with error handling
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
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please clear some data.');
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

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      folders: [],
      currentDocumentId: null,
      loading: false,
      syncing: false,
      error: null,
      isHydrated: false,
      pendingOperations: [],
      cancelDebouncedSync: null,

      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),

      createDocument: async (title = "Untitled", folderId, subject = "economics") => {
        const id = crypto.randomUUID();
        const now = new Date();
        const newDocument: Document = {
          id,
          title,
          subject,
          blocks: [createBlock("paragraph")],
          folderId,
          createdAt: now,
          updatedAt: now,
        };
        
        // Optimistic update
        set((state) => ({ documents: [...state.documents, newDocument] }));

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
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving document:", error);
          set({ error: "Failed to save document to server" });
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
          updateData.updated_at = now.toISOString();

          const { error } = await supabase.from("documents").update(updateData).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating document:", error);
          set({ error: "Failed to update document on server" });
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
        }
      },

      setCurrentDocument: (id) => set({ currentDocumentId: id }),

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

        // Debounced sync
        get().debouncedSyncDocument(documentId);
      },

      updateBlock: (documentId, blockId, content) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === documentId
              ? {
                  ...doc,
                  blocks: doc.blocks.map((block) =>
                    block.id === blockId ? { ...block, content } : block
                  ),
                  updatedAt: new Date(),
                }
              : doc
          ),
        }));

        // Debounced sync
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

        // Debounced sync
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

        // Debounced sync
        get().debouncedSyncDocument(documentId);
      },

      debouncedSyncDocument: (documentId: string) => {
        const { cancelDebouncedSync } = get();
        
        // Cancel previous debounced sync
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

      createFolder: async (name, parentId, subject = "economics") => {
        const id = crypto.randomUUID();
        const newFolder: Folder = {
          id,
          name,
          subject,
          parentId,
          createdAt: new Date(),
        };
        
        // Optimistic update
        set((state) => ({ folders: [...state.folders, newFolder] }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("folders").insert({
              id: newFolder.id,
              user_id: user.id,
              name: newFolder.name,
              subject: newFolder.subject,
              parent_id: parentId,
            });
            if (error) throw error;
          }
        } catch (error) {
          console.error("Error saving folder:", error);
          set({ error: "Failed to save folder to server" });
        }

        return id;
      },

      updateFolder: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        }));

        try {
          const updateData: Record<string, unknown> = {};
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.parentId !== undefined) updateData.parent_id = updates.parentId;

          const { error } = await supabase.from("folders").update(updateData).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating folder:", error);
          set({ error: "Failed to update folder on server" });
        }
      },

      deleteFolder: async (id) => {
        // Optimistic update
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          documents: state.documents.map((doc) =>
            doc.folderId === id ? { ...doc, folderId: undefined } : doc
          ),
        }));

        try {
          const { error } = await supabase.from("folders").delete().eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error deleting folder:", error);
          set({ error: "Failed to delete folder from server" });
        }
      },

      getDocument: (id) => get().documents.find((doc) => doc.id === id),
      getFolder: (id) => get().folders.find((folder) => folder.id === id),
      getDocumentsInFolder: (folderId) =>
        get().documents.filter((doc) => doc.folderId === folderId),
      getDocumentsBySubject: (subject) =>
        get().documents.filter((doc) => doc.subject === subject),

      fetchDocuments: async () => {
        // Prevent concurrent fetches
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
            createdAt: new Date(doc.created_at),
            updatedAt: new Date(doc.updated_at),
          }));

          const mappedFolders: Folder[] = (foldersData || []).map((folder: DatabaseFolder) => ({
            id: folder.id,
            name: folder.name,
            subject: folder.subject as Subject,
            parentId: folder.parent_id,
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
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useDocument = (id: string) => 
  useDocumentStore((state) => state.documents.find((doc) => doc.id === id));

export const useDocumentsBySubject = (subject: Subject) => 
  useDocumentStore((state) => state.documents.filter((doc) => doc.subject === subject));

export const useDocumentsInFolder = (folderId?: string) => 
  useDocumentStore((state) => state.documents.filter((doc) => doc.folderId === folderId));

export const useCurrentDocument = () => 
  useDocumentStore((state) => state.currentDocumentId ? state.documents.find((doc) => doc.id === state.currentDocumentId) : undefined);

export const useFolder = (id: string) => 
  useDocumentStore((state) => state.folders.find((folder) => folder.id === id));

export const useFoldersBySubject = (subject: Subject) => 
  useDocumentStore((state) => state.folders.filter((folder) => folder.subject === subject));
