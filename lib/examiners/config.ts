export interface ExaminerConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: string[];
  color: string;
}

export const examiners: ExaminerConfig[] = [
  {
    id: "task-response",
    name: "Task Response",
    icon: "Target",
    description: "Evaluates how well the essay addresses the task",
    criteria: [
      "Addresses all parts of the task",
      "Presents a clear position",
      "Supports ideas with evidence",
      "Stays on topic throughout",
    ],
    color: "#A8C5D4",
  },
  {
    id: "coherence",
    name: "Coherence & Cohesion",
    icon: "Link",
    description: "Evaluates organization and flow",
    criteria: [
      "Clear paragraph structure",
      "Logical progression of ideas",
      "Effective use of linking words",
      "Clear introduction and conclusion",
    ],
    color: "#E8D5C4",
  },
  {
    id: "lexical",
    name: "Lexical Resource",
    icon: "BookOpen",
    description: "Evaluates vocabulary usage",
    criteria: [
      "Wide range of vocabulary",
      "Precise word choice",
      "Appropriate collocations",
      "Minimal repetition",
    ],
    color: "#E5C9A8",
  },
  {
    id: "grammar",
    name: "Grammatical Range",
    icon: "Type",
    description: "Evaluates grammar and sentence structure",
    criteria: [
      "Variety of sentence structures",
      "Accurate grammar usage",
      "Correct punctuation",
      "Appropriate verb tenses",
    ],
    color: "#A8C5A8",
  },
  {
    id: "style",
    name: "Academic Style",
    icon: "GraduationCap",
    description: "Evaluates formality and academic tone",
    criteria: [
      "Formal register maintained",
      "Objective tone",
      "Appropriate academic conventions",
      "Consistent style throughout",
    ],
    color: "#D4C4B0",
  },
  {
    id: "consensus",
    name: "Consensus Engine",
    icon: "Scale",
    description: "Aggregates all examiner scores",
    criteria: [
      "Weighted score calculation",
      "Cross-examiner validation",
      "Final band determination",
      "Comprehensive feedback synthesis",
    ],
    color: "#C9D6DF",
  },
];
