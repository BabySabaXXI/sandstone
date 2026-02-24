import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Quiz, QuizAttempt, QuizQuestion, Subject, QuizSourceType, QuizAnswer } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

interface QuizStore {
  // State
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  currentQuizId: string | null;
  currentAttempt: QuizAttempt | null;
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];
  
  // Actions
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
  processPendingOperations: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'delete' | 'update';
  entity: 'quiz' | 'attempt';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// Type for Supabase quiz row
interface SupabaseQuizRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  subject: string;
  source_type: string;
  source_id?: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

// Type for Supabase quiz attempt row
interface SupabaseQuizAttemptRow {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  answers: QuizAnswer[];
  completed_at?: string;
  created_at: string;
}

// Custom storage with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.error(`Error reading ${name} from localStorage:`, error);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to localStorage:`, error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage limit exceeded. Please clear some data.');
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error(`Error removing ${name} from localStorage:`, error);
    }
  },
};

// Date serialization helpers
const serializeQuiz = (quiz: Quiz): Record<string, unknown> => ({
  ...quiz,
  createdAt: quiz.createdAt.toISOString(),
  updatedAt: quiz.updatedAt.toISOString(),
});

const deserializeQuiz = (quiz: Record<string, unknown>): Quiz => ({
  ...(quiz as Quiz),
  createdAt: new Date(quiz.createdAt as string),
  updatedAt: new Date(quiz.updatedAt as string),
});

const serializeAttempt = (attempt: QuizAttempt): Record<string, unknown> => ({
  ...attempt,
  createdAt: attempt.createdAt.toISOString(),
  completedAt: attempt.completedAt?.toISOString(),
});

const deserializeAttempt = (attempt: Record<string, unknown>): QuizAttempt => ({
  ...(attempt as QuizAttempt),
  createdAt: new Date(attempt.createdAt as string),
  completedAt: attempt.completedAt ? new Date(attempt.completedAt as string) : undefined,
});

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      quizzes: [],
      attempts: [],
      currentQuizId: null,
      currentAttempt: null,
      loading: false,
      error: null,
      isHydrated: false,
      pendingOperations: [],

      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),

      createQuiz: async (title, description, questions, subject, sourceType = "manual", sourceId) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const newQuiz: Quiz = {
          id,
          title,
          description,
          subject,
          sourceType: sourceType as QuizSourceType,
          sourceId,
          questions,
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic update
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
          set({ error: "Failed to save quiz to server" });
          
          // Add to pending operations for retry
          set((state) => ({
            pendingOperations: [
              ...state.pendingOperations,
              {
                id: crypto.randomUUID(),
                type: 'create',
                entity: 'quiz',
                data: newQuiz,
                timestamp: Date.now(),
                retryCount: 0,
              },
            ],
          }));
        }

        return id;
      },

      deleteQuiz: async (id) => {
        // Optimistic update
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
          set({ error: "Failed to delete quiz from server" });
        }
      },

      setCurrentQuiz: (id) => set({ currentQuizId: id }),
      
      getQuiz: (id) => {
        return get().quizzes.find((q) => q.id === id);
      },
      
      getQuizzesBySubject: (subject) => {
        return get().quizzes.filter((q) => q.subject === subject);
      },

      startAttempt: (quizId) => {
        const quiz = get().getQuiz(quizId);
        if (!quiz) {
          set({ error: "Quiz not found" });
          return;
        }

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
        set((state) => {
          const { currentAttempt } = state;
          if (!currentAttempt) return state;

          const newAnswer: QuizAnswer = { questionId, answer, correct };
          const updatedAnswers = [...currentAttempt.answers, newAnswer];
          const score = updatedAnswers.filter((a) => a.correct).length;

          return {
            currentAttempt: {
              ...currentAttempt,
              answers: updatedAnswers,
              score,
            },
          };
        });
      },

      completeAttempt: async () => {
        const { currentAttempt } = get();
        if (!currentAttempt) return;

        const completedAttempt: QuizAttempt = {
          ...currentAttempt,
          completedAt: new Date(),
        };

        // Optimistic update
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
          set({ error: "Failed to save attempt to server" });
        }
      },

      getQuizAttempts: (quizId) => {
        return get().attempts.filter((a) => a.quizId === quizId);
      },

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
        const now = new Date();
        const quiz: Quiz = {
          id,
          title: `Quiz: ${essayQuestion.slice(0, 40)}...`,
          description: `Test your understanding of this ${subject} response`,
          subject,
          sourceType: "essay",
          questions,
          createdAt: now,
          updatedAt: now,
        };

        // Optimistic update
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
          set({ error: "Failed to save generated quiz" });
        }

        return quiz;
      },

      fetchQuizzes: async () => {
        // Prevent concurrent fetches
        if (get().loading) return;
        
        set({ loading: true, error: null });
        
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

          const mappedQuizzes: Quiz[] = (data as SupabaseQuizRow[]).map((q) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            subject: q.subject as Subject,
            sourceType: q.source_type as QuizSourceType,
            sourceId: q.source_id,
            questions: q.questions,
            createdAt: new Date(q.created_at),
            updatedAt: new Date(q.updated_at),
          }));

          set({ quizzes: mappedQuizzes });
        } catch (error) {
          console.error("Error fetching quizzes:", error);
          set({ error: "Failed to fetch quizzes" });
        } finally {
          set({ loading: false });
        }
      },

      syncWithSupabase: async () => {
        await get().fetchQuizzes();
        await get().processPendingOperations();
        toast.success("Quizzes synced");
      },

      processPendingOperations: async () => {
        const { pendingOperations } = get();
        if (pendingOperations.length === 0) return;

        const processedIds: string[] = [];

        for (const operation of pendingOperations) {
          if (operation.retryCount >= 3) continue;

          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) break;

            if (operation.type === 'create' && operation.entity === 'quiz') {
              const quiz = operation.data as Quiz;
              await supabase.from("quizzes").insert({
                id: quiz.id,
                user_id: user.id,
                title: quiz.title,
                description: quiz.description,
                subject: quiz.subject,
                source_type: quiz.sourceType,
                source_id: quiz.sourceId,
                questions: quiz.questions,
              });
            }

            processedIds.push(operation.id);
          } catch (error) {
            console.error("Failed to process pending operation:", error);
            operation.retryCount++;
          }
        }

        set((state) => ({
          pendingOperations: state.pendingOperations.filter(
            (op) => !processedIds.includes(op.id)
          ),
        }));
      },
    }),
    {
      name: "quiz-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        quizzes: state.quizzes,
        attempts: state.attempts,
        currentQuizId: state.currentQuizId,
        pendingOperations: state.pendingOperations,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useQuiz = (id: string) => 
  useQuizStore((state) => state.quizzes.find((q) => q.id === id));

export const useQuizzesBySubject = (subject: Subject) => 
  useQuizStore((state) => state.quizzes.filter((q) => q.subject === subject));

export const useQuizAttempts = (quizId: string) => 
  useQuizStore((state) => state.attempts.filter((a) => a.quizId === quizId));

export const useCurrentQuiz = () => 
  useQuizStore((state) => state.currentQuizId ? state.quizzes.find((q) => q.id === state.currentQuizId) : undefined);
