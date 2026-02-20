"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blockTypes, BlockType } from "@/lib/documents/blocks";
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus } from "lucide-react";

interface SlashCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: BlockType) => void;
  position: { top: number; left: number };
}

const iconMap = {
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  paragraph: Type,
  bullet: List,
  numbered: ListOrdered,
  quote: Quote,
  divider: Minus,
};

export function SlashCommand({ isOpen, onClose, onSelect, position }: SlashCommandProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % blockTypes.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + blockTypes.length) % blockTypes.length);
          break;
        case "Enter":
          e.preventDefault();
          onSelect(blockTypes[selectedIndex].type);
          onClose();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen]);

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
            top: position.top,
            left: position.left,
            zIndex: 50,
          }}
          className="w-64 bg-white rounded-xl shadow-lg border border-[#E5E5E0] py-2"
        >
          <div className="px-3 py-2 text-xs text-[#8A8A8A] uppercase tracking-wider">
            Basic Blocks
          </div>
          {blockTypes.map((block, index) => {
            const Icon = iconMap[block.type];
            return (
              <button
                key={block.type}
                onClick={() => {
                  onSelect(block.type);
                  onClose();
                }}
                className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-[#F0F0EC] transition-colors ${
                  index === selectedIndex ? "bg-[#F0F0EC]" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#FAFAF8] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#5A5A5A]" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-[#2D2D2D]">{block.label}</div>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
