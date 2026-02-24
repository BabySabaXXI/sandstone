/**
 * Enhanced Grading Service
 * Sandstone App - AI Essay Grading with Kimi API
 * 
 * Provides comprehensive essay grading with multi-AO assessment,
 * detailed feedback generation, and Edexcel mark scheme alignment.
 */

import { 
  ExaminerConfig, 
  QuestionType, 
  UnitCode, 
  AssessmentObjective,
  getExaminers,
  getQuestionTypeConfig,
  getMarkBand,
  calculateGrade,
  calculateUMS,
  getExaminerPrompt,
  getDiagramFeedback,
  economicsExaminers,
} from "./config";

// ============================================================================
// Type Definitions
// ============================================================================

export interface GradingRequest {
  question: string;
  essay: string;
  subject: "economics" | "geography";
  unit?: UnitCode;
  questionType?: QuestionType;
  hasDiagram?: boolean;
  contextData?: string;
  extractInfo?: string;
}

export interface ExaminerResult {
  examinerId: string;
  examinerName: string;
  ao: AssessmentObjective;
  score: number;
  maxScore: number;
  band: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  color: string;
  metadata?: Record<string, unknown>;
}

export interface GradingResponse {
  overallScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  ums?: number;
  band: string;
  examinerResults: ExaminerResult[];
  summary: string;
  keyStrengths: string[];
  priorityImprovements: string[];
  annotations: Annotation[];
  diagramFeedback?: string;
  timeEstimate?: string;
  wordCount?: number;
  metadata: GradingMetadata;
}

export interface Annotation {
  id: string;
  type: "grammar" | "vocabulary" | "style" | "positive" | "knowledge" | "analysis" | "evaluation";
  start: number;
  end: number;
  message: string;
  suggestion?: string;
}

export interface GradingMetadata {
  questionType: QuestionType;
  unit: UnitCode;
  processingTime: number;
  modelUsed: string;
  confidence: number;
}

export interface KimiResponse {
  score: number;
  band: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  [key: string]: unknown;
}

// ============================================================================
// Configuration
// ============================================================================

const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const DEFAULT_MODEL = "kimi-latest";
const DEFAULT_TEMPERATURE = 0.2;
const DEFAULT_MAX_TOKENS = 1500;
const REQUEST_TIMEOUT = 25000;

// ============================================================================
// Main Grading Function
// ============================================================================

export async function gradeEssay(request: GradingRequest): Promise<GradingResponse> {
  const startTime = Date.now();
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new GradingError("KIMI_API_KEY not configured", "CONFIG_ERROR");
  }

  const {
    question,
    essay,
    subject = "economics",
    unit = "WEC11",
    questionType = "14-mark",
    hasDiagram = false,
    contextData,
    extractInfo,
  } = request;

  // Validate inputs
  if (!question.trim() || !essay.trim()) {
    throw new GradingError("Question and essay are required", "VALIDATION_ERROR");
  }

  if (essay.length > 10000) {
    throw new GradingError("Essay exceeds maximum length of 10000 characters", "VALIDATION_ERROR");
  }

  const config = getQuestionTypeConfig(questionType);
  if (!config) {
    throw new GradingError(`Invalid question type: ${questionType}`, "VALIDATION_ERROR");
  }

  // Get examiners for the subject
  const examiners = getExaminers(subject).filter(e => e.id !== "consensus");
  
  // Grade with each examiner in parallel
  const examinerPromises = examiners.map(examiner => 
    gradeWithExaminer(examiner, question, essay, unit, questionType, hasDiagram, contextData, extractInfo, apiKey)
  );

  const examinerResults = await Promise.allSettled(examinerPromises);
  const successfulResults: ExaminerResult[] = [];
  const failedExaminers: string[] = [];

  examinerResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successfulResults.push(result.value);
    } else {
      failedExaminers.push(examiners[index].name);
      console.error(`Examiner ${examiners[index].name} failed:`, result.reason);
    }
  });

  // If all examiners failed, throw error
  if (successfulResults.length === 0) {
    throw new GradingError("All examiners failed to grade the essay", "GRADING_ERROR");
  }

  // Calculate overall score
  const { overallScore, maxScore } = calculateOverallScore(successfulResults, questionType);
  const percentage = Math.round((overallScore / maxScore) * 100);
  const grade = calculateGrade(overallScore, maxScore);
  const ums = calculateUMS(overallScore, maxScore);
  const band = getMarkBand(questionType, overallScore)?.level || "L1";

  // Generate consensus feedback
  const consensusFeedback = await generateConsensusFeedback(
    successfulResults, 
    question, 
    essay, 
    apiKey
  );

  // Generate annotations
  const annotations = await generateAnnotations(essay, apiKey);

  // Generate diagram feedback
  const diagramFeedback = config.requiresDiagram 
    ? getDiagramFeedback(questionType, hasDiagram)
    : undefined;

  const processingTime = Date.now() - startTime;

  return {
    overallScore,
    maxScore,
    percentage,
    grade,
    ums,
    band,
    examinerResults: successfulResults,
    summary: consensusFeedback.summary,
    keyStrengths: consensusFeedback.keyStrengths,
    priorityImprovements: consensusFeedback.priorityImprovements,
    annotations,
    diagramFeedback,
    timeEstimate: config.timeAllocation 
      ? `${config.timeAllocation} minutes recommended`
      : undefined,
    wordCount: essay.split(/\s+/).length,
    metadata: {
      questionType,
      unit,
      processingTime,
      modelUsed: DEFAULT_MODEL,
      confidence: calculateConfidence(successfulResults, failedExaminers.length),
    },
  };
}

