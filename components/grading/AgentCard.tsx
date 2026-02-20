"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, Link, BookOpen, Type, GraduationCap, Scale, Check, Loader2, 
  TrendingUp, GitBranch, Layout, Brain, Map, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Link,
  BookOpen,
  Type,
  GraduationCap,
  Scale,
  TrendingUp,
  GitBranch,
  Layout,
  Brain,
  Map,
  Globe,
};

interface AgentCardProps {
  name: string;
  icon: string;
  description: string;
  score?: number;
  maxScore: number;
  status: "waiting" | "thinking" | "complete" | "error";
  color: string;
  feedback?: string;
}

export function AgentCard({
  name,
  icon,
  description,
  score,
  maxScore,
  status,
  color,
  feedback,
}: AgentCardProps) {
  const Icon = iconMap[icon] || Target;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: status === "complete" ? 1.02 : 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "bg-white rounded-xl border p-4 transition-all duration-300",
        status === "complete" 
          ? "border-[#E8D5C4] shadow-lg hover:shadow-xl" 
          : status === "thinking"
          ? "border-[#E8D5C4]/50 shadow-md"
          : "border-[#E5E5E0] shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={
            status === "thinking"
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{ duration: 0.5, repeat: status === "thinking" ? Infinity : 0 }}
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-[#2D2D2D] text-sm">{name}</h4>
            <AnimatePresence mode="wait">
              {status === "complete" && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-5 h-5 rounded-full bg-[#A8C5A8] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
              {status === "thinking" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="w-4 h-4 text-[#8A8A8A] animate-spin" />
                </motion.div>
              )}
              {status === "waiting" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="w-2 h-2 rounded-full bg-[#E5E5E0]"
                />
              )}
            </AnimatePresence>
          </div>
          
          <p className="text-[#8A8A8A] text-xs mt-1">{description}</p>

          <AnimatePresence>
            {status === "complete" && feedback && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[#5A5A5A] text-xs mt-2 leading-relaxed"
              >
                {feedback}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === "complete" && score !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-3 flex items-center gap-3"
              >
                <div className="flex-1 h-2 bg-[#F0F0EC] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / maxScore) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: color }}
                  >
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-sm font-bold text-[#2D2D2D] min-w-[2rem] text-right"
                >
                  {score.toFixed(1)}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {status === "thinking" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 flex items-center gap-1.5"
              >
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-[#8A8A8A] ml-1">Analyzing...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
