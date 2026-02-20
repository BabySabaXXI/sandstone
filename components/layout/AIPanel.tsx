"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "@/stores/layout-store";
import { X, Bot, Sparkles, MessageSquare } from "lucide-react";

export function AIPanel() {
  const { aiPanelOpen, toggleAIPanel } = useLayoutStore();

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-80 h-screen ai-panel fixed right-0 top-0 z-40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#E8D5C4]" />
              <span className="text-white font-medium">AI Assistant</span>
            </div>
            <button
              onClick={toggleAIPanel}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Agent Status Cards */}
            <div className="space-y-3 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#A8C5A8]" />
                  <span className="text-white/80 text-sm font-medium">Examiner Swarm</span>
                </div>
                <p className="text-white/50 text-xs">6 AI examiners analyzing your essay...</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-[#A8C5D4]" />
                  <span className="text-white/80 text-sm font-medium">Chat</span>
                </div>
                <p className="text-white/50 text-xs">Ask questions about your writing...</p>
              </div>
            </div>

            {/* Chat Area Placeholder */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[200px]">
              <p className="text-white/40 text-sm text-center italic">
                AI chat interface will appear here...
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
              <input
                type="text"
                placeholder="Ask a question..."
                className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/40"
              />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
