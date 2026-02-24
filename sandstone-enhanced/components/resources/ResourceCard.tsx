"use client";

import React from "react";
import { motion } from "framer-motion";
import { Resource, ResourceType } from "@/types/resources";
import {
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  Link as LinkIcon,
  LayoutGrid,
  MoreVertical,
  Heart,
  Pin,
  Eye,
  Download,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Resource type icons mapping
const resourceTypeIcons: Record<ResourceType, React.ComponentType<{ className?: string }>> = {
  article: FileText,
  video: Video,
  audio: Headphones,
  pdf: FileText,
  document: FileText,
  link: LinkIcon,
  image: ImageIcon,
  interactive: LayoutGrid,
  quiz: FileText,
  flashcard: FileText,
};

// Resource type colors
const resourceTypeColors: Record<ResourceType, string> = {
  article: "bg-blue-100 text-blue-700",
  video: "bg-red-100 text-red-700",
  audio: "bg-purple-100 text-purple-700",
  pdf: "bg-orange-100 text-orange-700",
  document: "bg-gray-100 text-gray-700",
  link: "bg-green-100 text-green-700",
  image: "bg-pink-100 text-pink-700",
  interactive: "bg-cyan-100 text-cyan-700",
  quiz: "bg-yellow-100 text-yellow-700",
  flashcard: "bg-indigo-100 text-indigo-700",
};

// Category labels
const categoryLabels: Record<string, string> = {
  writing_tips: "Writing Tips",
  vocabulary: "Vocabulary",
  practice: "Practice",
  grammar: "Grammar",
  reading: "Reading",
  listening: "Listening",
  speaking: "Speaking",
  exam_prep: "Exam Prep",
  study_guides: "Study Guides",
  past_papers: "Past Papers",
  mark_schemes: "Mark Schemes",
  theory: "Theory",
  case_studies: "Case Studies",
  diagrams: "Diagrams",
  formulas: "Formulas",
  custom: "Custom",
};

// Difficulty labels
const difficultyLabels: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
};

interface ResourceCardProps {
  resource: Resource;
  viewMode?: "grid" | "list";
  isSelected?: boolean;
  showActions?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onTogglePin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMove?: () => void;
  onOpen?: () => void;
  className?: string;
}

export function ResourceCard({
  resource,
  viewMode = "grid",
  isSelected = false,
  showActions = true,
  onSelect,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onOpen,
  className,
}: ResourceCardProps) {
  const Icon = resourceTypeIcons[resource.type];
  const typeColor = resourceTypeColors[resource.type];

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpen) {
      onOpen();
    } else if (resource.url) {
      window.open(resource.url, "_blank");
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "group flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer",
          isSelected
            ? "border-[#E8D5C4] bg-[#FDF8F3]"
            : "border-[#E5E5E0] bg-white hover:border-[#D4C4B5] hover:shadow-sm",
          className
        )}
        onClick={handleClick}
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", typeColor)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[#2D2D2D] truncate">{resource.title}</h3>
            {resource.isPinned && <Pin className="w-3 h-3 text-[#E8D5C4] flex-shrink-0" />}
            {resource.isFavorite && <Heart className="w-3 h-3 text-red-400 fill-red-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8A8A8A]">
            <span className="capitalize">{resource.type}</span>
            <span>•</span>
            <span>{categoryLabels[resource.category] || resource.category}</span>
            <span>•</span>
            <span>{difficultyLabels[resource.difficulty] || resource.difficulty}</span>
          </div>
        </div>

        {resource.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {resource.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {resource.downloadCount}
          </span>
        </div>

        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
            >
              <Heart className={cn("w-4 h-4", resource.isFavorite && "fill-red-400 text-red-400")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpen}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">⎘</span>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">↗</span>
                  Move
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}>
                  <Pin className="w-4 h-4 mr-2" />
                  {resource.isPinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">🗑</span>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-white rounded-xl border transition-all cursor-pointer overflow-hidden",
        isSelected
          ? "border-[#E8D5C4] ring-2 ring-[#E8D5C4] ring-opacity-50"
          : "border-[#E5E5E0] hover:border-[#D4C4B5] hover:shadow-lg",
        className
      )}
      onClick={handleClick}
    >
      {/* Thumbnail or Icon */}
      <div className="aspect-video bg-gradient-to-br from-[#F5F0EB] to-[#E8E4DF] flex items-center justify-center relative">
        {resource.thumbnailUrl ? (
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", typeColor)}>
            <Icon className="w-8 h-8" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {resource.isPinned && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <Pin className="w-3 h-3" />
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="secondary" className={cn("capitalize", typeColor)}>
            {resource.type}
          </Badge>
        </div>

        {/* Hover actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}
            >
              <Heart className={cn("w-4 h-4 mr-1", resource.isFavorite && "fill-red-400 text-red-400")} />
              {resource.isFavorite ? "Favorited" : "Favorite"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleOpen}>
              <ExternalLink className="w-4 h-4 mr-1" />
              Open
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-[#2D2D2D] line-clamp-2 mb-1">{resource.title}</h3>
        {resource.description && (
          <p className="text-sm text-[#8A8A8A] line-clamp-2 mb-3">{resource.description}</p>
        )}

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[resource.category] || resource.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {difficultyLabels[resource.difficulty] || resource.difficulty}
            </Badge>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">⎘</span>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">↗</span>
                  Move
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}>
                  <Pin className="w-4 h-4 mr-2" />
                  {resource.isPinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete?.(); }}>
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-sm">🗑</span>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#E5E5E0] text-xs text-[#8A8A8A]">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {resource.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {resource.downloadCount}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {new Date(resource.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ResourceCard;
