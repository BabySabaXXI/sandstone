"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { BlockEditor } from "@/components/documents/BlockEditor";
import { useDocumentStore } from "@/stores/document-store";
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  LayoutGrid, 
  List,
  Search,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function DocumentsPage() {
  const { 
    currentDocumentId, 
    setCurrentDocument, 
    createDocument, 
    fetchDocuments, 
    syncing,
    loading,
    documents,
    getRecentDocuments,
    getDocumentCount,
  } = useDocumentStore();
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [viewMode, setViewMode] = useState<"split" | "editor">("split");
  const [showStats, setShowStats] = useState(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    await fetchDocuments();
  };

  const handleSelectDocument = (id: string) => {
    setCurrentDocument(id);
    setShowWelcome(false);
  };

  const handleCreateDocument = async () => {
    const id = await createDocument("Untitled Document");
    setCurrentDocument(id);
    setShowWelcome(false);
  };

  const handleRefresh = async () => {
    await loadDocuments();
    toast.success("Documents refreshed");
  };

  const recentDocuments = getRecentDocuments(5);
  const documentCount = getDocumentCount();

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E0] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5C4] to-[#D4C4B0] flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#2D2D2D]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2D2D2D]">Documents</h1>
                <p className="text-xs text-[#8A8A8A]">
                  {documentCount} document{documentCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="hidden sm:flex items-center bg-[#F0F0EC] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("split")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "split" ? "bg-white shadow-sm" : "text-[#8A8A8A]"
                  }`}
                  title="Split view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("editor")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "editor" ? "bg-white shadow-sm" : "text-[#8A8A8A]"
                  }`}
                  title="Editor only"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Stats toggle */}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  showStats ? "bg-[#E8D5C4] text-[#2D2D2D]" : "bg-[#F0F0EC] text-[#5A5A5A]"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Stats</span>
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={syncing || loading}
                className="p-2 text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0F0EC] rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${(syncing || loading) && "animate-spin"}`} />
              </button>

              {/* New document button */}
              <button
                onClick={handleCreateDocument}
                className="flex items-center gap-2 bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">New Document</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#F0F0EC] border-b border-[#E5E5E0] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#8A8A8A] mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Total Documents</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">{documentCount}</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#8A8A8A] mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Recently Edited</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">{recentDocuments.length}</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#8A8A8A] mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">This Week</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">
                    {documents.filter(d => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(d.updatedAt) > weekAgo;
                    }).length}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 text-[#8A8A8A] mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Total Words</span>
                  </div>
                  <div className="text-2xl font-bold text-[#2D2D2D]">
                    {documents.reduce((acc, doc) => 
                      acc + doc.blocks.reduce((blockAcc, block) => 
                        blockAcc + block.content.split(/\s+/).filter(Boolean).length, 0
                      ), 0
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1"}`}>
          {/* Sidebar - Document Tree */}
          {(viewMode === "split" || !currentDocumentId) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${viewMode === "split" ? "lg:col-span-1" : ""}`}
            >
              <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-sm p-4 sticky top-24">
                <DocumentTree
                  onSelectDocument={handleSelectDocument}
                  selectedId={currentDocumentId}
                />
              </div>

              {/* Recent documents */}
              {recentDocuments.length > 0 && viewMode === "split" && (
                <div className="mt-4 bg-white rounded-xl border border-[#E5E5E0] shadow-sm p-4">
                  <h4 className="text-sm font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#8A8A8A]" />
                    Recently Edited
                  </h4>
                  <div className="space-y-1">
                    {recentDocuments.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleSelectDocument(doc.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-[#5A5A5A] hover:bg-[#F0F0EC] transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{doc.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Main Content - Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${viewMode === "split" ? "lg:col-span-3" : ""}`}
          >
            <AnimatePresence mode="wait">
              {showWelcome || !currentDocumentId ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-[#E5E5E0] shadow-sm p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E8D5C4] to-[#D4C4B0] flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-[#2D2D2D]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">
                    Your Documents
                  </h2>
                  <p className="text-[#5A5A5A] mb-8 max-w-md mx-auto">
                    Create and organize your essay drafts, practice questions, and study notes.
                    All your documents are automatically synced to the cloud.
                  </p>

                  {/* Quick actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                    <button
                      onClick={handleCreateDocument}
                      className="inline-flex items-center gap-2 bg-[#2D2D2D] text-white px-6 py-3 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Document
                    </button>
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center gap-2 bg-[#F0F0EC] text-[#5A5A5A] px-6 py-3 rounded-lg hover:bg-[#E5E5E0] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Sync Documents
                    </button>
                  </div>

                  {/* Tips */}
                  <div className="max-w-lg mx-auto">
                    <h3 className="text-sm font-semibold text-[#2D2D2D] mb-3">Quick Tips</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      <div className="bg-[#FAFAF8] rounded-lg p-3">
                        <div className="text-[#E5D4A8] mb-1">/</div>
                        <p className="text-sm text-[#5A5A5A]">Type / to open the command menu</p>
                      </div>
                      <div className="bg-[#FAFAF8] rounded-lg p-3">
                        <div className="text-[#A8C5D4] mb-1">⌘S</div>
                        <p className="text-sm text-[#5A5A5A]">Press Cmd/Ctrl+S to save</p>
                      </div>
                      <div className="bg-[#FAFAF8] rounded-lg p-3">
                        <div className="text-[#A8D4B5] mb-1">↵</div>
                        <p className="text-sm text-[#5A5A5A]">Press Enter to create new block</p>
                      </div>
                      <div className="bg-[#FAFAF8] rounded-lg p-3">
                        <div className="text-[#D4A8A8] mb-1">⌘E</div>
                        <p className="text-sm text-[#5A5A5A]">Press Cmd/Ctrl+E to export</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-[#E5E5E0] shadow-sm p-8"
                >
                  <BlockEditor documentId={currentDocumentId} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
