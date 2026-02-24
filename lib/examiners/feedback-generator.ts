/**
 * Feedback Generator
 * Sandstone App - Enhanced Feedback Generation
 * 
 * Generates detailed, actionable feedback for students based on
 * examiner assessments and Edexcel mark scheme criteria.
 */

import { 
  ExaminerResult, 
  GradingResponse, 
  Annotation 
} from "./grading-service";
import { 
  QuestionType, 
  MarkBand, 
  getMarkBand, 
  getQuestionTypeConfig,
  AssessmentObjective,
} from "./config";

// ============================================================================
// Type Definitions
// ============================================================================

export interface DetailedFeedback {
  overallComment: string;
  aoBreakdown: AOFeedback[];
  specificStrengths: string[];
  priorityImprovements: string[];
  actionPlan: ActionItem[];
  nextSteps: string[];
  estimatedGradeBoundary: string;
}

export interface AOFeedback {
  ao: AssessmentObjective;
  score: number;
  maxScore: number;
  percentage: number;
  comment: string;
  strengths: string[];
  improvements: string[];
}

export interface ActionItem {
  priority: "high" | "medium" | "low";
  action: string;
  resource?: string;
  estimatedTime?: string;
}

export interface ProgressTracker {
  currentScore: number;
  targetScore: number;
  progressPercentage: number;
  milestones: Milestone[];
}

export interface Milestone {
  score: number;
  description: string;
  achieved: boolean;
}

// ============================================================================
// Detailed Feedback Generator
// ============================================================================

export function generateDetailedFeedback(
  gradingResponse: GradingResponse,
  questionType: QuestionType
): DetailedFeedback {
  const { examinerResults, overallScore, maxScore, percentage, grade } = gradingResponse;
  
  // Generate AO breakdown
  const aoBreakdown = generateAOBreakdown(examinerResults);
  
  // Extract all strengths and improvements
  const allStrengths = examinerResults.flatMap(r => r.strengths);
  const allImprovements = examinerResults.flatMap(r => r.improvements);
  
  // Deduplicate and prioritize
  const specificStrengths = deduplicateAndPrioritize(allStrengths, 5);
  const priorityImprovements = deduplicateAndPrioritize(allImprovements, 5);
  
  // Generate action plan
  const actionPlan = generateActionPlan(examinerResults, questionType);
  
  // Generate next steps
  const nextSteps = generateNextSteps(percentage, questionType);
  
  // Estimate grade boundary
  const estimatedGradeBoundary = estimateGradeBoundary(percentage, questionType);
  
  // Generate overall comment
  const overallComment = generateOverallComment(gradingResponse, questionType);

  return {
    overallComment,
    aoBreakdown,
    specificStrengths,
    priorityImprovements,
    actionPlan,
    nextSteps,
    estimatedGradeBoundary,
  };
}

// ============================================================================
// AO Breakdown Generator
// ============================================================================

function generateAOBreakdown(examinerResults: ExaminerResult[]): AOFeedback[] {
  return examinerResults
    .filter(r => r.ao !== "AO1" || r.examinerId !== "consensus")
    .map(result => {
      const percentage = Math.round((result.score / result.maxScore) * 100);
      
      return {
        ao: result.ao,
        score: result.score,
        maxScore: result.maxScore,
        percentage,
        comment: generateAOComment(result.ao, percentage),
        strengths: result.strengths.slice(0, 3),
        improvements: result.improvements.slice(0, 3),
      };
    });
}

