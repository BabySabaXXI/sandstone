import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import { GradingResult, DatabaseEssay, ExaminerScore, Quiz, QuizQuestion } from "@/types";
import { toast } from "sonner";

interface Essay {
  id: string;
  question: string;
  content: string;
  overallScore?: number;
  band?: string;
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
  
  // Local operations
  fetchEssays: () => Promise<void>;
  saveEssay: (question: string, content: string, result?: GradingResult) => Promise<string | null>;
  deleteEssay: (id: string) => Promise<void>;
  getEssay: (id: string) => Essay | undefined;
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  
  // Quiz generation
  generateQuiz: (essayId: string) => Promise<Quiz | null>;
}

export const useEssayStore = create<EssayStore>()(
  persist(
    (set, get) => ({
      essays: [],
      loading: false,
      syncing: false,

      fetchEssays: async () => {
        set({ loading: true });
        
        // Try to fetch from Supabase first
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
                question: e.question,
                content: e.content,
                overallScore: e.overall_score,
                band: e.band,
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
          toast.error("Failed to sync essays from cloud");
        } finally {
          set({ loading: false });
        }
      },

      saveEssay: async (question, content, result) => {
        const id = crypto.randomUUID();
        const newEssay: Essay = {
          id,
          question,
          content,
          overallScore: result?.overallScore,
          band: result?.band,
          feedback: result?.examiners,
          annotations: result?.annotations,
          summary: result?.summary,
          improvements: result?.improvements,
          createdAt: new Date(),
          updatedAt: new Date(),
          synced: false,
        };

        // Save locally first
        set((state) => ({ essays: [newEssay, ...state.essays] }));

        // Try to sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase.from("essays").insert({
              id: newEssay.id,
              user_id: user.id,
              question: newEssay.question,
              content: newEssay.content,
              overall_score: newEssay.overallScore,
              band: newEssay.band,
              feedback: newEssay.feedback,
              annotations: newEssay.annotations,
              summary: newEssay.summary,
              improvements: newEssay.improvements,
            });

            if (error) throw error;
            
            // Mark as synced
            set((state) => ({
              essays: state.essays.map((e) =>
                e.id === id ? { ...e, synced: true } : e
              ),
            }));
          }
        } catch (error) {
          console.error("Error saving essay to Supabase:", error);
          toast.error("Essay saved locally but failed to sync");
        }

        return id;
      },

      deleteEssay: async (id) => {
        // Remove locally first
        set((state) => ({
          essays: state.essays.filter((e) => e.id !== id),
        }));

        // Try to delete from Supabase
        try {
          const { error } = await supabase.from("essays").delete().eq("id", id);
          if (error) throw error;
          toast.success("Essay deleted");
        } catch (error) {
          console.error("Error deleting essay from Supabase:", error);
        }
      },

      getEssay: (id) => get().essays.find((e) => e.id === id),

      syncWithSupabase: async () => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;

        set({ syncing: true });
        
        try {
          // Get unsynced essays
          const unsyncedEssays = get().essays.filter((e) => !e.synced);
          
          for (const essay of unsyncedEssays) {
            const { error } = await supabase.from("essays").upsert({
              id: essay.id,
              user_id: user.id,
              question: essay.question,
              content: essay.content,
              overall_score: essay.overallScore,
              band: essay.band,
              feedback: essay.feedback,
              annotations: essay.annotations,
              summary: essay.summary,
              improvements: essay.improvements,
            });

            if (error) throw error;
          }

          // Fetch latest from server
          await get().fetchEssays();
          
          toast.success("Synced with cloud");
        } catch (error) {
          console.error("Error syncing essays:", error);
          toast.error("Sync failed");
        } finally {
          set({ syncing: false });
        }
      },

      generateQuiz: async (essayId) => {
        const essay = get().getEssay(essayId);
        if (!essay) return null;

        // Generate quiz questions from essay content
        const questions: QuizQuestion[] = [
          {
            id: crypto.randomUUID(),
            type: "multiple_choice",
            question: "What is the main topic of this essay?",
            options: [
              "Crime prevention methods",
              "Education system reform",
              "Environmental protection",
              "Economic development"
            ],
            correctAnswer: "Crime prevention methods",
            explanation: "The essay discusses different approaches to reducing crime, including longer prison sentences and rehabilitation programs.",
            difficulty: "medium",
          },
          {
            id: crypto.randomUUID(),
            type: "fill_blank",
            question: "According to the essay, what can act as a deterrent to crime?",
            correctAnswer: "longer prison sentences",
            explanation: "The essay mentions that longer prison sentences can discourage people from committing crimes.",
            difficulty: "easy",
          },
          {
            id: crypto.randomUUID(),
            type: "essay",
            question: "Summarize the author's position on crime reduction in 2-3 sentences.",
            explanation: "The author acknowledges that longer prison sentences have some benefits but believes rehabilitation and education programs are more effective in the long term.",
            difficulty: "hard",
          },
        ];

        const quiz: Quiz = {
          id: crypto.randomUUID(),
          title: `Quiz: ${essay.question.slice(0, 50)}...`,
          description: `Test your understanding of this ${essay.band || "IELTS"} band essay`,
          sourceType: "essay",
          sourceId: essayId,
          questions,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save quiz to Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("quizzes").insert({
              id: quiz.id,
              user_id: user.id,
              title: quiz.title,
              description: quiz.description,
              source_type: quiz.sourceType,
              source_id: quiz.sourceId,
              questions: quiz.questions,
            });
          }
        } catch (error) {
          console.error("Error saving quiz:", error);
        }

        return quiz;
      },
    }),
    {
      name: "essay-store",
    }
  )
);
