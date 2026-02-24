/**
 * Secure Grade API Route with Multi-Tenant Subject Isolation
 * 
 * This is an updated version of the grade API route that enforces
 * subject-based tenant isolation.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  withSubjectIsolation,
  createSubjectIsolationError,
  createSecureDBOps,
} from "@/lib/tenant/server-api";
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
  saveToHistory: z.boolean().optional().default(true),
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

/**
 * POST handler for grading essays with subject isolation
 */
export const POST = withSubjectIsolation(
  async (request, { user, subjects, validatedSubject }) => {
    try {
      const body = await request.json();
      const { 
        question, 
        essay, 
        subject, 
        unit = "WEC11", 
        questionType = "14-mark",
        hasDiagram = false,
        saveToHistory = true,
      } = gradeRequestSchema.parse(body);

      // Validate subject access (redundant but explicit)
      if (!subjects.includes(subject)) {
        return createSubjectIsolationError(
          `Access denied to subject: ${subject}`,
          { userSubjects: subjects }
        );
      }

      // Check Kimi API key
      const apiKey = process.env.KIMI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "AI service not configured", code: "AI_NOT_CONFIGURED" },
          { status: 500 }
        );
      }

      const qtConfig = getQuestionTypeConfig(questionType as QuestionType);
      if (!qtConfig) {
        return NextResponse.json(
          { error: "Invalid question type", code: "INVALID_QUESTION_TYPE" },
          { status: 400 }
        );
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

      // Save to history if requested
      let savedEssayId: string | null = null;
      if (saveToHistory) {
        try {
          const secureDB = await createSecureDBOps(user.id, subjects);
          if (secureDB) {
            const { data: savedEssay, error: saveError } = await secureDB.insert("essays", {
              subject,
              question,
              content: essay,
              question_type: questionType,
              overall_score: Number(overallScore.toFixed(1)),
              grade,
              feedback: JSON.stringify(examinerScores.map(e => ({
                examiner: e.examinerName,
                score: e.score,
                maxScore: e.maxScore,
                feedback: e.feedback,
              }))),
              summary,
              improvements: JSON.stringify(improvements),
              examiner_scores: JSON.stringify(examinerScores),
            });

            if (saveError) {
              console.error("Error saving essay:", saveError);
            } else {
              savedEssayId = savedEssay?.id || null;
            }
          }
        } catch (saveError) {
          console.error("Error in save to history:", saveError);
        }
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
        savedEssayId,
        subject,
      });
    } catch (error) {
      console.error("Grade API error:", error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request", code: "VALIDATION_ERROR", details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  },
  { requireSubject: true }
);

/**
 * GET handler to retrieve user's graded essays with subject isolation
 */
export const GET = withSubjectIsolation(
  async (request, { user, subjects }) => {
    try {
      const { searchParams } = new URL(request.url);
      const subject = searchParams.get("subject");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Validate subject if provided
      if (subject && !subjects.includes(subject)) {
        return createSubjectIsolationError(
          `Access denied to subject: ${subject}`,
          { userSubjects: subjects }
        );
      }

      // Create secure DB operations
      const secureDB = await createSecureDBOps(user.id, subjects);
      if (!secureDB) {
        return NextResponse.json(
          { error: "Failed to initialize database", code: "DB_ERROR" },
          { status: 500 }
        );
      }

      // Fetch essays with subject isolation
      const { data: essays, error } = await secureDB.select("essays", {
        subject: subject || undefined,
        orderBy: { column: "created_at", ascending: false },
        limit,
      });

      if (error) {
        console.error("Error fetching essays:", error);
        return NextResponse.json(
          { error: "Failed to fetch essays", code: "FETCH_ERROR" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        essays: essays || [],
        total: essays?.length || 0,
        subject,
        subjects,
      });
    } catch (error) {
      console.error("Get essays error:", error);
      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  }
);
