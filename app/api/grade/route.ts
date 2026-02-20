import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  economicsExaminers,
  getQuestionTypeConfig,
  calculateGrade,
  getExaminerPrompt,
  getDiagramFeedback,
  type QuestionType,
  type UnitCode,
} from "@/lib/examiners/economics-config";

const gradeRequestSchema = z.object({
  question: z.string().min(1),
  essay: z.string().min(1),
  subject: z.enum(["economics", "geography"]),
  unit: z.enum(["WEC11", "WEC12", "WEC13", "WEC14"]).optional(),
  questionType: z.enum(["4-mark", "6-mark", "8-mark", "10-mark", "12-mark", "14-mark", "16-mark", "20-mark"]).optional(),
  hasDiagram: z.boolean().optional(),
});

interface ExaminerScore {
  examinerId: string;
  examinerName: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
  ao: string;
  color: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      question, 
      essay, 
      subject, 
      unit = "WEC11", 
      questionType = "14-mark",
      hasDiagram = false
    } = gradeRequestSchema.parse(body);

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
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const qtConfig = getQuestionTypeConfig(questionType as QuestionType);
    if (!qtConfig) {
      return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
    }

    // Grade with each examiner
    const examinerScores: ExaminerScore[] = [];

    for (const examiner of economicsExaminers) {
      const systemPrompt = getExaminerPrompt(examiner, unit as UnitCode, questionType as QuestionType, hasDiagram);

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
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Question: ${question}\n\nStudent Response:\n${essay}\n\n${hasDiagram ? "DIAGRAM: Student has provided a diagram." : "DIAGRAM: No diagram provided."}`
              }
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          // Try to extract JSON
          let result;
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              result = JSON.parse(jsonMatch[0]);
            }
          } catch {
            // Fallback to text parsing
            result = {
              score: 5,
              feedback: content.substring(0, 500),
              strengths: ["Response attempted"],
              improvements: ["Review feedback above"]
            };
          }

          examinerScores.push({
            examinerId: examiner.id,
            examinerName: examiner.name,
            score: Math.min(Math.max(result?.score || 5, 0), examiner.maxScore),
            maxScore: examiner.maxScore,
            feedback: result?.feedback || "Analysis completed",
            criteria: result?.strengths || result?.criteria || [],
            ao: examiner.ao,
            color: examiner.color,
          });
        }
      } catch (error) {
        console.error(`Examiner ${examiner.name} error:`, error);
        examinerScores.push({
          examinerId: examiner.id,
          examinerName: examiner.name,
          score: 5,
          maxScore: examiner.maxScore,
          feedback: "Unable to complete analysis - please try again",
          criteria: [],
          ao: examiner.ao,
          color: examiner.color,
        });
      }
    }

    // Calculate overall
    const totalScore = examinerScores.reduce((sum, e) => sum + e.score, 0);
    const maxTotalScore = examinerScores.reduce((sum, e) => sum + e.maxScore, 0);
    const overallScore = (totalScore / maxTotalScore) * 10;
    const grade = calculateGrade(totalScore, maxTotalScore);

    // Generate summary
    let summary = "";
    let improvements: string[] = [];

    try {
      const summaryPrompt = `You are a senior examiner. Based on these scores:
${examinerScores.map(e => `${e.ao}: ${e.score}/${e.maxScore}`).join("\n")}

Provide brief summary and 3 specific improvements. JSON format:
{
  "summary": "2-3 sentence overall assessment",
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"]
}`;

      const summaryResponse = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "kimi-latest",
          messages: [
            { role: "system", content: summaryPrompt },
            { role: "user", content: `Question: ${question.substring(0, 200)}...\nResponse length: ${essay.length} chars` }
          ],
          temperature: 0.4,
          max_tokens: 400,
        }),
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        const content = summaryData.choices?.[0]?.message?.content;
        if (content) {
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              summary = parsed.summary || "";
              improvements = parsed.improvements || [];
            }
          } catch {
            summary = content.substring(0, 300);
          }
        }
      }
    } catch (error) {
      console.error("Summary generation error:", error);
    }

    // Generate diagram feedback if missing
    let diagramFeedback;
    if (qtConfig.requiresDiagram && !hasDiagram) {
      diagramFeedback = getDiagramFeedback(questionType as QuestionType, hasDiagram);
    }

    return NextResponse.json({
      overallScore: Number(overallScore.toFixed(1)),
      grade,
      examiners: examinerScores,
      summary,
      improvements,
      questionType,
      unit,
      diagramFeedback,
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
