// =============================================================================
// HOOKS EXPORTS
// =============================================================================

// Document hooks
export { useDocuments, useDocument, useFolders } from "./useDocuments";
export { useAutoSave } from "./useAutoSave";

// Re-export from store for convenience
export {
  useDocumentStore,
  useDocument as useDocumentSelector,
  useDocumentsBySubject,
  useDocumentsInFolder,
  useCurrentDocument,
  useFolder as useFolderSelector,
  useFoldersBySubject,
  useRecentDocuments,
} from "@/stores/document-store";
