"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, BarChart3 } from "lucide-react";

interface ScoreCardProps {
  overallScore: number;
  band?: string;
  grade?: string;
  totalExaminers: number;
  completedExaminers: number;
}

export function ScoreCard({ overallScore, band, grade, totalExaminers, completedExaminers }: ScoreCardProps) {
  const progress = (completedExaminers / totalExaminers) * 100;
  const displayLabel = grade || band || overallScore.toFixed(1);
  const isGrade = !!grade;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] rounded-2xl p-6 text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#E8D5C4]" />
          <span className="font-medium">Overall Score</span>
        </div>
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <BarChart3 className="w-4 h-4" />
          <span>{completedExaminers}/{totalExaminers} Examiners</span>
        </div>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold"
        >
          {displayLabel}
        </motion.span>
        {!isGrade && <span className="text-white/60 mb-2">/ 9.0</span>}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Grading Progress</span>
          <span className="text-white/80">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full gradient-primary"
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-[#A8C5A8] mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-semibold">{overallScore.toFixed(1)}</span>
          <p className="text-white/50 text-xs mt-1">Average</p>
        </div>
        <div className="text-center border-x border-white/10">
          <span className="text-2xl font-semibold text-[#E8D5C4]">{displayLabel}</span>
          <p className="text-white/50 text-xs mt-1">{isGrade ? "Grade" : "Band"}</p>
        </div>
        <div className="text-center">
          <span className="text-2xl font-semibold text-[#A8C5D4]">{completedExaminers}</span>
          <p className="text-white/50 text-xs mt-1">Complete</p>
        </div>
      </div>
    </motion.div>
  );
}
