"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Tag } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  maxTags?: number;
  suggestions?: string[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TagInput({
  tags,
  onAddTag,
  onRemoveTag,
  maxTags = 10,
  suggestions = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  }, []);

  // Handle add tag
  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase();
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
        onAddTag(trimmedTag);
        setInputValue("");
        setShowSuggestions(false);
        inputRef.current?.focus();
      }
    },
    [tags, maxTags, onAddTag]
  );

  // Handle key down
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag(inputValue);
      } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        onRemoveTag(tags[tags.length - 1]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [inputValue, tags, handleAddTag, onRemoveTag]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      handleAddTag(suggestion);
    },
    [handleAddTag]
  );

  // Common tag suggestions for documents
  const commonSuggestions = [
    "essay",
    "draft",
    "notes",
    "research",
    "important",
    "review",
    "final",
    "practice",
    "exam",
    "homework",
  ];

  const availableSuggestions = suggestions.length > 0 ? filteredSuggestions : commonSuggestions.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="relative">
      {/* Tag input container */}
      <div
        className="flex flex-wrap items-center gap-2 p-2 bg-[#FAFAF8] border border-[#E5E5E0] rounded-lg focus-within:ring-2 focus-within:ring-[#E8D5C4]/50 focus-within:border-[#E8D5C4] transition-all"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing tags */}
        <AnimatePresence mode="popLayout">
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#E8D5C4] text-[#2D2D2D] text-sm rounded-full"
            >
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(tag);
                }}
                className="ml-1 p-0.5 hover:bg-[#D4C4B0] rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Input field */}
        {tags.length < maxTags && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(inputValue.length > 0 || availableSuggestions.length > 0)}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-[#8A8A8A]"
          />
        )}

        {/* Add button */}
        {inputValue && (
          <button
            onClick={() => handleAddTag(inputValue)}
            className="p-1 hover:bg-[#E8D5C4] rounded transition-colors"
          >
            <Plus className="w-4 h-4 text-[#5A5A5A]" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && availableSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-[#E5E5E0] py-2 z-20 max-h-48 overflow-y-auto"
          >
            <div className="px-3 py-1 text-xs text-[#8A8A8A] uppercase tracking-wider">
              Suggestions
            </div>
            {availableSuggestions.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-[#5A5A5A] hover:bg-[#F0F0EC] transition-colors flex items-center gap-2"
              >
                <Tag className="w-3.5 h-3.5" />
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag count */}
      <div className="mt-1 text-xs text-[#8A8A8A]">
        {tags.length} / {maxTags} tags
      </div>
    </div>
  );
}

export default TagInput;
