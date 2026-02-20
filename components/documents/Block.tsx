"use client";

import { useState, useRef, useEffect } from "react";
import { DocumentBlock } from "@/types";
import { getBlockStyles, getPlaceholder, BlockType } from "@/lib/documents/blocks";
import { SlashCommand } from "./SlashCommand";

interface BlockProps {
  block: DocumentBlock;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

export function Block({ block, onUpdate, onDelete, onAddBlock, isFocused, onFocus }: BlockProps) {
  const [showSlashCommand, setShowSlashCommand] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== block.content) {
      contentRef.current.textContent = block.content;
    }
  }, [block.content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || "";
    onUpdate(content);

    // Check for slash command
    if (content === "/") {
      const rect = e.currentTarget.getBoundingClientRect();
      setSlashPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
      });
      setShowSlashCommand(true);
    } else if (showSlashCommand && !content.startsWith("/")) {
      setShowSlashCommand(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddBlock("paragraph");
    } else if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      onDelete();
    }
  };

  const handleSlashSelect = (type: BlockType) => {
    onAddBlock(type);
    setShowSlashCommand(false);
    if (contentRef.current) {
      contentRef.current.textContent = "";
      onUpdate("");
    }
  };

  if (block.type === "divider") {
    return <hr className={getBlockStyles("divider")} />;
  }

  const Tag = block.type.startsWith("heading")
    ? (block.type as keyof JSX.IntrinsicElements)
    : "div";

  return (
    <div ref={blockRef} className="relative group">
      <Tag
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        className={`${getBlockStyles(block.type)} outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#8A8A8A] empty:before:cursor-text`}
        data-placeholder={getPlaceholder(block.type)}
      />
      
      <SlashCommand
        isOpen={showSlashCommand}
        onClose={() => setShowSlashCommand(false)}
        onSelect={handleSlashSelect}
        position={slashPosition}
      />
    </div>
  );
}
