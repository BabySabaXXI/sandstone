import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Subject } from "@/types";
import { defaultSubject } from "@/lib/subjects/config";

interface SubjectStore {
  currentSubject: Subject;
  setSubject: (subject: Subject) => void;
  getSubject: () => Subject;
}

export const useSubjectStore = create<SubjectStore>()(
  persist(
    (set, get) => ({
      currentSubject: defaultSubject,
      setSubject: (subject) => set({ currentSubject: subject }),
      getSubject: () => get().currentSubject,
    }),
    {
      name: "subject-store",
    }
  )
);
