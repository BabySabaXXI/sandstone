"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Code,
  Image,
  Lightbulb,
  Table,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  GripVertical,
  Check,
} from "lucide-react";
import { BlockType, blockTypes } from "@/lib/documents/blocks";

// =============================================================================
// TYPES
// =============================================================================

interface BlockToolbarProps {
  onConvert: (type: BlockType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  currentType: BlockType;
}

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<BlockType, React.ElementType> = {
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  paragraph: Type,
  bullet: List,
  numbered: ListOrdered,
  checklist: CheckSquare,
  quote: Quote,
  divider: Minus,
  callout: Lightbulb,
  code: Code,
  image: Image,
  table: Table,
  equation: Type,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BlockToolbar({
  onConvert,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  currentType,
}: BlockToolbarProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Group block types by category
  const groupedTypes = blockTypes.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, typeof blockTypes>);

  const categoryLabels: Record<string, string> = {
    basic: "Basic",
    list: "Lists",
    media: "Media",
    advanced: "Advanced",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="absolute -top-8 left-0 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-[#E5E5E0] p-1 z-20"
    >
      {/* Block Type Selector */}
      <div className="relative" ref={typeMenuRef}>
        <button
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-1 px-2 py-1 hover:bg-[#F0F0EC] rounded transition-colors"
          title="Change block type"
        >
          {(() => {
            const Icon = iconMap[currentType] || Type;
            return <Icon className="w-4 h-4 text-[#5A5A5A]" />;
          })()}
          <span className="text-xs text-[#5A5A5A]">
            {blockTypes.find((b) => b.type === currentType)?.label || "Text"}
          </span>
        </button>

        <AnimatePresence>
          {showTypeMenu && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E0] py-2 z-30 max-h-80 overflow-y-auto"
            >
              {Object.entries(groupedTypes).map(([category, types]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-xs text-[#8A8A8A] uppercase tracking-wider">
                    {categoryLabels[category] || category}
                  </div>
                  {types.map((block) => {
                    const Icon = iconMap[block.type];
                    const isActive = block.type === currentType;
                    return (
                      <button
                        key={block.type}
                        onClick={() => {
                          onConvert(block.type);
                          setShowTypeMenu(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-[#F0F0EC] transition-colors ${
                          isActive ? "bg-[#F0F0EC]" : ""
                        }`}
                      >
                        <div className="w-6 h-6 rounded bg-[#FAFAF8] flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-[#5A5A5A]" />
                        </div>
                        <span className="text-sm text-[#2D2D2D] flex-1 text-left">
                          {block.label}
                        </span>
                        {isActive && <Check className="w-4 h-4 text-[#A8C5D4]" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-4 bg-[#E5E5E0]" />

      {/* Move buttons */}
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="p-1.5 hover:bg-[#F0F0EC] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <ArrowUp className="w-4 h-4 text-[#5A5A5A]" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="p-1.5 hover:bg-[#F0F0EC] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <ArrowDown className="w-4 h-4 text-[#5A5A5A]" />
      </button>

      <div className="w-px h-4 bg-[#E5E5E0]" />

      {/* More actions */}
      <div className="relative" ref={moreMenuRef}>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 hover:bg-[#F0F0EC] rounded transition-colors"
          title="More actions"
        >
          <MoreHorizontal className="w-4 h-4 text-[#5A5A5A]" />
        </button>

        <AnimatePresence>
          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-[#E5E5E0] py-1 z-30"
            >
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#F0F0EC] transition-colors"
              >
                <Copy className="w-4 h-4 text-[#5A5A5A]" />
                <span className="text-sm text-[#2D2D2D]">Duplicate</span>
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMoreMenu(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#F0F0EC] transition-colors text-[#D4A8A8]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default BlockToolbar;
