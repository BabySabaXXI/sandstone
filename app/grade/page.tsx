"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { ExaminerSwarm } from "@/components/grading/ExaminerSwarm";
import { EssayHighlighter } from "@/components/grading/EssayHighlighter";
import { GradingResult } from "@/types";
import { Send, RotateCcw, FileText, Brain, Sparkles, Save, CheckCircle } from "lucide-react";
import { useEssayStore } from "@/stores/essay-store";
import { useQuizStore } from "@/stores/quiz-store";
import { useSubjectStore } from "@/stores/subject-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSubjectConfig } from "@/lib/subjects/config";

const sampleQuestions: Record<string, string> = {
  economics: "Discuss the likely microeconomic and macroeconomic effects of a significant increase in government spending on infrastructure projects.",
  geography: "Evaluate the strategies used to manage the impacts of tropical storms in contrasting areas of the world.",
};

const sampleResponses: Record<string, string> = {
  economics: `Government spending on infrastructure projects can have significant effects on both microeconomic and macroeconomic levels.

On the microeconomic level, infrastructure spending creates jobs in the construction sector. This increases household income and consumer spending. Firms benefit from improved transportation networks, reducing costs and increasing efficiency. However, there may be opportunity costs as resources are diverted from other sectors.

On the macroeconomic level, increased government spending represents an expansionary fiscal policy. This shifts the AD curve to the right, increasing real GDP and price level. The multiplier effect means the final increase in GDP may be larger than the initial spending. However, this depends on the size of the multiplier, which is affected by leakages.

Evaluation suggests that while infrastructure spending can boost economic growth, its effectiveness depends on the state of the economy and the quality of projects undertaken.`,
  geography: `Tropical storms have devastating impacts that require effective management strategies. Different regions employ various approaches based on their resources and experiences.

In developed countries like the USA, sophisticated monitoring and early warning systems are in place. Hurricane Katrina showed both successes and failures in these systems. Evacuation plans are well-developed, though not always followed. Infrastructure is built to withstand high winds and flooding.

In developing countries like Bangladesh, community-based early warning systems have been implemented. Cyclone shelters have been constructed. However, limited resources mean less sophisticated technology and infrastructure.

The effectiveness of these strategies varies. Early warning systems save lives but cannot prevent property damage. Long-term strategies like improved building codes are more effective but require significant investment and political will.`,
};

export default function GradePage() {
  const { currentSubject } = useSubjectStore();
  const subjectConfig = getSubjectConfig(currentSubject);
  
  const [question, setQuestion] = useState(sampleQuestions[currentSubject] || sampleQuestions.economics);
  const [essay, setEssay] = useState(sampleResponses[currentSubject] || sampleResponses.economics);
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
    const id = await saveEssay(question, essay, gradingResult, currentSubject);
    if (id) {
      setSavedEssayId(id);
      toast.success("Response saved to your library");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!savedEssayId) return;
    
    const quiz = await generateQuizFromEssay(essay, question, currentSubject);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#2D2D2D]" />
              </div>
              <div>
                <h1 className="text-h1 text-[#2D2D2D]">Response Grading</h1>
                <p className="text-[#5A5A5A]">
                  Submit your {subjectConfig?.name} response for AI-powered evaluation
                </p>
              </div>
            </div>
            <SubjectSwitcher />
          </div>
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
                  Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-24"
                  placeholder="Enter the question..."
                />
              </div>

              {/* Response Input */}
              <div className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#2D2D2D]">
                    Your Response
                  </label>
                  <span className="text-xs text-[#8A8A8A]">
                    {essay.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-80 font-mono text-sm"
                  placeholder="Type your response here..."
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
                  Grade Response
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
                  Grade Another Response
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
                    subject={currentSubject}
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
