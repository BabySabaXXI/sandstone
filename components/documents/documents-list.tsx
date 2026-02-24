/**
 * Documents List Component
 * 
 * Client Component that displays and manages documents.
 * Handles search, filtering, and view modes.
 */

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  Folder,
  MoreVertical,
  Download,
  Trash2,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Document } from "@/lib/ssr/data-fetching";

interface DocumentsListProps {
  documents: Document[];
  userId: string;
}

/**
 * Documents List Component
 */
export function DocumentsList({ documents: initialDocuments, userId }: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);

  // Extract unique folders from documents
  const folders = useMemo(() => {
    const folderSet = new Set(documents.map((d) => d.folder).filter(Boolean));
    return ["All", ...Array.from(folderSet), "Uncategorized"];
  }, [documents]);

  // Filter documents based on search and folder
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder =
        selectedFolder === "All" ||
        doc.folder === selectedFolder ||
        (selectedFolder === "Uncategorized" && !doc.folder);
      return matchesSearch && matchesFolder;
    });
  }, [documents, searchQuery, selectedFolder]);

  // Handle document deletion
  const handleDelete = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
    toast.success("Document deleted");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <Grid3X3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Folder Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {folders.map((folder) => (
          <Button
            key={folder}
            variant={selectedFolder === folder ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFolder(folder)}
          >
            {folder}
          </Button>
        ))}
      </div>

      {/* Documents */}
      {viewMode === "grid" ? (
        <DocumentsGrid documents={filteredDocuments} onDelete={handleDelete} />
      ) : (
        <DocumentsTable documents={filteredDocuments} onDelete={handleDelete} />
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <EmptyState searchQuery={searchQuery} selectedFolder={selectedFolder} />
      )}
    </div>
  );
}

/**
 * Documents Grid View
 */
function DocumentsGrid({
  documents,
  onDelete,
}: {
  documents: Document[];
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                {getFileIcon(doc.type)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-rose-500"
                      onClick={() => onDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-medium truncate" title={doc.name}>
                {doc.name}
              </h3>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>{doc.size}</span>
                <span>{doc.updatedAt}</span>
              </div>
              {doc.folder && (
                <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-muted rounded">
                  {doc.folder}
                </span>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Documents Table View
 */
function DocumentsTable({
  documents,
  onDelete,
}: {
  documents: Document[];
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              {getFileIcon(doc.type)}
              <div>
                <h3 className="font-medium">{doc.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.updatedAt}</span>
                  {doc.folder && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 text-xs bg-muted rounded">
                        {doc.folder}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Get file icon based on type
 */
function getFileIcon(type: Document["type"]) {
  switch (type) {
    case "pdf":
    case "doc":
      return <FileText className="w-8 h-8 text-blue-500" />;
    case "image":
      return <ImageIcon className="w-8 h-8 text-purple-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
    default:
      return <File className="w-8 h-8 text-gray-500" />;
  }
}

/**
 * Empty State Component
 */
function EmptyState({
  searchQuery,
  selectedFolder,
}: {
  searchQuery: string;
  selectedFolder: string;
}) {
  const hasFilters = searchQuery || selectedFolder !== "All";

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No documents found</h3>
      <p className="text-muted-foreground mb-4">
        {hasFilters
          ? "Try adjusting your filters"
          : "Upload your first document to get started"}
      </p>
      {!hasFilters && (
        <Button className="gap-2" asChild>
          <Link href="/documents/upload">
            <Folder className="w-4 h-4" />
            Upload Document
          </Link>
        </Button>
      )}
    </div>
  );
}
