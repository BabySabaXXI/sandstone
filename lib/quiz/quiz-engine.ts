/**
 * Quiz Engine
 * Core logic for quiz scoring, answer validation, and results calculation
 */

import {
  QuizQuestion,
  QuestionType,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  EssayQuestion,
  CalculationQuestion,
  DiagramLabelQuestion,
  QuestionAnswer,
  QuestionResult,
  QuizAttempt,
  Quiz,
} from './quiz-types';

// ============================================================================
// Answer Validation
// ============================================================================

/**
 * Validates an answer for a given question type
 */
export function validateAnswer(
  question: QuizQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  switch (question.type) {
    case 'multiple_choice':
      return validateMultipleChoice(question as MultipleChoiceQuestion, answer);
    case 'multiple_select':
      return validateMultipleSelect(question as MultipleSelectQuestion, answer);
    case 'true_false':
      return validateTrueFalse(question as TrueFalseQuestion, answer);
    case 'fill_blank':
      return validateFillBlank(question as FillBlankQuestion, answer);
    case 'short_answer':
      return validateShortAnswer(question as ShortAnswerQuestion, answer);
    case 'matching':
      return validateMatching(question as MatchingQuestion, answer);
    case 'ordering':
      return validateOrdering(question as OrderingQuestion, answer);
    case 'calculation':
      return validateCalculation(question as CalculationQuestion, answer);
    case 'diagram_label':
      return validateDiagramLabel(question as DiagramLabelQuestion, answer);
    case 'essay':
      return validateEssay(question as EssayQuestion, answer);
    default:
      return { correct: false, pointsEarned: 0, feedback: 'Unknown question type' };
  }
}

function validateMultipleChoice(
  question: MultipleChoiceQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'string') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const correct = answer === question.correctAnswer;
  return {
    correct,
    pointsEarned: correct ? question.points : 0,
    feedback: correct 
      ? 'Correct!' 
      : `The correct answer was: ${question.correctAnswer}`,
  };
}

function validateMultipleSelect(
  question: MultipleSelectQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (!Array.isArray(answer)) {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const correctAnswers = question.correctAnswers;
  const selectedAnswers = answer as string[];
  
  // Calculate correct selections
  const correctSelections = selectedAnswers.filter(a => correctAnswers.includes(a));
  const incorrectSelections = selectedAnswers.filter(a => !correctAnswers.includes(a));
  
  if (question.partialCredit) {
    // Partial credit calculation
    const correctRatio = correctSelections.length / correctAnswers.length;
    const penaltyRatio = incorrectSelections.length / question.options.length;
    const scoreRatio = Math.max(0, correctRatio - penaltyRatio * 0.5);
    const pointsEarned = Math.round(scoreRatio * question.points * 100) / 100;
    
    const allCorrect = correctSelections.length === correctAnswers.length && incorrectSelections.length === 0;
    
    return {
      correct: allCorrect,
      pointsEarned,
      feedback: allCorrect 
        ? 'Correct!' 
        : `You selected ${correctSelections.length} of ${correctAnswers.length} correct answers.`,
    };
  } else {
    // All-or-nothing scoring
    const allCorrect = correctSelections.length === correctAnswers.length && incorrectSelections.length === 0;
    
    return {
      correct: allCorrect,
      pointsEarned: allCorrect ? question.points : 0,
      feedback: allCorrect 
        ? 'Correct!' 
        : `The correct answers were: ${correctAnswers.join(', ')}`,
    };
  }
}

function validateTrueFalse(
  question: TrueFalseQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'boolean') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const correct = answer === question.correctAnswer;
  return {
    correct,
    pointsEarned: correct ? question.points : 0,
    feedback: correct 
      ? 'Correct!' 
      : `The statement is ${question.correctAnswer ? 'true' : 'false'}.`,
  };
}

function validateFillBlank(
  question: FillBlankQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (!Array.isArray(answer) && typeof answer !== 'object') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const answers = answer as Record<string, string>;
  let totalPoints = 0;
  let allCorrect = true;
  const feedbacks: string[] = [];
  
  for (const blank of question.blanks) {
    const userAnswer = answers[blank.id] || '';
    const normalizedUserAnswer = question.caseSensitive 
      ? userAnswer.trim() 
      : userAnswer.trim().toLowerCase();
    
    const normalizedCorrect = question.caseSensitive 
      ? blank.correctAnswer.trim() 
      : blank.correctAnswer.trim().toLowerCase();
    
    const acceptableAnswers = (blank.acceptableAnswers || []).map(a => 
      question.caseSensitive ? a.trim() : a.trim().toLowerCase()
    );
    
    const isCorrect = normalizedUserAnswer === normalizedCorrect || 
                      acceptableAnswers.includes(normalizedUserAnswer);
    
    if (isCorrect) {
      totalPoints += question.points / question.blanks.length;
    } else {
      allCorrect = false;
      feedbacks.push(`Blank "${blank.id}": Expected "${blank.correctAnswer}"`);
    }
  }
  
  return {
    correct: allCorrect,
    pointsEarned: Math.round(totalPoints * 100) / 100,
    feedback: allCorrect ? 'Correct!' : feedbacks.join('; '),
  };
}

