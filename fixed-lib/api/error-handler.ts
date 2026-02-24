export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      {
        error: error.message,
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      error: "An unknown error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  );
}

export function validateRequest(body: unknown, requiredFields: string[]): void {
  if (!body || typeof body !== "object") {
    throw new APIError("Invalid request body", 400, "INVALID_BODY");
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new APIError(`Missing required field: ${field}`, 400, "MISSING_FIELD");
    }
  }
}
