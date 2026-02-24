// =============================================================================
// DOCUMENT SYSTEM EXPORTS
// =============================================================================

// Main components
export { BlockEditor } from "./BlockEditor";
export { Block } from "./Block";
export { SlashCommand } from "./SlashCommand";
export { DocumentTree } from "./DocumentTree";

// Supporting components
export { BlockToolbar } from "./BlockToolbar";
export { ExportMenu } from "./ExportMenu";
export { TagInput } from "./TagInput";

// Re-export types from lib
export type { BlockType } from "@/lib/documents/blocks";
export { blockTypes, createBlock, getBlockStyles, getPlaceholder } from "@/lib/documents/blocks";
