import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  generateSystemPrompt,
  economicsExaminers,
  getQuestionTypeConfig,
  calculateGrade,
  type QuestionType,
  type UnitCode,
} from "@/lib/examiners/economics-config";

const gradeRequestSchema = z.object({
  question: z.string().min(1),
  essay: z.string().min(1),
  subject: z.enum(["economics", "geography"]),
  unit: z.enum(["WEC11", "WEC12", "WEC13", "WEC14"]).optional(),
  questionType: z
    .enum(["4-mark", "6-mark", "8-mark", "10-mark", "12-mark", "14-mark", "16-mark", "20-mark"])
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, essay, subject, unit = "WEC11", questionType = "14-mark" } =
      gradeRequestSchema.parse(body);

    // Check auth
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Kimi API key
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured - missing KIMI_API_KEY" },
        { status: 500 }
      );
    }

    const questionConfig = getQuestionTypeConfig(questionType as QuestionType);
    if (!questionConfig) {
      return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
    }

    // Generate system prompt
    const baseSystemPrompt = generateSystemPrompt(unit as UnitCode, questionType as QuestionType);

    // Get grading from AI
    const examinerScores: any[] = [];
    const annotations: any[] = [];

    for (const examiner of economicsExaminers) {
      const examinerPrompt = `${baseSystemPrompt}

**YOUR ROLE: ${examiner.name} (${examiner.ao})**

Criteria:
${examiner.criteria.map((c) => `- ${c}`).join("\n")}

Provide JSON response:
{
  "score": number (0-${examiner.maxScore}),
  "feedback": "detailed feedback",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "annotations": [
    {"type": "knowledge|application|analysis|evaluation", "start": number, "end": number, "message": "feedback"}
  ]
}`;

      try {
        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "kimi-latest",
            messages: [
              { role: "system", content: examinerPrompt },
              {
                role: "user",
                content: `Question: ${question}\n\nStudent Response:\n${essay}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            examinerScores.push({
              examinerId: examiner.id,
              examinerName: examiner.name,
              score: Math.min(result.score || 5, examiner.maxScore),
              maxScore: examiner.maxScore,
              feedback: result.feedback || "",
              criteria: result.strengths || [],
              ao: examiner.ao,
            });

            if (result.annotations) {
              annotations.push(
                ...result.annotations.map((a: any, i: number) => ({
                  id: `${examiner.id}-${i}`,
                  type: a.type || "knowledge",
                  start: a.start || 0,
                  end: a.end || 0,
                  message: a.message || "",
                }))
              );
            }
          }
        }
      } catch (error) {
        console.error(`Examiner ${examiner.name} error:`, error);
        examinerScores.push({
          examinerId: examiner.id,
          examinerName: examiner.name,
          score: 5,
          maxScore: examiner.maxScore,
          feedback: "Unable to assess - please try again",
          criteria: [],
          ao: examiner.ao,
        });
      }
    }

    // Calculate results
    const totalScore = examinerScores.reduce((sum, e) => sum + e.score, 0);
    const maxTotalScore = examinerScores.reduce((sum, e) => sum + e.maxScore, 0);
    const overallScore = (totalScore / maxTotalScore) * 10;
    const grade = calculateGrade(totalScore, maxTotalScore);

    // Generate summary
    let summary = "";
    let improvements: string[] = [];

    try {
      const summaryResponse = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "kimi-latest",
          messages: [
            {
              role: "system",
              content: `You are a senior examiner. Provide a brief overall summary (2-3 sentences) and 3 specific improvements. Format: {"summary": "...", "improvements": ["...", "...", "..."]}`
            },
            {
              role: "user",
              content: `Question: ${question}\n\nResponse: ${essay.substring(0, 1000)}...\n\nScores: ${examinerScores.map(e => `${e.ao}: ${e.score}/${e.maxScore}`).join(", ")}`
            }
          ],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        const content = summaryData.choices?.[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            summary = parsed.summary || "";
            improvements = parsed.improvements || [];
          }
        }
      }
    } catch (error) {
      console.error("Summary generation error:", error);
    }

    return NextResponse.json({
      overallScore: Number(overallScore.toFixed(1)),
      grade,
      examiners: examinerScores,
      annotations,
      summary,
      improvements,
      questionType,
      unit,
    });
  } catch (error) {
    console.error("Grade API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
