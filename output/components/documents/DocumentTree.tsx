"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/stores/document-store";
import {
  FileText,
  Folder,
  ChevronRight,
  Plus,
  Trash2,
  MoreHorizontal,
  Search,
  FolderPlus,
  Edit2,
  Check,
  X,
  GripVertical,
  Clock,
  Tag,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Subject } from "@/types";

// =============================================================================
// TYPES
// =============================================================================

interface DocumentTreeProps {
  onSelectDocument: (id: string) => void;
  selectedId?: string | null;
}

interface FolderColor {
  name: string;
  value: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const FOLDER_COLORS: FolderColor[] = [
  { name: "Yellow", value: "#E5D4A8" },
  { name: "Blue", value: "#A8C5D4" },
  { name: "Green", value: "#A8D4B5" },
  { name: "Red", value: "#D4A8A8" },
  { name: "Purple", value: "#C5A8D4" },
  { name: "Orange", value: "#E5C4A8" },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DocumentTree({ onSelectDocument, selectedId }: DocumentTreeProps) {
  const {
    documents,
    folders,
    createDocument,
    deleteDocument,
    createFolder,
    deleteFolder,
    updateFolder,
    moveDocument,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortDirection,
    setSortBy,
    setSortDirection,
    getFilteredDocuments,
    getAllTags,
    selectedTags,
    toggleTag,
    clearFilters,
  } = useDocumentStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0].value);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [draggedDocId, setDraggedDocId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // Toggle folder expansion
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

  // Handle create folder
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim(), undefined, "economics", newFolderColor);
      setNewFolderName("");
      setIsCreatingFolder(false);
    }
  };

  // Handle rename folder
  const handleRenameFolder = async (folderId: string) => {
    if (editingFolderName.trim()) {
      await updateFolder(folderId, { name: editingFolderName.trim() });
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  // Handle drag start
  const handleDragStart = (docId: string) => {
    setDraggedDocId(docId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    if (draggedDocId) {
      await moveDocument(draggedDocId, folderId);
      setDraggedDocId(null);
      setDragOverFolderId(null);
    }
  };

  // Get filtered documents
  const filteredDocuments = getFilteredDocuments();

  // Get root documents (not in any folder)
  const rootDocuments = filteredDocuments.filter((d) => !d.folderId);

  // Get all tags
  const allTags = getAllTags();

  // Sort folders
  const sortedFolders = useMemo(() => {
    return [...folders].sort((a, b) => a.name.localeCompare(b.name));
  }, [folders]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#2D2D2D]">Documents</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters || searchQuery || selectedTags.length > 0
                ? "bg-[#E8D5C4] text-[#2D2D2D]"
                : "hover:bg-[#F0F0EC] text-[#5A5A5A]"
            }`}
            title="Filter"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={async () => await createDocument("Untitled")}
            className="p-1.5 hover:bg-[#F0F0EC] rounded-lg transition-colors"
            title="New Document"
          >
            <Plus className="w-4 h-4 text-[#5A5A5A]" />
          </button>
          <button
            onClick={() => setIsCreatingFolder(true)}
            className="p-1.5 hover:bg-[#F0F0EC] rounded-lg transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4 text-[#5A5A5A]" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAFAF8] border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]/50 focus:border-[#E8D5C4] transition-all"
        />
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Sort options */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#8A8A8A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 text-sm bg-[#FAFAF8] border border-[#E5E5E0] rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]/50"
              >
                <option value="dateModified">Last Modified</option>
                <option value="name">Name</option>
                <option value="dateCreated">Date Created</option>
                <option value="subject">Subject</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                className="p-1.5 hover:bg-[#F0F0EC] rounded-lg transition-colors"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
              <div>
                <div className="text-xs text-[#8A8A8A] mb-2 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Filter by tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 text-xs rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-[#E8D5C4] text-[#2D2D2D]"
                          : "bg-[#F0F0EC] text-[#5A5A5A] hover:bg-[#E8D5C4]/50"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters */}
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-[#8A8A8A]">
        <span>{documents.length} documents</span>
        <span>{folders.length} folders</span>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Folders */}
        {sortedFolders.map((folder) => {
          const folderDocuments = filteredDocuments.filter((d) => d.folderId === folder.id);
          const isExpanded = expandedFolders.has(folder.id);
          const isDragOver = dragOverFolderId === folder.id;

          return (
            <div key={folder.id}>
              <div
                className={cn(
                  "flex items-center gap-1 group rounded-lg transition-all",
                  isDragOver && "bg-[#E8D5C4]/30 ring-2 ring-[#E8D5C4]"
                )}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
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
                <Folder
                  className="w-4 h-4"
                  style={{ color: folder.color || "#E5D4A8" }}
                />
                {editingFolderId === folder.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameFolder(folder.id);
                        if (e.key === "Escape") {
                          setEditingFolderId(null);
                          setEditingFolderName("");
                        }
                      }}
                      className="flex-1 text-sm px-1 py-0.5 border border-[#E5E5E0] rounded focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRenameFolder(folder.id)}
                      className="p-0.5 hover:bg-[#F0F0EC] rounded"
                    >
                      <Check className="w-3 h-3 text-[#A8D4B5]" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingFolderId(null);
                        setEditingFolderName("");
                      }}
                      className="p-0.5 hover:bg-[#F0F0EC] rounded"
                    >
                      <X className="w-3 h-3 text-[#D4A8A8]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[#2D2D2D] truncate">{folder.name}</span>
                    <span className="text-xs text-[#8A8A8A]">{folderDocuments.length}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                        }}
                        className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-[#8A8A8A]" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this folder? Documents will be moved to root.")) {
                            deleteFolder(folder.id, true);
                          }
                        }}
                        className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-[#8A8A8A]" />
                      </button>
                    </div>
                  </>
                )}
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
                      <div
                        key={doc.id}
                        draggable
                        onDragStart={() => handleDragStart(doc.id)}
                        className={cn(
                          "group flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                          selectedId === doc.id
                            ? "bg-[#F0F0EC] text-[#2D2D2D]"
                            : "text-[#5A5A5A] hover:bg-[#FAFAF8]"
                        )}
                      >
                        <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 cursor-grab" />
                        <button
                          onClick={() => onSelectDocument(doc.id)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </button>
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this document?")) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-[#8A8A8A]" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {folderDocuments.length === 0 && (
                      <p className="text-xs text-[#8A8A8A] px-2 py-1 italic">
                        No documents in this folder
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Root Documents */}
        <div
          className={cn(
            "space-y-1 pt-2 border-t border-[#E5E5E0]",
            dragOverFolderId === null && draggedDocId && "bg-[#E8D5C4]/10 rounded-lg"
          )}
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
        >
          {rootDocuments.length > 0 && folders.length > 0 && (
            <div className="text-xs text-[#8A8A8A] px-2 py-1">Uncategorized</div>
          )}
          {rootDocuments.map((doc) => (
            <div
              key={doc.id}
              draggable
              onDragStart={() => handleDragStart(doc.id)}
              className={cn(
                "group flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer",
                selectedId === doc.id
                  ? "bg-[#F0F0EC] text-[#2D2D2D]"
                  : "text-[#5A5A5A] hover:bg-[#FAFAF8]"
              )}
            >
              <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 cursor-grab" />
              <button
                onClick={() => onSelectDocument(doc.id)}
                className="flex-1 flex items-center gap-2 text-left"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </button>
              {doc.tags && doc.tags.length > 0 && (
                <span className="text-xs text-[#8A8A8A]">{doc.tags.length} tags</span>
              )}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this document?")) {
                      deleteDocument(doc.id);
                    }
                  }}
                  className="p-1 hover:bg-[#F0F0EC] rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-[#8A8A8A]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-[#E5E5E0] mx-auto mb-2" />
            <p className="text-sm text-[#8A8A8A]">
              {searchQuery || selectedTags.length > 0
                ? "No documents match your filters"
                : "No documents yet"}
            </p>
            {(searchQuery || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-[#A8C5D4] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Folder Form */}
      <AnimatePresence>
        {isCreatingFolder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[#FAFAF8] rounded-lg p-3 space-y-3"
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
              autoFocus
            />
            <div>
              <div className="text-xs text-[#8A8A8A] mb-2">Color</div>
              <div className="flex gap-2">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewFolderColor(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newFolderColor === color.value
                        ? "border-[#2D2D2D] scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 px-3 py-2 bg-[#2D2D2D] text-white text-sm rounded-lg hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName("");
                }}
                className="px-3 py-2 bg-[#F0F0EC] text-[#5A5A5A] text-sm rounded-lg hover:bg-[#E5E5E0] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DocumentTree;
