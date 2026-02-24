import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Quiz, QuizAttempt, QuizQuestion, Subject } from "@/types";
import { toast } from "sonner";

interface QuizStore {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  currentQuizId: string | null;
  currentAttempt: QuizAttempt | null;
  loading: boolean;
  
  createQuiz: (title: string, description: string, questions: QuizQuestion[], subject: Subject, sourceType?: string, sourceId?: string) => Promise<string>;
  deleteQuiz: (id: string) => Promise<void>;
  setCurrentQuiz: (id: string | null) => void;
  getQuiz: (id: string) => Quiz | undefined;
  getQuizzesBySubject: (subject: Subject) => Quiz[];
  
  startAttempt: (quizId: string) => void;
  submitAnswer: (questionId: string, answer: string, correct: boolean) => void;
  completeAttempt: () => Promise<void>;
  getQuizAttempts: (quizId: string) => QuizAttempt[];
  getAttemptStats: (quizId: string) => { totalAttempts: number; bestScore: number; averageScore: number };
  
  generateQuizFromEssay: (essayContent: string, essayQuestion: string, subject: Subject) => Promise<Quiz>;
  
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

      createQuiz: async (title, description, questions, subject, sourceType = "manual", sourceId) => {
        const id = crypto.randomUUID();
        const newQuiz: Quiz = {
          id,
          title,
          description,
          subject,
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
              subject: newQuiz.subject,
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
      getQuizzesBySubject: (subject) => get().quizzes.filter((q) => q.subject === subject),

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

      generateQuizFromEssay: async (essayContent, essayQuestion, subject) => {
        const questions: QuizQuestion[] = [
          {
            id: crypto.randomUUID(),
            type: "multiple_choice",
            question: "What is the main focus of this response?",
            options: [
              "Economic analysis",
              "Geographical processes",
              "Historical events",
              "Scientific methodology"
            ],
            correctAnswer: subject === "economics" ? "Economic analysis" : "Geographical processes",
            explanation: "Based on the content of the response provided.",
            difficulty: "medium",
          },
          {
            id: crypto.randomUUID(),
            type: "fill_blank",
            question: subject === "economics" 
              ? "The response discusses the effects of _______ on the economy."
              : "The response examines the impacts of _______ on geographical areas.",
            correctAnswer: "key factors",
            explanation: "The main factors discussed in the response.",
            difficulty: "easy",
          },
          {
            id: crypto.randomUUID(),
            type: "essay",
            question: "Summarize the key arguments presented in 2-3 sentences.",
            explanation: "A concise summary of the main points raised in the response.",
            difficulty: "hard",
          },
        ];

        const id = crypto.randomUUID();
        const quiz: Quiz = {
          id,
          title: `Quiz: ${essayQuestion.slice(0, 40)}...`,
          description: `Test your understanding of this ${subject} response`,
          subject,
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
              subject: quiz.subject,
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
            subject: q.subject as Subject,
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
