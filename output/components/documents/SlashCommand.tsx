"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blockTypes, BlockType, blockCategories } from "@/lib/documents/blocks";
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
  FunctionSquare,
  Search,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface SlashCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
  position: { top: number; left: number };
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
  equation: FunctionSquare,
};

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

const keyboardShortcuts: Record<string, BlockType> = {
  "1": "heading1",
  "2": "heading2",
  "3": "heading3",
  "p": "paragraph",
  "b": "bullet",
  "n": "numbered",
  "c": "checklist",
  "q": "quote",
  "d": "divider",
  "l": "callout",
  "x": "code",
  "i": "image",
  "t": "table",
  "e": "equation",
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SlashCommand({ isOpen, onClose, onSelect, position }: SlashCommandProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter blocks based on search query
  const filteredBlocks = searchQuery
    ? blockTypes.filter(
        (block) =>
          block.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          block.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blockTypes;

  // Group filtered blocks by category
  const groupedBlocks = filteredBlocks.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<string, typeof blockTypes>);

  // Get flat list for keyboard navigation
  const flatBlocks = filteredBlocks;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatBlocks.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatBlocks.length) % flatBlocks.length);
          break;
        case "Enter":
          e.preventDefault();
          if (flatBlocks[selectedIndex]) {
            onSelect(flatBlocks[selectedIndex].type);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
        case "Tab":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatBlocks.length);
          break;
      }

      // Handle keyboard shortcuts (number keys)
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        if (flatBlocks[index]) {
          onSelect(flatBlocks[index].type);
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, flatBlocks, onSelect, onClose]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchQuery("");
      // Focus search input after a short delay
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const selectedElement = menuRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, isOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(0);
  }, []);

  // Calculate position to keep menu in viewport
  const calculatePosition = () => {
    const menuHeight = 400;
    const menuWidth = 280;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let top = position.top;
    let left = position.left;

    // Adjust if menu would go below viewport
    if (top + menuHeight > viewportHeight + window.scrollY) {
      top = position.top - menuHeight - 10;
    }

    // Adjust if menu would go beyond right edge
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 20;
    }

    return { top, left };
  };

  const adjustedPosition = calculatePosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "absolute",
            top: adjustedPosition.top,
            left: adjustedPosition.left,
            zIndex: 50,
          }}
          className="w-72 bg-white rounded-xl shadow-xl border border-[#E5E5E0] overflow-hidden"
        >
          {/* Search input */}
          <div className="border-b border-[#E5E5E0] p-2">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#FAFAF8] rounded-lg">
              <Search className="w-4 h-4 text-[#8A8A8A]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Filter blocks..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#8A8A8A]"
              />
            </div>
          </div>

          {/* Block list */}
          <div className="max-h-80 overflow-y-auto py-2">
            {flatBlocks.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#8A8A8A]">
                <p className="text-sm">No blocks found</p>
              </div>
            ) : (
              Object.entries(groupedBlocks).map(([category, blocks]) => (
                <div key={category}>
                  <div className="px-3 py-1.5 text-xs text-[#8A8A8A] uppercase tracking-wider sticky top-0 bg-white">
                    {blockCategories[category as keyof typeof blockCategories] || category}
                  </div>
                  {blocks.map((block, index) => {
                    const Icon = iconMap[block.type];
                    const globalIndex = flatBlocks.findIndex((b) => b.type === block.type);
                    const isSelected = globalIndex === selectedIndex;
                    const shortcutKey = Object.entries(keyboardShortcuts).find(
                      ([_, type]) => type === block.type
                    )?.[0];

                    return (
                      <button
                        key={block.type}
                        data-index={globalIndex}
                        onClick={() => {
                          onSelect(block.type);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={`w-full px-3 py-2 flex items-center gap-3 transition-colors ${
                          isSelected ? "bg-[#F0F0EC]" : "hover:bg-[#FAFAF8]"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] border border-[#E5E5E0] flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#5A5A5A]" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm text-[#2D2D2D]">{block.label}</div>
                        </div>
                        {shortcutKey && (
                          <kbd className="px-1.5 py-0.5 text-xs bg-[#F0F0EC] rounded text-[#8A8A8A]">
                            {shortcutKey}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E5E5E0] px-3 py-2 bg-[#FAFAF8]">
            <div className="flex items-center justify-between text-xs text-[#8A8A8A]">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SlashCommand;
