import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { 
  generateSystemPrompt, 
  economicsExaminers, 
  getQuestionTypeConfig,
  calculateGrade,
  type QuestionType,
  type UnitCode 
} from "@/lib/examiners/economics-config";

const gradeRequestSchema = z.object({
  question: z.string().min(1),
  essay: z.string().min(1),
  subject: z.enum(["economics", "geography"]),
  unit: z.enum(["WEC11", "WEC12", "WEC13", "WEC14"]).optional(),
  questionType: z.enum(["4-mark", "6-mark", "8-mark", "10-mark", "12-mark", "14-mark", "16-mark", "20-mark"]).optional(),
});

interface ExaminerScore {
  examinerId: string;
  examinerName: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteria: string[];
  ao: string;
}

interface Annotation {
  id: string;
  type: "knowledge" | "application" | "analysis" | "evaluation" | "structure" | "grammar";
  start: number;
  end: number;
  message: string;
  suggestion?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      question, 
      essay, 
      subject, 
      unit = "WEC11", 
      questionType = "14-mark" 
    } = gradeRequestSchema.parse(body);

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

    // Get question configuration
    const questionConfig = getQuestionTypeConfig(questionType as QuestionType);
    if (!questionConfig) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      );
    }

    // Generate examiner prompts
    const baseSystemPrompt = generateSystemPrompt(unit as UnitCode, questionType as QuestionType);
    
    // Call AI for each examiner
    const examinerScores: ExaminerScore[] = [];
    const annotations: Annotation[] = [];
    
    for (const examiner of economicsExaminers) {
      const examinerPrompt = `${baseSystemPrompt}

**YOUR SPECIFIC ROLE: ${examiner.name}**
**Assessment Objective:** ${examiner.ao}

**Your Criteria:**
${examiner.criteria.map(c => `- ${c}`).join("\n")}

**Your Task:**
Assess the student's response focusing specifically on ${examiner.ao}. 

Provide:
1. A score out of ${examiner.maxScore}
2. Detailed feedback on strengths
3. Areas for improvement
4. Specific examples from the text

Format your response as JSON:
{
  "score": number,
  "maxScore": ${examiner.maxScore},
  "feedback": "detailed paragraph feedback",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "annotations": [
    {"type": "type", "start": character_index, "end": character_index, "message": "feedback", "suggestion": "optional improvement"}
  ]
}`;

      try {
        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "kimi-latest",
            messages: [
              { role: "system", content: examinerPrompt },
              { 
                role: "user", 
                content: `Question: ${question}\n\nStudent Response:\n${essay}` 
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`Examiner ${examiner.name} failed`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (content) {
          // Extract JSON from response
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
            
            // Add annotations
            if (result.annotations) {
              annotations.push(...result.annotations.map((a: any, i: number) => ({
                id: `${examiner.id}-${i}`,
                type: a.type || "knowledge",
                start: a.start || 0,
                end: a.end || 0,
                message: a.message || "",
                suggestion: a.suggestion,
              })));
            }
          }
        }
      } catch (error) {
        console.error(`Examiner ${examiner.name} error:`, error);
        // Provide fallback score
        examinerScores.push({
          examinerId: examiner.id,
          examinerName: examiner.name,
          score: 5,
          maxScore: examiner.maxScore,
          feedback: `Unable to assess ${examiner.ao} at this time. Please try again.`,
          criteria: [],
          ao: examiner.ao,
        });
      }
    }

    // Calculate overall score
    const totalScore = examinerScores.reduce((sum, e) => sum + e.score, 0);
    const maxTotalScore = examinerScores.reduce((sum, e) => sum + e.maxScore, 0);
    const overallScore = (totalScore / maxTotalScore) * 10; // Convert to 0-10 scale
    
    // Calculate grade
    const grade = calculateGrade(totalScore, maxTotalScore);

    // Generate summary
    const summaryResponse = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "kimi-latest",
        messages: [
          {
            role: "system",
            content: `You are a senior examiner providing an overall summary. 
Question Type: ${questionType} (${questionConfig.marks} marks)
Be encouraging but rigorous. Provide 2-3 key strengths and 2-3 specific improvements.`,
          },
          {
            role: "user",
            content: `Question: ${question}\n\nStudent Response:\n${essay}\n\nExaminer Scores:\n${examinerScores.map(e => `${e.examinerName}: ${e.score}/${e.maxScore}`).join("\n")}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    let summary = "";
    let improvements: string[] = [];
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      summary = summaryData.choices?.[0]?.message?.content || "";
      
      // Extract improvements from summary
      const improvementsMatch = summary.match(/improvements?:?\s*([\s\S]*?)(?=\n\n|$)/i);
      if (improvementsMatch) {
        improvements = improvementsMatch[1]
          .split(/\n|-/)
          .map((i: string) => i.trim())
          .filter((i: string) => i.length > 10);
      }
    }

    return NextResponse.json({
      overallScore: Number(overallScore.toFixed(1)),
      grade,
      examiners: examinerScores,
      annotations,
      summary,
      improvements: improvements.slice(0, 5),
      questionType,
      unit,
      // Note: Essay is NOT auto-saved - user must save manually
    });
  } catch (error) {
    console.error("Grade API error:", error);
    
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
