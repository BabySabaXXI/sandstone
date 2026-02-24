# AI Essay Grading System

## Sandstone App - Enhanced AI Grading for Edexcel A-Level

This module provides a comprehensive AI-powered essay grading system optimized for Edexcel A-Level Economics and Geography examinations.

## Features

### Multi-AO Assessment
- **AO1**: Knowledge and Understanding (20% weighting)
- **AO2**: Application (20% weighting)
- **AO3**: Analysis (30% weighting)
- **AO4**: Evaluation (30% weighting)

### Question Type Support
| Type | Marks | AO Distribution | Diagram Required |
|------|-------|-----------------|------------------|
| 4-mark | 4 | AO1:2, AO2:2 | No |
| 6-mark | 6 | AO1:2, AO2:2, AO3:2 | No |
| 8-mark | 8 | AO1:2, AO2:2, AO3:4 | Yes |
| 10-mark | 10 | AO1:2, AO2:2, AO3:4, AO4:2 | Yes |
| 12-mark | 12 | AO1:2, AO2:2, AO3:4, AO4:4 | Yes |
| 14-mark | 14 | AO1:2, AO2:3, AO3:4, AO4:5 | Yes |
| 16-mark | 16 | AO1:3, AO2:3, AO3:5, AO4:5 | Yes |
| 20-mark | 20 | AO1:4, AO2:4, AO3:6, AO4:6 | Yes |

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Kimi API Configuration
KIMI_API_KEY=sk-CkE2F9GDFElGSZSA6NCozb2VKJ6r1qqmR6JoloLOq7ClRe1m

# Optional: Rate Limiting Configuration
RATE_LIMIT_TIER=free
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW=60000
```

## Usage

### Basic Grading

```typescript
import { gradeEssay } from "@/lib/examiners";

const result = await gradeEssay({
  question: "Explain the causes of inflation and discuss the effectiveness of monetary policy in controlling it.",
  essay: studentResponse,
  subject: "economics",
  unit: "WEC12",
  questionType: "14-mark",
  hasDiagram: true,
});

console.log(result.overallScore); // e.g., 11/14
console.log(result.grade); // e.g., "A"
console.log(result.examinerResults); // Detailed AO breakdown
```

### API Endpoint

```typescript
// POST /api/grade
const response = await fetch('/api/grade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: "Your question here",
    essay: "Student essay here",
    subject: "economics",
    questionType: "12-mark",
    hasDiagram: false,
  }),
});

const data = await response.json();
```

### Response Format

```typescript
{
  success: true,
  data: {
    overallScore: 11,
    maxScore: 14,
    percentage: 79,
    grade: "A",
    ums: 72,
    band: "L3",
    examinerResults: [
      {
        examinerId: "knowledge",
        examinerName: "Knowledge Examiner",
        ao: "AO1",
        score: 2,
        maxScore: 2,
        band: "L2",
        feedback: "Accurate definitions provided...",
        strengths: ["Precise terminology", "Clear definitions"],
        improvements: ["Could include more key terms"],
        color: "#E8D5C4"
      },
      // ... other examiners
    ],
    summary: "Overall assessment summary...",
    keyStrengths: ["Strength 1", "Strength 2"],
    priorityImprovements: ["Improvement 1", "Improvement 2"],
    annotations: [...],
    diagramFeedback: "Diagram feedback if applicable",
    metadata: {
      questionType: "14-mark",
      unit: "WEC12",
      processingTime: 8500,
      modelUsed: "kimi-latest",
      confidence: 0.92
    }
  },
  meta: {
    processedAt: "2024-01-15T10:30:00Z",
    processingTimeMs: 8500,
    rateLimit: {
      remaining: 4,
      resetTime: "2024-01-15T10:31:00Z"
    }
  }
}
```

## File Structure

```
lib/examiners/
├── index.ts              # Main exports
├── config.ts             # Examiner configurations and mark schemes
├── grading-service.ts    # Core grading logic
├── prompts.ts            # AO-specific prompts for all question types
├── feedback-generator.ts # Enhanced feedback generation
└── README.md             # This file
```

## Mark Scheme Alignment

### AO1: Knowledge and Understanding
- Accurate definitions of key terms
- Correct use of economic/geographical terminology
- Appropriate theoretical frameworks
- Relevant knowledge selection

### AO2: Application
- Contextual application of knowledge
- Use of relevant examples
- Reference to specific scenarios/data
- Appropriate case study selection

### AO3: Analysis
- Clear chains of reasoning
- Cause and effect relationships
- Appropriate use of diagrams
- Logical development of arguments

### AO4: Evaluation
- Balanced arguments presented
- Critical assessment of points
- Prioritization of factors
- Supported judgments/conclusions

## Grade Boundaries

| Grade | Percentage |
|-------|------------|
| A*    | 90%+       |
| A     | 80-89%     |
| B     | 70-79%     |
| C     | 60-69%     |
| D     | 50-59%     |
| E     | 40-49%     |
| U     | <40%       |

## Error Handling

The grading system provides detailed error responses:

```typescript
// Validation Error
{
  error: "Validation failed",
  details: ["Question is required", "Essay exceeds maximum length"],
  code: "VALIDATION_ERROR"
}

// Rate Limit Error
{
  error: "Rate limit exceeded. Please try again later.",
  retryAfter: 45,
  code: "RATE_LIMIT_ERROR"
}

// Service Error
{
  error: "AI service not configured",
  code: "CONFIG_ERROR"
}
```

## Rate Limiting

- **Free tier**: 5 requests per minute
- **Basic tier**: 15 requests per minute
- **Premium tier**: 50 requests per minute

## Best Practices

1. **Always specify questionType** for accurate AO weighting
2. **Set hasDiagram correctly** for appropriate diagram feedback
3. **Include contextData** when available for better application assessment
4. **Handle rate limits gracefully** in your UI
5. **Cache results** where appropriate to reduce API calls

## Troubleshooting

### Common Issues

**Issue**: "KIMI_API_KEY not configured"
- **Solution**: Add the API key to your `.env.local` file

**Issue**: "Rate limit exceeded"
- **Solution**: Implement client-side rate limiting and display retry timer

**Issue**: "All examiners failed"
- **Solution**: Check Kimi API status and retry the request

## Support

For issues or questions about the grading system, please contact the development team.

## License

Part of the Sandstone App - All rights reserved.
