/**
 * Examiner Configuration - Enhanced AI Grading System
 * Sandstone App - Edexcel A-Level Economics & Geography
 * 
 * This module provides examiner configurations for multi-AO assessment
 * aligned with official Edexcel mark schemes.
 */

import { Subject } from "@/types";

// ============================================================================
// Type Definitions
// ============================================================================

export interface ExaminerConfig {
  id: string;
  name: string;
  description: string;
  ao: AssessmentObjective;
  icon: string;
  color: string;
  maxScore: number;
  weight: number;
  criteria: string[];
  promptTemplate: string;
}

export type AssessmentObjective = 
  | "AO1" // Knowledge and Understanding
  | "AO2" // Application
  | "AO3" // Analysis
  | "AO4"; // Evaluation

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

export interface QuestionTypeConfig {
  type: QuestionType;
  totalMarks: number;
  aoDistribution: Record<AssessmentObjective, number>;
  requiresDiagram: boolean;
  recommendedLength: string;
  timeAllocation: number; // minutes
  description: string;
}

export interface MarkBand {
  minScore: number;
  maxScore: number;
  level: string;
  description: string;
  characteristics: string[];
}

// ============================================================================
// Question Type Configurations (Edexcel-aligned)
// ============================================================================

export const questionTypeConfigs: Record<QuestionType, QuestionTypeConfig> = {
  "4-mark": {
    type: "4-mark",
    totalMarks: 4,
    aoDistribution: { AO1: 2, AO2: 2, AO3: 0, AO4: 0 },
    requiresDiagram: false,
    recommendedLength: "100-150 words",
    timeAllocation: 5,
    description: "Knowledge and application question - define and apply concepts",
  },
  "6-mark": {
    type: "6-mark",
    totalMarks: 6,
    aoDistribution: { AO1: 2, AO2: 2, AO3: 2, AO4: 0 },
    requiresDiagram: false,
    recommendedLength: "150-200 words",
    timeAllocation: 8,
    description: "Knowledge, application and basic analysis",
  },
  "8-mark": {
    type: "8-mark",
    totalMarks: 8,
    aoDistribution: { AO1: 2, AO2: 2, AO3: 4, AO4: 0 },
    requiresDiagram: true,
    recommendedLength: "200-250 words",
    timeAllocation: 10,
    description: "Analysis-focused with diagram requirement",
  },
  "10-mark": {
    type: "10-mark",
    totalMarks: 10,
    aoDistribution: { AO1: 2, AO2: 2, AO3: 4, AO4: 2 },
    requiresDiagram: true,
    recommendedLength: "250-300 words",
    timeAllocation: 12,
    description: "Full analysis with introductory evaluation",
  },
  "12-mark": {
    type: "12-mark",
    totalMarks: 12,
    aoDistribution: { AO1: 2, AO2: 2, AO3: 4, AO4: 4 },
    requiresDiagram: true,
    recommendedLength: "300-400 words",
    timeAllocation: 15,
    description: "Evaluation question with balanced judgment",
  },
  "14-mark": {
    type: "14-mark",
    totalMarks: 14,
    aoDistribution: { AO1: 2, AO2: 3, AO3: 4, AO4: 5 },
    requiresDiagram: true,
    recommendedLength: "400-500 words",
    timeAllocation: 18,
    description: "Extended evaluation with context application",
  },
  "16-mark": {
    type: "16-mark",
    totalMarks: 16,
    aoDistribution: { AO1: 3, AO2: 3, AO3: 5, AO4: 5 },
    requiresDiagram: true,
    recommendedLength: "500-600 words",
    timeAllocation: 20,
    description: "Full essay with comprehensive evaluation",
  },
  "20-mark": {
    type: "20-mark",
    totalMarks: 20,
    aoDistribution: { AO1: 4, AO2: 4, AO3: 6, AO4: 6 },
    requiresDiagram: true,
    recommendedLength: "600-800 words",
    timeAllocation: 25,
    description: "Synoptic essay requiring multiple perspectives",
  },
};

