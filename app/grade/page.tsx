"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useEssayStore } from "@/stores/essay-store";
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
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  economicsExaminers,
  caseStudies,
  getQuestionTypeConfig,
  calculateGrade,
  requiresDiagram,
  getDiagramFeedback,
  type QuestionType,
  type UnitCode
} from "@/lib/examiners/economics-config";

const units: { code: UnitCode; name: string; icon: string }[] = [
  { code: "WEC11", name: "Unit 1: Markets in Action", icon: "TrendingUp" },
  { code: "WEC12", name: "Unit 2: Macroeconomic Performance", icon: "BarChart3" },
  { code: "WEC13", name: "Unit 3: Business Behaviour", icon: "Target" },
  { code: "WEC14", name: "Unit 4: Global Economy", icon: "Globe" },
];

const questionTypes = [
  { type: "4-mark", marks: 4, name: "4 Mark Question" },
  { type: "6-mark", marks: 6, name: "6 Mark Question" },
  { type: "8-mark", marks: 8, name: "8 Mark Question" },
  { type: "14-mark", marks: 14, name: "14 Mark Essay" },
  { type: "20-mark", marks: 20, name: "20 Mark Essay" },
];

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

export default function GradePage() {
  const { user } = useAuth();
  const { currentSubject } = useSubjectStore();
  const { createEssay } = useEssayStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<UnitCode>("WEC11");
  const [selectedType, setSelectedType] = useState<QuestionType>("14-mark");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [expandedExaminer, setExpandedExaminer] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  const [diagramFile, setDiagramFile] = useState<File | null>(null);
  const [hasDiagram, setHasDiagram] = useState(false);

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
          hasDiagram,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to grade");
      }

      const data = await response.json();
      
      // Add diagram feedback
      const diagramRequired = requiresDiagram(selectedType);
      const diagramFeedback = getDiagramFeedback(selectedType, hasDiagram);
      
      setResult({
        ...data,
        diagramFeedback: diagramRequired && !hasDiagram ? diagramFeedback : undefined
      });
      
      toast.success("Grading complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to grade. Please try again.");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const removeDiagram = () => {
    setDiagramFile(null);
    setHasDiagram(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return "text-emerald-500";
    if (percentage >= 0.6) return "text-amber-500";
    return "text-rose-500";
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A*" || grade === "A") return "text-emerald-500";
    if (grade === "B" || grade === "C") return "text-amber-500";
    return "text-rose-500";
  };

  const getExaminerIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen": return <BookOpen className="w-5 h-5" />;
      case "Globe": return <BarChart3 className="w-5 h-5" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5" />;
      case "Scale": return <Target className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <ThreePanel>
      <div className="max-w-5xl mx-auto">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">AI Response Grading</h1>
          </div>
          <p className="text-muted-foreground">
            Get detailed feedback from 4 specialized AI examiners based on official Edexcel IAL mark schemes
          </p>
        </motion.div>

        {/* Configuration Cards */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          >
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-medium text-foreground mb-2">Unit</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value as UnitCode)}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                {units.map((unit) => (
                  <option key={unit.code} value={unit.code}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-medium text-foreground mb-2">Question Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as QuestionType)}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                {questionTypes.map((qt) => (
                  <option key={qt.type} value={qt.type}>
                    {qt.name} ({qt.marks} marks)
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Input Form */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-medium text-foreground mb-2">Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Paste your exam question here..."
                className="w-full h-24 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
              />
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-medium text-foreground mb-2">Your Response</label>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Write your response here..."
                className="w-full h-64 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Words: {essay.split(/\s+/).filter(w => w.length > 0).length}
                </p>
                {requiresDiagram(selectedType) && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Diagram recommended for {selectedType} questions
                  </p>
                )}
              </div>
            </div>

            {/* Diagram Upload */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Diagram Upload
                </label>
                <span className="text-xs text-muted-foreground">Optional but recommended</span>
              </div>
              
              {!diagramFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload diagram</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{diagramFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(diagramFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={removeDiagram}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Case Studies Toggle */}
            <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <button
                onClick={() => setShowCaseStudies(!showCaseStudies)}
                className="flex items-center justify-between w-full"
              >
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Available Case Studies
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showCaseStudies && "rotate-180")} />
              </button>
              <AnimatePresence>
                {showCaseStudies && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-amber-500/20 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(caseStudies).map(([category, studies]) => 
                        Object.entries(studies as Record<string, any>).map(([key, study]) => (
                          <div key={key} className="text-xs p-2 bg-background rounded border border-border">
                            <p className="font-medium text-foreground">{(study as any).title}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleGrade}
              disabled={isGrading || !question.trim() || !essay.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="animate-pulse">AI Examiners Analyzing...</span>
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

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save to Library
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setResult(null);
                    setEssay("");
                    setQuestion("");
                    setDiagramFile(null);
                    setHasDiagram(false);
                  }}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl hover:bg-secondary/80 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Grade Another
                </motion.button>
              </div>

              {/* Overall Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-8"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Overall Assessment</h2>
                    <p className="text-muted-foreground">{selectedUnit} • {selectedType}</p>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                        className={cn("text-6xl font-bold", getGradeColor(result.grade))}
                      >
                        {result.grade}
                      </motion.div>
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
              </motion.div>

              {/* Diagram Feedback */}
              {result.diagramFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700 dark:text-rose-300">{result.diagramFeedback}</p>
                </motion.div>
              )}

              {/* Summary */}
              {result.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Examiner Summary
                  </h3>
                  <p className="text-foreground leading-relaxed">{result.summary}</p>
                </motion.div>
              )}

              {/* Examiner Swarm */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Examiner Swarm Analysis
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {result.examiners.map((examiner, index) => (
                    <motion.div
                      key={examiner.examinerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedExaminer(
                          expandedExaminer === examiner.examinerId ? null : examiner.examinerId
                        )}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${examiner.color}20`, color: examiner.color }}
                          >
                            {getExaminerIcon(economicsExaminers.find(e => e.id === examiner.examinerId)?.icon || "Zap")}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{examiner.examinerName}</div>
                            <div className="text-xs text-muted-foreground">AO: {examiner.ao}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn("text-2xl font-bold", getScoreColor(examiner.score, examiner.maxScore))}>
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
                            className="border-t border-border"
                          >
                            <div className="p-4 space-y-4">
                              <div>
                                <h4 className="font-medium text-foreground mb-2">Feedback</h4>
                                <p className="text-sm text-muted-foreground">{examiner.feedback}</p>
                              </div>
                              {examiner.criteria.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-foreground mb-2">Strengths</h4>
                                  <ul className="space-y-1">
                                    {examiner.criteria.map((criterion, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
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
              </div>

              {/* Improvements */}
              {result.improvements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-3">
                    {result.improvements.map((improvement, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}
