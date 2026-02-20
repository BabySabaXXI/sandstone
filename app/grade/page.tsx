"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEssayStore } from "@/stores/essay-store";
import { useSubjectStore } from "@/stores/subject-store";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { 
  Send, Loader2, Save, BookOpen, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, TrendingUp, FileText, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// Economics units
const units = [
  { code: "WEC11", name: "Unit 1: Markets in Action", topics: ["Microeconomics", "Market Failure", "Government Intervention"] },
  { code: "WEC12", name: "Unit 2: Macroeconomic Performance", topics: ["AD/AS", "Economic Growth", "Policy"] },
  { code: "WEC13", name: "Unit 3: Business Behaviour", topics: ["Market Structures", "Costs", "Labour Markets"] },
  { code: "WEC14", name: "Unit 4: Global Economy", topics: ["Globalisation", "Development", "Trade"] },
];

// Question types with marks
const questionTypes = [
  { type: "4-mark", marks: 4, name: "4 Mark Question", time: 5 },
  { type: "6-mark", marks: 6, name: "6 Mark Question", time: 8 },
  { type: "8-mark", marks: 8, name: "8 Mark Question", time: 12 },
  { type: "14-mark", marks: 14, name: "14 Mark Essay", time: 22 },
  { type: "20-mark", marks: 20, name: "20 Mark Essay", time: 35 },
];

interface ExaminerScore {
  examinerId: string;
  examinerName: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
  ao: string;
}

interface GradingResult {
  overallScore: number;
  grade: string;
  examiners: ExaminerScore[];
  summary: string;
  improvements: string[];
  questionType: string;
  unit: string;
}

export default function GradePage() {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { createEssay } = useEssayStore();
  const router = useRouter();
  
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("WEC11");
  const [selectedType, setSelectedType] = useState("14-mark");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [expandedExaminer, setExpandedExaminer] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGrade = async () => {
    if (!question.trim() || !essay.trim()) {
      toast.error("Please enter both a question and your response");
      return;
    }

    setIsGrading(true);
    setResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          essay,
          subject: currentSubject,
          unit: selectedUnit,
          questionType: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade essay");
      }

      const data = await response.json();
      setResult(data);
      toast.success("Grading complete!");
    } catch (error) {
      toast.error("Failed to grade. Please try again.");
      console.error(error);
    } finally {
      setIsGrading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      await createEssay(
        question,
        essay,
        currentSubject,
        selectedType,
        parseInt(selectedType.split("-")[0])
      );
      toast.success("Response saved to your library!");
    } catch (error) {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-green-600 dark:text-green-400";
    if (percentage >= 0.6) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A*" || grade === "A") return "text-green-600 dark:text-green-400";
    if (grade === "B" || grade === "C") return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <ThreePanel>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">AI Response Grading</h1>
          <p className="text-muted-foreground">
            Get detailed feedback from AI examiners based on Pearson Edexcel IAL mark schemes
          </p>
        </div>

        {/* Configuration */}
        {!result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {units.map((unit) => (
                  <option key={unit.code} value={unit.code}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Question Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {questionTypes.map((qt) => (
                  <option key={qt.type} value={qt.type}>
                    {qt.name} ({qt.marks} marks, ~{qt.time} min)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Input Form */}
        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your exam question here..."
                className="w-full h-24 px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Response</label>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Write your response here..."
                className="w-full h-80 px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Word count: {essay.split(/\s+/).filter(w => w.length > 0).length}
              </p>
            </div>

            <button
              onClick={handleGrade}
              disabled={isGrading || !question.trim() || !essay.trim()}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Grading with AI Examiners...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Get Feedback
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-accent text-accent-foreground py-3 rounded-xl hover:bg-accent/90 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save to Library
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setEssay("");
                    setQuestion("");
                  }}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl hover:bg-secondary/80 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Grade Another
                </button>
              </div>

              {/* Overall Score */}
              <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-semibold text-foreground mb-1">Overall Assessment</h2>
                    <p className="text-muted-foreground">{selectedUnit} • {selectedType} question</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className={cn("text-5xl font-bold", getGradeColor(result.grade))}>
                        {result.grade}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Grade</div>
                    </div>
                    <div className="w-px h-16 bg-border" />
                    <div className="text-center">
                      <div className="text-5xl font-bold text-foreground">
                        {result.overallScore.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">/ 10</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {result.summary && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Examiner Summary
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground whitespace-pre-wrap">{result.summary}</p>
                  </div>
                </div>
              )}

              {/* Individual Examiner Feedback */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Detailed Feedback by Examiner</h3>
                {result.examiners.map((examiner) => (
                  <div
                    key={examiner.examinerId}
                    className="bg-card border border-border rounded-xl shadow-soft overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedExaminer(
                        expandedExaminer === examiner.examinerId ? null : examiner.examinerId
                      )}
                      className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("text-2xl font-bold", getScoreColor(examiner.score, examiner.maxScore))}>
                          {examiner.score}/{examiner.maxScore}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">{examiner.examinerName}</div>
                          <div className="text-sm text-muted-foreground">AO: {examiner.ao}</div>
                        </div>
                      </div>
                      {expandedExaminer === examiner.examinerId ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedExaminer === examiner.examinerId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-medium text-foreground mb-2">Feedback</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {examiner.feedback}
                              </p>
                            </div>
                            {examiner.criteria.length > 0 && (
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Strengths</h4>
                                <ul className="space-y-1">
                                  {examiner.criteria.map((criterion, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      {criterion}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {result.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}
