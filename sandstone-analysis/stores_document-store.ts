import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Document, DocumentBlock, Folder, DatabaseDocument, DatabaseFolder, Subject } from "@/types";
import { createBlock, BlockType } from "@/lib/documents/blocks";
import { toast } from "sonner";

interface DocumentStore {
  documents: Document[];
  folders: Folder[];
  currentDocumentId: string | null;
  loading: boolean;
  syncing: boolean;
  
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
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      folders: [],
      currentDocumentId: null,
      loading: false,
      syncing: false,

      createDocument: async (title = "Untitled", folderId, subject = "economics") => {
        const id = crypto.randomUUID();
        const newDocument: Document = {
          id,
          title,
          subject,
          blocks: [createBlock("paragraph")],
          folderId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
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
        }

        return id;
      },

      updateDocument: async (id, updates) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates, updatedAt: new Date() } : doc
          ),
        }));

        try {
          const { error } = await supabase.from("documents").update({
            title: updates.title,
            content: updates.blocks,
            folder_id: updates.folderId,
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating document:", error);
        }
      },

      deleteDocument: async (id) => {
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
        setTimeout(() => {
          const doc = get().getDocument(documentId);
          if (doc) {
            get().updateDocument(documentId, { blocks: doc.blocks });
          }
        }, 1000);
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
        setTimeout(() => {
          const doc = get().getDocument(documentId);
          if (doc) {
            get().updateDocument(documentId, { blocks: doc.blocks });
          }
        }, 1000);
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
          const { error } = await supabase.from("folders").update({
            name: updates.name,
            parent_id: updates.parentId,
          }).eq("id", id);
          if (error) throw error;
        } catch (error) {
          console.error("Error updating folder:", error);
        }
      },

      deleteFolder: async (id) => {
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
        }
      },

      getDocument: (id) => get().documents.find((doc) => doc.id === id),
      getFolder: (id) => get().folders.find((folder) => folder.id === id),
      getDocumentsInFolder: (folderId) =>
        get().documents.filter((doc) => doc.folderId === folderId),
      getDocumentsBySubject: (subject) =>
        get().documents.filter((doc) => doc.subject === subject),

      fetchDocuments: async () => {
        set({ loading: true });
        
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
          const mappedDocuments: Document[] = docsData.map((doc: DatabaseDocument) => ({
            id: doc.id,
            title: doc.title,
            subject: doc.subject as Subject,
            blocks: doc.content || [createBlock("paragraph")],
            folderId: doc.folder_id,
            createdAt: new Date(doc.created_at),
            updatedAt: new Date(doc.updated_at),
          }));

          const mappedFolders: Folder[] = foldersData.map((folder: DatabaseFolder) => ({
            id: folder.id,
            name: folder.name,
            subject: folder.subject as Subject,
            parentId: folder.parent_id,
            createdAt: new Date(folder.created_at),
          }));

          set({ documents: mappedDocuments, folders: mappedFolders });
        } catch (error) {
          console.error("Error fetching documents:", error);
          toast.error("Failed to fetch documents");
        } finally {
          set({ loading: false });
        }
      },

      syncWithSupabase: async () => {
        set({ syncing: true });
        
        try {
          await get().fetchDocuments();
          toast.success("Documents synced");
        } catch (error) {
          console.error("Error syncing documents:", error);
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: "document-store",
    }
  )
);