function generateAOComment(ao: AssessmentObjective, percentage: number): string {
  const comments: Record<AssessmentObjective, Record<string, string>> = {
    AO1: {
      excellent: "Excellent knowledge and understanding with precise terminology.",
      good: "Good knowledge demonstrated with accurate use of terms.",
      developing: "Developing knowledge - focus on accuracy of definitions.",
      limited: "Limited knowledge shown - review key concepts and terminology.",
    },
    AO2: {
      excellent: "Excellent application to context with relevant, specific examples.",
      good: "Good application with appropriate examples.",
      developing: "Developing application - use more specific examples.",
      limited: "Limited application - ensure you address the specific context.",
    },
    AO3: {
      excellent: "Excellent analysis with clear chains of reasoning throughout.",
      good: "Good analysis with some developed chains of reasoning.",
      developing: "Developing analysis - extend your chains of reasoning.",
      limited: "Limited analysis - focus on cause and effect relationships.",
    },
    AO4: {
      excellent: "Excellent evaluation with balanced arguments and supported judgment.",
      good: "Good evaluation with some balanced discussion.",
      developing: "Developing evaluation - include more counter-arguments.",
      limited: "Limited evaluation - practice using evaluative language.",
    },
  };
  
  const level = percentage >= 75 ? "excellent" : percentage >= 50 ? "good" : percentage >= 30 ? "developing" : "limited";
  return comments[ao][level];
}

// ============================================================================
// Action Plan Generator
// ============================================================================

function generateActionPlan(
  examinerResults: ExaminerResult[], 
  questionType: QuestionType
): ActionItem[] {
  const actionItems: ActionItem[] = [];
  
  // Find weakest AO
  const weakestAO = examinerResults
    .filter(r => r.examinerId !== "consensus")
    .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))[0];
  
  if (weakestAO) {
    const percentage = (weakestAO.score / weakestAO.maxScore) * 100;
    
    if (percentage < 50) {
      actionItems.push({
        priority: "high",
        action: `Focus on improving ${weakestAO.ao}: ${getAOFocusArea(weakestAO.ao)}`,
        resource: getAOResource(weakestAO.ao),
        estimatedTime: "2-3 hours per week",
      });
    }
  }
  
  // Add question-type specific actions
  const config = getQuestionTypeConfig(questionType);
  if (config?.requiresDiagram) {
    const ao3Result = examinerResults.find(r => r.ao === "AO3");
    if (ao3Result) {
      const diagramQuality = ao3Result.metadata?.diagramQuality as string;
      if (diagramQuality === "poor" || diagramQuality === "missing") {
        actionItems.push({
          priority: "high",
          action: "Practice drawing and labeling economic diagrams accurately",
          resource: "Diagram practice worksheets",
          estimatedTime: "1 hour per week",
        });
      }
    }
  }
  
  // Add evaluation practice for higher mark questions
  if (["12-mark", "14-mark", "16-mark", "20-mark"].includes(questionType)) {
    const ao4Result = examinerResults.find(r => r.ao === "AO4");
    if (ao4Result) {
      const percentage = (ao4Result.score / ao4Result.maxScore) * 100;
      if (percentage < 60) {
        actionItems.push({
          priority: "medium",
          action: "Practice using evaluative phrases and building balanced arguments",
          resource: "Evaluation phrase bank and practice questions",
          estimatedTime: "1-2 hours per week",
        });
      }
    }
  }
  
  // Add general improvement actions
  actionItems.push({
    priority: "medium",
    action: "Review and memorize key definitions and concepts",
    resource: "Key terms flashcards",
    estimatedTime: "30 minutes daily",
  });
  
  return actionItems;
}

function getAOFocusArea(ao: AssessmentObjective): string {
  const focusAreas: Record<AssessmentObjective, string> = {
    AO1: "memorizing precise definitions and key concepts",
    AO2: "applying knowledge to specific contexts with relevant examples",
    AO3: "developing clear chains of reasoning with cause and effect",
    AO4: "building balanced arguments with evaluative language",
  };
  return focusAreas[ao];
}

function getAOResource(ao: AssessmentObjective): string {
  const resources: Record<AssessmentObjective, string> = {
    AO1: "Key terms glossary and definition practice",
    AO2: "Contextual application exercises and case studies",
    AO3: "Chain of reasoning practice questions",
    AO4: "Evaluation framework and balanced argument templates",
  };
  return resources[ao];
}

// ============================================================================
// Next Steps Generator
// ============================================================================

