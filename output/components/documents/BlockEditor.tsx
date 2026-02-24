"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentStore } from "@/stores/document-store";
import { Block } from "./Block";
import { BlockType, serializeBlocks } from "@/lib/documents/blocks";
import { useAutoSave } from "@/hooks/useAutoSave";
import { 
  Plus, 
  Trash2, 
  MoreHorizontal, 
  Download, 
  FileText, 
  Share2, 
  History,
  Tag,
  Folder,
  Clock,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { ExportMenu } from "./ExportMenu";
import { TagInput } from "./TagInput";

// =============================================================================
// TYPES
// =============================================================================

interface BlockEditorProps {
  documentId: string;
}

interface DocumentHistory {
  id: string;
  timestamp: Date;
  title: string;
  blocks: { type: string; content: string }[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BlockEditor({ documentId }: BlockEditorProps) {
  const {
    getDocument,
    updateDocument,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    deleteDocument,
    convertBlock,
    duplicateBlock,
    mergeBlocks,
    moveDocument,
    addTagToDocument,
    removeTagFromDocument,
    folders,
  } = useDocumentStore();

  const document = getDocument(documentId);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [title, setTitle] = useState(document?.title || "Untitled");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update local title when document changes
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      updateCounts();
    }
  }, [document?.title, document?.blocks]);

  // Auto-save
  useAutoSave({
    data: { title, blocks: document?.blocks },
    onSave: () => {
      if (document) {
        updateDocument(documentId, { title });
      }
    },
    delay: 1000,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (document) {
          updateDocument(documentId, { title, blocks: document.blocks });
          toast.success("Document saved");
        }
      }

      // Ctrl/Cmd + E to export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setShowExportMenu(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [document, documentId, title, updateDocument]);

  // Update word and character count
  const updateCounts = useCallback(() => {
    if (!document) return;
    const text = document.blocks.map((b) => b.content).join(" ");
    setCharCount(text.length);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  }, [document]);

  if (!document) {
    return (
      <div className="text-center py-12 text-[#8A8A8A]">
        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Document not found</p>
      </div>
    );
  }

  // Block handlers
  const handleAddBlock = useCallback((type: BlockType, index?: number) => {
    addBlock(documentId, type, index);
    // Focus the new block after it's added
    setTimeout(() => {
      const newBlockIndex = index !== undefined ? index : document.blocks.length;
      const newBlock = document.blocks[newBlockIndex];
      if (newBlock) {
        setFocusedBlockId(newBlock.id);
      }
    }, 50);
  }, [addBlock, documentId, document.blocks]);

  const handleUpdateBlock = useCallback((blockId: string, content: string, metadata?: Record<string, unknown>) => {
    updateBlock(documentId, blockId, content, metadata);
    updateCounts();
  }, [updateBlock, documentId, updateCounts]);

  const handleDeleteBlock = useCallback((blockId: string) => {
    deleteBlock(documentId, blockId);
    // Focus previous block or next block
    const blockIndex = document.blocks.findIndex((b) => b.id === blockId);
    const newFocusIndex = blockIndex > 0 ? blockIndex - 1 : 0;
    const newFocusBlock = document.blocks[newFocusIndex];
    if (newFocusBlock && newFocusBlock.id !== blockId) {
      setFocusedBlockId(newFocusBlock.id);
    }
  }, [deleteBlock, documentId, document.blocks]);

  const handleConvertBlock = useCallback((blockId: string, type: BlockType) => {
    convertBlock(documentId, blockId, type);
  }, [convertBlock, documentId]);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    duplicateBlock(documentId, blockId);
  }, [duplicateBlock, documentId]);

  const handleMoveBlockUp = useCallback((blockId: string) => {
    const index = document.blocks.findIndex((b) => b.id === blockId);
    if (index > 0) {
      moveBlock(documentId, blockId, index - 1);
    }
  }, [moveBlock, documentId, document.blocks]);

  const handleMoveBlockDown = useCallback((blockId: string) => {
    const index = document.blocks.findIndex((b) => b.id === blockId);
    if (index < document.blocks.length - 1) {
      moveBlock(documentId, blockId, index + 1);
    }
  }, [moveBlock, documentId, document.blocks]);

  const handleMoveDocument = useCallback((folderId: string | null) => {
    moveDocument(documentId, folderId);
    setShowFolderMenu(false);
    toast.success(folderId ? "Document moved to folder" : "Document moved to root");
  }, [moveDocument, documentId]);

  const handleAddTag = useCallback(async (tag: string) => {
    await addTagToDocument(documentId, tag);
    toast.success(`Tag "${tag}" added`);
  }, [addTagToDocument, documentId]);

  const handleRemoveTag = useCallback(async (tag: string) => {
    await removeTagFromDocument(documentId, tag);
    toast.success(`Tag "${tag}" removed`);
  }, [removeTagFromDocument, documentId]);

  // Export handlers
  const handleExport = useCallback((format: "markdown" | "json" | "txt") => {
    const content = serializeBlocks(document.blocks);
    let blob: Blob;
    let filename: string;

    switch (format) {
      case "markdown":
        blob = new Blob([`# ${document.title}\n\n${content}`], { type: "text/markdown" });
        filename = `${document.title}.md`;
        break;
      case "json":
        blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
        filename = `${document.title}.json`;
        break;
      case "txt":
        blob = new Blob([document.blocks.map((b) => b.content).join("\n\n")], { type: "text/plain" });
        filename = `${document.title}.txt`;
        break;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported as ${format}`);
    setShowExportMenu(false);
  }, [document]);

  return (
    <div ref={editorRef} className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        {/* Title input */}
        <div className="flex items-start gap-4 mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-3xl font-bold text-[#2D2D2D] bg-transparent outline-none placeholder:text-[#8A8A8A]"
            placeholder="Untitled Document"
          />
          <div className="flex items-center gap-1">
            {/* Export button */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0F0EC] rounded-lg transition-colors"
                title="Export"
              >
                <Download className="w-5 h-5" />
              </button>
              <ExportMenu
                isOpen={showExportMenu}
                onClose={() => setShowExportMenu(false)}
                onExport={handleExport}
              />
            </div>

            {/* Tags button */}
            <div className="relative">
              <button
                onClick={() => setShowTagInput(!showTagInput)}
                className="p-2 text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0F0EC] rounded-lg transition-colors"
                title="Tags"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>

            {/* Folder button */}
            <div className="relative">
              <button
                onClick={() => setShowFolderMenu(!showFolderMenu)}
                className="p-2 text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0F0EC] rounded-lg transition-colors"
                title="Move to folder"
              >
                <Folder className="w-5 h-5" />
              </button>
              {showFolderMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E0] py-2 z-20">
                  <div className="px-3 py-1.5 text-xs text-[#8A8A8A] uppercase tracking-wider">
                    Move to folder
                  </div>
                  <button
                    onClick={() => handleMoveDocument(null)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F0F0EC] transition-colors ${
                      !document.folderId ? "bg-[#F0F0EC] text-[#2D2D2D]" : "text-[#5A5A5A]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Root (no folder)
                      {!document.folderId && <Check className="w-4 h-4 ml-auto" />}
                    </div>
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleMoveDocument(folder.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F0F0EC] transition-colors ${
                        document.folderId === folder.id ? "bg-[#F0F0EC] text-[#2D2D2D]" : "text-[#5A5A5A]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" style={{ color: folder.color || "#E5D4A8" }} />
                        {folder.name}
                        {document.folderId === folder.id && <Check className="w-4 h-4 ml-auto" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={() => {
                if (confirm("Are you sure you want to delete this document?")) {
                  deleteDocument(documentId);
                }
              }}
              className="p-2 text-[#8A8A8A] hover:text-[#D4A8A8] hover:bg-[#FDF2F2] rounded-lg transition-colors"
              title="Delete document"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Last edited {new Date(document.updatedAt).toLocaleString()}</span>
          </div>
          <div className="w-px h-3 bg-[#E5E5E0]" />
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{document.blocks.length} blocks</span>
        </div>

        {/* Tags */}
        <AnimatePresence>
          {showTagInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <TagInput
                tags={document.tags || []}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag display */}
        {!showTagInput && document.tags && document.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#F0F0EC] text-[#5A5A5A] text-xs rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Blocks */}
      <div className="space-y-1 min-h-[300px]">
        {document.blocks.map((block, index) => (
          <Block
            key={block.id}
            block={block}
            index={index}
            onUpdate={(content, metadata) => handleUpdateBlock(block.id, content, metadata)}
            onDelete={() => handleDeleteBlock(block.id)}
            onAddBlock={(type) => handleAddBlock(type, index + 1)}
            onConvert={(type) => handleConvertBlock(block.id, type)}
            onDuplicate={() => handleDuplicateBlock(block.id)}
            onMoveUp={() => handleMoveBlockUp(block.id)}
            onMoveDown={() => handleMoveBlockDown(block.id)}
            isFocused={focusedBlockId === block.id}
            onFocus={() => setFocusedBlockId(block.id)}
            totalBlocks={document.blocks.length}
          />
        ))}
      </div>

      {/* Add Block Button */}
      <button
        onClick={() => handleAddBlock("paragraph")}
        className="mt-6 flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors group"
      >
        <div className="w-6 h-6 rounded-full bg-[#F0F0EC] group-hover:bg-[#E8D5C4] flex items-center justify-center transition-colors">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-sm">Add block (type / for commands)</span>
      </button>

      {/* Empty state */}
      {document.blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-[#E5E5E0] rounded-xl">
          <p className="text-[#8A8A8A] mb-4">Start writing or add a block</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleAddBlock("heading1")}
              className="px-3 py-1.5 bg-[#F0F0EC] text-[#5A5A5A] text-sm rounded-lg hover:bg-[#E8D5C4] transition-colors"
            >
              Heading
            </button>
            <button
              onClick={() => handleAddBlock("paragraph")}
              className="px-3 py-1.5 bg-[#F0F0EC] text-[#5A5A5A] text-sm rounded-lg hover:bg-[#E8D5C4] transition-colors"
            >
              Paragraph
            </button>
            <button
              onClick={() => handleAddBlock("bullet")}
              className="px-3 py-1.5 bg-[#F0F0EC] text-[#5A5A5A] text-sm rounded-lg hover:bg-[#E8D5C4] transition-colors"
            >
              List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockEditor;
