import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Subject } from "@/types";
import { toast } from "sonner";

// Store version for migrations
const STORE_VERSION = 1;

// Default subject
const DEFAULT_SUBJECT: Subject = "economics";

interface SubjectStore {
  // State
  currentSubject: Subject;
  isHydrated: boolean;
  
  // Actions
  setSubject: (subject: Subject) => void;
  getSubject: () => Subject;
  toggleSubject: () => void;
  setHydrated: (value: boolean) => void;
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

export const useSubjectStore = create<SubjectStore>()(
  persist(
    (set, get) => ({
      currentSubject: DEFAULT_SUBJECT,
      isHydrated: false,

      setHydrated: (value) => set({ isHydrated: value }),

      setSubject: (subject) => {
        set({ currentSubject: subject });
        // You can add side effects here, like analytics tracking
        console.log(`Subject changed to: ${subject}`);
      },
      
      getSubject: () => get().currentSubject,
      
      toggleSubject: () => {
        set((state) => {
          const newSubject: Subject = state.currentSubject === "economics" ? "geography" : "economics";
          return { currentSubject: newSubject };
        });
      },
    }),
    {
      name: "subject-store",
      version: STORE_VERSION,
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ 
        currentSubject: state.currentSubject,
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
export const useCurrentSubject = () => 
  useSubjectStore((state) => state.currentSubject);

export const useIsEconomics = () => 
  useSubjectStore((state) => state.currentSubject === "economics");

export const useIsGeography = () => 
  useSubjectStore((state) => state.currentSubject === "geography");
