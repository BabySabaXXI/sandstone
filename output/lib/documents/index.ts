// =============================================================================
// DOCUMENT BLOCK SYSTEM EXPORTS
// =============================================================================

export {
  blockTypes,
  blockCategories,
  createBlock,
  getBlockStyles,
  getPlaceholder,
  convertBlockType,
  serializeBlock,
  serializeBlocks,
  groupBlocksByCategory,
  validateBlock,
  sanitizeBlockContent,
} from "./blocks";

export type { BlockType } from "./blocks";
