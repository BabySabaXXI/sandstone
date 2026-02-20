import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { Subject } from "@/types";

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
  feedback?: any[];
  annotations?: any[];
  summary?: string;
  improvements?: string[];
  examinerScores?: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface EssayStore {
  essays: Essay[];
  isLoading: boolean;
  error: string | null;

  fetchEssays: () => Promise<void>;
  createEssay: (
    question: string,
    content: string,
    subject: Subject,
    questionType?: string,
    marks?: number,
    gradingResult?: any
  ) => Promise<Essay>;
  deleteEssay: (id: string) => Promise<void>;
  getEssayById: (id: string) => Essay | undefined;
  getEssaysBySubject: (subject: Subject) => Essay[];
}

export const useEssayStore = create<EssayStore>()(
  persist(
    (set, get) => ({
      essays: [],
      isLoading: false,
      error: null,

      fetchEssays: async () => {
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

          const essays: Essay[] = (data || []).map((essay) => ({
            id: essay.id,
            userId: essay.user_id,
            subject: essay.subject as Subject,
            question: essay.question,
            content: essay.content,
            questionType: essay.question_type,
            marks: essay.marks,
            overallScore: essay.overall_score,
            grade: essay.grade,
            feedback: essay.feedback || [],
            annotations: essay.annotations || [],
            summary: essay.summary,
            improvements: essay.improvements || [],
            examinerScores: essay.examiner_scores || [],
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
          feedback: gradingResult?.examiners || [],
          annotations: gradingResult?.annotations || [],
          summary: gradingResult?.summary,
          improvements: gradingResult?.improvements || [],
          examiner_scores: gradingResult?.examiners || [],
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

        const essay: Essay = {
          id: data.id,
          userId: data.user_id,
          subject: data.subject as Subject,
          question: data.question,
          content: data.content,
          questionType: data.question_type,
          marks: data.marks,
          overallScore: data.overall_score,
          grade: data.grade,
          feedback: data.feedback || [],
          annotations: data.annotations || [],
          summary: data.summary,
          improvements: data.improvements || [],
          examinerScores: data.examiner_scores || [],
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        set((state) => ({
          essays: [essay, ...state.essays],
        }));

        return essay;
      },

      deleteEssay: async (id) => {
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
        }));
      },

      getEssayById: (id) => {
        return get().essays.find((essay) => essay.id === id);
      },

      getEssaysBySubject: (subject) => {
        return get().essays.filter((essay) => essay.subject === subject);
      },
    }),
    {
      name: "essay-store",
      partialize: (state) => ({ essays: state.essays }),
    }
  )
);
