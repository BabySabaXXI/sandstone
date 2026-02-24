"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Code, Download, FileJson, FileType } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: "markdown" | "json" | "txt") => void;
}

// =============================================================================
// EXPORT OPTIONS
// =============================================================================

const exportOptions = [
  {
    id: "markdown" as const,
    label: "Markdown",
    description: "Export as .md file",
    icon: FileType,
    color: "#A8C5D4",
  },
  {
    id: "json" as const,
    label: "JSON",
    description: "Export as .json file",
    icon: FileJson,
    color: "#E5D4A8",
  },
  {
    id: "txt" as const,
    label: "Plain Text",
    description: "Export as .txt file",
    icon: FileText,
    color: "#D4A8A8",
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ExportMenu({ isOpen, onClose, onExport }: ExportMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E5E5E0] py-3 z-50"
          >
            <div className="px-4 pb-2 border-b border-[#E5E5E0]">
              <h3 className="font-semibold text-[#2D2D2D]">Export Document</h3>
              <p className="text-xs text-[#8A8A8A]">Choose your preferred format</p>
            </div>

            <div className="p-2">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => onExport(option.id)}
                    className="w-full px-3 py-3 flex items-center gap-3 hover:bg-[#F0F0EC] rounded-lg transition-colors text-left group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${option.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: option.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[#2D2D2D] group-hover:text-[#2D2D2D]">
                        {option.label}
                      </div>
                      <div className="text-xs text-[#8A8A8A]">{option.description}</div>
                    </div>
                    <Download className="w-4 h-4 text-[#8A8A8A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>

            <div className="px-4 pt-2 border-t border-[#E5E5E0]">
              <p className="text-xs text-[#8A8A8A]">
                Tip: Use Ctrl/Cmd + E for quick export
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExportMenu;