// ============================================================================
// Mark Bands (Edexcel Standard)
// ============================================================================

export const markBands: Record<QuestionType, MarkBand[]> = {
  "4-mark": [
    { minScore: 0, maxScore: 1, level: "L1", description: "Limited knowledge", characteristics: ["Basic definitions", "Minimal context"] },
    { minScore: 2, maxScore: 3, level: "L2", description: "Good knowledge and application", characteristics: ["Clear definitions", "Relevant application"] },
    { minScore: 4, maxScore: 4, level: "L3", description: "Excellent understanding", characteristics: ["Precise definitions", "Full contextual application"] },
  ],
  "6-mark": [
    { minScore: 0, maxScore: 2, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak application"] },
    { minScore: 3, maxScore: 4, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Some application", "Basic analysis"] },
    { minScore: 5, maxScore: 6, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Clear application", "Developed analysis"] },
  ],
  "8-mark": [
    { minScore: 0, maxScore: 2, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak chains of reasoning"] },
    { minScore: 3, maxScore: 5, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Some chains of reasoning", "Diagram present"] },
    { minScore: 6, maxScore: 8, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Clear chains of reasoning", "Accurate diagram"] },
  ],
  "10-mark": [
    { minScore: 0, maxScore: 3, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak analysis", "Little evaluation"] },
    { minScore: 4, maxScore: 6, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Some analysis", "Basic evaluation"] },
    { minScore: 7, maxScore: 10, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Clear analysis", "Developed evaluation"] },
  ],
  "12-mark": [
    { minScore: 0, maxScore: 4, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak analysis", "Limited evaluation"] },
    { minScore: 5, maxScore: 8, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Clear analysis", "Some evaluation with judgment"] },
    { minScore: 9, maxScore: 12, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Developed analysis", "Balanced evaluation with supported judgment"] },
  ],
  "14-mark": [
    { minScore: 0, maxScore: 5, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak application", "Limited analysis and evaluation"] },
    { minScore: 6, maxScore: 9, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Clear application", "Some developed analysis and evaluation"] },
    { minScore: 10, maxScore: 14, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Full contextual application", "Developed analysis and evaluation with supported judgment"] },
  ],
  "16-mark": [
    { minScore: 0, maxScore: 5, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak application", "Limited analysis and evaluation"] },
    { minScore: 6, maxScore: 10, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Clear application", "Some developed analysis and evaluation with judgment"] },
    { minScore: 11, maxScore: 16, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Full contextual application", "Developed analysis and evaluation with well-supported judgment"] },
  ],
  "20-mark": [
    { minScore: 0, maxScore: 6, level: "L1", description: "Limited", characteristics: ["Basic knowledge", "Weak application", "Limited analysis and evaluation"] },
    { minScore: 7, maxScore: 13, level: "L2", description: "Developing", characteristics: ["Good knowledge", "Clear application", "Some developed analysis and evaluation with judgment"] },
    { minScore: 14, maxScore: 20, level: "L3", description: "Strong", characteristics: ["Full knowledge", "Full contextual application", "Developed analysis and evaluation with well-supported judgment across multiple perspectives"] },
  ],
};

// ============================================================================
// AO1: Knowledge and Understanding Examiner
// ============================================================================

const ao1Examiner: ExaminerConfig = {
  id: "knowledge",
  name: "Knowledge Examiner",
  description: "Assesses accurate definitions, concepts, and theoretical understanding",
  ao: "AO1",
  icon: "BookOpen",
  color: "#E8D5C4",
  maxScore: 4,
  weight: 0.2,
  criteria: [
    "Accurate definitions of key terms",
    "Correct use of economic/geographical concepts",
    "Appropriate theoretical frameworks",
    "Relevant knowledge selection",
  ],
  promptTemplate: `You are an expert examiner assessing AO1: Knowledge and Understanding.

Your task is to evaluate the student's demonstration of subject knowledge.

ASSESSMENT CRITERIA (AO1):
- Level 3 (4 marks): Comprehensive and accurate knowledge with precise terminology
- Level 2 (2-3 marks): Good knowledge with mostly accurate definitions
- Level 1 (1 mark): Basic knowledge with some accurate points
- Level 0 (0 marks): No relevant knowledge demonstrated

EVALUATION GUIDANCE:
1. Check accuracy of all key term definitions
2. Assess breadth of knowledge demonstrated
3. Evaluate precision of terminology
4. Consider relevance of knowledge to the question

You MUST respond in this exact JSON format:
{
  "score": <number 0-4>,
  "band": "<L1|L2|L3>",
  "feedback": "<2-3 sentences explaining the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "keyTermsUsed": ["<accurate term 1>", "<accurate term 2>"],
  "keyTermsMissing": ["<missing term 1>", "<missing term 2>"]
}`,
};

// ============================================================================
// AO2: Application Examiner
// ============================================================================

const ao2Examiner: ExaminerConfig = {
  id: "application",
  name: "Application Examiner",
  description: "Evaluates how well knowledge is applied to the specific context",
  ao: "AO2",
  icon: "Target",
  color: "#A8C5D4",
  maxScore: 4,
  weight: 0.2,
  criteria: [
    "Contextual application of knowledge",
    "Use of relevant examples",
    "Reference to specific scenarios/data",
    "Appropriate case study selection",
  ],
  promptTemplate: `You are an expert examiner assessing AO2: Application.

Your task is to evaluate how well the student applies knowledge to the given context.

ASSESSMENT CRITERIA (AO2):
- Level 3 (4 marks): Full and effective application to context with specific examples
- Level 2 (2-3 marks): Good application with some relevant examples
- Level 1 (1 mark): Limited application with generic examples
- Level 0 (0 marks): No application to context

EVALUATION GUIDANCE:
1. Assess how well the response addresses the specific question context
2. Evaluate relevance and specificity of examples used
3. Check for reference to any provided data/scenarios
4. Consider appropriateness of case studies

You MUST respond in this exact JSON format:
{
  "score": <number 0-4>,
  "band": "<L1|L2|L3>",
  "feedback": "<2-3 sentences explaining the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>"],
  "contextualReferences": ["<context reference 1>"]
}`,
};

// ============================================================================
// AO3: Analysis Examiner
// ============================================================================

const ao3Examiner: ExaminerConfig = {
  id: "analysis",
  name: "Analysis Examiner",
  description: "Assesses chains of reasoning, cause-and-effect, and use of diagrams",
  ao: "AO3",
  icon: "GitBranch",
  color: "#A8C5A8",
  maxScore: 6,
  weight: 0.3,
  criteria: [
    "Clear chains of reasoning",
    "Cause and effect relationships",
    "Appropriate use of diagrams",
    "Logical development of arguments",
  ],
  promptTemplate: `You are an expert examiner assessing AO3: Analysis.

Your task is to evaluate the student's analytical skills and chains of reasoning.

ASSESSMENT CRITERIA (AO3):
- Level 3 (5-6 marks): Developed chains of reasoning with clear cause-effect, accurate diagram
- Level 2 (3-4 marks): Some chains of reasoning with basic cause-effect, diagram present
- Level 1 (1-2 marks): Limited chains of reasoning, weak cause-effect, no/poor diagram
- Level 0 (0 marks): No analytical content

EVALUATION GUIDANCE:
1. Identify and count clear chains of reasoning (minimum 2 steps)
2. Assess quality of cause-and-effect explanations
3. Evaluate diagram accuracy (if applicable):
   - Correct axes labels
   - Accurate curves/shifts
   - Clear equilibrium points
   - Appropriate annotations
4. Check logical flow of arguments

You MUST respond in this exact JSON format:
{
  "score": <number 0-6>,
  "band": "<L1|L2|L3>",
  "feedback": "<2-3 sentences explaining the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "chainsOfReasoning": <number>,
  "diagramQuality": "<excellent|good|adequate|poor|missing>",
  "diagramFeedback": "<specific diagram feedback if applicable>"
}`,
};

// ============================================================================
// AO4: Evaluation Examiner
// ============================================================================

const ao4Examiner: ExaminerConfig = {
  id: "evaluation",
  name: "Evaluation Examiner",
  description: "Assesses critical evaluation, balanced arguments, and supported judgments",
  ao: "AO4",
  icon: "Scale",
  color: "#E5C9A8",
  maxScore: 6,
  weight: 0.3,
  criteria: [
    "Balanced arguments presented",
    "Critical assessment of points",
    "Prioritization of factors",
    "Supported judgments/conclusions",
  ],
  promptTemplate: `You are an expert examiner assessing AO4: Evaluation.

Your task is to evaluate the student's critical evaluation and judgment skills.

ASSESSMENT CRITERIA (AO4):
- Level 3 (5-6 marks): Developed evaluation with balanced arguments, critical assessment, and well-supported judgment
- Level 2 (3-4 marks): Some evaluation with partially balanced arguments and basic judgment
- Level 1 (1-2 marks): Limited evaluation with unbalanced arguments and unsupported judgment
- Level 0 (0 marks): No evaluative content

EVALUATION GUIDANCE:
1. Count evaluative comments (however, although, on the other hand, etc.)
2. Assess balance of arguments (pros vs cons)
3. Evaluate quality of critical assessment
4. Check for prioritization of factors
5. Assess whether final judgment is supported by preceding analysis

EVALUATIVE PHRASES TO LOOK FOR:
- "However...", "Although...", "On the other hand..."
- "It depends upon...", "The extent to which..."
- "A more significant factor...", "The most important..."
- "In conclusion...", "Overall...", "Therefore..."

You MUST respond in this exact JSON format:
{
  "score": <number 0-6>,
  "band": "<L1|L2|L3>",
  "feedback": "<2-3 sentences explaining the score>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "evaluativeComments": <number>,
  "balanceScore": "<excellent|good|adequate|poor>",
  "judgmentQuality": "<well-supported|partially-supported|unsupported|missing>"
}`,
};

// ============================================================================
// Consensus Examiner
// ============================================================================

const consensusExaminer: ExaminerConfig = {
  id: "consensus",
  name: "Consensus Examiner",
  description: "Synthesizes all examiner feedback into final assessment",
  ao: "AO1",
  icon: "Users",
  color: "#C4A8C5",
  maxScore: 20,
  weight: 0,
  criteria: ["Overall assessment synthesis", "Final grade determination"],
  promptTemplate: `You are a senior chief examiner providing a final consensus assessment.

Your task is to synthesize all examiner feedback into a coherent final assessment.

SYNTHESIS REQUIREMENTS:
1. Review all AO scores and feedback
2. Identify key patterns across assessments
3. Provide holistic improvement suggestions
4. Determine final grade recommendation

You MUST respond in this exact JSON format:
{
  "overallAssessment": "<3-4 sentence summary of performance>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "priorityImprovements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "gradeRecommendation": "<A*|A|B|C|D|E|U>",
  "nextSteps": "<advice for continued improvement>"
}`,
};

// ============================================================================
// Economics Examiners Array
// ============================================================================

export const economicsExaminers: ExaminerConfig[] = [
  ao1Examiner,
  ao2Examiner,
  ao3Examiner,
  ao4Examiner,
  consensusExaminer,
];

// ============================================================================
// Geography Examiners Array
// ============================================================================

export const geographyExaminers: ExaminerConfig[] = [
  {
    ...ao1Examiner,
    criteria: [
      "Accurate geographical knowledge",
      "Correct use of geographical terminology",
      "Appropriate case studies and examples",
      "Relevant place-specific knowledge",
    ],
  },
  {
    ...ao2Examiner,
    criteria: [
      "Application to specific places/contexts",
      "Use of relevant case studies",
      "Consideration of scale (local to global)",
      "Appropriate geographical examples",
    ],
  },
  {
    ...ao3Examiner,
    criteria: [
      "Clear explanation of processes",
      "Understanding of interconnections",
      "Effective use of geographical evidence",
      "Logical development of geographical arguments",
    ],
  },
  {
    ...ao4Examiner,
    criteria: [
      "Balanced geographical perspectives",
      "Critical assessment of viewpoints",
      "Consideration of different scales",
      "Supported geographical conclusions",
    ],
  },
  consensusExaminer,
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getExaminers(subject: Subject): ExaminerConfig[] {
  switch (subject) {
    case "economics":
      return economicsExaminers;
    case "geography":
      return geographyExaminers;
    default:
      return economicsExaminers;
  }
}

export function getQuestionTypeConfig(type: QuestionType): QuestionTypeConfig | undefined {
  return questionTypeConfigs[type];
}

export function getMarkBand(type: QuestionType, score: number): MarkBand | undefined {
  const bands = markBands[type];
  return bands.find(band => score >= band.minScore && score <= band.maxScore);
}

export function calculateGrade(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return "A*";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "U";
}

export function calculateUMS(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100;
  
  // Edexcel UMS conversion (simplified)
  if (percentage >= 90) return Math.round(80 + (percentage - 90) * 0.2);
  if (percentage >= 80) return Math.round(70 + (percentage - 80) * 1);
  if (percentage >= 70) return Math.round(60 + (percentage - 70) * 1);
  if (percentage >= 60) return Math.round(50 + (percentage - 60) * 1);
  if (percentage >= 50) return Math.round(40 + (percentage - 50) * 1);
  if (percentage >= 40) return Math.round(30 + (percentage - 40) * 1);
  return Math.round(percentage * 0.75);
}

export function getExaminerPrompt(
  examiner: ExaminerConfig,
  unit: UnitCode,
  questionType: QuestionType,
  hasDiagram: boolean
): string {
  const config = getQuestionTypeConfig(questionType);
  const aoMaxMarks = config?.aoDistribution[examiner.ao] || 4;
  
  return `${examiner.promptTemplate}

QUESTION CONTEXT:
- Unit: ${unit}
- Question Type: ${questionType} (${config?.totalMarks} marks total)
- Your AO Focus: ${examiner.ao} (Maximum ${aoMaxMarks} marks for this question type)
- Diagram Required: ${config?.requiresDiagram ? "Yes" : "No"}
- Diagram Provided: ${hasDiagram ? "Yes" : "No"}

Remember to be strict but fair in your assessment. Apply the mark scheme precisely.`;
}

export function getDiagramFeedback(questionType: QuestionType, hasDiagram: boolean): string {
  const config = getQuestionTypeConfigs(questionType);
  
  if (!config?.requiresDiagram) {
    return "";
  }
  
  if (!hasDiagram) {
    return `⚠️ **Diagram Missing**: For ${questionType} questions, a diagram is typically required. Consider including an appropriate diagram to support your analysis and maximize your AO3 marks.`;
  }
  
  return "✓ **Diagram Present**: Ensure your diagram is accurately labeled with correct axes, curves, and equilibrium points.";
}

// Helper function to fix the typo in the original function
function getQuestionTypeConfigs(type: QuestionType): QuestionTypeConfig | undefined {
  return questionTypeConfigs[type];
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  economicsExaminers,
  geographyExaminers,
  questionTypeConfigs,
  markBands,
  getExaminers,
  getQuestionTypeConfig,
  getMarkBand,
  calculateGrade,
  calculateUMS,
  getExaminerPrompt,
  getDiagramFeedback,
};
