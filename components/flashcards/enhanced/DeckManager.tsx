"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore, type FlashcardDeck } from "@/stores/flashcard-store-enhanced";
import {
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  MoreVertical,
  Play,
  Search,
  Filter,
  BookOpen,
  BarChart3,
  Tag,
  Folder,
  Clock,
  CheckCircle,
  Brain,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Subject } from "@/types";
import { formatInterval, getCardStatus } from "@/lib/flashcards/sm2-enhanced";

// ============================================================================
// TYPES
// ============================================================================

interface DeckManagerProps {
  onSelectDeck: (deckId: string) => void;
  onStudyDeck: (deckId: string) => void;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "created" | "updated" | "due" | "progress";

// ============================================================================
// DECK CARD COMPONENT
// ============================================================================

interface DeckCardProps {
  deck: FlashcardDeck;
  onSelect: () => void;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DeckCard = memo(function DeckCard({
  deck,
  onSelect,
  onStudy,
  onEdit,
  onDelete,
}: DeckCardProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const total = deck.cards.length;
    const due = deck.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
    const mastered = deck.cards.filter((c) => (c.repetitionCount || 0) >= 5).length;
    const newCards = deck.cards.filter((c) => (c.repetitionCount || 0) === 0).length;
    const learning = total - mastered - newCards;
    
    return { total, due, mastered, new: newCards, learning };
  }, [deck.cards]);

  const progress = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.mastered / stats.total) * 100);
  }, [stats]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-card rounded-xl border p-5 hover:shadow-lg transition-all cursor-pointer"
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{deck.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {deck.description || "No description"}
            </p>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStudy(); }}>
              <Play className="w-4 h-4 mr-2" />
              Study Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {deck.tags && deck.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {deck.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {deck.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{deck.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-muted rounded-lg">
          <div className="text-lg font-bold">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Total</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{stats.new}</div>
          <div className="text-[10px] text-blue-600/70 uppercase">New</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <div className="text-lg font-bold text-yellow-600">{stats.learning}</div>
          <div className="text-[10px] text-yellow-600/70 uppercase">Learning</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">{stats.mastered}</div>
          <div className="text-[10px] text-green-600/70 uppercase">Mastered</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{stats.due} due</span>
        </div>
        <Button
          size="sm"
          onClick={(e) => { e.stopPropagation(); onStudy(); }}
          disabled={stats.due === 0}
        >
          <Play className="w-4 h-4 mr-1" />
          Study
        </Button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// DECK LIST ITEM COMPONENT
// ============================================================================

interface DeckListItemProps {
  deck: FlashcardDeck;
  onSelect: () => void;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DeckListItem = memo(function DeckListItem({
  deck,
  onSelect,
  onStudy,
  onEdit,
  onDelete,
}: DeckListItemProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const total = deck.cards.length;
    const due = deck.cards.filter((c) => !c.nextReview || c.nextReview <= now).length;
    const mastered = deck.cards.filter((c) => (c.repetitionCount || 0) >= 5).length;
    
    return { total, due, mastered };
  }, [deck.cards]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group flex items-center gap-4 p-4 bg-card rounded-lg border hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Folder className="w-5 h-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{deck.name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {stats.total} cards · {stats.due} due · {stats.mastered} mastered
        </p>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onStudy(); }}>
          <Play className="w-4 h-4 mr-1" />
          Study
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// CREATE DECK DIALOG
// ============================================================================

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description: string, subject: Subject, tags: string[]) => void;
}

const CreateDeckDialog = memo(function CreateDeckDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState<Subject>("economics");
  const [tags, setTags] = useState("");

  const handleSubmit = useCallback(() => {
    if (name.trim()) {
      onCreate(
        name.trim(),
        description.trim(),
        subject,
        tags.split(",").map((t) => t.trim()).filter(Boolean)
      );
      setName("");
      setDescription("");
      setTags("");
      onOpenChange(false);
    }
  }, [name, description, subject, tags, onCreate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Microeconomics Basics"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this deck..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economics">Economics</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., chapter1, important, exam"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Create Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ============================================================================
// MAIN DECK MANAGER COMPONENT
// ============================================================================

export const DeckManager = memo(function DeckManager({
  onSelectDeck,
  onStudyDeck,
}: DeckManagerProps) {
  const { decks, createDeck, deleteDeck, updateDeck, getGlobalStats } = useFlashcardStore();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<FlashcardDeck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<FlashcardDeck | null>(null);

  // Global stats
  const globalStats = useMemo(() => getGlobalStats(), [getGlobalStats]);

  // Filter and sort decks
  const filteredDecks = useMemo(() => {
    let result = [...decks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          d.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "due":
          const aDue = a.cards.filter((c) => !c.nextReview || c.nextReview <= new Date()).length;
          const bDue = b.cards.filter((c) => !c.nextReview || c.nextReview <= new Date()).length;
          return bDue - aDue;
        case "progress":
          const aProgress = a.cards.length > 0 
            ? a.cards.filter((c) => (c.repetitionCount || 0) >= 5).length / a.cards.length 
            : 0;
          const bProgress = b.cards.length > 0 
            ? b.cards.filter((c) => (c.repetitionCount || 0) >= 5).length / b.cards.length 
            : 0;
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    return result;
  }, [decks, searchQuery, sortBy]);

  // Handlers
  const handleCreateDeck = useCallback(
    (name: string, description: string, subject: Subject, tags: string[]) => {
      createDeck(name, description, subject, tags);
    },
    [createDeck]
  );

  const handleDeleteDeck = useCallback(() => {
    if (deletingDeck) {
      deleteDeck(deletingDeck.id);
      setDeletingDeck(null);
    }
  }, [deletingDeck, deleteDeck]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Folder className="w-4 h-4" />
            <span className="text-sm">Decks</span>
          </div>
          <div className="text-2xl font-bold">{globalStats.totalDecks}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Cards</span>
          </div>
          <div className="text-2xl font-bold">{globalStats.totalCards}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Due</span>
          </div>
          <div className="text-2xl font-bold text-primary">{globalStats.cardsDue}</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Mastered</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{globalStats.mastered}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks..."
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="due">Due Cards</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <BookOpen className="w-4 h-4" />
            </Button>
          </div>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Deck
          </Button>
        </div>
      </div>

      {/* Decks Grid/List */}
      <AnimatePresence mode="popLayout">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onSelect={() => onSelectDeck(deck.id)}
                onStudy={() => onStudyDeck(deck.id)}
                onEdit={() => setEditingDeck(deck)}
                onDelete={() => setDeletingDeck(deck)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDecks.map((deck) => (
              <DeckListItem
                key={deck.id}
                deck={deck}
                onSelect={() => onSelectDeck(deck.id)}
                onStudy={() => onStudyDeck(deck.id)}
                onEdit={() => setEditingDeck(deck)}
                onDelete={() => setDeletingDeck(deck)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredDecks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No decks found" : "No decks yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Create your first deck to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Deck
            </Button>
          )}
        </div>
      )}

      {/* Create Dialog */}
      <CreateDeckDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateDeck}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deletingDeck} onOpenChange={() => setDeletingDeck(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingDeck?.name}&quot;? This will also delete all{" "}
              {deletingDeck?.cards.length} cards in this deck. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDeck(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeck}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default DeckManager;