// ============================================================================
// Individual Examiner Grading
// ============================================================================

async function gradeWithExaminer(
  examiner: ExaminerConfig,
  question: string,
  essay: string,
  unit: UnitCode,
  questionType: QuestionType,
  hasDiagram: boolean,
  contextData: string | undefined,
  extractInfo: string | undefined,
  apiKey: string
): Promise<ExaminerResult> {
  const systemPrompt = getExaminerPrompt(examiner, unit, questionType, hasDiagram);
  
  const userContent = buildUserContent(question, essay, contextData, extractInfo, hasDiagram);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Kimi API");
    }

    const parsed = parseExaminerResponse(content, examiner);
    
    return {
      examinerId: examiner.id,
      examinerName: examiner.name,
      ao: examiner.ao,
      score: parsed.score,
      maxScore: examiner.maxScore,
      band: parsed.band || "L1",
      feedback: parsed.feedback,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      color: examiner.color,
      metadata: parsed.metadata,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseExaminerResponse(content: string, examiner: ExaminerConfig): KimiResponse {
  try {
    // Try to parse as JSON
    const parsed = JSON.parse(content);
    
    // Validate and normalize the response
    const score = Math.min(
      Math.max(Math.round(Number(parsed.score) || 0), 0),
      examiner.maxScore
    );
    
    return {
      score,
      band: parsed.band || getBandFromScore(score, examiner.maxScore),
      feedback: parsed.feedback || "No feedback provided",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      ...parsed, // Include any additional metadata
    };
  } catch (error) {
    console.error("Failed to parse examiner response:", error);
    
    // Fallback: try to extract score from text
    const scoreMatch = content.match(/score[\s:=]+(\d+)/i);
    const score = scoreMatch 
      ? Math.min(Math.max(parseInt(scoreMatch[1], 10), 0), examiner.maxScore)
      : Math.floor(examiner.maxScore / 2);
    
    return {
      score,
      band: getBandFromScore(score, examiner.maxScore),
      feedback: content.substring(0, 500) || "Unable to parse detailed feedback",
      strengths: [],
      improvements: ["Please try again for more detailed feedback"],
    };
  }
}

function getBandFromScore(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 75) return "L3";
  if (percentage >= 40) return "L2";
  return "L1";
}

// ============================================================================
// Content Building
// ============================================================================

