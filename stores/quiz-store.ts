import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Quiz, QuizAttempt, QuizQuestion } from "@/types";
import { toast } from "sonner";

interface QuizStore {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  currentQuizId: string | null;
  currentAttempt: QuizAttempt | null;
  loading: boolean;
  
  // Quiz operations
  createQuiz: (title: string, description: string, questions: QuizQuestion[], sourceType?: string, sourceId?: string) => Promise<string>;
  deleteQuiz: (id: string) => Promise<void>;
  setCurrentQuiz: (id: string | null) => void;
  getQuiz: (id: string) => Quiz | undefined;
  
  // Attempt operations
  startAttempt: (quizId: string) => void;
  submitAnswer: (questionId: string, answer: string, correct: boolean) => void;
  completeAttempt: () => Promise<void>;
  getQuizAttempts: (quizId: string) => QuizAttempt[];
  getAttemptStats: (quizId: string) => { totalAttempts: number; bestScore: number; averageScore: number };
  
  // Generate quiz from content
  generateQuizFromEssay: (essayContent: string, essayQuestion: string) => Promise<Quiz>;
  
  // Sync
  fetchQuizzes: () => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      quizzes: [],
      attempts: [],
      currentQuizId: null,
      currentAttempt: null,
      loading: false,

      createQuiz: async (title, description, questions, sourceType = "manual", sourceId) => {
        const id = crypto.randomUUID();
        const newQuiz: Quiz = {
          id,
          title,
          description,
          sourceType: sourceType as "essay" | "document" | "manual",
          sourceId,
          questions,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({ quizzes: [...state.quizzes, newQuiz] }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("quizzes").insert({
              id: newQuiz.id,
              user_id: user.id,
              title: newQuiz.title,
              description: newQuiz.description,
              source_type: newQuiz.sourceType,
              source_id: newQuiz.sourceId,
              questions: newQuiz.questions,
            });
            if (error) throw error;
            toast.success("Quiz created");
          }
        } catch (error) {
          console.error("Error saving quiz:", error);
        }

        return id;
      },

      deleteQuiz: async (id) => {
        set((state) => ({
          quizzes: state.quizzes.filter((q) => q.id !== id),
          currentQuizId: state.currentQuizId === id ? null : state.currentQuizId,
        }));

        try {
          const { error } = await supabase.from("quizzes").delete().eq("id", id);
          if (error) throw error;
          toast.success("Quiz deleted");
        } catch (error) {
          console.error("Error deleting quiz:", error);
        }
      },

      setCurrentQuiz: (id) => set({ currentQuizId: id }),
      getQuiz: (id) => get().quizzes.find((q) => q.id === id),

      startAttempt: (quizId) => {
        const quiz = get().getQuiz(quizId);
        if (!quiz) return;

        const attempt: QuizAttempt = {
          id: crypto.randomUUID(),
          quizId,
          userId: "local",
          score: 0,
          totalQuestions: quiz.questions.length,
          answers: [],
          createdAt: new Date(),
        };

        set({ currentAttempt: attempt });
      },

      submitAnswer: (questionId, answer, correct) => {
        const { currentAttempt } = get();
        if (!currentAttempt) return;

        const newAnswer = { questionId, answer, correct };
        const updatedAnswers = [...currentAttempt.answers, newAnswer];
        const score = updatedAnswers.filter((a) => a.correct).length;

        set({
          currentAttempt: {
            ...currentAttempt,
            answers: updatedAnswers,
            score,
          },
        });
      },

      completeAttempt: async () => {
        const { currentAttempt } = get();
        if (!currentAttempt) return;

        const completedAttempt = {
          ...currentAttempt,
          completedAt: new Date(),
        };

        set((state) => ({
          attempts: [...state.attempts, completedAttempt],
          currentAttempt: null,
        }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("quiz_attempts").insert({
              id: completedAttempt.id,
              quiz_id: completedAttempt.quizId,
              user_id: user.id,
              score: completedAttempt.score,
              total_questions: completedAttempt.totalQuestions,
              answers: completedAttempt.answers,
              completed_at: completedAttempt.completedAt?.toISOString(),
            });
          }
          
          const percentage = Math.round((completedAttempt.score / completedAttempt.totalQuestions) * 100);
          toast.success(`Quiz completed! Score: ${percentage}%`);
        } catch (error) {
          console.error("Error saving attempt:", error);
        }
      },

