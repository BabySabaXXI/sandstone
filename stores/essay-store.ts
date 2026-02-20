import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { GradingResult, DatabaseEssay, ExaminerScore, Quiz, QuizQuestion, Subject } from "@/types";
import { toast } from "sonner";

interface Essay {
  id: string;
  subject: Subject;
  question: string;
  content: string;
  overallScore?: number;
  grade?: string;
  feedback?: ExaminerScore[];
  annotations?: any[];
  summary?: string;
  improvements?: string[];
  createdAt: Date;
  updatedAt: Date;
  synced?: boolean;
}

interface EssayStore {
  essays: Essay[];
  loading: boolean;
  syncing: boolean;
  
  fetchEssays: () => Promise<void>;
  saveEssay: (question: string, content: string, result?: GradingResult, subject?: Subject) => Promise<string | null>;
  deleteEssay: (id: string) => Promise<void>;
  getEssay: (id: string) => Essay | undefined;
  getEssaysBySubject: (subject: Subject) => Essay[];
  syncWithSupabase: () => Promise<void>;
}

export const useEssayStore = create<EssayStore>()(
  persist(
    (set, get) => ({
      essays: [],
      loading: false,
      syncing: false,

      fetchEssays: async () => {
        set({ loading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from("essays")
              .select("*")
              .order("created_at", { ascending: false });
            
            if (error) throw error;
            
            if (data) {
              const mappedEssays: Essay[] = data.map((e: DatabaseEssay) => ({
                id: e.id,
                subject: (e.subject as Subject) || "economics",
                question: e.question,
                content: e.content,
                overallScore: e.overall_score,
                grade: e.grade,
                feedback: e.feedback,
                annotations: e.annotations,
                summary: e.summary,
                improvements: e.improvements,
                createdAt: new Date(e.created_at),
                updatedAt: new Date(e.updated_at),
                synced: true,
              }));
              set({ essays: mappedEssays });
            }
          }
        } catch (error) {
          console.error("Error fetching essays from Supabase:", error);
          toast.error("Failed to sync responses from cloud");
        } finally {
          set({ loading: false });
        }
      },

      saveEssay: async (question, content, result, subject = "economics") => {
        const id = crypto.randomUUID();
        const newEssay: Essay = {
          id,
          subject,
          question,
          content,
          overallScore: result?.overallScore,
          grade: result?.grade,
          feedback: result?.examiners,
          annotations: result?.annotations,
          summary: result?.summary,
          improvements: result?.improvements,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        };

        set((state) => ({ essays: [newEssay, ...state.essays] }));

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("essays").insert({
              id: newEssay.id,
              user_id: user.id,
              subject: newEssay.subject,
              question: newEssay.question,
              content: newEssay.content,
              overall_score: newEssay.overallScore,
              grade: newEssay.grade,
              feedback: newEssay.feedback,
              annotations: newEssay.annotations,
              summary: newEssay.summary,
              improvements: newEssay.improvements,
            });

            if (error) throw error;
            
            set((state) => ({
              essays: state.essays.map((e) =>
                e.id === id ? { ...e, synced: true } : e
              ),
            }));
          }
        } catch (error) {
          console.error("Error saving essay to Supabase:", error);
          toast.error("Response saved locally but failed to sync");
        }

        return id;
      },

      deleteEssay: async (id) => {
        set((state) => ({
          essays: state.essays.filter((e) => e.id !== id),
        }));

        try {
          const { error } = await supabase.from("essays").delete().eq("id", id);
          if (error) throw error;
          toast.success("Response deleted");
        } catch (error) {
          console.error("Error deleting essay from Supabase:", error);
        }
      },

      getEssay: (id) => get().essays.find((e) => e.id === id),
      
      getEssaysBySubject: (subject) => get().essays.filter((e) => e.subject === subject),

      syncWithSupabase: async () => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;

        set({ syncing: true });
        
        try {
          const unsyncedEssays = get().essays.filter((e) => !e.synced);
          
          for (const essay of unsyncedEssays) {
            const { error } = await supabase.from("essays").upsert({
              id: essay.id,
              user_id: user.id,
              subject: essay.subject,
              question: essay.question,
              content: essay.content,
              overall_score: essay.overallScore,
              grade: essay.grade,
              feedback: essay.feedback,
              annotations: essay.annotations,
              summary: essay.summary,
              improvements: essay.improvements,
            });

            if (error) throw error;
          }

          await get().fetchEssays();
          
          toast.success("Synced with cloud");
        } catch (error) {
          console.error("Error syncing essays:", error);
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: "essay-store",
    }
  )
);
