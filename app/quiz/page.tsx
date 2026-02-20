"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SubjectSwitcher } from "@/components/layout/SubjectSwitcher";
import { useQuizStore } from "@/stores/quiz-store";
import { useEssayStore } from "@/stores/essay-store";
import { useSubjectStore } from "@/stores/subject-store";
import { Quiz, QuizQuestion, QuizAttempt } from "@/types";
import { 
  Brain, Plus, Trash2, Play, ChevronRight, CheckCircle, 
  XCircle, Clock, Trophy, ArrowLeft, Sparkles, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSubjectConfig } from "@/lib/subjects/config";

export default function QuizPage() {
  const { currentSubject } = useSubjectStore();
  const subjectConfig = getSubjectConfig(currentSubject);
  const { quizzes, fetchQuizzes, deleteQuiz, setCurrentQuiz, getQuiz, currentQuizId, startAttempt, currentAttempt, submitAnswer, completeAttempt } = useQuizStore();
  const { essays } = useEssayStore();
  const [view, setView] = useState<"list" | "take" | "result" | "generate">("list");
  const [generatingForEssay, setGeneratingForEssay] = useState<string | null>(null);

  const subjectQuizzes = quizzes.filter((q) => q.subject === currentSubject);
  const subjectEssays = essays.filter((e) => e.subject === currentSubject);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes, currentSubject]);

  const handleGenerateQuiz = async (essayId: string) => {
    setGeneratingForEssay(essayId);
    const essay = subjectEssays.find((e) => e.id === essayId);
    if (essay) {
      await useQuizStore.getState().generateQuizFromEssay(essay.content, essay.question, currentSubject);
      await fetchQuizzes();
    }
    setGeneratingForEssay(null);
  };

  const handleStartQuiz = (quizId: string) => {
    setCurrentQuiz(quizId);
    startAttempt(quizId);
    setView("take");
  };

  return (
    <ThreePanel>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-[#E8D5C4]" />
              <h1 className="text-h1 text-[#2D2D2D]">Quiz Center</h1>
            </div>
            <SubjectSwitcher />
          </div>
          <p className="text-[#5A5A5A]">
            Test your {subjectConfig?.name} knowledge with AI-generated quizzes
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "list" && (
            <QuizListView 
              quizzes={subjectQuizzes}
              essays={subjectEssays}
              onStartQuiz={handleStartQuiz}
              onDeleteQuiz={deleteQuiz}
              onGenerateQuiz={handleGenerateQuiz}
              generatingForEssay={generatingForEssay}
            />
          )}
          {view === "take" && currentQuizId && (
            <QuizTakeView 
              quiz={getQuiz(currentQuizId)!}
              attempt={currentAttempt}
              onSubmitAnswer={submitAnswer}
              onComplete={() => {
                completeAttempt();
                setView("result");
              }}
              onExit={() => setView("list")}
            />
          )}
          {view === "result" && currentQuizId && (
            <QuizResultView 
              quiz={getQuiz(currentQuizId)!}
              onBack={() => setView("list")}
            />
          )}
        </AnimatePresence>
      </div>
    </ThreePanel>
  );
}