function validateShortAnswer(
  question: ShortAnswerQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'string') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const normalizedAnswer = question.caseSensitive 
    ? answer.trim() 
    : answer.trim().toLowerCase();
  
  const normalizedCorrect = question.caseSensitive 
    ? question.correctAnswer.trim() 
    : question.correctAnswer.trim().toLowerCase();
  
  const acceptableAnswers = (question.acceptableAnswers || []).map(a => 
    question.caseSensitive ? a.trim() : a.trim().toLowerCase()
  );
  
  const isCorrect = normalizedAnswer === normalizedCorrect || 
                    acceptableAnswers.includes(normalizedAnswer);
  
  // Check for keywords if defined
  let keywordScore = 0;
  if (question.keywords && question.keywords.length > 0) {
    const foundKeywords = question.keywords.filter(kw => 
      normalizedAnswer.includes(question.caseSensitive ? kw : kw.toLowerCase())
    );
    keywordScore = foundKeywords.length / question.keywords.length;
  }
  
  // If exact match, full points. Otherwise, partial credit based on keywords
  const pointsEarned = isCorrect 
    ? question.points 
    : (question.keywords ? Math.round(keywordScore * question.points * 50) / 100 : 0);
  
  return {
    correct: isCorrect,
    pointsEarned,
    feedback: isCorrect 
      ? 'Correct!' 
      : `Expected: "${question.correctAnswer}"`,
  };
}

function validateMatching(
  question: MatchingQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'object' || answer === null) {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const matches = answer as Record<string, string>;
  let correctMatches = 0;
  
  for (const pair of question.pairs) {
    if (matches[pair.id] === pair.right) {
      correctMatches++;
    }
  }
  
  const pointsPerMatch = question.points / question.pairs.length;
  const pointsEarned = Math.round(correctMatches * pointsPerMatch * 100) / 100;
  const allCorrect = correctMatches === question.pairs.length;
  
  return {
    correct: allCorrect,
    pointsEarned,
    feedback: allCorrect 
      ? 'Correct!' 
      : `You matched ${correctMatches} of ${question.pairs.length} correctly.`,
  };
}

function validateOrdering(
  question: OrderingQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (!Array.isArray(answer)) {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const userOrder = answer as string[];
  const correctOrder = question.correctOrder;
  
  // Calculate score based on correct positions
  let correctPositions = 0;
  for (let i = 0; i < Math.min(userOrder.length, correctOrder.length); i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctPositions++;
    }
  }
  
  const pointsPerItem = question.points / correctOrder.length;
  const pointsEarned = Math.round(correctPositions * pointsPerItem * 100) / 100;
  const allCorrect = correctPositions === correctOrder.length;
  
  return {
    correct: allCorrect,
    pointsEarned,
    feedback: allCorrect 
      ? 'Correct!' 
      : `You placed ${correctPositions} of ${correctOrder.length} items in the correct position.`,
  };
}

function validateCalculation(
  question: CalculationQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'number') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const tolerance = question.tolerance || 0.01;
  const correct = Math.abs(answer - question.correctAnswer) <= tolerance;
  
  return {
    correct,
    pointsEarned: correct ? question.points : 0,
    feedback: correct 
      ? 'Correct!' 
      : `The correct answer is ${question.correctAnswer}${question.units ? ' ' + question.units : ''}.`,
  };
}

function validateDiagramLabel(
  question: DiagramLabelQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'object' || answer === null) {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  const labels = answer as Record<string, string>;
  let correctLabels = 0;
  
  for (const label of question.labels) {
    const userAnswer = (labels[label.id] || '').trim();
    const normalizedUser = userAnswer.toLowerCase();
    const normalizedCorrect = label.correctText.toLowerCase();
    const acceptableAnswers = (label.acceptableAnswers || []).map(a => a.toLowerCase());
    
    if (normalizedUser === normalizedCorrect || acceptableAnswers.includes(normalizedUser)) {
      correctLabels++;
    }
  }
  
  const pointsPerLabel = question.points / question.labels.length;
  const pointsEarned = Math.round(correctLabels * pointsPerLabel * 100) / 100;
  const allCorrect = correctLabels === question.labels.length;
  
  return {
    correct: allCorrect,
    pointsEarned,
    feedback: allCorrect 
      ? 'Correct!' 
      : `You labeled ${correctLabels} of ${question.labels.length} correctly.`,
  };
}

