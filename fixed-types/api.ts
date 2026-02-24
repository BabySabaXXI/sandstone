// API Request/Response Types
import { AnnotationType } from "./index";

export interface GradeRequest {
  essay: string;
  question: string;
  useMock?: boolean;
}

export interface GradeResponseExaminer {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
}

export interface GradeResponseAnnotation {
  id: string;
  type: AnnotationType;
  start: number;
  end: number;
  message: string;
  suggestion?: string;
}

export interface GradeResponse {
  overallScore: number;
  band: string;
  examiners: GradeResponseExaminer[];
  annotations: GradeResponseAnnotation[];
  summary: string;
  improvements: string[];
}

export interface APIErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}

// Chat API Types
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  message: string;
  subject: "economics" | "geography";
  chatHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
}