function generateNextSteps(percentage: number, questionType: QuestionType): string[] {
  const steps: string[] = [];
  
  if (percentage >= 80) {
    steps.push("Continue practicing with more challenging questions");
    steps.push("Focus on timing to complete questions within exam conditions");
    steps.push("Review synoptic connections between topics");
  } else if (percentage >= 60) {
    steps.push("Practice questions of the same type to build consistency");
    steps.push("Focus on the weakest assessment objective identified");
    steps.push("Review mark schemes to understand examiner expectations");
  } else if (percentage >= 40) {
    steps.push("Review the relevant topic content thoroughly");
    steps.push("Practice basic definitions and concepts");
    steps.push("Work through example answers with examiner commentary");
    steps.push("Focus on one assessment objective at a time");
  } else {
    steps.push("Start with foundational knowledge - review key definitions");
    steps.push("Work through textbook explanations of core concepts");
    steps.push("Practice simple application questions first");
    steps.push("Seek additional support from your teacher");
    steps.push("Use flashcards to memorize key terms");
  }
  
  // Add question-type specific steps
  if (questionType === "20-mark") {
    steps.push("Practice integrating knowledge from multiple topics");
  }
  
  return steps.slice(0, 5);
}

// ============================================================================
// Grade Boundary Estimator
// ============================================================================

function estimateGradeBoundary(percentage: number, questionType: QuestionType): string {
  const config = getQuestionTypeConfig(questionType);
  if (!config) return "Unable to estimate";
  
  const totalMarks = config.totalMarks;
  
  // Edexcel grade boundaries (approximate)
  const boundaries = {
    "A*": Math.ceil(totalMarks * 0.9),
    "A": Math.ceil(totalMarks * 0.8),
    "B": Math.ceil(totalMarks * 0.7),
    "C": Math.ceil(totalMarks * 0.6),
    "D": Math.ceil(totalMarks * 0.5),
    "E": Math.ceil(totalMarks * 0.4),
  };
  
  const currentMarks = Math.round((percentage / 100) * totalMarks);
  
  // Find next grade boundary
  for (const [grade, marks] of Object.entries(boundaries)) {
    if (currentMarks < marks) {
      const marksNeeded = marks - currentMarks;
      return `${marksNeeded} mark${marksNeeded > 1 ? 's' : ''} needed for grade ${grade}`;
    }
  }
  
  return "Achieved maximum grade boundary";
}

// ============================================================================
// Overall Comment Generator
// ============================================================================

function generateOverallComment(
  gradingResponse: GradingResponse, 
  questionType: QuestionType
): string {
  const { overallScore, maxScore, percentage, grade, examinerResults } = gradingResponse;
  
  // Find strongest and weakest AOs
  const sortedAOs = examinerResults
    .filter(r => r.examinerId !== "consensus")
    .sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
  
  const strongestAO = sortedAOs[0];
  const weakestAO = sortedAOs[sortedAOs.length - 1];
  
  let comment = `This ${questionType} response achieved ${overallScore}/${maxScore} marks (${percentage}%), `;
  comment += `equivalent to grade ${grade}. `;
  
  if (strongestAO && weakestAO) {
    comment += `Your strongest area is ${strongestAO.ao} (${strongestAO.score}/${strongestAO.maxScore}), `;
    comment += `while ${weakestAO.ao} (${weakestAO.score}/${weakestAO.maxScore}) offers the most potential for improvement. `;
  }
  
  // Add specific advice based on percentage
  if (percentage >= 80) {
    comment += "This is an excellent response demonstrating strong understanding across all assessment objectives. ";
    comment += "To achieve full marks, focus on adding more sophistication to your evaluation and ensuring every point is fully developed.";
  } else if (percentage >= 60) {
    comment += "This is a good response showing solid understanding. ";
    comment += "Focus on developing your weaker areas to push into the top grade boundaries.";
  } else if (percentage >= 40) {
    comment += "This response shows developing understanding with room for improvement. ";
    comment += "Work on strengthening your knowledge base and practicing application to different contexts.";
  } else {
    comment += "This response needs significant development. ";
    comment += "Focus on building foundational knowledge and understanding the basic requirements of this question type.";
  }
  
  return comment;
}

