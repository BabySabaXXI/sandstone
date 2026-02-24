"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useResourceStore } from "@/stores/resource-store";
import { ResourceSearchResult } from "@/types/resources";

interface ResourceSearchProps {
  onSearch?: (results: ResourceSearchResult[]) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  showClearButton?: boolean;
}

export function ResourceSearch({
  onSearch,
  onQueryChange,
  placeholder = "Search resources...",
  className,
  autoFocus = false,
  debounceMs = 300,
  showClearButton = true,
}: ResourceSearchProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchResources = useResourceStore((state) => state.searchResources);

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        onSearch?.([]);
        return;
      }

      setIsSearching(true);
      const results = searchResources(searchQuery);
      onSearch?.(results);
      setIsSearching(false);
    },
    [onSearch, searchResources]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, performSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const handleClear = () => {
    setQuery("");
    onQueryChange?.("");
    onSearch?.([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        autoFocus={autoFocus}
        className={cn(
          "pl-10 pr-10",
          isSearching && "pr-16"
        )}
      />
      {isSearching && (
        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] animate-spin" />
      )}
      {showClearButton && query && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#F5F0EB] transition-colors"
          onClick={handleClear}
        >
          <X className="w-4 h-4 text-[#8A8A8A]" />
        </button>
      )}
    </form>
  );
}

export default ResourceSearch;
