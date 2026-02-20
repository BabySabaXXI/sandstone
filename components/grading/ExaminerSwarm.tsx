"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { examiners } from "@/lib/examiners/config";
import { AgentCard } from "./AgentCard";
import { ScoreCard } from "./ScoreCard";
import { ExaminerScore, GradingResult } from "@/types";
import { Sparkles, Brain, Zap } from "lucide-react";

interface ExaminerSwarmProps {
  essay: string;
  question: string;
  onComplete?: (result: GradingResult) => void;
  onGenerating?: (generating: boolean) => void;
}

type ExaminerStatus = "waiting" | "thinking" | "complete" | "error";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function ExaminerSwarm({ essay, question, onComplete, onGenerating }: ExaminerSwarmProps) {
  const [statuses, setStatuses] = useState<Record<string, ExaminerStatus>>(
    Object.fromEntries(examiners.map((e) => [e.id, "waiting"]))
  );
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const completedCount = Object.values(statuses).filter((s) => s === "complete").length;
  const progress = (completedCount / examiners.length) * 100;

  // Reset state when essay changes
  useEffect(() => {
    if (!essay) return;
    
    setStatuses(Object.fromEntries(examiners.map((e) => [e.id, "waiting"])));
    setScores({});
    setFeedbacks({});
    setIsComplete(false);
    setIsGenerating(true);
    setShowCelebration(false);
    onGenerating?.(true);

    // Simulate grading process with improved timing
    const runGrading = async () => {
      const individualExaminers = examiners.filter((e) => e.id !== "consensus");
      
      for (let i = 0; i < individualExaminers.length; i++) {
        const examiner = individualExaminers[i];
        
        // Set thinking state with staggered delay
        await new Promise((resolve) => setTimeout(resolve, i === 0 ? 500 : 1200));
        
        setStatuses((prev) => ({ ...prev, [examiner.id]: "thinking" }));

        // Simulate processing time with variation
        const processingTime = 1500 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Generate score with some randomness but consistent range
        const baseScore = 6;
        const score = baseScore + Math.random() * 2.5 + (i % 3) * 0.3;
        const clampedScore = Math.min(9, Math.max(4, score));

        setScores((prev) => ({ ...prev, [examiner.id]: clampedScore }));
        setFeedbacks((prev) => ({
          ...prev,
          [examiner.id]: generateFeedback(examiner.id, clampedScore),
        }));
        setStatuses((prev) => ({ ...prev, [examiner.id]: "complete" }));
      }

      // Consensus examiner with dramatic pause
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatuses((prev) => ({ ...prev, consensus: "thinking" }));
      
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Calculate consensus score
      const individualScores = Object.entries(scores)
        .filter(([id]) => id !== "consensus")
        .map(([, score]) => score);
      
      const avgScore = individualScores.length > 0
        ? individualScores.reduce((a, b) => a + b, 0) / individualScores.length
        : 6.5;

      setScores((prev) => ({ ...prev, consensus: avgScore }));
      setStatuses((prev) => ({ ...prev, consensus: "complete" }));
      setIsComplete(true);
      setIsGenerating(false);
      setShowCelebration(true);
      onGenerating?.(false);

      // Build final result
      const result: GradingResult = {
        overallScore: avgScore,
        band: avgScore.toFixed(1),
        examiners: examiners.map((e) => ({
          name: e.name,
          score: scores[e.id] || avgScore,
          maxScore: 9,
          feedback: feedbacks[e.id] || generateFeedback(e.id, avgScore),
          criteria: e.criteria,
        })),
        annotations: generateAnnotations(essay),
        summary: generateSummary(avgScore),
        improvements: generateImprovements(avgScore),
      };

      onComplete?.(result);
    };

    runGrading();
  }, [essay, question]);

  const generateFeedback = (examinerId: string, score: number): string => {
    const feedbacks: Record<string, string[]> = {
      "task-response": [
        "Addresses the task well with a clear position throughout.",
        "All parts of the prompt are addressed with relevant examples.",
        "Good task response with room for more developed arguments.",
      ],
      coherence: [
        "Well-organized essay with clear paragraph structure.",
        "Good use of cohesive devices linking ideas effectively.",
        "Logical progression of ideas with clear introduction and conclusion.",
      ],
      lexical: [
        "Good range of vocabulary with some less common items.",
        "Effective word choice with appropriate collocations.",
        "Adequate vocabulary range, could use more sophisticated terms.",
      ],
      grammar: [
        "Variety of complex structures used accurately.",
        "Good grammatical control with minor errors.",
        "Adequate range of structures, work on complex sentences.",
      ],
      style: [
        "Appropriate academic register maintained throughout.",
        "Formal tone with consistent academic style.",
        "Generally appropriate style with some inconsistencies.",
      ],
      consensus: [
        "Overall strong performance across all criteria.",
        "Good essay with clear areas for improvement identified.",
        "Solid foundation with potential for higher band score.",
      ],
    };

    const examinerFeedbacks = feedbacks[examinerId] || feedbacks.consensus;
    const index = Math.floor((score / 9) * examinerFeedbacks.length);
    return examinerFeedbacks[Math.min(index, examinerFeedbacks.length - 1)];
  };

  const generateSummary = (score: number): string => {
    if (score >= 7.5) return "This essay demonstrates a strong command of academic writing with well-developed arguments and sophisticated language use.";
    if (score >= 6.5) return "This essay shows good writing skills with clear organization and adequate vocabulary, though some areas need refinement.";
    if (score >= 5.5) return "This essay demonstrates adequate writing ability but requires improvement in organization, vocabulary range, and grammatical accuracy.";
    return "This essay shows basic writing competence but needs significant improvement in multiple areas to achieve a higher band score.";
  };

  const generateImprovements = (score: number): string[] => {
    const improvements = [
      "Practice using more sophisticated vocabulary and academic collocations",
      "Work on developing complex sentence structures with subordinate clauses",
      "Ensure consistent use of formal academic register throughout",
      "Strengthen the logical flow between paragraphs with better transitions",
      "Provide more specific examples to support your main arguments",
    ];
    
    return score >= 7 ? improvements.slice(0, 3) : improvements;
  };

  const generateAnnotations = (essay: string) => {
    // Simple annotation generation based on essay content
    const annotations = [];
    const sentences = essay.split(/[.!?]+/);
    
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i];
      if (sentence.length > 30) {
        annotations.push({
          id: crypto.randomUUID(),
          type: i === 0 ? "positive" : i === 1 ? "vocabulary" : "grammar",
          start: essay.indexOf(sentence),
          end: essay.indexOf(sentence) + sentence.length,
          message: i === 0 ? "Strong opening statement" : i === 1 ? "Consider using more academic vocabulary" : "Good use of complex structure",
          suggestion: i === 1 ? "Consider: 'significant challenge' instead of 'big problem'" : undefined,
        });
      }
    }
    
    return annotations;
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / (Object.values(scores).length || 1);

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <AnimatePresence>
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-5 h-5 text-[#E8D5C4]" />
              </motion.div>
              <span className="text-sm text-[#5A5A5A]">
                {isGenerating ? "AI Examiners analyzing..." : "Analysis complete"}
              </span>
            </div>
            <span className="text-sm font-medium text-[#2D2D2D]">
              {completedCount}/{examiners.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="h-1 bg-[#F0F0EC] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E8D5C4] to-[#A8C5A8]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Score Card */}
      <AnimatePresence>
        {completedCount > 0 && (
          <ScoreCard
            overallScore={overallScore}
            band={overallScore.toFixed(1)}
            totalExaminers={examiners.length}
            completedExaminers={completedCount}
          />
        )}
      </AnimatePresence>

      {/* Agent Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {examiners.map((examiner) => (
          <motion.div key={examiner.id} variants={itemVariants}>
            <AgentCard
              name={examiner.name}
              icon={examiner.icon}
              description={examiner.description}
              score={scores[examiner.id]}
              maxScore={9}
              status={statuses[examiner.id]}
              color={examiner.color}
              feedback={feedbacks[examiner.id]}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden"
          >
            {/* Celebration particles */}
            <AnimatePresence>
              {showCelebration && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 1, 
                        scale: 0,
                        x: "50%",
                        y: "50%",
                      }}
                      animate={{ 
                        opacity: 0, 
                        scale: 1.5,
                        x: `${50 + (Math.random() - 0.5) * 200}%`,
                        y: `${50 + (Math.random() - 0.5) * 100}%`,
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: ["#E8D5C4", "#A8C5A8", "#A8C5D4", "#E5C9A8"][i % 4],
                        left: "50%",
                        top: "50%",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            <div className="bg-gradient-to-r from-[#A8C5A8]/20 to-[#E8D5C4]/20 border border-[#A8C5A8] rounded-xl p-5 text-center relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-12 h-12 bg-[#A8C5A8] rounded-full flex items-center justify-center mx-auto mb-3"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-[#2D2D2D] font-semibold text-lg">Grading Complete!</h3>
              <p className="text-[#5A5A5A] text-sm mt-1">
                All {examiners.length} AI examiners have finished evaluating your essay.
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#E8D5C4]" />
                  <span className="text-[#5A5A5A]">{examiners.length - 1} criteria analyzed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-[#A8C5D4]" />
                  <span className="text-[#5A5A5A]">Consensus reached</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
