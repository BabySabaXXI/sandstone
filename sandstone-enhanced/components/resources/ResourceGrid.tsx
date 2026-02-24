"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Resource } from "@/types/resources";
import { ResourceCard } from "./ResourceCard";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResourceGridProps {
  resources: Resource[];
  viewMode?: "grid" | "list";
  selectedIds?: string[];
  showActions?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  onSelect?: (resource: Resource) => void;
  onToggleFavorite?: (resource: Resource) => void;
  onTogglePin?: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onDuplicate?: (resource: Resource) => void;
  onMove?: (resource: Resource) => void;
  onOpen?: (resource: Resource) => void;
  className?: string;
}

export function ResourceGrid({
  resources,
  viewMode = "grid",
  selectedIds = [],
  showActions = true,
  emptyState,
  onSelect,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onOpen,
  className,
}: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-[#8A8A8A]" />
        </div>
        <h3 className="text-lg font-medium text-[#2D2D2D] mb-1">
          {emptyState?.title || "No resources found"}
        </h3>
        <p className="text-sm text-[#8A8A8A] mb-4">
          {emptyState?.description || "Get started by adding your first resource"}
        </p>
        {emptyState?.action && (
          <Button onClick={emptyState.action.onClick}>
            {emptyState.action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      layout
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2",
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            viewMode={viewMode}
            isSelected={selectedIds.includes(resource.id)}
            showActions={showActions}
            onSelect={() => onSelect?.(resource)}
            onToggleFavorite={() => onToggleFavorite?.(resource)}
            onTogglePin={() => onTogglePin?.(resource)}
            onEdit={() => onEdit?.(resource)}
            onDelete={() => onDelete?.(resource)}
            onDuplicate={() => onDuplicate?.(resource)}
            onMove={() => onMove?.(resource)}
            onOpen={() => onOpen?.(resource)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default ResourceGrid;
