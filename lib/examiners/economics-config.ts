/**
 * Pearson Edexcel IAL Economics Examiner Configuration
 * Integrates with Economics Intelligence Engine
 */

import { Subject } from "@/types";
import {
  caseStudies,
  examTechniques,
  constructGradingPrompt,
  diagramRequirements,
  evaluationFrameworks
} from "./economics-intelligence";

export type QuestionType =
  | "4-mark"
  | "6-mark"
  | "8-mark"
  | "10-mark"
  | "12-mark"
  | "14-mark"
  | "16-mark"
  | "20-mark";

export type UnitCode = "WEC11" | "WEC12" | "WEC13" | "WEC14";

export interface ExaminerConfig {
  id: string;
  name: string;
  ao: "AO1" | "AO2" | "AO3" | "AO4";
  description: string;
  criteria: string[];
  maxScore: number;
  weight: number;
  color: string;
  icon: string;
}

export const economicsExaminers: ExaminerConfig[] = [
  {
    id: "knowledge-examiner",
    name: "Knowledge & Understanding",
    ao: "AO1",
    description: "Assesses accuracy of economic definitions, concepts, and theories",
    criteria: [
      "Accurate definitions of key terms",
      "Correct use of economic terminology",
      "Understanding of relevant concepts",
      "Appropriate theory selection",
      "Correct formulas and calculations"
    ],
    maxScore: 9,
    weight: 0.25,
    color: "#3B82F6",
    icon: "BookOpen"
  },
  {
    id: "application-examiner",
    name: "Application",
    ao: "AO2",
    description: "Assesses ability to apply knowledge to real-world contexts",
    criteria: [
      "Use of real-world examples from case studies",
      "Application to context provided",
      "Relevant contemporary examples (2024-2025)",
      "Use of data from extracts",
      "Synoptic links where appropriate"
    ],
    maxScore: 9,
    weight: 0.25,
    color: "#10B981",
    icon: "Globe"
  },
  {
    id: "analysis-examiner",
    name: "Analysis",
    ao: "AO3",
    description: "Assesses chains of reasoning and analytical depth",
    criteria: [
      "Clear chains of reasoning (minimum 3 steps)",
      "Accurate diagrams with labels",
      "Logical development of arguments",
      "Causal relationships explained",
      "Reference to diagrams in text"
    ],
    maxScore: 9,
    weight: 0.25,
    color: "#F59E0B",
    icon: "TrendingUp"
  },
  {
    id: "evaluation-examiner",
    name: "Evaluation",
    ao: "AO4",
    description: "Assesses critical assessment and balanced judgment",
    criteria: [
      "Balanced consideration of viewpoints",
      "Use of evaluative language",
      "Time dimension considerations",
      "Stakeholder analysis",
      "Reasoned judgment in conclusion"
    ],
    maxScore: 9,
    weight: 0.25,
    color: "#8B5CF6",
    icon: "Scale"
  }
];

// Export case studies for use in components
export { caseStudies, examTechniques, diagramRequirements, evaluationFrameworks };

// Question type configurations
export interface QuestionTypeConfig {
  type: QuestionType;
  marks: number;
  unitAvailability: UnitCode[];
  requiredAOs: ("AO1" | "AO2" | "AO3" | "AO4")[];
  examinerAdvice: string;
  requiresDiagram: boolean;
}

