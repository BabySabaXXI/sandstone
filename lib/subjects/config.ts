import { SubjectConfig } from "@/types";

export const subjects: SubjectConfig[] = [
  {
    id: "economics",
    name: "Economics",
    description: "Pearson Edexcel IAL Economics",
    icon: "TrendingUp",
    color: "#A8C5A8",
    examBoard: "Pearson Edexcel IAL",
    level: "A-Level",
  },
  {
    id: "geography",
    name: "Geography",
    description: "Pearson Edexcel IAL Geography",
    icon: "Globe",
    color: "#A8C5D4",
    examBoard: "Pearson Edexcel IAL",
    level: "A-Level",
  },
];

export const defaultSubject = "economics";

export function getSubjectConfig(subjectId: string): SubjectConfig | undefined {
  return subjects.find((s) => s.id === subjectId);
}

export function getSubjectColor(subjectId: string): string {
  return getSubjectConfig(subjectId)?.color || "#E8D5C4";
}

export function getSubjectName(subjectId: string): string {
  return getSubjectConfig(subjectId)?.name || "Unknown Subject";
}
