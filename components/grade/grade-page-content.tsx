"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSubjectStore } from "@/stores/subject-store";
import { ThreePanel } from "@/components/layout/ThreePanel";
import {
  Send,
  Loader2,
  Save,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  Award,
  BarChart3,
  Zap,
  Target,
  Globe,
  Lightbulb,
  ArrowLeft,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  economicsExaminers,
  getQuestionTypeConfig,
  calculateGrade,
  requiresDiagram,
  getDiagramFeedback,
  type QuestionType,
  type UnitCode
} from "@/lib/examiners/economics-config";

// Unit configuration
const UNITS: { code: UnitCode; name: string; icon: typeof TrendingUp }[] = [
  { code: "WEC11", name: "Unit 1: Markets in Action", icon: TrendingUp },
  { code: "WEC12", name: "Unit 2: Macroeconomic Performance", icon: BarChart3 },
  { code: "WEC13", name: "Unit 3: Business Behaviour", icon: Target },
  { code: "WEC14", name: "Unit 4: Global Economy", icon: Globe },
];

// Question type configuration
const QUESTION_TYPES: { type: QuestionType; marks: number; name: string }[] = [
  { type: "4-mark", marks: 4, name: "4 Mark Question" },
  { type: "6-mark", marks: 6, name: "6 Mark Question" },
  { type: "8-mark", marks: 8, name: "8 Mark Question" },
  { type: "10-mark", marks: 10, name: "10 Mark Question" },
  { type: "12-mark", marks: 12, name: "12 Mark Essay" },
  { type: "14-mark", marks: 14, name: "14 Mark Essay" },
  { type: "16-mark", marks: 16, name: "16 Mark Essay" },
  { type: "20-mark", marks: 20, name: "20 Mark Essay" },
];

// Examiner score interface
interface ExaminerScore {
  examinerId: string;
  examinerName: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
  ao: string;
  color: string;
}

// Grading result interface
interface GradingResult {
  overallScore: number;
  grade: string;
  examiners: ExaminerScore[];
  summary: string;
  improvements: string[];
  questionType: string;
  unit: string;
  diagramFeedback?: string;
}

interface GradePageContentProps {
  userId: string;
}

