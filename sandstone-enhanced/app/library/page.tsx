"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { useResourceStore } from "@/stores/resource-store";
import { Resource, ResourceType, ResourceCategory, ResourceDifficulty, ResourceFolder } from "@/types/resources";
import { Subject } from "@/types";
import {
  BookOpen,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Folder as FolderIcon,
  MoreVertical,
  Heart,
  Pin,
  ExternalLink,
  FileText,
  Video,
  Headphones,
  Image as ImageIcon,
  Link as LinkIcon,
  FileAudio,
  FileVideo,
  FileImage,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
  Copy,
  Move,
  Download,
  Star,
  Clock,
  Eye,
  X,
  Check,
  LayoutGrid,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

// Resource category labels
const categoryLabels: Record<ResourceCategory, string> = {
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
const difficultyLabels: Record<ResourceDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all_levels: "All Levels",
};

// Subject labels
const subjectLabels: Record<Subject, string> = {
  economics: "Economics",
  geography: "Geography",
};

interface ResourceCardProps {
  resource: Resource;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: () => void;
}

function ResourceCard({
  resource,
  viewMode,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}: ResourceCardProps) {
  const Icon = resourceTypeIcons[resource.type];
  const typeColor = resourceTypeColors[resource.type];

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
            : "border-[#E5E5E0] bg-white hover:border-[#D4C4B5] hover:shadow-sm"
        )}
        onClick={onSelect}
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeColor)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[#2D2D2D] truncate">{resource.title}</h3>
            {resource.isPinned && <Pin className="w-3 h-3 text-[#E8D5C4]" />}
            {resource.isFavorite && <Heart className="w-3 h-3 text-red-400 fill-red-400" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8A8A8A]">
            <span className="capitalize">{resource.type}</span>
            <span>•</span>
            <span>{categoryLabels[resource.category]}</span>
            <span>•</span>
            <span>{difficultyLabels[resource.difficulty]}</span>
          </div>
        </div>

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

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("w-4 h-4", resource.isFavorite && "fill-red-400 text-red-400")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(); }}>
                <Move className="w-4 h-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                <Pin className="w-4 h-4 mr-2" />
                {resource.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  }

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
          : "border-[#E5E5E0] hover:border-[#D4C4B5] hover:shadow-lg"
      )}
      onClick={onSelect}
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
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("w-4 h-4 mr-1", resource.isFavorite && "fill-red-400 text-red-400")} />
            {resource.isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-[#2D2D2D] line-clamp-2 mb-1">{resource.title}</h3>
        {resource.description && (
          <p className="text-sm text-[#8A8A8A] line-clamp-2 mb-3">{resource.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {categoryLabels[resource.category]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {difficultyLabels[resource.difficulty]}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(); }}>
                <Move className="w-4 h-4 mr-2" />
                Move
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTogglePin(); }}>
                <Pin className="w-4 h-4 mr-2" />
                {resource.isPinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

// Folder Tree Component
interface FolderTreeProps {
  folders: ResourceFolder[];
  currentFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: () => void;
}

function FolderTree({ folders, currentFolderId, onSelectFolder, onCreateFolder }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderFolder = (folder: ResourceFolder, depth = 0) => {
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = currentFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
            isSelected
              ? "bg-[#E8D5C4] text-[#2D2D2D]"
              : "text-[#5A5A5A] hover:bg-[#F5F0EB]"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          {childFolders.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 rounded hover:bg-black/5"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {!childFolders.length && <span className="w-4" />}
          <FolderIcon className="w-4 h-4" style={{ color: folder.color }} />
          <span className="flex-1 text-left truncate">{folder.name}</span>
          <span className="text-xs text-[#8A8A8A]">{folder.resourceCount}</span>
        </button>
        {isExpanded && childFolders.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  };

  const rootFolders = folders.filter(f => !f.parentId);

  return (
    <div className="space-y-1">
      <button
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
          currentFolderId === null
            ? "bg-[#E8D5C4] text-[#2D2D2D]"
            : "text-[#5A5A5A] hover:bg-[#F5F0EB]"
        )}
        onClick={() => onSelectFolder(null)}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="flex-1 text-left">All Resources</span>
      </button>

      <Separator className="my-2" />

      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-medium text-[#8A8A8A] uppercase">Folders</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateFolder}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {rootFolders.map(folder => renderFolder(folder))}
    </div>
  );
}

// Main Library Page
export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ResourceType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ResourceCategory[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<ResourceDifficulty[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "popular">("newest");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [movingResourceId, setMovingResourceId] = useState<string | null>(null);

  const {
    resources,
    folders,
    currentFolderId,
    selectedResourceIds,
    loading,
    getFilteredResources,
    getResourcesInFolder,
    getFavoriteResources,
    getPinnedResources,
    getRecentResources,
    getFolderPath,
    getResourceStats,
    setFilter,
    clearFilter,
    createResource,
    updateResource,
    deleteResource,
    deleteMultipleResources,
    duplicateResource,
    moveResource,
    moveMultipleResources,
    toggleFavorite,
    togglePin,
    toggleResourceSelection,
    clearResourceSelection,
    selectAllResources,
    setCurrentFolder,
    createFolder,
    syncWithSupabase,
  } = useResourceStore();

  // Sync on mount
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Apply filters
  useEffect(() => {
    setFilter({
      searchQuery,
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
      folderId: currentFolderId || undefined,
      sortBy,
    });
  }, [searchQuery, selectedTypes, selectedCategories, selectedDifficulties, sortBy, currentFolderId, setFilter]);

  // Get filtered resources
  const filteredResources = getFilteredResources();

  // Get folder path for breadcrumbs
  const folderPath = currentFolderId ? getFolderPath(currentFolderId) : [];

  // Get stats
  const stats = getResourceStats();

  // Quick access resources
  const favorites = getFavoriteResources();
  const pinned = getPinnedResources();
  const recent = getRecentResources(5);

  // Handlers
  const handleCreateResource = async (data: Partial<Resource>) => {
    await createResource({
      ...data,
      folderId: currentFolderId || undefined,
    });
    setShowAddDialog(false);
  };

  const handleUpdateResource = async (data: Partial<Resource>) => {
    if (editingResource) {
      await updateResource(editingResource.id, data);
      setShowEditDialog(false);
      setEditingResource(null);
    }
  };

  const handleDeleteResource = async () => {
    if (editingResource) {
      await deleteResource(editingResource.id);
      setShowDeleteDialog(false);
      setEditingResource(null);
    }
  };

  const handleDeleteSelected = async () => {
    await deleteMultipleResources(selectedResourceIds);
    setShowDeleteDialog(false);
  };

  const handleDuplicateResource = async (resource: Resource) => {
    await duplicateResource(resource.id);
  };

  const handleMoveResource = async (folderId: string | null) => {
    if (movingResourceId) {
      await moveResource(movingResourceId, folderId || undefined);
      setShowMoveDialog(false);
      setMovingResourceId(null);
    }
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder({
      name,
      parentId: currentFolderId || undefined,
    });
    setShowFolderDialog(false);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    clearFilter();
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || selectedCategories.length > 0 || selectedDifficulties.length > 0;

  return (
    <ThreePanel>
      <div className="h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-[#E5E5E0]"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-6 h-6 text-[#E8D5C4]" />
              <h1 className="text-2xl font-semibold text-[#2D2D2D]">Resource Library</h1>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              {stats.totalResources} resources • {stats.favoriteCount} favorites
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedResourceIds.length > 0 && (
              <>
                <span className="text-sm text-[#8A8A8A]">{selectedResourceIds.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMovingResourceId(selectedResourceIds[0]);
                    setShowMoveDialog(true);
                  }}
                >
                  <Move className="w-4 h-4 mr-1" />
                  Move
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={clearResourceSelection}>
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Resource
            </Button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b border-[#E5E5E0]">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X className="w-4 h-4 text-[#8A8A8A]" />
              </button>
            )}
          </div>

          {/* Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={selectedTypes.length > 0 ? "border-[#E8D5C4]" : ""}>
                <Filter className="w-4 h-4 mr-1" />
                Type
                {selectedTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{selectedTypes.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Resource Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(resourceTypeIcons).map(([type, Icon]) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type as ResourceType)}
                  onCheckedChange={(checked) => {
                    setSelectedTypes(prev =>
                      checked
                        ? [...prev, type as ResourceType]
                        : prev.filter(t => t !== type)
                    );
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="capitalize">{type}</span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className={selectedCategories.length > 0 ? "border-[#E8D5C4]" : ""}>
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Category
                {selectedCategories.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{selectedCategories.length}</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(categoryLabels).map(([category, label]) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category as ResourceCategory)}
                  onCheckedChange={(checked) => {
                    setSelectedCategories(prev =>
                      checked
                        ? [...prev, category as ResourceCategory]
                        : prev.filter(c => c !== category)
                    );
                  }}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
              <DropdownMenuCheckboxItem
                checked={sortBy === "newest"}
                onCheckedChange={() => setSortBy("newest")}
              >
                Newest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "oldest"}
                onCheckedChange={() => setSortBy("oldest")}
              >
                Oldest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "name"}
                onCheckedChange={() => setSortBy("name")}
              >
                Name (A-Z)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "popular"}
                onCheckedChange={() => setSortBy("popular")}
              >
                Most popular
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear filters
            </Button>
          )}

          <div className="flex-1" />

          {/* View mode toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid" ? "bg-[#E8D5C4] text-[#2D2D2D]" : "text-[#8A8A8A] hover:bg-[#F5F0EB]"
              )}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              className={cn(
                "p-2 transition-colors",
                viewMode === "list" ? "bg-[#E8D5C4] text-[#2D2D2D]" : "text-[#8A8A8A] hover:bg-[#F5F0EB]"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-[#E5E5E0] p-4 overflow-auto">
            <FolderTree
              folders={folders}
              currentFolderId={currentFolderId}
              onSelectFolder={setCurrentFolder}
              onCreateFolder={() => setShowFolderDialog(true)}
            />

            <Separator className="my-4" />

            {/* Quick Access */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#8A8A8A] uppercase px-3">Quick Access</span>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F0EB] transition-colors"
                onClick={() => setFilter({ isFavorite: true })}
              >
                <Heart className="w-4 h-4 text-red-400" />
                <span className="flex-1 text-left">Favorites</span>
                <span className="text-xs text-[#8A8A8A]">{favorites.length}</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F0EB] transition-colors"
                onClick={() => {
                  const pinnedIds = pinned.map(r => r.id);
                  // Filter to show only pinned
                }}
              >
                <Pin className="w-4 h-4 text-[#E8D5C4]" />
                <span className="flex-1 text-left">Pinned</span>
                <span className="text-xs text-[#8A8A8A]">{pinned.length}</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F5F0EB] transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="flex-1 text-left">Recent</span>
                <span className="text-xs text-[#8A8A8A]">{recent.length}</span>
              </button>
            </div>

            <Separator className="my-4" />

            {/* Stats */}
            <div className="space-y-2 px-3">
              <span className="text-xs font-medium text-[#8A8A8A] uppercase">Statistics</span>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Total views</span>
                  <span className="font-medium">{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#5A5A5A]">
                  <span>Downloads</span>
                  <span className="font-medium">{stats.totalDownloads.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto p-6">
            {/* Breadcrumbs */}
            {folderPath.length > 0 && (
              <div className="flex items-center gap-2 mb-4 text-sm">
                <button
                  className="text-[#8A8A8A] hover:text-[#2D2D2D]"
                  onClick={() => setCurrentFolder(null)}
                >
                  All Resources
                </button>
                {folderPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="w-4 h-4 text-[#8A8A8A]" />
                    <button
                      className={cn(
                        "hover:text-[#2D2D2D]",
                        index === folderPath.length - 1 ? "text-[#2D2D2D] font-medium" : "text-[#8A8A8A]"
                      )}
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Resources grid/list */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-[#E8D5C4] border-t-transparent rounded-full" />
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F5F0EB] flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-[#8A8A8A]" />
                </div>
                <h3 className="text-lg font-medium text-[#2D2D2D] mb-1">No resources found</h3>
                <p className="text-sm text-[#8A8A8A] mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters or search query"
                    : "Get started by adding your first resource"}
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Resource
                  </Button>
                )}
              </div>
            ) : (
              <motion.div
                layout
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-2"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      viewMode={viewMode}
                      isSelected={selectedResourceIds.includes(resource.id)}
                      onSelect={() => toggleResourceSelection(resource.id)}
                      onToggleFavorite={() => toggleFavorite(resource.id)}
                      onTogglePin={() => togglePin(resource.id)}
                      onEdit={() => {
                        setEditingResource(resource);
                        setShowEditDialog(true);
                      }}
                      onDelete={() => {
                        setEditingResource(resource);
                        setShowDeleteDialog(true);
                      }}
                      onDuplicate={() => handleDuplicateResource(resource)}
                      onMove={() => {
                        setMovingResourceId(resource.id);
                        setShowMoveDialog(true);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Add Resource Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>Add a new resource to your library</DialogDescription>
          </DialogHeader>
          <AddResourceForm onSubmit={handleCreateResource} folders={folders} />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource details</DialogDescription>
          </DialogHeader>
          {editingResource && (
            <EditResourceForm
              resource={editingResource}
              onSubmit={handleUpdateResource}
              folders={folders}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Resource</DialogTitle>
            <DialogDescription>Select a folder to move the resource to</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#F5F0EB] transition-colors"
              onClick={() => handleMoveResource(null)}
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-[#8A8A8A]" />
                <span>All Resources (Root)</span>
              </div>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#F5F0EB] transition-colors"
                onClick={() => handleMoveResource(folder.id)}
              >
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-5 h-5" style={{ color: folder.color }} />
                  <span>{folder.name}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              {selectedResourceIds.length > 1
                ? `Are you sure you want to delete ${selectedResourceIds.length} resources?`
                : "Are you sure you want to delete this resource?"}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={selectedResourceIds.length > 1 ? handleDeleteSelected : handleDeleteResource}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>Create a new folder to organize your resources</DialogDescription>
          </DialogHeader>
          <CreateFolderForm onSubmit={handleCreateFolder} />
        </DialogContent>
      </Dialog>
    </ThreePanel>
  );
}

// Add Resource Form
interface AddResourceFormProps {
  onSubmit: (data: Partial<Resource>) => void;
  folders: ResourceFolder[];
}

function AddResourceForm({ onSubmit, folders }: AddResourceFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResourceType>("article");
  const [category, setCategory] = useState<ResourceCategory>("custom");
  const [difficulty, setDifficulty] = useState<ResourceDifficulty>("all_levels");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      category,
      difficulty,
      url,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(resourceTypeIcons).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Difficulty</label>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as ResourceDifficulty)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">URL (optional)</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <DialogFooter>
        <Button type="submit">Create Resource</Button>
      </DialogFooter>
    </form>
  );
}

// Edit Resource Form
interface EditResourceFormProps {
  resource: Resource;
  onSubmit: (data: Partial<Resource>) => void;
  folders: ResourceFolder[];
}

function EditResourceForm({ resource, onSubmit, folders }: EditResourceFormProps) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description || "");
  const [type, setType] = useState<ResourceType>(resource.type);
  const [category, setCategory] = useState<ResourceCategory>(resource.category);
  const [difficulty, setDifficulty] = useState<ResourceDifficulty>(resource.difficulty);
  const [url, setUrl] = useState(resource.url || "");
  const [tags, setTags] = useState(resource.tags.join(", "));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      category,
      difficulty,
      url,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(resourceTypeIcons).map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select value={category} onValueChange={(v) => setCategory(v as ResourceCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Difficulty</label>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as ResourceDifficulty)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(difficultyLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">URL (optional)</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}

// Create Folder Form
interface CreateFolderFormProps {
  onSubmit: (name: string) => void;
}

function CreateFolderForm({ onSubmit }: CreateFolderFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1 block">Folder Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Folder"
          required
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button type="submit">Create Folder</Button>
      </DialogFooter>
    </form>
  );
}
