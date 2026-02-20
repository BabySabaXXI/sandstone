"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/stores/document-store";
import { FileText, Folder, ChevronRight, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTreeProps {
  onSelectDocument: (id: string) => void;
  selectedId?: string | null;
}

export function DocumentTree({ onSelectDocument, selectedId }: DocumentTreeProps) {
  const { documents, folders, createDocument, deleteDocument, createFolder, deleteFolder } =
    useDocumentStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  const rootDocuments = documents.filter((d) => !d.folderId);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#2D2D2D]">Documents</h3>
        <div className="flex gap-1">
          <button
            onClick={async () => await createDocument("Untitled")}
            className="p-1.5 hover:bg-[#F0F0EC] rounded-lg transition-colors"
            title="New Document"
          >
            <Plus className="w-4 h-4 text-[#5A5A5A]" />
          </button>
        </div>
      </div>

      {/* Folders */}
      {folders.map((folder) => {
        const folderDocuments = documents.filter((d) => d.folderId === folder.id);
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <div key={folder.id}>
            <div className="flex items-center gap-1 group">
              <button
                onClick={() => toggleFolder(folder.id)}
                className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-[#8A8A8A] transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>
              <Folder className="w-4 h-4 text-[#E5D4A8]" />
              <span className="flex-1 text-sm text-[#2D2D2D]">{folder.name}</span>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F0F0EC] rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-[#8A8A8A]" />
              </button>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-6 space-y-1 overflow-hidden"
                >
                  {folderDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => onSelectDocument(doc.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                        selectedId === doc.id
                          ? "bg-[#F0F0EC] text-[#2D2D2D]"
                          : "text-[#5A5A5A] hover:bg-[#FAFAF8]"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                  {folderDocuments.length === 0 && (
                    <p className="text-xs text-[#8A8A8A] px-2 py-1">No documents</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Root Documents */}
      {rootDocuments.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onSelectDocument(doc.id)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
            selectedId === doc.id
              ? "bg-[#F0F0EC] text-[#2D2D2D]"
              : "text-[#5A5A5A] hover:bg-[#FAFAF8]"
          )}
        >
          <FileText className="w-4 h-4" />
          <span className="truncate">{doc.title}</span>
        </button>
      ))}

      {/* Create Folder */}
      {isCreatingFolder ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
              if (e.key === "Escape") setIsCreatingFolder(false);
            }}
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
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      )}
    </div>
  );
}
