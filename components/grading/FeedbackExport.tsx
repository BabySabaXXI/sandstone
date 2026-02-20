"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Annotation, GradingResult } from "@/types";
import { Download, FileText, FileJson, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackExportProps {
  essay: string;
  gradingResult?: GradingResult;
}

export function FeedbackExport({ essay, gradingResult }: FeedbackExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const annotations = gradingResult?.annotations || [];

  const generatePDFContent = () => {
    const date = new Date().toLocaleDateString();
    
    return {
      title: "Essay Feedback Report",
      date,
      overallScore: gradingResult?.overallScore || 0,
      band: gradingResult?.band || "N/A",
      summary: gradingResult?.summary || "",
      essay,
      annotations: annotations.map((a) => ({
        type: a.type,
        message: a.message,
        suggestion: a.suggestion,
        text: essay.slice(a.start, a.end),
      })),
      improvements: gradingResult?.improvements || [],
    };
  };

  const generateJSON = () => {
    return JSON.stringify(
      {
        essay,
        gradingResult,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const handleExportPDF = async () => {
    setExporting(true);
    
    // Simulate PDF generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const content = generatePDFContent();
    
    // Create a formatted text report as a downloadable file
    const reportText = `
ESSAY FEEDBACK REPORT
Generated: ${content.date}

═══════════════════════════════════════════════════════════

OVERALL SCORE: ${content.overallScore}/9
BAND: ${content.band}

═══════════════════════════════════════════════════════════

SUMMARY
${content.summary}

═══════════════════════════════════════════════════════════

YOUR ESSAY

${content.essay}

═══════════════════════════════════════════════════════════

DETAILED FEEDBACK (${content.annotations.length} items)

${content.annotations
  .map(
    (a, i) => `
[${i + 1}] ${a.type.toUpperCase()}
Text: "${a.text}"
Feedback: ${a.message}
${a.suggestion ? `Suggestion: ${a.suggestion}` : ""}
`
  )
  .join("\n---\n")}

═══════════════════════════════════════════════════════════

AREAS FOR IMPROVEMENT

${content.improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n")}

═══════════════════════════════════════════════════════════
`;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `essay-feedback-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExporting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleExportJSON = async () => {
    setExporting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const json = generateJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `essay-feedback-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExporting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#3D3D3D] transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export Feedback
      </button>

      {/* Export Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#2D2D2D]">
                  Export Feedback
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors"
                >
                  <X className="w-5 h-5 text-[#8A8A8A]" />
                </button>
              </div>

              {/* Export Options */}
              {!exporting && !success && (
                <div className="space-y-4">
                  <p className="text-[#5A5A5A] text-sm mb-4">
                    Choose a format to export your essay feedback:
                  </p>

                  <button
                    onClick={handleExportPDF}
                    className="w-full p-4 rounded-xl border border-[#E5E5E0] hover:border-[#D5D5D0] hover:bg-[#FAFAF8] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#D4A8A8]/20 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[#D4A8A8]" />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-medium text-[#2D2D2D] group-hover:text-[#1D1D1D]">
                          Text Report
                        </h4>
                          <p className="text-sm text-[#8A8A8A]">
                          Formatted feedback with annotations
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="w-full p-4 rounded-xl border border-[#E5E5E0] hover:border-[#D5D5D0] hover:bg-[#FAFAF8] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#A8C5D4]/20 flex items-center justify-center">
                        <FileJson className="w-6 h-6 text-[#A8C5D4]" />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="font-medium text-[#2D2D2D] group-hover:text-[#1D1D1D]">
                          JSON Data
                        </h4>
                        <p className="text-sm text-[#8A8A8A]">
                          Raw data for further analysis
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Stats */}
                  <div className="mt-6 pt-4 border-t border-[#E5E5E0]">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-[#F0F0EC] rounded-lg">
                        <p className="text-2xl font-semibold text-[#2D2D2D]">
                          {annotations.length}
                        </p>
                        <p className="text-xs text-[#8A8A8A]">Annotations</p>
                      </div>
                      <div className="p-3 bg-[#F0F0EC] rounded-lg">
                        <p className="text-2xl font-semibold text-[#2D2D2D]">
                          {gradingResult?.overallScore || 0}
                        </p>
                        <p className="text-xs text-[#8A8A8A]">Overall Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Exporting State */}
              {exporting && (
                <div className="py-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-[#E5E5E0] border-t-[#2D2D2D] rounded-full mx-auto mb-4"
                  />
                  <p className="text-[#5A5A5A]">Generating export...</p>
                </div>
              )}

              {/* Success State */}
              {success && (
                <div className="py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-[#A8C5A8]/20 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-[#A8C5A8]" />
                  </motion.div>
                  <p className="text-[#2D2D2D] font-medium">Export complete!</p>
                  <p className="text-sm text-[#8A8A8A]">
                    Your file has been downloaded
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Standalone export button for use in other components
export function ExportButton({
  essay,
  gradingResult,
  variant = "default",
}: FeedbackExportProps & { variant?: "default" | "outline" | "ghost" }) {
  const [isOpen, setIsOpen] = useState(false);

  const variantStyles = {
    default: "bg-[#2D2D2D] text-white hover:bg-[#3D3D3D]",
    outline: "border border-[#E5E5E0] text-[#2D2D2D] hover:bg-[#F0F0EC]",
    ghost: "text-[#8A8A8A] hover:text-[#2D2D2D] hover:bg-[#F0F0EC]",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm",
          variantStyles[variant]
        )}
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      <FeedbackExport
        essay={essay}
        gradingResult={gradingResult}
      />
    </>
  );
}
