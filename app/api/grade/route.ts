import { NextRequest } from "next/server";
import { gradeEssayWithKimi, mockGradeEssay } from "@/lib/kimi/client";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/api/rate-limit";
import { handleAPIError, APIError, validateRequest } from "@/lib/api/error-handler";

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const ip = request.ip || "anonymous";
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      throw new APIError("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
    }

    // Parse request body
    const body = await request.json();
    validateRequest(body, ["essay", "question"]);

    const { essay, question, useMock = false } = body;

    // Validate essay length
    if (essay.length < 50) {
      throw new APIError("Essay is too short (minimum 50 characters)", 400, "ESSAY_TOO_SHORT");
    }

    if (essay.length > 5000) {
      throw new APIError("Essay is too long (maximum 5000 characters)", 400, "ESSAY_TOO_LONG");
    }

    // Grade essay
    let result;
    if (useMock || !process.env.KIMI_API_KEY) {
      result = mockGradeEssay(essay, question);
    } else {
      result = await gradeEssayWithKimi(essay, question);
    }

    // Return response with rate limit headers
    return Response.json(result, {
      headers: getRateLimitHeaders(ip),
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function GET() {
  return Response.json({
    message: "Grading API endpoint",
    usage: {
      method: "POST",
      body: {
        essay: "string (required, 50-5000 chars)",
        question: "string (required)",
        useMock: "boolean (optional, default: false)",
      },
    },
  });
}
