"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  FileText,
  Video,
  ExternalLink,
  Bookmark,
  Filter,
  Download,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LibraryContentProps {
  userId: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "document" | "past-paper";
  subject: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  isBookmarked?: boolean;
}

const mockResources: Resource[] = [
  {
    id: "1",
    title: "Understanding Market Structures",
    description: "Comprehensive guide to perfect competition, monopoly, oligopoly, and monopolistic competition",
    type: "article",
    subject: "Economics",
    topic: "Microeconomics",
    difficulty: "intermediate",
  },
  {
    id: "2",
    title: "Coastal Processes and Landforms",
    description: "Video explanation of erosion, transportation, and deposition processes",
    type: "video",
    subject: "Geography",
    topic: "Physical Geography",
    difficulty: "beginner",
  },
  {
    id: "3",
    title: "Edexcel Economics A-Level Past Paper 2023",
    description: "Complete past paper with mark scheme",
    type: "past-paper",
    subject: "Economics",
    topic: "Exam Practice",
    difficulty: "advanced",
    isBookmarked: true,
  },
  {
    id: "4",
    title: "Globalization and Development",
    description: "Case studies of development in different countries",
    type: "document",
    subject: "Geography",
    topic: "Human Geography",
    difficulty: "intermediate",
  },
];

const getTypeIcon = (type: Resource["type"]) => {
  switch (type) {
    case "article":
      return <BookOpen className="w-5 h-5 text-blue-500" />;
    case "video":
      return <Video className="w-5 h-5 text-rose-500" />;
    case "document":
      return <FileText className="w-5 h-5 text-emerald-500" />;
    case "past-paper":
      return <FileText className="w-5 h-5 text-amber-500" />;
  }
};

const getTypeLabel = (type: Resource["type"]) => {
  switch (type) {
    case "article":
      return "Article";
    case "video":
      return "Video";
    case "document":
      return "Document";
    case "past-paper":
      return "Past Paper";
  }
};

const getDifficultyColor = (difficulty: Resource["difficulty"]) => {
  switch (difficulty) {
    case "beginner":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "intermediate":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "advanced":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
  }
};

export function LibraryContent({ userId }: LibraryContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [resources, setResources] = useState<Resource[]>(mockResources);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || resource.subject === selectedSubject;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesSubject && matchesType;
  });

  const toggleBookmark = (resourceId: string) => {
    setResources(
      resources.map((r) =>
        r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
      )
    );
    toast.success("Bookmark updated");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground mt-1">
          Browse curated study resources and materials
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Economics">Economics</SelectItem>
            <SelectItem value="Geography">Geography</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="past-paper">Past Papers</SelectItem>
          </SelectContent>
        </Select>
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
            <Card className="group h-full hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getTypeIcon(resource.type)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleBookmark(resource.id)}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        resource.isBookmarked
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                </div>

                <Badge
                  variant="secondary"
                  className={`mb-2 ${getDifficultyColor(resource.difficulty)}`}
                >
                  {resource.difficulty}
                </Badge>

                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                      {resource.subject}
                    </span>
                    <span className="text-muted-foreground">
                      {resource.topic}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button className="flex-1 gap-2" asChild>
                    <Link href={`/library/${resource.id}`}>
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Link>
                  </Button>
                  {resource.type === "past-paper" && (
                    <Button variant="outline" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