function buildUserContent(
  question: string,
  essay: string,
  contextData: string | undefined,
  extractInfo: string | undefined,
  hasDiagram: boolean
): string {
  let content = `QUESTION: ${question}\n\n`;
  
  if (contextData) {
    content += `CONTEXT/DATA PROVIDED:\n${contextData}\n\n`;
  }
  
  if (extractInfo) {
    content += `EXTRACT INFORMATION:\n${extractInfo}\n\n`;
  }
  
  content += `STUDENT RESPONSE:\n${essay}\n\n`;
  content += `DIAGRAM: ${hasDiagram ? "Student has provided a diagram" : "No diagram provided"}\n\n`;
  content += `Please provide your assessment in the required JSON format.`;
  
  return content;
}

// ============================================================================
// Score Calculation
// ============================================================================

function calculateOverallScore(
  results: ExaminerResult[], 
  questionType: QuestionType
): { overallScore: number; maxScore: number } {
  const config = getQuestionTypeConfig(questionType);
  if (!config) {
    // Fallback: simple sum
    const total = results.reduce((sum, r) => sum + r.score, 0);
    const max = results.reduce((sum, r) => sum + r.maxScore, 0);
    return { overallScore: total, maxScore: max };
  }

  // Weight scores by AO distribution
  let weightedScore = 0;
  
  results.forEach(result => {
    const aoMaxMarks = config.aoDistribution[result.ao] || 0;
    if (aoMaxMarks > 0) {
      const proportion = result.score / result.maxScore;
      weightedScore += proportion * aoMaxMarks;
    }
  });

  return {
    overallScore: Math.round(weightedScore * 10) / 10,
    maxScore: config.totalMarks,
  };
}

function calculateConfidence(results: ExaminerResult[], failedCount: number): number {
  if (results.length === 0) return 0;
  
  const baseConfidence = 0.9;
  const failurePenalty = failedCount * 0.15;
  const variancePenalty = calculateScoreVariance(results) * 0.1;
  
  return Math.max(0.3, Math.min(0.98, baseConfidence - failurePenalty - variancePenalty));
}

function calculateScoreVariance(results: ExaminerResult[]): number {
  if (results.length < 2) return 0;
  
  const normalizedScores = results.map(r => r.score / r.maxScore);
  const mean = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
  const variance = normalizedScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / normalizedScores.length;
  
  return Math.sqrt(variance);
}

// ============================================================================
// Consensus Feedback Generation
// ============================================================================

interface ConsensusFeedback {
  summary: string;
  keyStrengths: string[];
  priorityImprovements: string[];
}

async function generateConsensusFeedback(
  results: ExaminerResult[],
  question: string,
  essay: string,
  apiKey: string
): Promise<ConsensusFeedback> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const scoresSummary = results.map(r => 
      `${r.examinerName} (${r.ao}): ${r.score}/${r.maxScore} - ${r.band}`
    ).join("\n");

    const allStrengths = results.flatMap(r => r.strengths).slice(0, 6);
    const allImprovements = results.flatMap(r => r.improvements).slice(0, 6);

    const prompt = `You are a senior chief examiner providing a final consensus assessment.

SCORES SUMMARY:
${scoresSummary}

STUDENT STRENGTHS IDENTIFIED:
${allStrengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}

AREAS FOR IMPROVEMENT:
${allImprovements.map((s, i) => `${i + 1}. ${s}`).join("\n")}

QUESTION: ${question.substring(0, 200)}...

Provide a consensus assessment in this JSON format:
{
  "summary": "<3-4 sentence overall assessment highlighting key performance>",
  "keyStrengths": ["<top 3 strengths>"],
  "priorityImprovements": ["<top 3 priority improvements>"]
}`;

    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "Generate consensus feedback" },
        ],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Consensus generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || generateFallbackSummary(results),
        keyStrengths: parsed.keyStrengths?.slice(0, 3) || allStrengths.slice(0, 3),
        priorityImprovements: parsed.priorityImprovements?.slice(0, 3) || allImprovements.slice(0, 3),
      };
    }
  } catch (error) {
    console.error("Consensus generation error:", error);
  }

  // Fallback
  return {
    summary: generateFallbackSummary(results),
    keyStrengths: results.flatMap(r => r.strengths).slice(0, 3),
    priorityImprovements: results.flatMap(r => r.improvements).slice(0, 3),
  };
}

