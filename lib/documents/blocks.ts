import { DocumentBlock } from "@/types";

export const blockTypes = [
  { type: "heading1", label: "Heading 1", icon: "H1" },
  { type: "heading2", label: "Heading 2", icon: "H2" },
  { type: "heading3", label: "Heading 3", icon: "H3" },
  { type: "paragraph", label: "Paragraph", icon: "P" },
  { type: "bullet", label: "Bullet List", icon: "•" },
  { type: "numbered", label: "Numbered List", icon: "1." },
  { type: "quote", label: "Quote", icon: '"' },
  { type: "divider", label: "Divider", icon: "—" },
] as const;

export type BlockType = (typeof blockTypes)[number]["type"];

export function createBlock(type: BlockType, content: string = ""): DocumentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content,
  };
}

export function getBlockStyles(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "text-3xl font-bold text-[#2D2D2D] mb-4";
    case "heading2":
      return "text-2xl font-semibold text-[#2D2D2D] mb-3 mt-6";
    case "heading3":
      return "text-xl font-semibold text-[#2D2D2D] mb-2 mt-4";
    case "paragraph":
      return "text-base text-[#2D2D2D] leading-relaxed mb-4";
    case "bullet":
      return "text-base text-[#2D2D2D] leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#8A8A8A]";
    case "numbered":
      return "text-base text-[#2D2D2D] leading-relaxed pl-6 relative";
    case "quote":
      return "text-base text-[#5A5A5A] italic border-l-4 border-[#E8D5C4] pl-4 py-2 my-4 bg-[#FAFAF8] rounded-r-lg";
    case "divider":
      return "border-t border-[#E5E5E0] my-6";
    default:
      return "";
  }
}

export function getPlaceholder(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "Heading 1";
    case "heading2":
      return "Heading 2";
    case "heading3":
      return "Heading 3";
    case "paragraph":
      return "Type something...";
    case "bullet":
      return "List item";
    case "numbered":
      return "List item";
    case "quote":
      return "Quote text...";
    default:
      return "";
  }
}
