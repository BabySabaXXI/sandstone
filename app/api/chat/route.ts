import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const chatRequestSchema = z.object({
  message: z.string().min(1),
  subject: z.enum(["economics", "geography"]),
  chatHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, subject, chatHistory = [] } = chatRequestSchema.parse(body);

    // Check authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    // Build messages array
    const messages = [
      {
        role: "system" as const,
        content: SUBJECT_SYSTEM_PROMPTS[subject],
      },
      ...chatHistory.slice(-6).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    // Call Kimi API
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Kimi API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat API error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
