"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DocumentBlock } from "@/types";
import {
  getBlockStyles,
  getPlaceholder,
  BlockType,
} from "@/lib/documents/blocks";
import { SlashCommand } from "./SlashCommand";
import { BlockToolbar } from "./BlockToolbar";
import { CheckSquare, Square } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface BlockProps {
  block: DocumentBlock;
  index: number;
  onUpdate: (content: string, metadata?: Record<string, unknown>) => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  onConvert: (type: BlockType) => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFocused?: boolean;
  onFocus?: () => void;
  totalBlocks?: number;
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
  index,
  onUpdate,
  onDelete,
  onAddBlock,
  onConvert,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFocused,
  onFocus,
  totalBlocks = 1,
}: BlockProps) {
  const [showSlashCommand, setShowSlashCommand] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [isChecked, setIsChecked] = useState(block.metadata?.checked || false);

  const contentRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  // Sync content from props to DOM
  useEffect(() => {
    const contentEl = contentRef.current;
    if (contentEl && contentEl.textContent !== block.content) {
      contentEl.textContent = block.content;
    }
  }, [block.content]);

  // Update checked state when metadata changes
  useEffect(() => {
    setIsChecked(block.metadata?.checked || false);
  }, [block.metadata?.checked]);

  // Close slash command when focus is lost
  useEffect(() => {
    if (!isFocused) {
      setShowSlashCommand(false);
      setShowToolbar(false);
    }
  }, [isFocused]);

  // Show toolbar on hover when focused
  useEffect(() => {
    setShowToolbar(isFocused || false);
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

      // Tab for indentation in lists
      if (e.key === "Tab") {
        if (block.type === "bullet" || block.type === "numbered" || block.type === "checklist") {
          e.preventDefault();
          // Could add indentation logic here
        }
      }
    },
    [block.content, block.type, onAddBlock, onDelete, showSlashCommand]
  );

  // Memoized slash select handler
  const handleSlashSelect = useCallback(
    (type: BlockType) => {
      onConvert(type);
      setShowSlashCommand(false);

      const contentEl = contentRef.current;
      if (contentEl) {
        contentEl.textContent = "";
        onUpdate("");
      }
    },
    [onConvert, onUpdate]
  );

  // Handle checklist toggle
  const handleCheckToggle = useCallback(() => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onUpdate(block.content, { ...block.metadata, checked: newChecked });
  }, [isChecked, block.content, block.metadata, onUpdate]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Render divider block
  if (block.type === "divider") {
    return (
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative group py-2"
      >
        <hr className={getBlockStyles("divider")} />
        {isFocused && (
          <BlockToolbar
            onConvert={onConvert}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < totalBlocks - 1}
            currentType={block.type}
          />
        )}
      </motion.div>
    );
  }

  // Render image block
  if (block.type === "image") {
    return (
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group my-4"
      >
        {block.metadata?.src ? (
          <figure className="my-4">
            <img
              src={block.metadata.src as string}
              alt={(block.metadata.alt as string) || ""}
              className="max-w-full rounded-lg"
            />
            {block.metadata.caption && (
              <figcaption className="text-center text-sm text-[#8A8A8A] mt-2">
                {block.metadata.caption as string}
              </figcaption>
            )}
          </figure>
        ) : (
          <div className="border-2 border-dashed border-[#E5E5E0] rounded-lg p-8 text-center">
            <p className="text-[#8A8A8A]">Image URL or upload coming soon</p>
          </div>
        )}
        {isFocused && (
          <BlockToolbar
            onConvert={onConvert}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < totalBlocks - 1}
            currentType={block.type}
          />
        )}
      </motion.div>
    );
  }

  // Render code block
  if (block.type === "code") {
    return (
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group my-4"
      >
        <div className="bg-[#2D2D2D] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-[#3A3A3A]">
            <select
              value={(block.metadata?.language as string) || "plaintext"}
              onChange={(e) => onUpdate(block.content, { ...block.metadata, language: e.target.value })}
              className="bg-transparent text-xs text-[#8A8A8A] outline-none cursor-pointer"
            >
              <option value="plaintext">Plain Text</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={onFocus}
              onPaste={handlePaste}
              className={`${getBlockStyles("code")} outline-none`}
              data-placeholder={getPlaceholder("code")}
              style={{ minHeight: "3rem" }}
            />
          </pre>
        </div>
        {isFocused && (
          <BlockToolbar
            onConvert={onConvert}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < totalBlocks - 1}
            currentType={block.type}
          />
        )}
      </motion.div>
    );
  }

  // Render callout block
  if (block.type === "callout") {
    const colors: Record<string, string> = {
      blue: "bg-blue-50 border-blue-200",
      green: "bg-green-50 border-green-200",
      yellow: "bg-yellow-50 border-yellow-200",
      red: "bg-red-50 border-red-200",
      purple: "bg-purple-50 border-purple-200",
    };
    const colorClass = colors[(block.metadata?.color as string) || "blue"] || colors.blue;

    return (
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group my-4"
      >
        <div className={`${colorClass} border rounded-lg p-4 flex gap-3`}>
          <span className="text-xl">{(block.metadata?.icon as string) || "💡"}</span>
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onPaste={handlePaste}
            className={`${getBlockStyles("callout")} flex-1 outline-none`}
            data-placeholder={getPlaceholder("callout")}
          />
        </div>
        {isFocused && (
          <BlockToolbar
            onConvert={onConvert}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < totalBlocks - 1}
            currentType={block.type}
          />
        )}
      </motion.div>
    );
  }

  const headingClass = getHeadingClass(block.type);
  const placeholder = getPlaceholder(block.type);

  // Render checklist block
  if (block.type === "checklist") {
    return (
      <motion.div
        ref={blockRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group flex items-start gap-2 py-1"
      >
        <button
          onClick={handleCheckToggle}
          className="mt-1 p-0.5 hover:bg-[#F0F0EC] rounded transition-colors"
        >
          {isChecked ? (
            <CheckSquare className="w-5 h-5 text-[#A8C5D4]" />
          ) : (
            <Square className="w-5 h-5 text-[#8A8A8A]" />
          )}
        </button>
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onPaste={handlePaste}
          className={`${getBlockStyles("checklist")} flex-1 ${isChecked ? "line-through text-[#8A8A8A]" : ""}`}
          data-placeholder={placeholder}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
        />
        {isFocused && (
          <BlockToolbar
            onConvert={onConvert}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            canMoveUp={index > 0}
            canMoveDown={index < totalBlocks - 1}
            currentType={block.type}
          />
        )}
        <SlashCommand
          isOpen={showSlashCommand}
          onClose={() => setShowSlashCommand(false)}
          onSelect={handleSlashSelect}
          position={slashPosition}
        />
      </motion.div>
    );
  }

  // Default block render
  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      {/* Drag handle */}
      <div className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <svg className="w-4 h-4 text-[#8A8A8A]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>

      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onPaste={handlePaste}
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
          rounded
          px-1
          -mx-1
        `}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
      />

      {/* Block toolbar */}
      {isFocused && (
        <BlockToolbar
          onConvert={onConvert}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          canMoveUp={index > 0}
          canMoveDown={index < totalBlocks - 1}
          currentType={block.type}
        />
      )}

      <SlashCommand
        isOpen={showSlashCommand}
        onClose={() => setShowSlashCommand(false)}
        onSelect={handleSlashSelect}
        position={slashPosition}
      />
    </motion.div>
  );
});

export default Block;
