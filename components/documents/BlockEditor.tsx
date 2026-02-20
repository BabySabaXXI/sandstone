"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDocumentStore } from "@/stores/document-store";
import { Block } from "./Block";
import { BlockType } from "@/lib/documents/blocks";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";

interface BlockEditorProps {
  documentId: string;
}

export function BlockEditor({ documentId }: BlockEditorProps) {
  const {
    getDocument,
    updateDocument,
    updateBlock,
    addBlock,
    deleteBlock,
    deleteDocument,
  } = useDocumentStore();

  const document = getDocument(documentId);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [title, setTitle] = useState(document?.title || "Untitled");

  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document?.title]);

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

  if (!document) {
    return (
      <div className="text-center py-12 text-[#8A8A8A]">
        <p>Document not found</p>
      </div>
    );
  }

  const handleAddBlock = (type: BlockType, index?: number) => {
    addBlock(documentId, type, index);
  };

  const handleUpdateBlock = (blockId: string, content: string) => {
    updateBlock(documentId, blockId, content);
  };

  const handleDeleteBlock = (blockId: string) => {
    deleteBlock(documentId, blockId);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-3xl font-bold text-[#2D2D2D] bg-transparent outline-none placeholder:text-[#8A8A8A] w-full"
          placeholder="Untitled Document"
        />
        <button
          onClick={() => deleteDocument(documentId)}
          className="text-[#8A8A8A] hover:text-[#D4A8A8] transition-colors p-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Last edited */}
      <div className="text-xs text-[#8A8A8A] mb-8">
        Last edited {new Date(document.updatedAt).toLocaleString()}
      </div>

      {/* Blocks */}
      <div className="space-y-1">
        {document.blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Block
              block={block}
              onUpdate={(content) => handleUpdateBlock(block.id, content)}
              onDelete={() => handleDeleteBlock(block.id)}
              onAddBlock={(type) => handleAddBlock(type, index + 1)}
              isFocused={focusedBlockId === block.id}
              onFocus={() => setFocusedBlockId(block.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Add Block Button */}
      <button
        onClick={() => handleAddBlock("paragraph")}
        className="mt-4 flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Add block (type / for commands)</span>
      </button>
    </div>
  );
}
