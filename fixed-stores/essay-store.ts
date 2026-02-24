import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject, ExaminerScore, Annotation, GradingResult } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

export interface Essay {
  id: string;
  userId: string;
  subject: Subject;
  question: string;
  content: string;
  questionType?: string;
  marks?: number;
  overallScore?: number;
  grade?: string;
  feedback: ExaminerScore[];
  annotations: Annotation[];
  summary?: string;
  improvements: string[];
  examinerScores: ExaminerScore[];
  createdAt: Date;
  updatedAt: Date;
}

interface EssayStore {
  // State
  essays: Essay[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Pending operations for offline support
  pendingOperations: PendingOperation[];

  // Actions
  fetchEssays: () => Promise<void>;
  createEssay: (
    question: string,
    content: string,
    subject: Subject,
    questionType?: string,
    marks?: number,
    gradingResult?: GradingResult
  ) => Promise<Essay>;
  deleteEssay: (id: string) => Promise<void>;
  updateEssay: (id: string, updates: Partial<Essay>) => Promise<void>;
  getEssayById: (id: string) => Essay | undefined;
  getEssaysBySubject: (subject: Subject) => Essay[];
  syncWithSupabase: () => Promise<void>;
  processPendingOperations: () => Promise<void>;
  clearError: () => void;
  setHydrated: (value: boolean) => void;
}

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retryCount: number;
}

// Type guard for Supabase essay data
interface SupabaseEssayRow {
  id: string;
  user_id: string;
  subject: string;
  question: string;
  content: string;
  question_type?: string;
  marks?: number;
  overall_score?: number;
  grade?: string;
  feedback?: ExaminerScore[];
  annotations?: Annotation[];
  summary?: string;
  improvements?: string[];
  examiner_scores?: ExaminerScore[];
  created_at: string;
  updated_at: string;
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

export const useEssayStore = create<EssayStore>()(
  persist(
    (set, get) => ({
      essays: [],
      isLoading: false,
      error: null,
      isHydrated: false,
      pendingOperations: [],

      setHydrated: (value) => set({ isHydrated: value }),
      clearError: () => set({ error: null }),

      fetchEssays: async () => {
        // Prevent concurrent fetches
        if (get().isLoading) return;
        
        set({ isLoading: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            set({ isLoading: false, error: "Not authenticated" });
            return;
          }

          const { data, error } = await supabase
            .from("essays")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Failed to fetch essays:", error);
            set({ isLoading: false, error: error.message });
            return;
          }

          const essays: Essay[] = (data || []).map((essay: SupabaseEssayRow) => ({
            id: essay.id,
            userId: essay.user_id,
            subject: essay.subject as Subject,
            question: essay.question,
            content: essay.content,
            questionType: essay.question_type,
            marks: essay.marks,
            overallScore: essay.overall_score,
            grade: essay.grade,
            feedback: essay.feedback ?? [],
            annotations: essay.annotations ?? [],
            summary: essay.summary,
            improvements: essay.improvements ?? [],
            examinerScores: essay.examiner_scores ?? [],
            createdAt: new Date(essay.created_at),
            updatedAt: new Date(essay.updated_at),
          }));

          set({ essays, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch essays:", error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch essays",
          });
        }
      },

      createEssay: async (question, content, subject, questionType, marks, gradingResult) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new Error("Not authenticated");
          }

          const now = new Date().toISOString();
          const newEssay = {
            user_id: user.id,
            subject,
            question,
            content,
            question_type: questionType,
            marks,
            overall_score: gradingResult?.overallScore,
            grade: gradingResult?.grade,
            feedback: gradingResult?.examiners ?? [],
            annotations: gradingResult?.annotations ?? [],
            summary: gradingResult?.summary,
            improvements: gradingResult?.improvements ?? [],
            examiner_scores: gradingResult?.examiners ?? [],
            created_at: now,
            updated_at: now,
          };

          const { data, error } = await supabase
            .from("essays")
            .insert(newEssay)
            .select()
            .single();

          if (error) {
            console.error("Failed to create essay:", error);
            throw new Error(error.message);
          }

          const essayRow = data as SupabaseEssayRow;
          const essay: Essay = {
            id: essayRow.id,
            userId: essayRow.user_id,
            subject: essayRow.subject as Subject,
            question: essayRow.question,
            content: essayRow.content,
            questionType: essayRow.question_type,
            marks: essayRow.marks,
            overallScore: essayRow.overall_score,
            grade: essayRow.grade,
            feedback: essayRow.feedback ?? [],
            annotations: essayRow.annotations ?? [],
            summary: essayRow.summary,
            improvements: essayRow.improvements ?? [],
            examinerScores: essayRow.examiner_scores ?? [],
            createdAt: new Date(essayRow.created_at),
            updatedAt: new Date(essayRow.updated_at),
          };

          set((state) => ({
            essays: [essay, ...state.essays],
            isLoading: false,
          }));

          return essay;
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      updateEssay: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Not authenticated");

          const updateData: Record<string, unknown> = {};
          if (updates.question !== undefined) updateData.question = updates.question;
          if (updates.content !== undefined) updateData.content = updates.content;
          if (updates.overallScore !== undefined) updateData.overall_score = updates.overallScore;
          if (updates.grade !== undefined) updateData.grade = updates.grade;
          if (updates.feedback !== undefined) updateData.feedback = updates.feedback;
          if (updates.annotations !== undefined) updateData.annotations = updates.annotations;
          if (updates.summary !== undefined) updateData.summary = updates.summary;
          if (updates.improvements !== undefined) updateData.improvements = updates.improvements;
          updateData.updated_at = new Date().toISOString();

          const { error } = await supabase
            .from("essays")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id);

          if (error) throw error;

          set((state) => ({
            essays: state.essays.map((essay) =>
              essay.id === id 
                ? { ...essay, ...updates, updatedAt: new Date() } 
                : essay
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      deleteEssay: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            throw new Error("Not authenticated");
          }

          const { error } = await supabase
            .from("essays")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

          if (error) {
            throw new Error(error.message);
          }

          set((state) => ({
            essays: state.essays.filter((essay) => essay.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ isLoading: false, error: (error as Error).message });
          throw error;
        }
      },

      getEssayById: (id) => {
        return get().essays.find((essay) => essay.id === id);
      },

      getEssaysBySubject: (subject) => {
        return get().essays.filter((essay) => essay.subject === subject);
      },

      syncWithSupabase: async () => {
        set({ isLoading: true });
        try {
          await get().fetchEssays();
          await get().processPendingOperations();
          toast.success("Essays synced");
        } catch (error) {
          console.error("Sync error:", error);
          toast.error("Sync failed");
        } finally {
          set({ isLoading: false });
        }
      },

      processPendingOperations: async () => {
        const { pendingOperations } = get();
        if (pendingOperations.length === 0) return;

        const processedIds: string[] = [];

        for (const operation of pendingOperations) {
          if (operation.retryCount >= 3) continue;

          try {
            // Process operation based on type
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
      name: "essay-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ 
        essays: state.essays,
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
export const useEssay = (id: string) => 
  useEssayStore((state) => state.essays.find((essay) => essay.id === id));

export const useEssaysBySubject = (subject: Subject) => 
  useEssayStore((state) => state.essays.filter((essay) => essay.subject === subject));

export const useEssayStats = () => 
  useEssayStore((state) => ({
    total: state.essays.length,
    bySubject: {
      economics: state.essays.filter((e) => e.subject === 'economics').length,
      geography: state.essays.filter((e) => e.subject === 'geography').length,
    },
    graded: state.essays.filter((e) => e.overallScore !== undefined).length,
  }));
