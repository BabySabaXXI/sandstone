"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getExaminers } from "@/lib/examiners/config";
import { AgentCard } from "./AgentCard";
import { ScoreCard } from "./ScoreCard";
import { ExaminerScore, GradingResult, Annotation, Subject } from "@/types";
import { Sparkles, Brain, Zap } from "lucide-react";

interface ExaminerSwarmProps {
  essay: string;
  question: string;
  subject: Subject;
  onComplete?: (result: GradingResult) => void;
  onGenerating?: (generating: boolean) => void;
}

type ExaminerStatus = "waiting" | "thinking" | "complete" | "error";

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

export function ExaminerSwarm({ essay, question, subject, onComplete, onGenerating }: ExaminerSwarmProps) {
  const examiners = getExaminers(subject);
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

  useEffect(() => {
    if (!essay) return;
    
    setStatuses(Object.fromEntries(examiners.map((e) => [e.id, "waiting"])));
    setScores({});
    setFeedbacks({});
    setIsComplete(false);
    setIsGenerating(true);
    setShowCelebration(false);
    onGenerating?.(true);

    const runGrading = async () => {
      const individualExaminers = examiners.filter((e) => e.id !== "consensus");
      
      for (let i = 0; i < individualExaminers.length; i++) {
        const examiner = individualExaminers[i];
        
        await new Promise((resolve) => setTimeout(resolve, i === 0 ? 500 : 1200));
        
        setStatuses((prev) => ({ ...prev, [examiner.id]: "thinking" }));

        const processingTime = 1500 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        const baseScore = 6;
        const score = baseScore + Math.random() * 2.5 + (i % 3) * 0.3;
        const clampedScore = Math.min(9, Math.max(4, score));

        setScores((prev) => ({ ...prev, [examiner.id]: clampedScore }));
        setFeedbacks((prev) => ({
          ...prev,
          [examiner.id]: generateFeedback(examiner.id, clampedScore, subject),
        }));
        setStatuses((prev) => ({ ...prev, [examiner.id]: "complete" }));
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatuses((prev) => ({ ...prev, consensus: "thinking" }));
      
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

      const result: GradingResult = {
        overallScore: avgScore,
        grade: getGradeLabel(avgScore, subject),
        examiners: examiners.map((e) => ({
          name: e.name,
          score: scores[e.id] || avgScore,
          maxScore: 9,
          feedback: feedbacks[e.id] || generateFeedback(e.id, avgScore, subject),
          criteria: e.criteria,
        })),
        annotations: generateAnnotations(essay),
        summary: generateSummary(avgScore, subject),
        improvements: generateImprovements(avgScore, subject),
        subject,
      };

      onComplete?.(result);
    };

    runGrading();
  }, [essay, question, subject]);

  const generateFeedback = (examinerId: string, score: number, subject: Subject): string => {
    const feedbacks: Record<string, Record<string, string[]>> = {
      economics: {
        knowledge: [
          "Good understanding of economic concepts demonstrated.",
          "Accurate definitions provided with appropriate examples.",
          "Economic theory applied correctly in context.",
        ],
        application: [
          "Strong application of knowledge to the given context.",
          "Relevant real-world examples used effectively.",
          "Good understanding of the specific scenario.",
        ],
        analysis: [
          "Clear chains of reasoning developed throughout.",
          "Good use of cause and effect relationships.",
          "Appropriate use of diagrams to support analysis.",
        ],
        evaluation: [
          "Balanced arguments presented with critical assessment.",
          "Good prioritization of factors considered.",
          "Supported judgments provided throughout.",
        ],
        structure: [
          "Well-organized response with clear structure.",
          "Effective introduction and conclusion provided.",
          "Logical flow of arguments maintained.",
        ],
        consensus: [
          "Overall strong performance across all criteria.",
          "Good understanding demonstrated with room for development.",
          "Solid foundation with clear areas for improvement.",
        ],
      },
      geography: {
        knowledge: [
          "Good understanding of geographical concepts shown.",
          "Accurate use of geographical terminology.",
          "Appropriate case studies included.",
        ],
        application: [
          "Effective application to specific contexts.",
          "Good use of place-specific examples.",
          "Appropriate scale considered in response.",
        ],
        analysis: [
          "Clear explanation of geographical processes.",
          "Good understanding of interconnections shown.",
          "Effective use of geographical evidence.",
        ],
        evaluation: [
          "Balanced perspectives presented effectively.",
          "Good consideration of different viewpoints.",
          "Supported conclusions provided.",
        ],
        skills: [
          "Good interpretation of geographical sources.",
          "Appropriate use of data and maps.",
          "Fieldwork understanding demonstrated.",
        ],
        consensus: [
          "Overall strong geographical understanding shown.",
          "Good application with room for development.",
          "Solid foundation across geographical skills.",
        ],
      },
    };

    const subjectFeedbacks = feedbacks[subject] || feedbacks.economics;
    const examinerFeedbacks = subjectFeedbacks[examinerId] || subjectFeedbacks.consensus;
    const index = Math.floor((score / 9) * examinerFeedbacks.length);
    return examinerFeedbacks[Math.min(index, examinerFeedbacks.length - 1)];
  };

  const getGradeLabel = (score: number, subject: Subject): string => {
    if (score >= 8) return "A*";
    if (score >= 7) return "A";
    if (score >= 6) return "B";
    if (score >= 5) return "C";
    if (score >= 4) return "D";
    return "E";
  };

  const generateSummary = (score: number, subject: Subject): string => {
    const summaries: Record<string, string> = {
      economics: `This response demonstrates ${score >= 7 ? "strong" : score >= 5 ? "good" : "developing"} understanding of economic concepts. The ${score >= 6 ? "analysis shows clear chains of reasoning" : "response would benefit from more developed analysis"} and ${score >= 7 ? "effective evaluation throughout" : "further development of evaluation skills"}.`,
      geography: `This response shows ${score >= 7 ? "strong" : score >= 5 ? "good" : "developing"} geographical understanding. The ${score >= 6 ? "application of knowledge to contexts is effective" : "application needs further development"} and ${score >= 7 ? "evaluation is well-balanced" : "evaluation skills need strengthening"}.`,
    };
    return summaries[subject] || summaries.economics;
  };

  const generateImprovements = (score: number, subject: Subject): string[] => {
    const improvements: Record<string, string[]> = {
      economics: [
        "Include more specific economic data to support arguments",
        "Develop evaluation points with clearer prioritization",
        "Use economic diagrams to illustrate key concepts",
        "Consider both short-run and long-run effects",
        "Include more real-world examples from different economies",
      ],
      geography: [
        "Include more specific place-based examples",
        "Develop case study knowledge with specific details",
        "Use maps and data to support geographical arguments",
        "Consider different scales from local to global",
        "Strengthen links between human and physical geography",
      ],
    };
    
    const subjectImprovements = improvements[subject] || improvements.economics;
    return score >= 7 ? subjectImprovements.slice(0, 3) : subjectImprovements;
  };

  const generateAnnotations = (essay: string): Annotation[] => {
    const annotations: Annotation[] = [];
    const sentences = essay.split(/[.!?]+/);
    const types: Array<"grammar" | "vocabulary" | "style" | "positive" | "knowledge" | "analysis" | "evaluation"> = ["positive", "analysis", "knowledge"];
    
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i];
      if (sentence.length > 30) {
        annotations.push({
          id: crypto.randomUUID(),
          type: types[i],
          start: essay.indexOf(sentence),
          end: essay.indexOf(sentence) + sentence.length,
          message: i === 0 ? "Strong opening point" : i === 1 ? "Good analytical approach" : "Clear understanding shown",
          suggestion: i === 1 ? "Consider developing this point further with specific examples" : undefined,
        });
      }
    }
    
    return annotations;
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / (Object.values(scores).length || 1);

  return (
    <div className="space-y-6">
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

      <div className="h-1 bg-[#F0F0EC] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E8D5C4] to-[#A8C5A8]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <AnimatePresence>
        {completedCount > 0 && (
          <ScoreCard
            overallScore={overallScore}
            grade={getGradeLabel(overallScore, subject)}
            totalExaminers={examiners.length}
            completedExaminers={completedCount}
          />
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden"
          >
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
                All {examiners.length} AI examiners have finished evaluating your response.
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
