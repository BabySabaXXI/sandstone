/**
 * Pearson Edexcel IAL Economics Examiner Configuration
 * Based on official training data and mark schemes
 * 
 * Qualification: YEC11 (IAL) / XEC11 (IAS)
 * Units: WEC11, WEC12, WEC13, WEC14
 * Assessment Objectives: AO1, AO2, AO3, AO4
 */

import { Subject } from "@/types";

// Question types for Edexcel IAL Economics
export type QuestionType = 
  | "4-mark"      // Knowledge/Understanding
  | "6-mark"      // Knowledge + Application
  | "8-mark"      // Analysis
  | "10-mark"     // Analysis + Evaluation (AS Level)
  | "12-mark"     // Extended Analysis
  | "14-mark"     // Essay with evaluation (Unit 1 & 2)
  | "16-mark"     // Extended essay (Unit 3 & 4)
  | "20-mark";    // Full essay with context (Unit 3 & 4)

// Unit codes
export type UnitCode = "WEC11" | "WEC12" | "WEC13" | "WEC14";

// Assessment Objectives
export interface AssessmentObjective {
  code: "AO1" | "AO2" | "AO3" | "AO4";
  name: string;
  description: string;
  weight: number;
}

export const assessmentObjectives: AssessmentObjective[] = [
  {
    code: "AO1",
    name: "Knowledge & Understanding",
    description: "Demonstrate knowledge and understanding of economic concepts",
    weight: 0.25,
  },
  {
    code: "AO2",
    name: "Application",
    description: "Apply economic knowledge to real-world situations",
    weight: 0.25,
  },
  {
    code: "AO3",
    name: "Analysis",
    description: "Analyze economic issues using appropriate tools and frameworks",
    weight: 0.25,
  },
  {
    code: "AO4",
    name: "Evaluation",
    description: "Evaluate economic arguments and policy options",
    weight: 0.25,
  },
];

// Question type configurations
export interface QuestionTypeConfig {
  type: QuestionType;
  marks: number;
  timeMinutes: number;
  unitAvailability: UnitCode[];
  requiredAOs: ("AO1" | "AO2" | "AO3" | "AO4")[];
  structure: string;
  examinerAdvice: string;
}

