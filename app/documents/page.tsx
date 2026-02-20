"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { BlockEditor } from "@/components/documents/BlockEditor";
import { useDocumentStore } from "@/stores/document-store";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const { currentDocumentId, setCurrentDocument, createDocument, fetchDocuments, syncing } = useDocumentStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setIsLoading(true);
    await fetchDocuments();
    setIsLoading(false);
  };

  const handleSelectDocument = (id: string) => {
    setCurrentDocument(id);
    setShowWelcome(false);
  };

  const handleCreateDocument = () => {
    const id = createDocument("Untitled Document");
    setCurrentDocument(id);
    setShowWelcome(false);
  };

  const handleRefresh = async () => {
    await loadDocuments();
    toast.success("Documents refreshed");
  };

  return (
    <ThreePanel>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-[#A8C5D4]" />
              <h1 className="text-h1 text-[#2D2D2D]">Documents</h1>
            </div>
            <p className="text-[#5A5A5A]">
              Organize your writing practice and study notes
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={syncing || isLoading}
            className="flex items-center gap-2 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(syncing || isLoading) && "animate-spin"}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Document Tree */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-4 sticky top-6">
              <DocumentTree
                onSelectDocument={handleSelectDocument}
                selectedId={currentDocumentId}
              />
            </div>
          </motion.div>

          {/* Main Content - Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {showWelcome || !currentDocumentId ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-12 text-center"
                >
                  <FileText className="w-16 h-16 text-[#E8D5C4] mx-auto mb-4" />
                  <h2 className="text-h2 text-[#2D2D2D] mb-2">Your Documents</h2>
                  <p className="text-[#5A5A5A] mb-6 max-w-md mx-auto">
                    Create and organize your essay drafts, practice questions, and study notes.
                    All your documents are automatically synced to the cloud.
                  </p>
                  <button
                    onClick={handleCreateDocument}
                    className="inline-flex items-center gap-2 bg-[#2D2D2D] text-white px-6 py-3 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Document
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-8"
                >
                  <BlockEditor documentId={currentDocumentId} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </ThreePanel>
  );
}