function generateFallbackSummary(results: ExaminerResult[]): string {
  const avgScore = results.reduce((sum, r) => sum + (r.score / r.maxScore), 0) / results.length;
  const percentage = Math.round(avgScore * 100);
  
  if (percentage >= 75) {
    return `This is a strong response demonstrating excellent understanding across all assessment objectives. The student shows particularly strong ${results.filter(r => r.score/r.maxScore > 0.75).map(r => r.ao).join(" and ")} skills.`;
  } else if (percentage >= 50) {
    return `This is a competent response showing good understanding with room for development. The student demonstrates solid ${results.filter(r => r.score/r.maxScore > 0.5).map(r => r.ao).join(" and ")}, while ${results.filter(r => r.score/r.maxScore <= 0.5).map(r => r.ao).join(" and ")} could be further developed.`;
  } else {
    return `This response shows developing understanding with significant room for improvement. Focus should be placed on strengthening ${results.filter(r => r.score/r.maxScore < 0.5).map(r => r.ao).join(" and ")} skills.`;
  }
}

// ============================================================================
// Annotation Generation
// ============================================================================

async function generateAnnotations(essay: string, apiKey: string): Promise<Annotation[]> {
  // For now, return basic annotations based on pattern matching
  // In a full implementation, this would use the AI to identify specific issues
  const annotations: Annotation[] = [];
  
  // Simple pattern-based annotations
  const sentences = essay.match(/[^.!?]+[.!?]+/g) || [];
  
  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    const start = essay.indexOf(trimmed);
    const end = start + trimmed.length;
    
    // Check for evaluative language
    if (/\b(however|although|on the other hand|it depends|in contrast)\b/i.test(trimmed)) {
      annotations.push({
        id: `eval-${index}`,
        type: "evaluation",
        start,
        end,
        message: "Good evaluative language",
        suggestion: "Ensure this evaluation is developed with specific reasoning",
      });
    }
    
    // Check for analytical language
    if (/\b(because|therefore|as a result|this leads to|consequently)\b/i.test(trimmed)) {
      annotations.push({
        id: `anal-${index}`,
        type: "analysis",
        start,
        end,
        message: "Clear analytical connection",
        suggestion: "Consider extending this chain of reasoning",
      });
    }
  });
  
  return annotations.slice(0, 5);
}

// ============================================================================
// Error Handling
// ============================================================================

export class GradingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GradingError";
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function validateGradingRequest(request: GradingRequest): string[] {
  const errors: string[] = [];
  
  if (!request.question?.trim()) {
    errors.push("Question is required");
  }
  
  if (!request.essay?.trim()) {
    errors.push("Essay is required");
  }
  
  if (request.essay && request.essay.length > 10000) {
    errors.push("Essay exceeds maximum length of 10000 characters");
  }
  
  if (request.questionType && !getQuestionTypeConfig(request.questionType)) {
    errors.push(`Invalid question type: ${request.questionType}`);
  }
  
  return errors;
}

export function getGradeDescription(grade: string): string {
  const descriptions: Record<string, string> = {
    "A*": "Exceptional performance with comprehensive understanding",
    "A": "Excellent performance with strong understanding",
    "B": "Good performance with sound understanding",
    "C": "Satisfactory performance with adequate understanding",
    "D": "Basic performance with limited understanding",
    "E": "Minimal performance with weak understanding",
    "U": "Unclassified - significant improvement needed",
  };
  
  return descriptions[grade] || "Grade not recognized";
}

export function getImprovementPriority(score: number, maxScore: number): "high" | "medium" | "low" {
  const percentage = (score / maxScore) * 100;
  if (percentage < 50) return "high";
  if (percentage < 75) return "medium";
  return "low";
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  gradeEssay,
  validateGradingRequest,
  getGradeDescription,
  getImprovementPriority,
  GradingError,
};
