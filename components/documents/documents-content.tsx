"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
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

interface DocumentsContentProps {
  userId: string;
}

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "spreadsheet";
  size: string;
  updatedAt: string;
  folder?: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Economics Revision Notes.pdf",
    type: "pdf",
    size: "2.4 MB",
    updatedAt: "2 hours ago",
    folder: "Economics",
  },
  {
    id: "2",
    name: "Geography Case Studies.docx",
    type: "doc",
    size: "1.8 MB",
    updatedAt: "1 day ago",
    folder: "Geography",
  },
  {
    id: "3",
    name: "Market Structures Diagram.png",
    type: "image",
    size: "856 KB",
    updatedAt: "3 days ago",
    folder: "Economics",
  },
  {
    id: "4",
    name: "Grade Tracker.xlsx",
    type: "spreadsheet",
    size: "124 KB",
    updatedAt: "1 week ago",
  },
];

const folders = ["All", "Economics", "Geography", "Uncategorized"];

const getFileIcon = (type: Document["type"]) => {
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
};

export function DocumentsContent({ userId }: DocumentsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === "All" || doc.folder === selectedFolder ||
      (selectedFolder === "Uncategorized" && !doc.folder);
    return matchesSearch && matchesFolder;
  });

  const handleDelete = (docId: string) => {
    setDocuments(documents.filter((d) => d.id !== docId));
    toast.success("Document deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your study materials and resources
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Folder className="w-4 h-4" />
            New Folder
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocuments.map((doc, index) => (
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
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          onClick={() => handleDelete(doc.id)}
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
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredDocuments.map((doc, index) => (
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
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedFolder !== "All"
              ? "Try adjusting your filters"
              : "Upload your first document to get started"}
          </p>
          {!searchQuery && selectedFolder === "All" && (
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Upload Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