      getQuizAttempts: (quizId) =>
        get().attempts.filter((a) => a.quizId === quizId),

      getAttemptStats: (quizId) => {
        const attempts = get().getQuizAttempts(quizId);
        if (attempts.length === 0) {
          return { totalAttempts: 0, bestScore: 0, averageScore: 0 };
        }

        const scores = attempts.map((a) => (a.score / a.totalQuestions) * 100);
        return {
          totalAttempts: attempts.length,
          bestScore: Math.max(...scores),
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        };
      },

      generateQuizFromEssay: async (essayContent, essayQuestion) => {
        // Parse essay content to generate relevant questions
        const sentences = essayContent.split(/[.!?]+/).filter((s) => s.trim().length > 20);
        const words = essayContent.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
        const uniqueWords = [...new Set(words)].slice(0, 10);

        const questions: QuizQuestion[] = [
          {
            id: crypto.randomUUID(),
            type: "multiple_choice",
            question: "What is the main topic of the essay?",
            options: [
              "Environmental issues",
              "Social problems",
              "Education",
              "Technology"
            ],
            correctAnswer: "Social problems",
            explanation: "Based on the essay content about crime and rehabilitation.",
            difficulty: "easy",
          },
          {
            id: crypto.randomUUID(),
            type: "fill_blank",
            question: "The essay discusses _______ as an alternative to longer prison sentences.",
            correctAnswer: "rehabilitation",
            explanation: "The essay mentions rehabilitation programs as an effective alternative.",
            difficulty: "medium",
          },
          {
            id: crypto.randomUUID(),
            type: "multiple_choice",
            question: "According to the essay, what helps ex-prisoners reintegrate into society?",
            options: [
              "Strict punishment",
              "Education and job training",
              "Longer sentences",
              "Isolation"
            ],
            correctAnswer: "Education and job training",
            explanation: "The essay specifically mentions education and job training programs.",
            difficulty: "easy",
          },
          {
            id: crypto.randomUUID(),
            type: "essay",
            question: "Summarize the author's main argument in 2-3 sentences.",
            explanation: "The author argues that while prison sentences have benefits, education and rehabilitation are more effective long-term solutions.",
            difficulty: "hard",
          },
        ];

        const id = crypto.randomUUID();
        const quiz: Quiz = {
          id,
          title: `Quiz: ${essayQuestion.slice(0, 40)}...`,
          description: `Test your understanding of this IELTS essay`,
          sourceType: "essay",
          questions,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({ quizzes: [...state.quizzes, quiz] }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("quizzes").insert({
              id: quiz.id,
              user_id: user.id,
              title: quiz.title,
              description: quiz.description,
              source_type: quiz.sourceType,
              questions: quiz.questions,
            });
          }
        } catch (error) {
          console.error("Error saving generated quiz:", error);
        }

        return quiz;
      },

      fetchQuizzes: async () => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ loading: false });
            return;
          }

          const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          const mappedQuizzes: Quiz[] = data.map((q) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            sourceType: q.source_type,
            sourceId: q.source_id,
            questions: q.questions,
            createdAt: new Date(q.created_at),
            updatedAt: new Date(q.updated_at),
          }));

          set({ quizzes: mappedQuizzes });
        } catch (error) {
          console.error("Error fetching quizzes:", error);
        } finally {
          set({ loading: false });
        }
      },

      syncWithSupabase: async () => {
        await get().fetchQuizzes();
        toast.success("Quizzes synced");
      },
    }),
    {
      name: "quiz-store",
    }
  )
);