export function GradePageContent({ userId }: GradePageContentProps) {
  const router = useRouter();
  const { currentSubject } = useSubjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<UnitCode>("WEC11");
  const [selectedType, setSelectedType] = useState<QuestionType>("14-mark");
  const [hasDiagram, setHasDiagram] = useState(false);
  const [diagramFile, setDiagramFile] = useState<File | null>(null);

  // UI state
  const [isGrading, setIsGrading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [expandedExaminer, setExpandedExaminer] = useState<string | null>(null);

  // Handle grading submission
  const handleGrade = useCallback(async () => {
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
          hasDiagram,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to grade");
      }

      const data: GradingResult = await response.json();
      
      // Add diagram feedback if needed
      const diagramRequired = requiresDiagram(selectedType);
      const diagramFeedback = getDiagramFeedback(selectedType, hasDiagram);
      
      setResult({
        ...data,
        diagramFeedback: diagramRequired && !hasDiagram ? diagramFeedback : undefined
      });
      
      toast.success("Grading complete!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to grade. Please try again.");
    } finally {
      setIsGrading(false);
    }
  }, [question, essay, currentSubject, selectedUnit, selectedType, hasDiagram]);

  // Handle saving the graded essay
  const handleSave = useCallback(async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          content: essay,
          subject: currentSubject,
          questionType: selectedType,
          marks: parseInt(selectedType.split("-")[0]),
          overallScore: result.overallScore,
          grade: result.grade,
          feedback: result.summary,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast.success("Response saved to your library!");
    } catch (error) {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [result, question, essay, currentSubject, selectedType]);

  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max 5MB.");
        return;
      }
      setDiagramFile(file);
      setHasDiagram(true);
      toast.success("Diagram uploaded successfully");
    }
  }, []);

  // Remove diagram
  const removeDiagram = useCallback(() => {
    setDiagramFile(null);
    setHasDiagram(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setQuestion("");
    setEssay("");
    setResult(null);
    setHasDiagram(false);
    setDiagramFile(null);
    setExpandedExaminer(null);
  }, []);

  // Get score color based on percentage
  const getScoreColor = useCallback((score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-emerald-500";
    if (percentage >= 0.6) return "text-amber-500";
    return "text-rose-500";
  }, []);

  // Get grade color
  const getGradeColor = useCallback((grade: string) => {
    if (grade === "A*" || grade === "A") return "text-emerald-500";
    if (grade === "B" || grade === "C") return "text-amber-500";
    return "text-rose-500";
  }, []);

  return (
    <ThreePanel>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI Response Grading</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Get detailed feedback from 4 specialized AI examiners based on official Edexcel IAL mark schemes
          </p>
        </motion.header>

        {/* Results View */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Score Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Overall Result</h2>
                    <p className="text-muted-foreground">Based on feedback from 4 AI examiners</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      New
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score */}
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <div className={cn("text-5xl font-bold", getGradeColor(result.grade))}>
                      {result.overallScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Overall Score / 10</div>
                  </div>

                  {/* Grade */}
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <div className={cn("text-5xl font-bold", getGradeColor(result.grade))}>
                      {result.grade}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Grade</div>
                  </div>

                  {/* Question Type */}
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <div className="text-5xl font-bold text-foreground">
                      {result.questionType}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Question Type</div>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="mt-6 p-4 bg-accent/10 rounded-xl">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Summary
                    </h3>
                    <p className="text-muted-foreground">{result.summary}</p>
                  </div>
                )}

                {/* Diagram Feedback */}
                {result.diagramFeedback && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Diagram Required
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300">{result.diagramFeedback}</p>
                  </div>
                )}

                {/* Improvements */}
                {result.improvements.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-accent" />
                      Key Improvements
                    </h3>
                    <ul className="space-y-2">
                      {result.improvements.map((improvement, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-sm font-medium text-accent">
                            {index + 1}
                          </span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Examiner Feedback */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Detailed Feedback</h2>
                {result.examiners.map((examiner) => (
                  <motion.div
                    key={examiner.examinerId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedExaminer(
                        expandedExaminer === examiner.examinerId ? null : examiner.examinerId
                      )}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${examiner.color}30` }}
                        >
                          <BookOpen className="w-5 h-5" style={{ color: examiner.color }} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground">{examiner.examinerName}</h3>
                          <p className="text-sm text-muted-foreground">{examiner.ao}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn("text-xl font-bold", getScoreColor(examiner.score, examiner.maxScore))}>
                          {examiner.score}/{examiner.maxScore}
                        </div>
                        {expandedExaminer === examiner.examinerId ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedExaminer === examiner.examinerId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 border-t border-border">
                            <p className="text-muted-foreground mb-4">{examiner.feedback}</p>
                            {examiner.criteria.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Strengths</h4>
                                <ul className="space-y-1">
                                  {examiner.criteria.map((criterion, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
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
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Input Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Unit
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value as UnitCode)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit.code} value={unit.code}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Question Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as QuestionType)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  >
                    {QUESTION_TYPES.map((qt) => (
                      <option key={qt.type} value={qt.type}>
                        {qt.name} ({qt.marks} marks)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Input */}
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Paste your exam question here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
                />
              </div>

              {/* Response Input */}
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Response
                </label>
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder="Write your response here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
                />
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  {essay.length} characters
                </div>
              </div>

              {/* Diagram Upload */}
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Diagram (Optional)
                </label>
                {diagramFile ? (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <ImageIcon className="w-5 h-5 text-accent" />
                    <span className="flex-1 text-sm text-foreground truncate">
                      {diagramFile.name}
                    </span>
                    <button
                      onClick={removeDiagram}
                      className="p-1 hover:bg-background rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-5 h-5" />
                      Upload Diagram (Max 5MB)
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleGrade}
                disabled={isGrading || !question.trim() || !essay.trim()}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Grading with AI Examiners...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Grade My Response
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}