export const questionTypes: QuestionTypeConfig[] = [
  {
    type: "4-mark",
    marks: 4,
    timeMinutes: 5,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2"],
    structure: "2 knowledge points + 2 application points",
    examinerAdvice: "Define key terms clearly. Apply to the context given in the question.",
  },
  {
    type: "6-mark",
    marks: 6,
    timeMinutes: 8,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2"],
    structure: "Knowledge + Application with development",
    examinerAdvice: "Provide 2-3 developed points with clear context application.",
  },
  {
    type: "8-mark",
    marks: 8,
    timeMinutes: 12,
    unitAvailability: ["WEC11", "WEC12", "WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3"],
    structure: "Knowledge + Application + Analysis",
    examinerAdvice: "Include chains of reasoning. Use diagrams where appropriate.",
  },
  {
    type: "10-mark",
    marks: 10,
    timeMinutes: 15,
    unitAvailability: ["WEC11", "WEC12"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    structure: "4 marks analysis + 6 marks evaluation",
    examinerAdvice: "Provide balanced evaluation. Consider both sides of the argument.",
  },
  {
    type: "12-mark",
    marks: 12,
    timeMinutes: 18,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3"],
    structure: "Knowledge + Application + Extended Analysis",
    examinerAdvice: "Develop chains of reasoning thoroughly. Use real-world examples.",
  },
  {
    type: "14-mark",
    marks: 14,
    timeMinutes: 22,
    unitAvailability: ["WEC11", "WEC12"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    structure: "6 marks analysis + 8 marks evaluation",
    examinerAdvice: "L2 evaluation requires at least 2 evaluative points. L3 requires developed evaluation with priorities or limitations.",
  },
  {
    type: "16-mark",
    marks: 16,
    timeMinutes: 25,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    structure: "8 marks analysis + 8 marks evaluation",
    examinerAdvice: "Use context throughout. Evaluation must be balanced and developed.",
  },
  {
    type: "20-mark",
    marks: 20,
    timeMinutes: 35,
    unitAvailability: ["WEC13", "WEC14"],
    requiredAOs: ["AO1", "AO2", "AO3", "AO4"],
    structure: "10 marks analysis + 10 marks evaluation with context",
    examinerAdvice: "Integrate context from extracts. Provide reasoned judgment in conclusion.",
  },
];

// Examiner definitions based on assessment objectives
export interface ExaminerConfig {
  id: string;
  name: string;
  ao: "AO1" | "AO2" | "AO3" | "AO4";
  description: string;
  criteria: string[];
  feedbackTemplate: string;
  maxScore: number;
  weight: number;
}

export const economicsExaminers: ExaminerConfig[] = [
  {
    id: "knowledge-examiner",
    name: "Knowledge & Understanding (AO1)",
    ao: "AO1",
    description: "Assesses accuracy of economic definitions, concepts, and theories",
    criteria: [
      "Accurate definitions of key terms",
      "Correct use of economic terminology",
      "Understanding of relevant concepts",
      "Appropriate theory selection",
    ],
    feedbackTemplate: `
## Knowledge & Understanding Feedback

**Strengths:**
{{strengths}}

**Areas for Improvement:**
{{improvements}}

**Key Terminology:**
{{terminology}}

**Specific Corrections:**
{{corrections}}
    `,
    maxScore: 9,
    weight: 0.25,
  },
  {
    id: "application-examiner",
    name: "Application (AO2)",
    ao: "AO2",
    description: "Assesses ability to apply knowledge to real-world contexts",
    criteria: [
      "Use of real-world examples",
      "Application to context provided",
      "Relevant case studies",
      "Contemporary awareness",
    ],
    feedbackTemplate: `
## Application Feedback

**Context Usage:**
{{context}}

**Examples Provided:**
{{examples}}

**Suggestions for Better Application:**
{{suggestions}}
    `,
    maxScore: 9,
    weight: 0.25,
  },
  {
    id: "analysis-examiner",
    name: "Analysis (AO3)",
    ao: "AO3",
    description: "Assesses chains of reasoning and analytical depth",
    criteria: [
      "Clear chains of reasoning",
      "Use of diagrams (where appropriate)",
      "Logical development of arguments",
      "Causal relationships explained",
    ],
    feedbackTemplate: `
## Analysis Feedback

**Chains of Reasoning:**
{{reasoning}}

**Diagram Suggestions:**
{{diagrams}}

**Logical Structure:**
{{structure}}

**Analytical Depth:**
{{depth}}
    `,
    maxScore: 9,
    weight: 0.25,
  },
  {
    id: "evaluation-examiner",
    name: "Evaluation (AO4)",
    ao: "AO4",
    description: "Assesses critical assessment and balanced judgment",
    criteria: [
      "Balanced consideration of viewpoints",
      "Use of evaluative language",
      "Prioritization of arguments",
      "Reasoned judgment in conclusion",
    ],
    feedbackTemplate: `
## Evaluation Feedback

**Evaluative Points:**
{{points}}

**Balance:**
{{balance}}

**Quality of Judgment:**
{{judgment}}

**Suggestions for Improvement:**
{{improvements}}
    `,
    maxScore: 9,
    weight: 0.25,
  },
];

// Unit-specific knowledge domains
export const unitKnowledge: Record<UnitCode, {
  title: string;
  topics: string[];
  keyDiagrams: string[];
  commonContexts: string[];
}> = {
  WEC11: {
    title: "Markets in Action (Microeconomics)",
    topics: [
      "Scarcity and choice",
      "Production possibility frontiers",
      "Supply and demand",
      "Price elasticity",
      "Market failure",
      "Externalities",
      "Public goods",
      "Government intervention",
    ],
    keyDiagrams: [
      "Supply and demand equilibrium",
      "Price elasticity of demand",
      "Negative externalities (MSC > MPC)",
      "Positive externalities (MSB > MPB)",
      "Tax incidence",
      "Subsidy effects",
    ],
    commonContexts: [
      "Housing market",
      "Transport and congestion",
      "Energy markets",
      "Agriculture",
      "Healthcare",
    ],
  },
  WEC12: {
    title: "Macroeconomic Performance and Policy",
    topics: [
      "Circular flow of income",
      "Aggregate demand and supply",
      "Economic growth",
      "Inflation",
      "Unemployment",
      "Balance of payments",
      "Macroeconomic policies",
      "International competitiveness",
    ],
    keyDiagrams: [
      "AD/AS model",
      "Phillips curve",
      "Keynesian vs Classical AS",
      "Multiplier effect",
      "Crowding out",
      "Lorenz curve",
    ],
    commonContexts: [
      "UK economy",
      "US economy",
      "Developing economies",
      "Eurozone",
      "Post-pandemic recovery",
    ],
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
      "Labour markets",
    ],
    keyDiagrams: [
      "Cost curves (SRAC, LRAC, MC)",
      "Revenue curves",
      "Profit maximization (MC=MR)",
      "Perfect competition short/long run",
      "Monopoly welfare loss",
      "Kinked demand curve",
    ],
    commonContexts: [
      "Big Tech",
      "Energy companies",
      "Retail markets",
      "Airlines",
      "Pharmaceuticals",
    ],
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
      "Role of state",
      "International institutions",
    ],
    keyDiagrams: [
      "Comparative advantage",
      "Tariff effects",
      "Exchange rate determination",
      "J-curve effect",
      "Lorenz curve/Gini coefficient",
      "Poverty cycle",
    ],
    commonContexts: [
      "Developing countries",
      "China",
      "India",
      "Sub-Saharan Africa",
      "Climate change",
    ],
  },
};

// Grade boundaries (typical)
export const gradeBoundaries = {
  Astar: 90,
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40,
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

// System prompt for AI examiners
export function generateSystemPrompt(unit: UnitCode, questionType: QuestionType): string {
  const config = getQuestionTypeConfig(questionType);
  const unitData = unitKnowledge[unit];
  
  return `You are an expert Pearson Edexcel IAL Economics examiner specializing in ${unitData.title}.

**Question Type:** ${questionType} (${config?.marks} marks)
**Unit:** ${unit}

**Your Role:**
You are one of four specialist examiners assessing this response. Focus on your specific assessment objective while being aware of the overall mark scheme.

**Key Topics in this Unit:**
${unitData.topics.map(t => `- ${t}`).join("\n")}

**Relevant Diagrams:**
${unitData.keyDiagrams.map(d => `- ${d}`).join("\n")}

**Mark Scheme for ${questionType} questions:**
${config?.examinerAdvice}

**Current Contexts (2024-2025):**
${unitData.commonContexts.map(c => `- ${c}`).join("\n")}

**Grading Standards:**
- Level 3 (High): Detailed knowledge, thorough application, developed analysis/evaluation
- Level 2 (Mid): Sound knowledge, some application, clear but limited analysis/evaluation  
- Level 1 (Low): Basic knowledge, limited application, undeveloped analysis/evaluation

**Important:**
- Base assessment on official Edexcel IAL Economics mark schemes
- Consider the specific context provided in the question
- Award marks based on what the candidate HAS done, not what they haven't
- Use current real-world examples where appropriate
- Reference specific mark scheme levels in feedback`;
}