// ============================================================================
// Utility Functions
// ============================================================================

function deduplicateAndPrioritize(items: string[], limit: number): string[] {
  // Remove duplicates (case-insensitive)
  const seen = new Set<string>();
  const unique: string[] = [];
  
  for (const item of items) {
    const normalized = item.toLowerCase().trim();
    if (!seen.has(normalized) && item.trim()) {
      seen.add(normalized);
      unique.push(item);
    }
  }
  
  return unique.slice(0, limit);
}

// ============================================================================
// Progress Tracker
// ============================================================================

export function generateProgressTracker(
  currentScore: number,
  targetScore: number,
  questionType: QuestionType
): ProgressTracker {
  const config = getQuestionTypeConfig(questionType);
  const maxScore = config?.totalMarks || 20;
  
  const progressPercentage = Math.min(100, Math.round((currentScore / targetScore) * 100));
  
  const milestones: Milestone[] = [
    { score: Math.ceil(maxScore * 0.4), description: "Pass grade (E)", achieved: currentScore >= Math.ceil(maxScore * 0.4) },
    { score: Math.ceil(maxScore * 0.6), description: "Grade C", achieved: currentScore >= Math.ceil(maxScore * 0.6) },
    { score: Math.ceil(maxScore * 0.7), description: "Grade B", achieved: currentScore >= Math.ceil(maxScore * 0.7) },
    { score: Math.ceil(maxScore * 0.8), description: "Grade A", achieved: currentScore >= Math.ceil(maxScore * 0.8) },
    { score: Math.ceil(maxScore * 0.9), description: "Grade A*", achieved: currentScore >= Math.ceil(maxScore * 0.9) },
  ];
  
  return {
    currentScore,
    targetScore,
    progressPercentage,
    milestones,
  };
}

// ============================================================================
// Annotation Generator Enhancement
// ============================================================================

export function generateSmartAnnotations(
  essay: string,
  examinerResults: ExaminerResult[]
): Annotation[] {
  const annotations: Annotation[] = [];
  
  // Pattern-based annotation generation
  const patterns: Array<{
    pattern: RegExp;
    type: Annotation["type"];
    message: string;
    suggestion?: string;
  }> = [
    {
      pattern: /\b(however|although|on the other hand|conversely|nevertheless)\b/gi,
      type: "evaluation",
      message: "Good evaluative language",
      suggestion: "Ensure this evaluation is developed with specific reasoning",
    },
    {
      pattern: /\b(because|therefore|as a result|this leads to|consequently|thus)\b/gi,
      type: "analysis",
      message: "Clear analytical connection",
      suggestion: "Consider extending this chain of reasoning further",
    },
    {
      pattern: /\b(in conclusion|overall|to conclude|in summary)\b/gi,
      type: "evaluation",
      message: "Concluding statement",
      suggestion: "Ensure your conclusion is supported by preceding analysis",
    },
    {
      pattern: /\b(for example|for instance|such as|e\.g\.)\b/gi,
      type: "knowledge",
      message: "Example provided",
      suggestion: "Make sure this example is specific and relevant to the context",
    },
  ];
  
  patterns.forEach(({ pattern, type, message, suggestion }) => {
    let match;
    while ((match = pattern.exec(essay)) !== null) {
      // Find the sentence containing this match
      const sentenceStart = essay.lastIndexOf(".", match.index) + 1;
      const sentenceEnd = essay.indexOf(".", match.index);
      const end = sentenceEnd !== -1 ? sentenceEnd + 1 : essay.length;
      
      annotations.push({
        id: `anno-${match.index}`,
        type,
        start: sentenceStart,
        end,
        message,
        suggestion,
      });
    }
  });
  
  // Limit annotations
  return annotations.slice(0, 8);
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  generateDetailedFeedback,
  generateProgressTracker,
  generateSmartAnnotations,
};