export const questionTypes: QuestionTypeConfig[] = [
  {
    type: "4-mark",
    marks: 4,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2"],
    examinerAdvice: "2 knowledge points + 2 application points. Define key terms clearly.",
    requiresDiagram: false
  },
  {
    type: "6-mark",
    marks: 6,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2"],
    examinerAdvice: "Provide 2-3 developed points with clear context application.",
    requiresDiagram: false
  },
  {
    type: "8-mark",
    marks: 8,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3"],
    examinerAdvice: "Include chains of reasoning. Use diagrams where appropriate.",
    requiresDiagram: true
  },
  {
    type: "10-mark",
    marks: 10,
    unitAvailability: ["WEC11", "WEC12"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    examinerAdvice: "4 marks analysis + 6 marks evaluation. Minimum 2 evaluative points.",
    requiresDiagram: true
  },
  {
    type: "12-mark",
    marks: 12,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3"],
    examinerAdvice: "Develop chains of reasoning thoroughly. Use real-world examples.",
    requiresDiagram: true
  },
  {
    type: "14-mark",
    marks: 14,
    unitAvailability: ["WEC11", "WEC12"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    examinerAdvice: "L2 evaluation requires 2+ evaluative points. L3 requires developed evaluation with priorities.",
    requiresDiagram: true
  },
  {
    type: "16-mark",
    marks: 16,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    examinerAdvice: "Use context throughout. Evaluation must be balanced and developed.",
    requiresDiagram: true
  },
  {
    type: "20-mark",
    marks: 20,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    examinerAdvice: "Integrate context from extracts. Provide reasoned judgment in conclusion.",
    requiresDiagram: true
  }
];

// Unit knowledge domains
export const unitKnowledge: Record<UnitCode, {
  title: string;
  topics: string[];
  keyDiagrams: string[];
  commonContexts: string[];
  caseStudyKeys: string[];
}> = {
  WEC11: {
    title: "Markets in Action",
    topics: [
      "Scarcity and choice",
      "Production possibility frontiers",
      "Supply and demand",
      "Elasticities",
      "Market failure",
      "Externalities",
      "Public goods",
      "Government intervention"
    ],
    keyDiagrams: [
      "Supply and demand equilibrium",
      "PED/IES/PES calculations",
      "Negative externalities (MSC > MPC)",
      "Positive externalities (MSB > MPB)",
      "Tax incidence",
      "Subsidy effects"
    ],
    commonContexts: [
      "Zero Emission Zones (ZEZs)",
      "UK housing market",
      "Carbon pricing",
      "Energy markets",
      "Transport and congestion"
    ],
    caseStudyKeys: ["zeroEmissionZones", "housingMarket", "carbonPricing"]
  },
  WEC12: {
    title: "Macroeconomic Performance",
    topics: [
      "Circular flow of income",
      "Aggregate demand and supply",
      "Economic growth",
      "Inflation",
      "Unemployment",
      "Balance of payments",
      "Macroeconomic policies"
    ],
    keyDiagrams: [
      "AD/AS model",
      "Phillips curve",
      "Keynesian vs Classical AS",
      "Multiplier effect",
      "Crowding out"
    ],
    commonContexts: [
      "UK growth slowdown 2025",
      "Inflation 2024-2025",
      "National Minimum Wage",
      "Monetary policy trade-offs"
    ],
    caseStudyKeys: ["ukSlowdown2025", "ukInflation2024", "nationalMinimumWage"]
  },
  WEC13: {
    title: "Business Behaviour",
    topics: [
      "Business objectives",
      "Costs and revenues",
      "Market structures",
      "Perfect competition",
      "Monopoly",
      "Oligopoly",
      "Monopolistic competition",
      "Labour markets"
    ],
    keyDiagrams: [
      "Cost curves (SRAC, LRAC, MC)",
      "Revenue curves",
      "Profit maximization (MC=MR)",
      "Perfect competition SR/LR",
      "Monopoly welfare loss",
      "Kinked demand curve"
    ],
    commonContexts: [
      "China EV price wars",
      "UK housebuilding oligopoly",
      "UK supermarket competition",
      "Indian market structures"
    ],
    caseStudyKeys: ["chinaEV", "ukHousebuilding", "ukSupermarkets"]
  },
  WEC14: {
    title: "Developments in the Global Economy",
    topics: [
      "Globalisation",
      "Trade patterns",
      "Balance of payments",
      "Exchange rates",
      "Development economics",
      "Inequality",
      "Role of state"
    ],
    keyDiagrams: [
      "Comparative advantage",
      "Tariff welfare effects",
      "Exchange rate determination",
      "J-curve effect"
    ],
    commonContexts: [
      "Indonesia commodity dependence",
      "Rwanda development success",
      "Development innovations",
      "Trade and convergence"
    ],
    caseStudyKeys: ["indonesia", "rwanda", "developmentInnovations"]
  }
};

// Grade boundaries
export const gradeBoundaries = {
  Astar: 90,
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40
};

// Helper functions
export function getQuestionTypeConfig(type: QuestionType): QuestionTypeConfig | undefined {
  return questionTypes.find(qt => qt.type === type);
}

export function getAvailableQuestionTypes(unit: UnitCode): QuestionType[] {
  return questionTypes
    .filter(qt => qt.unitAvailability.includes(unit))
    .map(qt => qt.type);
}

export function calculateGrade(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= gradeBoundaries.Astar) return "A*";
  if (percentage >= gradeBoundaries.A) return "A";
  if (percentage >= gradeBoundaries.B) return "B";
  if (percentage >= gradeBoundaries.C) return "C";
  if (percentage >= gradeBoundaries.D) return "D";
  if (percentage >= gradeBoundaries.E) return "E";
  return "U";
}

export function generateSystemPrompt(unit: UnitCode, questionType: QuestionType, hasDiagram: boolean): string {
  return constructGradingPrompt(unit, questionType, "AO1", hasDiagram);
}

export function getExaminerPrompt(examiner: ExaminerConfig, unit: UnitCode, questionType: QuestionType, hasDiagram: boolean): string {
  return constructGradingPrompt(unit, questionType, examiner.ao, hasDiagram);
}

// Diagram detection helpers
export function requiresDiagram(questionType: QuestionType): boolean {
  const config = getQuestionTypeConfig(questionType);
  return config?.requiresDiagram || false;
}

export function getDiagramFeedback(questionType: QuestionType, hasDiagram: boolean, diagramQuality?: string): string {
  if (!requiresDiagram(questionType)) {
    return "Diagram not required for this question type, but beneficial if accurate.";
  }
  
  if (!hasDiagram) {
    return `⚠️ MISSING DIAGRAM: ${questionType} questions require diagrams. Marks deducted for missing or incorrect diagrams.`;
  }
  
  if (diagramQuality === "poor") {
    return "Diagram present but has significant errors (wrong curves, missing labels, incorrect axes).";
  }
  
  if (diagramQuality === "good") {
    return "✓ Accurate diagram with correct curves, labels, and explanation in text.";
  }
  
  return "Diagram present - assess accuracy of curves, labels, and whether referenced in explanation.";
}
