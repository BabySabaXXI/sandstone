"use client";

import React from "react";
import { ResourceType, ResourceCategory, ResourceDifficulty, ResourceFilter } from "@/types/resources";
import { Subject } from "@/types";
import { Filter, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Resource type options
const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
  { value: "image", label: "Image" },
  { value: "interactive", label: "Interactive" },
  { value: "quiz", label: "Quiz" },
  { value: "flashcard", label: "Flashcard" },
];

// Category options
const resourceCategories: { value: ResourceCategory; label: string }[] = [
  { value: "writing_tips", label: "Writing Tips" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "practice", label: "Practice" },
  { value: "grammar", label: "Grammar" },
  { value: "reading", label: "Reading" },
  { value: "listening", label: "Listening" },
  { value: "speaking", label: "Speaking" },
  { value: "exam_prep", label: "Exam Prep" },
  { value: "study_guides", label: "Study Guides" },
  { value: "past_papers", label: "Past Papers" },
  { value: "mark_schemes", label: "Mark Schemes" },
  { value: "theory", label: "Theory" },
  { value: "case_studies", label: "Case Studies" },
  { value: "diagrams", label: "Diagrams" },
  { value: "formulas", label: "Formulas" },
  { value: "custom", label: "Custom" },
];

// Difficulty options
const resourceDifficulties: { value: ResourceDifficulty; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all_levels", label: "All Levels" },
];

// Subject options
const subjects: { value: Subject; label: string }[] = [
  { value: "economics", label: "Economics" },
  { value: "geography", label: "Geography" },
];

// Sort options
const sortOptions: { value: ResourceFilter["sortBy"]; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A-Z)" },
  { value: "popular", label: "Most popular" },
  { value: "recently_viewed", label: "Recently viewed" },
];

interface ResourceFiltersProps {
  filter: ResourceFilter;
  onFilterChange: (filter: ResourceFilter) => void;
  onClearFilters: () => void;
  className?: string;
}

export function ResourceFilters({
  filter,
  onFilterChange,
  onClearFilters,
  className,
}: ResourceFiltersProps) {
  const activeFilterCount =
    (filter.types?.length || 0) +
    (filter.categories?.length || 0) +
    (filter.difficulties?.length || 0) +
    (filter.subjects?.length || 0);

  const hasActiveFilters = activeFilterCount > 0 || filter.sortBy !== "newest";

  const updateFilter = (updates: Partial<ResourceFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof ResourceFilter,
    value: T,
    currentValues: T[] = []
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter({ [key]: newValues.length > 0 ? newValues : undefined } as Partial<ResourceFilter>);
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(filter.types?.length && "border-[#E8D5C4]")}
          >
            <Filter className="w-4 h-4 mr-1" />
            Type
            {filter.types?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filter.types.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Resource Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {resourceTypes.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filter.types?.includes(value)}
              onCheckedChange={() =>
                toggleArrayFilter("types", value, filter.types)
              }
            >
              <span className="capitalize">{label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(filter.categories?.length && "border-[#E8D5C4]")}
          >
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            Category
            {filter.categories?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filter.categories.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
          <DropdownMenuLabel>Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {resourceCategories.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filter.categories?.includes(value)}
              onCheckedChange={() =>
                toggleArrayFilter("categories", value, filter.categories)
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Difficulty Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(filter.difficulties?.length && "border-[#E8D5C4]")}
          >
            <span className="mr-1">Level</span>
            {filter.difficulties?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filter.difficulties.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Difficulty</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {resourceDifficulties.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filter.difficulties?.includes(value)}
              onCheckedChange={() =>
                toggleArrayFilter("difficulties", value, filter.difficulties)
              }
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ArrowUpDown className="w-4 h-4 mr-1" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map(({ value, label }) => (
            <DropdownMenuCheckboxItem
              key={value}
              checked={filter.sortBy === value}
              onCheckedChange={() => updateFilter({ sortBy: value })}
            >
              {label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}

export default ResourceFilters;