// Quiz List View
function QuizListView({ 
  quizzes, 
  essays,
  onStartQuiz, 
  onDeleteQuiz, 
  onGenerateQuiz,
  generatingForEssay 
}: { 
  quizzes: Quiz[];
  essays: any[];
  onStartQuiz: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onGenerateQuiz: (essayId: string) => void;
  generatingForEssay: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Generate from Responses Section */}
      {essays.length > 0 && (
        <div className="bg-gradient-to-br from-[#E8D5C4]/20 to-[#F5E6D3]/20 rounded-xl border border-[#E8D5C4] p-5">
          <h3 className="font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E8D5C4]" />
            Generate from Your Responses
          </h3>
          <div className="space-y-2">
            {essays.slice(0, 3).map((essay) => (
              <div 
                key={essay.id}
                className="flex items-center justify-between bg-white rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#8A8A8A]" />
                  <span className="text-sm text-[#2D2D2D] truncate max-w-[300px]">
                    {essay.question.slice(0, 50)}...
                  </span>
                </div>
                <button
                  onClick={() => onGenerateQuiz(essay.id)}
                  disabled={generatingForEssay === essay.id}
                  className="text-sm text-[#2D2D2D] hover:text-[#E8D5C4] font-medium disabled:opacity-50"
                >
                  {generatingForEssay === essay.id ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5 group hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-[#2D2D2D]" />
                </div>
                <button
                  onClick={() => onDeleteQuiz(quiz.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#8A8A8A] hover:text-[#D4A8A8] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-[#2D2D2D] mb-1">{quiz.title}</h3>
              <p className="text-sm text-[#8A8A8A] mb-4">{quiz.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-[#8A8A8A]">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {quiz.questions.length} questions
                  </span>
                </div>
                <button
                  onClick={() => onStartQuiz(quiz.id)}
                  className="flex items-center gap-1 bg-[#2D2D2D] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#1A1A1A] transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Start
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E5E5E0]">
          <Brain className="w-12 h-12 text-[#E8D5C4] mx-auto mb-4" />
          <h3 className="text-h3 text-[#2D2D2D] mb-2">No Quizzes Yet</h3>
          <p className="text-[#8A8A8A] mb-4">Generate quizzes from your responses to test your knowledge</p>
        </div>
      )}
    </motion.div>
  );
}

// Quiz Take View
function QuizTakeView({ 
  quiz, 
  attempt,
  onSubmitAnswer,
  onComplete,
  onExit 
}: { 
  quiz: Quiz;
  attempt: QuizAttempt | null;
  onSubmitAnswer: (questionId: string, answer: string, correct: boolean) => void;
  onComplete: () => void;
  onExit: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    onSubmitAnswer(currentQuestion.id, selectedAnswer, correct);
    setShowExplanation(true);
    setAnswered(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswered(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#2D2D2D]"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>
        <div className="flex items-center gap-2 text-sm text-[#8A8A8A]">
          <Clock className="w-4 h-4" />
          Question {currentIndex + 1} of {quiz.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#F0F0EC] rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#E8D5C4] to-[#F5E6D3] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + (answered ? 1 : 0)) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-2xl border border-[#E5E5E0] shadow-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              currentQuestion.difficulty === "easy" && "bg-[#A8C5A8]/20 text-[#4A6A4A]",
              currentQuestion.difficulty === "medium" && "bg-[#E5D4A8]/20 text-[#8B7A4A]",
              currentQuestion.difficulty === "hard" && "bg-[#D4A8A8]/20 text-[#8B5A5A]",
            )}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-[#8A8A8A] capitalize">
              {currentQuestion.type.replace("_", " ")}
            </span>
          </div>

          <h3 className="text-lg font-medium text-[#2D2D2D] mb-6">
            {currentQuestion.question}
          </h3>

          {/* Options */}
          {currentQuestion.options && (
            <div className="space-y-2 mb-6">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => !answered && setSelectedAnswer(option)}
                  disabled={answered}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    selectedAnswer === option
                      ? "border-[#E8D5C4] bg-[#E8D5C4]/10"
                      : "border-[#E5E5E0] hover:border-[#D5D5D0]",
                    answered && option === currentQuestion.correctAnswer && "border-[#A8C5A8] bg-[#A8C5A8]/20",
                    answered && selectedAnswer === option && option !== currentQuestion.correctAnswer && "border-[#D4A8A8] bg-[#D4A8A8]/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {answered && option === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-[#A8C5A8]" />
                    )}
                    {answered && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-[#D4A8A8]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Essay Answer Input */}
          {currentQuestion.type === "essay" && (
            <div className="mb-6">
              <textarea
                className="w-full h-32 p-4 border border-[#E5E5E0] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
                placeholder="Type your answer here..."
                value={selectedAnswer || ""}
                onChange={(e) => !answered && setSelectedAnswer(e.target.value)}
                disabled={answered}
              />
            </div>
          )}

          {/* Explanation */}
          {showExplanation && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-[#F5F5F0] rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-[#5A5A5A]">
                <span className="font-medium text-[#2D2D2D]">Explanation:</span>{" "}
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}

          {/* Action Button */}
          {!answered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="w-full bg-[#2D2D2D] text-white py-3 rounded-xl font-medium hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full bg-[#E8D5C4] text-[#2D2D2D] py-3 rounded-xl font-medium hover:bg-[#D4C4B0] transition-colors flex items-center justify-center gap-2"
            >
              {isLastQuestion ? "Complete Quiz" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Quiz Result View
function QuizResultView({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  const { getQuizAttempts, getAttemptStats } = useQuizStore();
  const attempts = getQuizAttempts(quiz.id);
  const stats = getAttemptStats(quiz.id);
  const latestAttempt = attempts[attempts.length - 1];

  const percentage = latestAttempt 
    ? Math.round((latestAttempt.score / latestAttempt.totalQuestions) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center"
    >
      <div className={cn(
        "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
        percentage >= 70 ? "bg-gradient-to-br from-[#A8C5A8] to-[#B8D4B8]" :
        percentage >= 50 ? "bg-gradient-to-br from-[#E5D4A8] to-[#F5E6D3]" :
        "bg-gradient-to-br from-[#D4A8A8] to-[#E5C4C4]"
      )}>
        <Trophy className="w-12 h-12 text-white" />
      </div>

      <h2 className="text-h2 text-[#2D2D2D] mb-2">Quiz Complete!</h2>
      <p className="text-[#5A5A5A] mb-6">
        You scored {latestAttempt?.score || 0} out of {latestAttempt?.totalQuestions || quiz.questions.length}
      </p>

      {/* Score Circle */}
      <div className="relative w-32 h-32 mx-auto mb-8">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="#F0F0EC"
            strokeWidth="12"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke={percentage >= 70 ? "#A8C5A8" : percentage >= 50 ? "#E5D4A8" : "#D4A8A8"}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-[#2D2D2D]">{percentage}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
          <div className="text-2xl font-bold text-[#2D2D2D]">{stats.totalAttempts}</div>
          <div className="text-xs text-[#8A8A8A]">Attempts</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
          <div className="text-2xl font-bold text-[#A8C5A8]">{stats.bestScore}%</div>
          <div className="text-xs text-[#8A8A8A]">Best</div>
        </div>
        <div className="bg-white rounded-xl border border-[#E5E5E0] p-4">
          <div className="text-2xl font-bold text-[#E8D5C4]">{stats.averageScore}%</div>
          <div className="text-xs text-[#8A8A8A]">Average</div>
        </div>
      </div>

      <button
        onClick={onBack}
        className="bg-[#2D2D2D] text-white px-6 py-3 rounded-xl hover:bg-[#1A1A1A] transition-colors"
      >
        Back to Quizzes
      </button>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
