import { ExaminerConfig } from "./types";

export interface ExaminerConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  criteria: string[];
  color: string;
}

// Economics Examiners
export const economicsExaminers: ExaminerConfig[] = [
  {
    id: "knowledge",
    name: "Knowledge & Understanding",
    icon: "BookOpen",
    description: "Evaluates economic concepts and definitions",
    criteria: [
      "Accurate definitions of economic terms",
      "Understanding of economic concepts",
      "Relevant economic theory applied",
      "Appropriate use of diagrams",
    ],
    color: "#A8C5A8",
  },
  {
    id: "application",
    name: "Application",
    icon: "Target",
    description: "Evaluates use of knowledge in context",
    criteria: [
      "Contextual understanding",
      "Relevant examples used",
      "Appropriate application of theory",
      "Real-world connections",
    ],
    color: "#E8D5C4",
  },
  {
    id: "analysis",
    name: "Analysis",
    icon: "GitBranch",
    description: "Evaluates chains of reasoning",
    criteria: [
      "Clear logical progression",
      "Cause and effect chains",
      "Use of economic diagrams",
      "Appropriate terminology",
    ],
    color: "#E5C9A8",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    icon: "Scale",
    description: "Evaluates critical assessment",
    criteria: [
      "Balanced arguments presented",
      "Critical assessment of points",
      "Prioritization of factors",
      "Supported judgments",
    ],
    color: "#A8C5D4",
  },
  {
    id: "structure",
    name: "Structure & Coherence",
    icon: "Layout",
    description: "Evaluates essay organization",
    criteria: [
      "Clear introduction",
      "Logical paragraph structure",
      "Effective conclusions",
      "Cohesive argument flow",
    ],
    color: "#D4C4B0",
  },
  {
    id: "consensus",
    name: "Consensus Engine",
    icon: "Brain",
    description: "Aggregates all examiner scores",
    criteria: [
      "Weighted score calculation",
      "Cross-examiner validation",
      "Final grade determination",
      "Comprehensive feedback synthesis",
    ],
    color: "#C9D6DF",
  },
];

// Geography Examiners
export const geographyExaminers: ExaminerConfig[] = [
  {
    id: "knowledge",
    name: "Knowledge & Understanding",
    icon: "BookOpen",
    description: "Evaluates geographical concepts",
    criteria: [
      "Accurate geographical terms",
      "Understanding of processes",
      "Relevant case studies",
      "Appropriate examples",
    ],
    color: "#A8C5D4",
  },
  {
    id: "application",
    name: "Application",
    icon: "Target",
    description: "Evaluates use of knowledge in context",
    criteria: [
      "Contextual understanding",
      "Relevant case study application",
      "Appropriate place-specific knowledge",
      "Scale awareness (local to global)",
    ],
    color: "#A8C5A8",
  },
  {
    id: "analysis",
    name: "Analysis",
    icon: "GitBranch",
    description: "Evaluates geographical reasoning",
    criteria: [
      "Clear explanations of processes",
      "Cause and effect relationships",
      "Interconnected understanding",
      "Use of geographical evidence",
    ],
    color: "#E8D5C4",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    icon: "Scale",
    description: "Evaluates critical assessment",
    criteria: [
      "Balanced perspectives",
      "Critical assessment of viewpoints",
      "Consideration of sustainability",
      "Supported conclusions",
    ],
    color: "#E5C9A8",
  },
  {
    id: "skills",
    name: "Geographical Skills",
    icon: "Map",
    description: "Evaluates geographical techniques",
    criteria: [
      "Map interpretation",
      "Data analysis",
      "Fieldwork understanding",
      "Use of sources",
    ],
    color: "#D4C4B0",
  },
  {
    id: "consensus",
    name: "Consensus Engine",
    icon: "Brain",
    description: "Aggregates all examiner scores",
    criteria: [
      "Weighted score calculation",
      "Cross-examiner validation",
      "Final grade determination",
      "Comprehensive feedback synthesis",
    ],
    color: "#C9D6DF",
  },
];

export function getExaminers(subject: string): ExaminerConfig[] {
  switch (subject) {
    case "economics":
      return economicsExaminers;
    case "geography":
      return geographyExaminers;
    default:
      return economicsExaminers;
  }
}
