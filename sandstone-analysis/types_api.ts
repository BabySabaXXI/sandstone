// API Request/Response Types

export interface GradeRequest {
  essay: string;
  question: string;
  useMock?: boolean;
}

export interface GradeResponse {
  overallScore: number;
  band: string;
  examiners: Array<{
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
    criteria: string[];
  }>;
  annotations: Array<{
    id: string;
    type: "grammar" | "vocabulary" | "style" | "positive";
    start: number;
    end: number;
    message: string;
    suggestion?: string;
  }>;
  summary: string;
  improvements: string[];
}

export interface APIErrorResponse {
  error: string;
  code: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}
