import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Validation schema for chat requests
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  subject: z.enum(["economics", "geography"], {
    errorMap: () => ({ message: "Subject must be 'economics' or 'geography'" }),
  }),
  chatHistory: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).max(20, "Chat history too long").optional(),
});

// Subject-specific system prompts
const SUBJECT_SYSTEM_PROMPTS: Record<string, string> = {
  economics: `You are an expert A-Level Economics tutor specializing in Pearson Edexcel IAL Economics. 

Your expertise includes:
- Microeconomics: Market structures, market failure, government intervention, consumer/producer theory
- Macroeconomics: Economic growth, inflation, unemployment, monetary/fiscal policy, international trade, development economics
- Exam techniques: 4-mark, 6-mark, 8-mark, 10-mark, 12-mark, 14-mark, 16-mark, and 20-mark questions
- Assessment Objectives: AO1 (Knowledge & Understanding), AO2 (Application), AO3 (Analysis), AO4 (Evaluation)

When helping students:
1. Use clear economic terminology and precise definitions
2. Provide real-world examples and applications
3. Include diagrams when relevant (describe them clearly)
4. Show chains of reasoning for analytical questions
5. Demonstrate evaluation skills (consider alternative viewpoints, short vs long term, stakeholders, assumptions)
6. Reference the Edexcel IAL syllabus where appropriate

Be encouraging but rigorous. Push students to develop their evaluation skills.`,

  geography: `You are an expert A-Level Geography tutor specializing in physical and human geography.

Your expertise includes:
- Physical Geography: Water cycle, carbon cycle, hot desert systems, coastal systems, glaciation, hazards (tectonics, weather), ecosystems
- Human Geography: Globalisation, regeneration, superpowers, migration, human rights, trade, development
- Fieldwork and investigation skills
- Cartographic, graphical, and statistical analysis
- Essay writing for 6-mark, 9-mark, 12-mark, 16-mark, and 20-mark questions
- Assessment Objectives: AO1 (Knowledge), AO2 (Application), AO3 (Analysis), AO4 (Evaluation)

When helping students:
1. Use accurate geographical terminology
2. Provide specific place-based examples and case studies
3. Include relevant data and statistics
4. Develop synoptic links between topics
5. Show geographical thinking through chains of reasoning
6. Demonstrate critical evaluation of theories and approaches

Be encouraging but push students to think geographically and make connections between different parts of the curriculum.`,
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// POST handler for chat requests
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request format", 
          details: validationResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { message, subject, chatHistory = [] } = validationResult.data;

    // Check authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to use the chat feature." },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id, 30, 60000)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a minute." },
        { status: 429 }
      );
    }

    // Check API key
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      console.error("KIMI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // Build messages array with context window management
    const maxHistoryMessages = 6;
    const messages = [
      {
        role: "system" as const,
        content: SUBJECT_SYSTEM_PROMPTS[subject],
      },
      ...chatHistory.slice(-maxHistoryMessages).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Call Kimi API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
          max_tokens: 2000,
          top_p: 0.9,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Kimi API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return NextResponse.json(
          { error: "Failed to get AI response. Please try again." },
          { status: 502 }
        );
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        return NextResponse.json(
          { error: "Invalid AI response format" },
          { status: 502 }
        );
      }

      // Log successful request (for monitoring)
      const duration = Date.now() - startTime;
      console.log(`Chat API success: ${duration}ms, user: ${user.id.slice(0, 8)}...`);

      return NextResponse.json(
        { 
          response: aiResponse,
          meta: {
            duration,
            model: data.model,
            usage: data.usage,
          },
        },
        {
          headers: {
            // Prevent caching of chat responses
            "Cache-Control": "private, no-cache, no-store, must-revalidate",
          },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout. Please try again." },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Chat API error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
