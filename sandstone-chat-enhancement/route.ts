import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Enhanced chat request schema with context awareness
const chatRequestSchema = z.object({
  message: z.string().min(1),
  subject: z.enum(["economics", "geography", "general"]),
  chatHistory: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).optional().default([]),
  context: z.object({
    essayText: z.string().optional(),
    essayQuestion: z.string().optional(),
    documentContent: z.string().optional(),
    flashcardTopic: z.string().optional(),
    quizResults: z.array(z.object({
      question: z.string(),
      userAnswer: z.string(),
      correct: z.boolean(),
    })).optional(),
    userLevel: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
    learningGoal: z.string().optional(),
  }).optional().default({}),
  stream: z.boolean().optional().default(false),
});

// Enhanced system prompts with context awareness
const SUBJECT_SYSTEM_PROMPTS: Record<string, (context: any) => string> = {
  economics: (ctx) => `You are an expert A-Level Economics tutor specializing in Pearson Edexcel IAL Economics. 

Your expertise includes:
- Microeconomics: Market structures, market failure, government intervention, consumer/producer theory
- Macroeconomics: Economic growth, inflation, unemployment, monetary/fiscal policy, international trade, development economics
- Exam techniques: 4-mark, 6-mark, 8-mark, 10-mark, 12-mark, 14-mark, 16-mark, and 20-mark questions
- Assessment Objectives: AO1 (Knowledge & Understanding), AO2 (Application), AO3 (Analysis), AO4 (Evaluation)

${ctx.userLevel ? `Adapt your explanations for a ${ctx.userLevel} level student.` : ''}
${ctx.learningGoal ? `The student's learning goal is: ${ctx.learningGoal}` : ''}

When helping students:
1. Use clear economic terminology and precise definitions
2. Provide real-world examples and applications
3. Include diagrams when relevant (describe them clearly using ASCII art or detailed descriptions)
4. Show chains of reasoning for analytical questions
5. Demonstrate evaluation skills (consider alternative viewpoints, short vs long term, stakeholders, assumptions)
6. Reference the Edexcel IAL syllabus where appropriate
7. Adapt complexity based on the student's demonstrated understanding

Be encouraging but rigorous. Push students to develop their evaluation skills.

${ctx.essayText ? `\n=== CONTEXT: STUDENT'S ESSAY ===\n${ctx.essayText}\n=== END ESSAY ===` : ''}
${ctx.essayQuestion ? `\n=== ESSAY QUESTION ===\n${ctx.essayQuestion}\n=== END QUESTION ===` : ''}`,

  geography: (ctx) => `You are an expert A-Level Geography tutor specializing in physical and human geography.

Your expertise includes:
- Physical Geography: Water cycle, carbon cycle, hot desert systems, coastal systems, glaciation, hazards (tectonics, weather), ecosystems
- Human Geography: Globalisation, regeneration, superpowers, migration, human rights, trade, development
- Fieldwork and investigation skills
- Cartographic, graphical, and statistical analysis
- Essay writing for 6-mark, 9-mark, 12-mark, 16-mark, and 20-mark questions
- Assessment Objectives: AO1 (Knowledge), AO2 (Application), AO3 (Analysis), AO4 (Evaluation)

${ctx.userLevel ? `Adapt your explanations for a ${ctx.userLevel} level student.` : ''}
${ctx.learningGoal ? `The student's learning goal is: ${ctx.learningGoal}` : ''}

When helping students:
1. Use accurate geographical terminology
2. Provide specific place-based examples and case studies
3. Include relevant data and statistics
4. Develop synoptic links between topics
5. Show geographical thinking through chains of reasoning
6. Demonstrate critical evaluation of theories and approaches

Be encouraging but push students to think geographically and make connections between different parts of the curriculum.

${ctx.essayText ? `\n=== CONTEXT: STUDENT'S ESSAY ===\n${ctx.essayText}\n=== END ESSAY ===` : ''}
${ctx.essayQuestion ? `\n=== ESSAY QUESTION ===\n${ctx.essayQuestion}\n=== END QUESTION ===` : ''}`,

  general: (ctx) => `You are a knowledgeable and supportive AI tutor helping students with their studies.

${ctx.userLevel ? `Adapt your explanations for a ${ctx.userLevel} level student.` : ''}
${ctx.learningGoal ? `The student's learning goal is: ${ctx.learningGoal}` : ''}

When helping students:
1. Provide clear, structured explanations
2. Use appropriate examples to illustrate concepts
3. Encourage critical thinking and questions
4. Adapt your teaching style to the student's needs
5. Be encouraging and supportive

${ctx.documentContent ? `\n=== CONTEXT: REFERENCE DOCUMENT ===\n${ctx.documentContent.substring(0, 2000)}\n=== END DOCUMENT ===` : ''}
${ctx.flashcardTopic ? `\n=== CURRENT TOPIC ===\n${ctx.flashcardTopic}\n=== END TOPIC ===` : ''}
${ctx.quizResults && ctx.quizResults.length > 0 ? `\n=== RECENT QUIZ RESULTS ===\n${ctx.quizResults.map((r: any, i: number) => `${i + 1}. Q: ${r.question}\n   A: ${r.userAnswer} (${r.correct ? 'Correct' : 'Incorrect'})`).join('\n')}\n=== END QUIZ RESULTS ===` : ''}`,
};

// Message type for Kimi API
interface KimiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function callKimiAPIWithRetry(
  messages: KimiMessage[],
  apiKey: string,
  stream: boolean = false,
  retryCount: number = 0
): Promise<Response> {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "kimi-latest",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Retry on rate limit or server errors
      if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return callKimiAPIWithRetry(messages, apiKey, stream, retryCount + 1);
      }
      
      throw new Error(`Kimi API error: ${errorData.error?.message || response.statusText}`);
    }

    return response;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return callKimiAPIWithRetry(messages, apiKey, stream, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, subject, chatHistory = [], context = {}, stream = false } = chatRequestSchema.parse(body);

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Please sign in to use the AI tutor" },
        { status: 401 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      console.error("KIMI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured", details: "Please contact support" },
        { status: 500 }
      );
    }

    // Build enhanced messages array with context-aware system prompt
    const systemPrompt = SUBJECT_SYSTEM_PROMPTS[subject](context);
    
    // Filter and prepare chat history (limit to last 10 messages for context window)
    const filteredHistory = chatHistory
      .filter((msg): msg is { role: "user" | "assistant"; content: string } => 
        msg.role === "user" || msg.role === "assistant"
      )
      .slice(-10);

    const messages: KimiMessage[] = [
      { role: "system", content: systemPrompt },
      ...filteredHistory,
      { role: "user", content: message },
    ];

    // Call Kimi API with retry logic
    const response = await callKimiAPIWithRetry(messages, apiKey, stream);

    // Handle streaming response
    if (stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Handle non-streaming response
    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    const usage = data.usage;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Invalid AI response", details: "No content received from AI" },
        { status: 500 }
      );
    }

    // Log usage for monitoring (optional)
    console.log(`Kimi API usage - Prompt: ${usage?.prompt_tokens}, Completion: ${usage?.completion_tokens}`);

    return NextResponse.json({ 
      response: aiResponse,
      usage: {
        promptTokens: usage?.prompt_tokens,
        completionTokens: usage?.completion_tokens,
        totalTokens: usage?.total_tokens,
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.issues },
        { status: 400 }
      );
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("Kimi API error")) {
        return NextResponse.json(
          { error: "AI service error", details: error.message },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error", details: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ status: "ok", service: "chat-api" });
}
