/**
 * Resources Grid Component
 * 
 * Client Component that displays library resources.
 * Handles filtering and resource display.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LibraryResource } from "@/lib/ssr/data-fetching";

interface ResourcesGridProps {
  resources: LibraryResource[];
}

/**
 * Resources Grid Component
 */
export function ResourcesGrid({ resources }: ResourcesGridProps) {
  const [filter, setFilter] = useState<string | null>(null);

  // Filter resources
  const filteredResources = useMemo(() => {
    if (!filter) return resources;
    return resources.filter((r) =>
      filter === "difficulty"
        ? true // Would filter by difficulty
        : r.type === filter
    );
  }, [resources, filter]);

  if (resources.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        <FilterButton
          active={filter === null}
          onClick={() => setFilter(null)}
          label="All"
        />
        <FilterButton
          active={filter === "article"}
          onClick={() => setFilter("article")}
          label="Articles"
          icon={FileText}
        />
        <FilterButton
          active={filter === "video"}
          onClick={() => setFilter("video")}
          label="Videos"
          icon={Video}
        />
        <FilterButton
          active={filter === "quiz"}
          onClick={() => setFilter("quiz")}
          label="Quizzes"
          icon={HelpCircle}
        />
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ResourceCard resource={resource} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Filter Button Component
 */
function FilterButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: typeof FileText;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}

/**
 * Resource Card Component
 */
function ResourceCard({ resource }: { resource: LibraryResource }) {
  const Icon = getResourceIcon(resource.type);
  const difficultyColor = getDifficultyColor(resource.difficulty);

  return (
    <Link href={`/library/${resource.id}`}>
      <Card className="group hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                difficultyColor.bg
              )}
            >
              <Icon className={cn("w-5 h-5", difficultyColor.text)} />
            </div>
            <Badge variant="secondary">{resource.type}</Badge>
          </div>

          <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {resource.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{resource.estimatedTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="capitalize">{resource.difficulty}</span>
            </div>
          </div>

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-muted rounded-full"
                >
                  {tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-muted rounded-full">
                  +{resource.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Get resource icon based on type
 */
function getResourceIcon(type: LibraryResource["type"]) {
  switch (type) {
    case "article":
      return FileText;
    case "video":
      return Video;
    case "pdf":
      return BookOpen;
    case "quiz":
      return HelpCircle;
    default:
      return FileText;
  }
}

/**
 * Get difficulty color based on level
 */
function getDifficultyColor(difficulty: LibraryResource["difficulty"]) {
  switch (difficulty) {
    case "beginner":
      return { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600" };
    case "intermediate":
      return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600" };
    case "advanced":
      return { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground" };
  }
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="text-center py-12">
      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No resources found</h3>
      <p className="text-muted-foreground">
        Check back later for new study materials
      </p>
    </div>
  );
}
