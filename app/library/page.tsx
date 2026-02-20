"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { BookOpen, ExternalLink, FileText, Video, Headphones } from "lucide-react";

const resources = [
  {
    category: "Writing Tips",
    items: [
      { title: "IELTS Writing Task 2 Guide", type: "article", url: "#" },
      { title: "Band 9 Essay Examples", type: "article", url: "#" },
      { title: "Common Grammar Mistakes", type: "article", url: "#" },
    ],
  },
  {
    category: "Vocabulary",
    items: [
      { title: "Academic Word List", type: "video", url: "#" },
      { title: "Collocations for IELTS", type: "article", url: "#" },
      { title: "Idioms and Phrases", type: "audio", url: "#" },
    ],
  },
  {
    category: "Practice",
    items: [
      { title: "Past Exam Questions", type: "article", url: "#" },
      { title: "Timed Writing Exercises", type: "video", url: "#" },
      { title: "Self-Assessment Checklist", type: "article", url: "#" },
    ],
  },
];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  article: FileText,
  video: Video,
  audio: Headphones,
};

export default function LibraryPage() {
  return (
    <ThreePanel>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-[#E8D5C4]" />
            <h1 className="text-h1 text-[#2D2D2D]">Resource Library</h1>
          </div>
          <p className="text-[#5A5A5A]">
            Curated resources to help you improve your writing
          </p>
        </motion.div>

        {/* Resources */}
        <div className="space-y-8">
          {resources.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h2 className="text-h3 text-[#2D2D2D] mb-4">{section.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.items.map((item, itemIndex) => {
                  const Icon = typeIcons[item.type];
                  return (
                    <motion.a
                      key={item.title}
                      href={item.url}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + itemIndex * 0.05 }}
                      className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-4 hover:shadow-card-hover transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F0EC] flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-[#5A5A5A]" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-[#8A8A8A] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-medium text-[#2D2D2D] text-sm">{item.title}</h3>
                      <p className="text-xs text-[#8A8A8A] mt-1 capitalize">{item.type}</p>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ThreePanel>
  );
}