function validateEssay(
  question: EssayQuestion,
  answer: unknown
): { correct: boolean; pointsEarned: number; feedback?: string } {
  if (typeof answer !== 'string') {
    return { correct: false, pointsEarned: 0, feedback: 'Invalid answer format' };
  }
  
  // Essay questions require manual grading
  // Return pending status
  const wordCount = answer.trim().split(/\s+/).length;
  
  return {
    correct: false, // Will be updated after manual grading
    pointsEarned: 0, // Will be updated after manual grading
    feedback: `Essay submitted (${wordCount} words). Awaiting manual grading.`,
  };
}

// ============================================================================
// Quiz Scoring
// ============================================================================

/**
 * Calculate the total score for a quiz attempt
 */
export function calculateQuizScore(
  quiz: Quiz,
  answers: Record<string, unknown>
): {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  questionResults: QuestionResult[];
} {
  let totalScore = 0;
  const questionResults: QuestionResult[] = [];
  
  for (const question of quiz.questions) {
    const userAnswer = answers[question.id];
    const validation = validateAnswer(question, userAnswer);
    
    totalScore += validation.pointsEarned;
    
    questionResults.push({
      questionId: question.id,
      question,
      userAnswer,
      correct: validation.correct,
      pointsEarned: validation.pointsEarned,
      maxPoints: question.points,
      feedback: validation.feedback,
      timeSpent: 0, // Will be tracked separately
    });
  }
  
  const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= quiz.settings.passingScore;
  
  return {
    score: totalScore,
    maxScore,
    percentage,
    passed,
    questionResults,
  };
}

// ============================================================================
// Question Utilities
// ============================================================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Prepare questions for a quiz session (shuffle if needed)
 */
export function prepareQuizQuestions(quiz: Quiz): QuizQuestion[] {
  let questions = [...quiz.questions];
  
  if (quiz.settings.shuffleQuestions) {
    questions = shuffleArray(questions);
  }
  
  // Shuffle options for applicable question types
  questions = questions.map(q => {
    if ((q.type === 'multiple_choice' || q.type === 'multiple_select') && 
        (q as MultipleChoiceQuestion).shuffleOptions !== false) {
      const mq = q as MultipleChoiceQuestion | MultipleSelectQuestion;
      return { ...q, options: shuffleArray(mq.options) };
    }
    return q;
  });
  
  return questions;
}

/**
 * Get the default points for a question type
 */
export function getDefaultPoints(type: QuestionType): number {
  switch (type) {
    case 'multiple_choice':
    case 'true_false':
      return 1;
    case 'multiple_select':
    case 'fill_blank':
      return 2;
    case 'short_answer':
    case 'matching':
    case 'ordering':
      return 3;
    case 'calculation':
    case 'diagram_label':
      return 4;
    case 'essay':
    case 'case_study':
      return 10;
    default:
      return 1;
  }
}

/**
 * Get the estimated time for a question type (in seconds)
 */
export function getEstimatedTime(type: QuestionType): number {
  switch (type) {
    case 'multiple_choice':
    case 'true_false':
      return 30;
    case 'multiple_select':
      return 45;
    case 'fill_blank':
      return 60;
    case 'short_answer':
      return 90;
    case 'matching':
      return 120;
    case 'ordering':
      return 90;
    case 'calculation':
      return 180;
    case 'diagram_label':
      return 120;
    case 'essay':
      return 900; // 15 minutes
    case 'case_study':
      return 600; // 10 minutes
    default:
      return 60;
  }
}

// ============================================================================
// Quiz Statistics
// ============================================================================

/**
 * Calculate quiz statistics from attempts
 */
export function calculateQuizStats(attempts: QuizAttempt[]) {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      medianScore: 0,
      passRate: 0,
      averageTimeSpent: 0,
    };
  }
  
  const scores = attempts.map(a => a.percentage);
  const times = attempts.map(a => a.timeSpent);
  const passedCount = attempts.filter(a => a.passed).length;
  
  // Calculate median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sortedScores.length / 2);
  const medianScore = sortedScores.length % 2 === 0
    ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
    : sortedScores[mid];
  
  return {
    totalAttempts: attempts.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    medianScore: Math.round(medianScore),
    passRate: Math.round((passedCount / attempts.length) * 100),
    averageTimeSpent: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
  };
}

/**
 * Calculate score distribution
 */
export function calculateScoreDistribution(attempts: QuizAttempt[]): { range: string; count: number }[] {
  const ranges = [
    { min: 0, max: 20, label: '0-20%' },
    { min: 21, max: 40, label: '21-40%' },
    { min: 41, max: 60, label: '41-60%' },
    { min: 61, max: 80, label: '61-80%' },
    { min: 81, max: 100, label: '81-100%' },
  ];
  
  return ranges.map(range => ({
    range: range.label,
    count: attempts.filter(a => a.percentage >= range.min && a.percentage <= range.max).length,
  }));
}
