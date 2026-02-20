"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { ExaminerSwarm } from "@/components/grading/ExaminerSwarm";
import { EssayHighlighter } from "@/components/grading/EssayHighlighter";
import { GradingResult } from "@/types";
import { Send, RotateCcw, FileText, Brain, Sparkles, Save, CheckCircle } from "lucide-react";
import { useEssayStore } from "@/stores/essay-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const sampleQuestion =
  "Some people think that the best way to reduce crime is to give longer prison sentences. To what extent do you agree or disagree?";

const sampleEssay = `In recent years, the issue of crime has become a major concern for society. While it is true that longer prison sentences can act as a deterrent, I believe that there are more effective ways to reduce crime.

On the one hand, longer prison sentences can discourage people from committing crimes. When potential criminals know that they will face severe punishment, they may think twice before breaking the law. This approach protects society by keeping dangerous criminals away from the public.

On the other hand, there are alternative methods that address the root causes of crime. Education and job training programs can help ex-prisoners reintegrate into society. When people have stable employment and a sense of purpose, they are less likely to return to criminal activities.

In conclusion, while longer prison sentences have some benefits, I believe that rehabilitation and education programs are more effective in reducing crime in the long term.`;

export default function GradePage() {
  const [question, setQuestion] = useState(sampleQuestion);
  const [essay, setEssay] = useState(sampleEssay);
  const [isGrading, setIsGrading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [savedEssayId, setSavedEssayId] = useState<string | null>(null);
  const [quizGenerated, setQuizGenerated] = useState(false);
  
  const { saveEssay } = useEssayStore();
  const { generateQuizFromEssay } = useQuizStore();
  const router = useRouter();

  const handleSubmit = () => {
    if (!essay.trim() || !question.trim()) return;
    setIsGrading(true);
    setResult(null);
    setSavedEssayId(null);
    setQuizGenerated(false);
  };

  const handleReset = () => {
    setIsGrading(false);
    setResult(null);
    setSavedEssayId(null);
    setQuizGenerated(false);
  };

  const handleGradingComplete = async (gradingResult: GradingResult) => {
    setResult(gradingResult);
    setIsGrading(false);
    
    // Auto-save the essay with results
    const id = await saveEssay(question, essay, gradingResult);
    if (id) {
      setSavedEssayId(id);
      toast.success("Essay saved to your library");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!savedEssayId) return;
    
    const quiz = await generateQuizFromEssay(essay, question);
    if (quiz) {
      setQuizGenerated(true);
      toast.success("Quiz generated! Go to Quiz Center to take it.");
    }
  };

  const handleGoToQuiz = () => {
    router.push("/quiz");
  };

  return (
    <ThreePanel>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <h1 className="text-h1 text-[#2D2D2D]">Essay Grading</h1>
          </div>
          <p className="text-[#5A5A5A]">
            Submit your essay for AI-powered evaluation by 6 expert examiners
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isGrading && !result && (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Question Input */}
              <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5">
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Essay Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-24"
                  placeholder="Enter the essay question..."
                />
              </div>

              {/* Essay Input */}
              <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#2D2D2D]">
                    Your Essay
                  </label>
                  <span className="text-xs text-[#8A8A8A]">
                    {essay.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-80 font-mono text-sm"
                  placeholder="Type your essay here..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={!essay.trim() || !question.trim()}
                  className="flex items-center gap-2 bg-[#2D2D2D] text-white px-6 py-3 rounded-lg hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Grade Essay
                </button>
              </div>
            </motion.div>
          )}

          {(isGrading || result) && (
            <motion.div
              key="grading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#2D2D2D] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Grade Another Essay
                </button>
                
                <div className="flex items-center gap-2">
                  {savedEssayId && !quizGenerated && (
                    <button
                      onClick={handleGenerateQuiz}
                      className="flex items-center gap-2 bg-[#E8D5C4] text-[#2D2D2D] px-4 py-2 rounded-lg hover:bg-[#D4C4B0] transition-colors"
                    >
                      <Brain className="w-4 h-4" />
                      Generate Quiz
                    </button>
                  )}
                  {quizGenerated && (
                    <button
                      onClick={handleGoToQuiz}
                      className="flex items-center gap-2 bg-[#A8C5A8] text-white px-4 py-2 rounded-lg hover:bg-[#8BA88B] transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Take Quiz
                    </button>
                  )}
                  {savedEssayId && (
                    <div className="flex items-center gap-1.5 text-sm text-[#A8C5A8]">
                      <Save className="w-4 h-4" />
                      <span>Saved</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Grading Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Examiner Swarm */}
                <div>
                  <ExaminerSwarm
                    essay={essay}
                    question={question}
                    onComplete={handleGradingComplete}
                    onGenerating={setIsGenerating}
                  />
                </div>

                {/* Essay with Highlights */}
                <div>
                  {result && (
                    <EssayHighlighter essay={essay} gradingResult={result} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}
