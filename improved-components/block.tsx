"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { DocumentBlock } from "@/types";
import {
  getBlockStyles,
  getPlaceholder,
  BlockType,
} from "@/lib/documents/blocks";
import { SlashCommand } from "./SlashCommand";

// =============================================================================
// TYPES
// =============================================================================

interface BlockProps {
  block: DocumentBlock;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const HEADING_STYLES: Record<string, string> = {
  heading1: "text-3xl font-bold",
  heading2: "text-2xl font-semibold",
  heading3: "text-xl font-semibold",
};

const SLASH_COMMAND_TRIGGER = "/";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getHeadingClass(type: string): string {
  return HEADING_STYLES[type] ?? "";
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Block = memo(function Block({
  block,
  onUpdate,
  onDelete,
  onAddBlock,
  isFocused,
  onFocus,
}: BlockProps) {
  const [showSlashCommand, setShowSlashCommand] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  // Sync content from props to DOM (only when content changes externally)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (contentEl && contentEl.textContent !== block.content) {
      contentEl.textContent = block.content;
    }
  }, [block.content]);

  // Close slash command when focus is lost
  useEffect(() => {
    if (!isFocused) {
      setShowSlashCommand(false);
    }
  }, [isFocused]);

  // Memoized input handler
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const content = e.currentTarget.textContent || "";
      onUpdate(content);

      // Check for slash command
      if (content === SLASH_COMMAND_TRIGGER) {
        const rect = e.currentTarget.getBoundingClientRect();
        setSlashPosition({
          top: rect.bottom + window.scrollY + 5,
          left: rect.left + window.scrollX,
        });
        setShowSlashCommand(true);
      } else if (showSlashCommand && !content.startsWith(SLASH_COMMAND_TRIGGER)) {
        setShowSlashCommand(false);
      }
    },
    [onUpdate, showSlashCommand]
  );

  // Memoized keydown handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter without shift creates new block
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onAddBlock("paragraph");
        return;
      }

      // Backspace on empty block deletes it
      if (e.key === "Backspace" && block.content === "") {
        e.preventDefault();
        onDelete();
        return;
      }

      // Escape closes slash command
      if (e.key === "Escape" && showSlashCommand) {
        setShowSlashCommand(false);
        return;
      }
    },
    [block.content, onAddBlock, onDelete, showSlashCommand]
  );

  // Memoized slash select handler
  const handleSlashSelect = useCallback(
    (type: BlockType) => {
      onAddBlock(type);
      setShowSlashCommand(false);

      const contentEl = contentRef.current;
      if (contentEl) {
        contentEl.textContent = "";
        onUpdate("");
      }
    },
    [onAddBlock, onUpdate]
  );

  // Render divider block
  if (block.type === "divider") {
    return <hr className={getBlockStyles("divider")} />;
  }

  const headingClass = getHeadingClass(block.type);
  const placeholder = getPlaceholder(block.type);

  return (
    <div ref={blockRef} className="relative group">
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className={`
          ${getBlockStyles(block.type)} 
          ${headingClass} 
          outline-none 
          empty:before:content-[attr(data-placeholder)] 
          empty:before:text-[#8A8A8A] 
          empty:before:cursor-text
          focus:ring-2 
          focus:ring-[#E8D5C4]/50 
          focus:rounded
          transition-all
          duration-150
        `}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
      />

      <SlashCommand
        isOpen={showSlashCommand}
        onClose={() => setShowSlashCommand(false)}
        onSelect={handleSlashSelect}
        position={slashPosition}
      />
    </div>
  );
});

export default Block;
