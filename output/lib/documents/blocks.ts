import { DocumentBlock } from "@/types";

// =============================================================================
// BLOCK TYPE DEFINITIONS
// =============================================================================

export const blockTypes = [
  { type: "heading1", label: "Heading 1", icon: "H1", category: "basic" },
  { type: "heading2", label: "Heading 2", icon: "H2", category: "basic" },
  { type: "heading3", label: "Heading 3", icon: "H3", category: "basic" },
  { type: "paragraph", label: "Paragraph", icon: "P", category: "basic" },
  { type: "bullet", label: "Bullet List", icon: "•", category: "list" },
  { type: "numbered", label: "Numbered List", icon: "1.", category: "list" },
  { type: "checklist", label: "Checklist", icon: "☑", category: "list" },
  { type: "quote", label: "Quote", icon: '"', category: "basic" },
  { type: "callout", label: "Callout", icon: "📢", category: "advanced" },
  { type: "code", label: "Code Block", icon: "</>", category: "advanced" },
  { type: "image", label: "Image", icon: "🖼", category: "media" },
  { type: "divider", label: "Divider", icon: "—", category: "basic" },
  { type: "table", label: "Table", icon: "⊞", category: "advanced" },
  { type: "equation", label: "Equation", icon: "∑", category: "advanced" },
] as const;

export type BlockType = (typeof blockTypes)[number]["type"];

export const blockCategories = {
  basic: "Basic Blocks",
  list: "Lists",
  media: "Media",
  advanced: "Advanced",
} as const;

// =============================================================================
// BLOCK CREATION
// =============================================================================

export function createBlock(type: BlockType, content: string = ""): DocumentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    metadata: getDefaultMetadata(type),
  };
}

function getDefaultMetadata(type: BlockType): Record<string, unknown> | undefined {
  switch (type) {
    case "checklist":
      return { checked: false };
    case "callout":
      return { icon: "💡", color: "blue" };
    case "code":
      return { language: "plaintext" };
    case "image":
      return { src: "", alt: "", caption: "" };
    case "table":
      return { rows: 2, cols: 2, data: [["", ""], ["", ""]] };
    case "equation":
      return { displayMode: false };
    default:
      return undefined;
  }
}

// =============================================================================
// BLOCK STYLES
// =============================================================================

export function getBlockStyles(type: BlockType): string {
  const baseStyles = "outline-none transition-all duration-150";
  
  switch (type) {
    case "heading1":
      return `${baseStyles} text-3xl font-bold text-[#2D2D2D] mb-4 mt-2 leading-tight`;
    case "heading2":
      return `${baseStyles} text-2xl font-semibold text-[#2D2D2D] mb-3 mt-6 leading-tight`;
    case "heading3":
      return `${baseStyles} text-xl font-semibold text-[#2D2D2D] mb-2 mt-4 leading-tight`;
    case "paragraph":
      return `${baseStyles} text-base text-[#2D2D2D] leading-relaxed mb-4`;
    case "bullet":
      return `${baseStyles} text-base text-[#2D2D2D] leading-relaxed pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-[#8A8A8A]`;
    case "numbered":
      return `${baseStyles} text-base text-[#2D2D2D] leading-relaxed pl-6 relative counter-increment:list-item`;
    case "checklist":
      return `${baseStyles} text-base text-[#2D2D2D] leading-relaxed pl-8 relative flex items-center gap-2`;
    case "quote":
      return `${baseStyles} text-base text-[#5A5A5A] italic border-l-4 border-[#E8D5C4] pl-4 py-2 my-4 bg-[#FAFAF8] rounded-r-lg`;
    case "callout":
      return `${baseStyles} text-base text-[#2D2D2D] p-4 my-4 rounded-lg border border-[#E5E5E0] bg-[#FAFAF8]`;
    case "code":
      return `${baseStyles} font-mono text-sm bg-[#2D2D2D] text-[#F5F5F0] p-4 rounded-lg my-4 overflow-x-auto`;
    case "image":
      return `${baseStyles} my-4`;
    case "divider":
      return "border-t border-[#E5E5E0] my-6";
    case "table":
      return `${baseStyles} w-full my-4 border-collapse`;
    case "equation":
      return `${baseStyles} text-center my-4 font-serif text-lg`;
    default:
      return baseStyles;
  }
}

// =============================================================================
// BLOCK PLACEHOLDERS
// =============================================================================

export function getPlaceholder(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "Heading 1";
    case "heading2":
      return "Heading 2";
    case "heading3":
      return "Heading 3";
    case "paragraph":
      return "Type something... (press / for commands)";
    case "bullet":
      return "List item";
    case "numbered":
      return "List item";
    case "checklist":
      return "To-do item";
    case "quote":
      return "Quote text...";
    case "callout":
      return "Callout text...";
    case "code":
      return "// Code...";
    case "image":
      return "Image URL...";
    case "table":
      return "Table content...";
    case "equation":
      return "E = mc²";
    default:
      return "";
  }
}

// =============================================================================
// BLOCK CONVERSION
// =============================================================================

export function convertBlockType(
  block: DocumentBlock,
  newType: BlockType
): DocumentBlock {
  return {
    ...block,
    type: newType,
    metadata: getDefaultMetadata(newType),
  };
}

// =============================================================================
// BLOCK SERIALIZATION
// =============================================================================

export function serializeBlock(block: DocumentBlock): string {
  switch (block.type) {
    case "heading1":
      return `# ${block.content}`;
    case "heading2":
      return `## ${block.content}`;
    case "heading3":
      return `### ${block.content}`;
    case "bullet":
      return `- ${block.content}`;
    case "numbered":
      return `1. ${block.content}`;
    case "checklist":
      const checked = block.metadata?.checked ? "x" : " ";
      return `- [${checked}] ${block.content}`;
    case "quote":
      return `> ${block.content}`;
    case "code":
      const lang = block.metadata?.language || "";
      return "```" + lang + "\n" + block.content + "\n```";
    case "divider":
      return "---";
    default:
      return block.content;
  }
}

export function serializeBlocks(blocks: DocumentBlock[]): string {
  return blocks.map(serializeBlock).join("\n\n");
}

// =============================================================================
// BLOCK GROUPING
// =============================================================================

export function groupBlocksByCategory() {
  return blockTypes.reduce((acc, block) => {
    const category = block.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(block);
    return acc;
  }, {} as Record<string, typeof blockTypes>);
}

// =============================================================================
// BLOCK VALIDATION
// =============================================================================

export function validateBlock(block: DocumentBlock): boolean {
  if (!block.id || typeof block.id !== "string") return false;
  if (!block.type || !blockTypes.some((b) => b.type === block.type)) return false;
  if (typeof block.content !== "string") return false;
  return true;
}

export function sanitizeBlockContent(content: string): string {
  // Remove potentially harmful content
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}
