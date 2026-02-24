import { GradingResult, Annotation, ExaminerScore } from "@/types";

interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface KimiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const KIMI_API_KEY = process.env.KIMI_API_KEY || "";

export async function gradeEssayWithKimi(
  essay: string,
  question: string
): Promise<GradingResult> {
  const messages: KimiMessage[] = [
    {
      role: "system",
      content: `You are an expert IELTS Writing Task 2 examiner with 20+ years of experience.

Evaluate essays based on the four official IELTS criteria:
1. Task Response (TR) - 25%
2. Coherence and Cohesion (CC) - 25%
3. Lexical Resource (LR) - 25%
4. Grammatical Range and Accuracy (GRA) - 25%

Provide detailed feedback with specific examples and actionable improvements.

Return your evaluation as a JSON object with this exact structure:
{
  "overallScore": number (0-9),
  "band": string (e.g., "7.5"),
  "examiners": [
    {
      "name": string,
      "score": number (0-9),
      "maxScore": 9,
      "feedback": string,
      "criteria": string[]
    }
  ],
  "annotations": [
    {
      "id": string,
      "type": "grammar" | "vocabulary" | "style" | "positive",
      "start": number,
      "end": number,
      "message": string,
      "suggestion": string
    }
  ],
  "summary": string,
  "improvements": string[]
}`,
    },
    {
      role: "user",
      content: `Essay Question: ${question}\n\nEssay Text:\n${essay}\n\nPlease evaluate this essay and return a JSON object with the structure specified in your instructions.`,
    },
  ];

  try {
    const response = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "kimi-latest",
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data: KimiResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Kimi API");
    }

    const result = JSON.parse(content) as GradingResult;
    return result;
  } catch (error) {
    console.error("Error grading essay:", error);
    throw error;
  }
}

// Mock grading for testing without API
export function mockGradeEssay(essay: string, question: string): GradingResult {
  const wordCount = essay.split(/\s+/).length;
  const baseScore = Math.min(9, Math.max(5, 6 + wordCount / 200));

  const examiners: ExaminerScore[] = [
    {
      name: "Task Response",
      score: Math.min(9, baseScore + Math.random() * 0.5),
      maxScore: 9,
      feedback: "The essay addresses the task reasonably well with a clear position.",
      criteria: ["Addresses task requirements", "Clear position", "Relevant examples"],
    },
    {
      name: "Coherence & Cohesion",
      score: Math.min(9, baseScore + Math.random() * 0.5),
      maxScore: 9,
      feedback: "Good paragraph organization with clear progression of ideas.",
      criteria: ["Logical structure", "Effective linking", "Clear paragraphs"],
    },
    {
      name: "Lexical Resource",
      score: Math.min(9, baseScore + Math.random() * 0.5),
      maxScore: 9,
      feedback: "Adequate vocabulary range with some less common lexical items.",
      criteria: ["Vocabulary range", "Word choice", "Collocations"],
    },
    {
      name: "Grammatical Range",
      score: Math.min(9, baseScore + Math.random() * 0.5),
      maxScore: 9,
      feedback: "Good variety of sentence structures with minor errors.",
      criteria: ["Sentence variety", "Grammar accuracy", "Punctuation"],
    },
  ];

  const avgScore = examiners.reduce((sum, e) => sum + e.score, 0) / examiners.length;

  return {
    overallScore: avgScore,
    grade: avgScore >= 8 ? "A*" : avgScore >= 7 ? "A" : avgScore >= 6 ? "B" : avgScore >= 5 ? "C" : "D",
    examiners,
    annotations: generateMockAnnotations(essay),
    summary: `This response demonstrates a ${avgScore.toFixed(1)} level of proficiency.`,
    improvements: [
      "Practice using more sophisticated vocabulary",
      "Work on complex sentence structures",
      "Ensure consistent use of academic register",
    ],
    subject: "economics" as const,
  };
}

function generateMockAnnotations(essay: string): Annotation[] {
  const annotations: Annotation[] = [];
  const words = essay.split(/(\s+)/);
  let position = 0;

  // Add some mock annotations
  for (let i = 0; i < Math.min(5, words.length); i++) {
    const word = words[i * 10];
    if (word && word.length > 3) {
      const types: Annotation["type"][] = ["grammar", "vocabulary", "style", "positive"];
      annotations.push({
        id: crypto.randomUUID(),
        type: types[Math.floor(Math.random() * types.length)],
        start: position,
        end: position + word.length,
        message: `Sample feedback for "${word}"`,
        suggestion: Math.random() > 0.5 ? `Consider using a synonym` : undefined,
      });
    }
    position += word?.length || 0 + 1;
  }

  return annotations;
}
