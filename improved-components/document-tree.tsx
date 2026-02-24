"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/stores/document-store";
import {
  FileText,
  Folder,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface DocumentTreeProps {
  onSelectDocument: (id: string) => void;
  selectedId?: string | null;
}

interface FolderItemProps {
  folder: {
    id: string;
    name: string;
  };
  documents: Array<{ id: string; title: string; folderId?: string | null }>;
  isExpanded: boolean;
  selectedId?: string | null;
  onToggle: (folderId: string) => void;
  onSelectDocument: (id: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

interface DocumentItemProps {
  doc: { id: string; title: string };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const DocumentItem = memo(function DocumentItem({
  doc,
  isSelected,
  onSelect,
}: DocumentItemProps) {
  const handleClick = useCallback(() => {
    onSelect(doc.id);
  }, [doc.id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
        isSelected
          ? "bg-[#F0F0EC] text-[#2D2D2D]"
          : "text-[#5A5A5A] hover:bg-[#FAFAF8]"
      )}
      aria-current={isSelected ? "true" : undefined}
    >
      <FileText className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{doc.title}</span>
    </button>
  );
});

const FolderItem = memo(function FolderItem({
  folder,
  documents,
  isExpanded,
  selectedId,
  onToggle,
  onSelectDocument,
  onDeleteFolder,
}: FolderItemProps) {
  const handleToggle = useCallback(() => {
    onToggle(folder.id);
  }, [folder.id, onToggle]);

  const handleDelete = useCallback(() => {
    onDeleteFolder(folder.id);
  }, [folder.id, onDeleteFolder]);

  return (
    <div>
      <div className="flex items-center gap-1 group">
        <button
          onClick={handleToggle}
          className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
          aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          aria-expanded={isExpanded}
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 text-[#8A8A8A] transition-transform duration-200",
              isExpanded && "rotate-90"
            )}
            aria-hidden="true"
          />
        </button>
        <Folder
          className="w-4 h-4 text-[#E5D4A8] flex-shrink-0"
          aria-hidden="true"
        />
        <span className="flex-1 text-sm text-[#2D2D2D] truncate">
          {folder.name}
        </span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F0F0EC] rounded transition-all"
          aria-label={`Delete folder ${folder.name}`}
        >
          <Trash2 className="w-3 h-3 text-[#8A8A8A]" aria-hidden="true" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="ml-6 space-y-1 overflow-hidden"
          >
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                isSelected={selectedId === doc.id}
                onSelect={onSelectDocument}
              />
            ))}
            {documents.length === 0 && (
              <p className="text-xs text-[#8A8A8A] px-2 py-1">No documents</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const DocumentTree = memo(function DocumentTree({
  onSelectDocument,
  selectedId,
}: DocumentTreeProps) {
  const { documents, folders, createDocument, deleteFolder } =
    useDocumentStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Memoized folder toggle handler
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  // Memoized document creation handler
  const handleCreateDocument = useCallback(async () => {
    await createDocument("Untitled");
  }, [createDocument]);

  // Memoized folder deletion handler
  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      await deleteFolder(folderId);
    },
    [deleteFolder]
  );

  // Memoized folder creation handlers
  const handleCreateFolder = useCallback(async () => {
    if (newFolderName.trim()) {
      // Note: createFolder would need to be added to the store
      // await createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  }, [newFolderName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreateFolder();
      } else if (e.key === "Escape") {
        setIsCreatingFolder(false);
        setNewFolderName("");
      }
    },
    [handleCreateFolder]
  );

  // Memoize root documents
  const rootDocuments = useMemo(
    () => documents.filter((d) => !d.folderId),
    [documents]
  );

  // Memoize folder documents lookup
  const getFolderDocuments = useCallback(
    (folderId: string) => documents.filter((d) => d.folderId === folderId),
    [documents]
  );

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#2D2D2D]">Documents</h3>
        <div className="flex gap-1">
          <button
            onClick={handleCreateDocument}
            className="p-1.5 hover:bg-[#F0F0EC] rounded-lg transition-colors"
            title="New Document"
            aria-label="Create new document"
          >
            <Plus className="w-4 h-4 text-[#5A5A5A]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Folders */}
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          documents={getFolderDocuments(folder.id)}
          isExpanded={expandedFolders.has(folder.id)}
          selectedId={selectedId}
          onToggle={toggleFolder}
          onSelectDocument={onSelectDocument}
          onDeleteFolder={handleDeleteFolder}
        />
      ))}

      {/* Root Documents */}
      {rootDocuments.map((doc) => (
        <DocumentItem
          key={doc.id}
          doc={doc}
          isSelected={selectedId === doc.id}
          onSelect={onSelectDocument}
        />
      ))}

      {/* Create Folder */}
      {isCreatingFolder ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Folder name"
            className="flex-1 px-2 py-1 text-sm border border-[#E5E5E0] rounded focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setIsCreatingFolder(true)}
          className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors px-2 py-1"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Folder
        </button>
      )}
    </div>
  );
});

export default DocumentTree;
