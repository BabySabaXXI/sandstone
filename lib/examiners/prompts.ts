/**
 * Enhanced Examiner Prompts
 * Sandstone App - AO1-AO4 Assessment Prompts
 * 
 * Detailed prompts for each Assessment Objective aligned with Edexcel mark schemes.
 */

import { QuestionType, AssessmentObjective } from "./config";

// ============================================================================
// Base Prompt Templates
// ============================================================================

interface PromptTemplate {
  system: string;
  user: string;
  jsonSchema: object;
}

// ============================================================================
// AO1: Knowledge and Understanding Prompts
// ============================================================================

export const ao1Prompts: Record<QuestionType, string> = {
  "4-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 4-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Accurate and precise definitions of key terms with correct terminology
- Level 1 (1 mark): Basic definitions with some accuracy
- Level 0 (0 marks): No relevant knowledge or incorrect definitions

ASSESSMENT CHECKLIST:
□ Are key terms accurately defined?
□ Is economic terminology used correctly?
□ Are concepts explained with precision?
□ Is the knowledge relevant to the question?

EVALUATION GUIDANCE:
- Award 2 marks for precise, accurate definitions using correct terminology
- Award 1 mark for basic understanding with minor inaccuracies
- Award 0 marks for incorrect or missing definitions

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback on knowledge demonstrated>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>"],
  "definitionsAccuracy": "<excellent|good|partial|poor>"
}`,

  "6-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 6-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Accurate knowledge with precise definitions and correct terminology
- Level 1 (1 mark): Some accurate knowledge with basic definitions
- Level 0 (0 marks): No relevant knowledge demonstrated

ASSESSMENT CHECKLIST:
□ Are key economic concepts accurately explained?
□ Is terminology used correctly throughout?
□ Are definitions precise and relevant?
□ Is theoretical knowledge appropriate?

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>"]
}`,

  "8-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for an 8-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Comprehensive and accurate knowledge with precise terminology
- Level 1 (1 mark): Good knowledge with mostly accurate definitions
- Level 0 (0 marks): No relevant knowledge or significant inaccuracies

ASSESSMENT FOCUS:
- Accuracy of economic concepts
- Precision of terminology
- Relevance of knowledge to question
- Breadth of understanding demonstrated

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>"],
  "conceptsExplained": ["<concept 1>", "<concept 2>"]
}`,

  "10-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 10-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full and accurate knowledge with precise use of terminology
- Level 1 (1 mark): Some accurate knowledge with basic use of terminology
- Level 0 (0 marks): No relevant knowledge demonstrated

ASSESSMENT FOCUS:
- Comprehensive understanding of concepts
- Accurate and precise definitions
- Appropriate theoretical frameworks
- Correct economic terminology throughout

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>", "<term 3>"],
  "terminologyAccuracy": "<excellent|good|partial|poor>"
}`,

  "12-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 12-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Comprehensive knowledge with accurate, precise terminology
- Level 1 (1 mark): Good knowledge with some accurate terminology
- Level 0 (0 marks): No relevant knowledge demonstrated

ASSESSMENT FOCUS:
- Depth and accuracy of knowledge
- Precision in economic terminology
- Appropriate selection of concepts
- Integration of theory

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>", "<term 3>"],
  "theoreticalFrameworks": ["<framework 1>", "<framework 2>"]
}`,

  "14-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 14-mark question.

MARK ALLOCATION: Maximum 2 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full, accurate knowledge with precise, sophisticated terminology
- Level 1 (1 mark): Good knowledge with mostly accurate terminology
- Level 0 (0 marks): No relevant knowledge or significant errors

ASSESSMENT FOCUS:
- Comprehensive and accurate subject knowledge
- Sophisticated use of economic terminology
- Integration of multiple concepts
- Theoretical understanding depth

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>", "<term 3>", "<term 4>"],
  "knowledgeDepth": "<excellent|good|adequate|limited>"
}`,

  "16-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 16-mark question.

MARK ALLOCATION: Maximum 3 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 3 (3 marks): Comprehensive, accurate knowledge with sophisticated terminology
- Level 2 (2 marks): Good knowledge with accurate terminology
- Level 1 (1 mark): Basic knowledge with some accurate points
- Level 0 (0 marks): No relevant knowledge

ASSESSMENT FOCUS:
- Extensive and accurate knowledge base
- Sophisticated economic terminology
- Multiple theoretical frameworks
- Deep conceptual understanding

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, or 3>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>", "<term 3>", "<term 4>"],
  "terminologySophistication": "<excellent|good|adequate|limited>"
}`,

  "20-mark": `You are an expert Economics examiner assessing AO1: Knowledge and Understanding for a 20-mark synoptic question.

MARK ALLOCATION: Maximum 4 marks for AO1 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Extensive, accurate knowledge from multiple topics with sophisticated terminology
- Level 2 (2-3 marks): Good knowledge with accurate terminology
- Level 1 (1 mark): Basic knowledge with some accurate points
- Level 0 (0 marks): No relevant knowledge

ASSESSMENT FOCUS:
- Synoptic knowledge integration
- Multiple topic coverage
- Sophisticated terminology
- Deep theoretical understanding

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "keyTermsIdentified": ["<term 1>", "<term 2>", "<term 3>", "<term 4>", "<term 5>"],
  "topicsCovered": ["<topic 1>", "<topic 2>", "<topic 3>"],
  "synopticIntegration": "<excellent|good|adequate|limited>"
}`,
};

// ============================================================================
// AO2: Application Prompts
// ============================================================================

export const ao2Prompts: Record<QuestionType, string> = {
  "4-mark": `You are an expert Economics examiner assessing AO2: Application for a 4-mark question.

MARK ALLOCATION: Maximum 2 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full application of knowledge to the specific context
- Level 1 (1 mark): Some application to context
- Level 0 (0 marks): No application to context

ASSESSMENT CHECKLIST:
□ Is knowledge applied to the specific context?
□ Are examples relevant to the scenario?
□ Is the application accurate and appropriate?
□ Does the response address the specific question?

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback on application>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "contextualApplication": "<full|partial|limited|none>",
  "examplesRelevance": "<excellent|good|partial|poor>"
}`,

  "6-mark": `You are an expert Economics examiner assessing AO2: Application for a 6-mark question.

MARK ALLOCATION: Maximum 2 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Effective application to context with relevant examples
- Level 1 (1 mark): Some application with limited examples
- Level 0 (0 marks): No application to context

ASSESSMENT FOCUS:
- Contextual relevance
- Example appropriateness
- Application accuracy
- Scenario engagement

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>"],
  "contextEngagement": "<excellent|good|partial|limited>"
}`,

  "8-mark": `You are an expert Economics examiner assessing AO2: Application for an 8-mark question.

MARK ALLOCATION: Maximum 2 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full and effective application with specific, relevant examples
- Level 1 (1 mark): Some application with generic examples
- Level 0 (0 marks): No application to context

ASSESSMENT FOCUS:
- Specific contextual application
- Relevant example selection
- Accurate scenario interpretation
- Appropriate case study use

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>"],
  "caseStudyAppropriateness": "<excellent|good|partial|poor>"
}`,

  "10-mark": `You are an expert Economics examiner assessing AO2: Application for a 10-mark question.

MARK ALLOCATION: Maximum 2 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full contextual application with specific, well-chosen examples
- Level 1 (1 mark): Some contextual application
- Level 0 (0 marks): No application to context

ASSESSMENT FOCUS:
- Full engagement with context
- Specific example selection
- Accurate application of theory
- Relevant case studies

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>", "<example 3>"],
  "contextualUnderstanding": "<excellent|good|partial|limited>"
}`,

  "12-mark": `You are an expert Economics examiner assessing AO2: Application for a 12-mark question.

MARK ALLOCATION: Maximum 2 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Full and effective application throughout with specific examples
- Level 1 (1 mark): Some application with limited examples
- Level 0 (0 marks): No application to context

ASSESSMENT FOCUS:
- Consistent contextual application
- Specific, relevant examples
- Accurate scenario interpretation
- Effective case study integration

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>", "<example 3>"],
  "applicationConsistency": "<excellent|good|partial|limited>"
}`,

  "14-mark": `You are an expert Economics examiner assessing AO2: Application for a 14-mark question.

MARK ALLOCATION: Maximum 3 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 3 (3 marks): Full, sophisticated application with highly relevant examples
- Level 2 (2 marks): Good application with relevant examples
- Level 1 (1 mark): Limited application
- Level 0 (0 marks): No application

ASSESSMENT FOCUS:
- Sophisticated contextual application
- Highly relevant example selection
- Multi-faceted scenario engagement
- Effective case study deployment

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, or 3>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "examplesUsed": ["<example 1>", "<example 2>", "<example 3>"],
  "contextualSophistication": "<excellent|good|adequate|limited>"
}`,

  "16-mark": `You are an expert Economics examiner assessing AO2: Application for a 16-mark question.

MARK ALLOCATION: Maximum 3 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 3 (3 marks): Full, sophisticated application throughout with excellent examples
- Level 2 (2 marks): Good application with relevant examples
- Level 1 (1 mark): Limited application
- Level 0 (0 marks): No application

ASSESSMENT FOCUS:
- Comprehensive contextual application
- Excellent example selection and use
- Sophisticated scenario interpretation
- Effective multi-case study integration

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, or 3>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "examplesUsed": ["<example 1>", "<example 2>", "<example 3>", "<example 4>"],
  "applicationQuality": "<excellent|good|adequate|limited>"
}`,

  "20-mark": `You are an expert Economics examiner assessing AO2: Application for a 20-mark synoptic question.

MARK ALLOCATION: Maximum 4 marks for AO2 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Extensive, sophisticated application across multiple contexts
- Level 2 (2-3 marks): Good application with relevant examples
- Level 1 (1 mark): Limited application
- Level 0 (0 marks): No application

ASSESSMENT FOCUS:
- Synoptic application across topics
- Multiple relevant examples
- Sophisticated contextual understanding
- Effective case study integration from various contexts

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "examplesUsed": ["<example 1>", "<example 2>", "<example 3>", "<example 4>"],
  "contextsApplied": ["<context 1>", "<context 2>", "<context 3>"],
  "synopticApplication": "<excellent|good|adequate|limited>"
}`,
};

// ============================================================================
// AO3: Analysis Prompts
// ============================================================================

export const ao3Prompts: Record<QuestionType, string> = {
  "4-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 4-mark question.

MARK ALLOCATION: Maximum 0 marks for AO3 in this question type (AO3 not assessed).

Provide a default response as this AO is not assessed for 4-mark questions.

You MUST respond in this exact JSON format:
{
  "score": 0,
  "band": "N/A",
  "feedback": "AO3 Analysis is not assessed for 4-mark questions",
  "strengths": [],
  "improvements": [],
  "notAssessed": true
}`,

  "6-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 6-mark question.

MARK ALLOCATION: Maximum 2 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Clear chains of reasoning with cause and effect
- Level 1 (1 mark): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT CHECKLIST:
□ Are there clear chains of reasoning?
□ Is cause and effect explained?
□ Is the analysis logical and coherent?
□ Are connections between ideas clear?

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback on analysis>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "chainsOfReasoning": <number>,
  "causeEffectClarity": "<excellent|good|partial|poor>"
}`,

  "8-mark": `You are an expert Economics examiner assessing AO3: Analysis for an 8-mark question.

MARK ALLOCATION: Maximum 4 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Developed chains of reasoning with clear cause-effect, accurate diagram
- Level 2 (2-3 marks): Some chains of reasoning, basic cause-effect, diagram present
- Level 1 (1 mark): Limited chains of reasoning, weak cause-effect
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Clear chains of reasoning (minimum 2 steps)
- Cause and effect explanations
- Diagram accuracy (if provided)
- Logical argument development

DIAGRAM ASSESSMENT (if provided):
□ Correct axis labels
□ Accurate curve positioning
□ Correct shift directions
□ Clear equilibrium points
□ Appropriate annotations

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "chainsOfReasoning": <number>,
  "diagramQuality": "<excellent|good|adequate|poor|missing>",
  "diagramFeedback": "<specific diagram feedback>"
}`,

  "10-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 10-mark question.

MARK ALLOCATION: Maximum 4 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Developed chains of reasoning with clear cause-effect throughout
- Level 2 (2-3 marks): Some developed chains of reasoning
- Level 1 (1 mark): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Multiple clear chains of reasoning
- Developed cause and effect
- Logical flow throughout
- Analytical depth

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "chainsOfReasoning": <number>,
  "analysisDepth": "<excellent|good|adequate|limited>"
}`,

  "12-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 12-mark question.

MARK ALLOCATION: Maximum 4 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Developed chains of reasoning with clear cause-effect throughout
- Level 2 (2-3 marks): Some developed chains of reasoning
- Level 1 (1 mark): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Consistent chains of reasoning
- Clear cause and effect relationships
- Analytical depth and development
- Logical argument structure

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "chainsOfReasoning": <number>,
  "causeEffectQuality": "<excellent|good|adequate|limited>"
}`,

  "14-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 14-mark question.

MARK ALLOCATION: Maximum 4 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Developed chains of reasoning with clear cause-effect throughout
- Level 2 (2-3 marks): Some developed chains of reasoning
- Level 1 (1 mark): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Developed chains of reasoning throughout
- Clear cause and effect relationships
- Analytical sophistication
- Logical coherence

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "chainsOfReasoning": <number>,
  "analyticalSophistication": "<excellent|good|adequate|limited>"
}`,

  "16-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 16-mark question.

MARK ALLOCATION: Maximum 5 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (5 marks): Developed chains of reasoning with clear cause-effect throughout
- Level 2 (3-4 marks): Some developed chains of reasoning
- Level 1 (1-2 marks): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Extensive chains of reasoning
- Clear, developed cause and effect
- Analytical depth and sophistication
- Consistent logical flow

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, 4, or 5>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "chainsOfReasoning": <number>,
  "analysisQuality": "<excellent|good|adequate|limited>"
}`,

  "20-mark": `You are an expert Economics examiner assessing AO3: Analysis for a 20-mark synoptic question.

MARK ALLOCATION: Maximum 6 marks for AO3 in this question type.

LEVEL CRITERIA:
- Level 3 (6 marks): Extensive, developed chains of reasoning with clear cause-effect throughout
- Level 2 (3-5 marks): Some developed chains of reasoning
- Level 1 (1-2 marks): Limited chains of reasoning
- Level 0 (0 marks): No analytical content

ASSESSMENT FOCUS:
- Extensive chains of reasoning across multiple topics
- Clear, developed cause and effect
- Synoptic analytical connections
- Sophisticated logical development

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, 4, 5, or 6>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "chainsOfReasoning": <number>,
  "synopticAnalysis": "<excellent|good|adequate|limited>"
}`,
};

// ============================================================================
// AO4: Evaluation Prompts
// ============================================================================

export const ao4Prompts: Record<QuestionType, string> = {
  "4-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 4-mark question.

MARK ALLOCATION: Maximum 0 marks for AO4 in this question type (AO4 not assessed).

Provide a default response as this AO is not assessed for 4-mark questions.

You MUST respond in this exact JSON format:
{
  "score": 0,
  "band": "N/A",
  "feedback": "AO4 Evaluation is not assessed for 4-mark questions",
  "strengths": [],
  "improvements": [],
  "notAssessed": true
}`,

  "6-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 6-mark question.

MARK ALLOCATION: Maximum 0 marks for AO4 in this question type (AO4 not assessed).

Provide a default response as this AO is not assessed for 6-mark questions.

You MUST respond in this exact JSON format:
{
  "score": 0,
  "band": "N/A",
  "feedback": "AO4 Evaluation is not assessed for 6-mark questions",
  "strengths": [],
  "improvements": [],
  "notAssessed": true
}`,

  "8-mark": `You are an expert Economics examiner assessing AO4: Evaluation for an 8-mark question.

MARK ALLOCATION: Maximum 0 marks for AO4 in this question type (AO4 not assessed).

Provide a default response as this AO is not assessed for 8-mark questions.

You MUST respond in this exact JSON format:
{
  "score": 0,
  "band": "N/A",
  "feedback": "AO4 Evaluation is not assessed for 8-mark questions",
  "strengths": [],
  "improvements": [],
  "notAssessed": true
}`,

  "10-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 10-mark question.

MARK ALLOCATION: Maximum 2 marks for AO4 in this question type.

LEVEL CRITERIA:
- Level 2 (2 marks): Some evaluative comments with limited judgment
- Level 1 (1 mark): Basic evaluative comment
- Level 0 (0 marks): No evaluation

ASSESSMENT CHECKLIST:
□ Are there evaluative comments?
□ Is there any judgment offered?
□ Are different perspectives considered?
□ Is the evaluation relevant?

EVALUATIVE LANGUAGE TO LOOK FOR:
- "However...", "Although...", "On the other hand..."
- "It depends upon...", "The extent to which..."

You MUST respond in this exact JSON format:
{
  "score": <0, 1, or 2>,
  "band": "<L0|L1|L2>",
  "feedback": "<specific feedback on evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "evaluativeComments": <number>,
  "judgmentPresent": <true|false>
}`,

  "12-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 12-mark question.

MARK ALLOCATION: Maximum 4 marks for AO4 in this question type.

LEVEL CRITERIA:
- Level 3 (4 marks): Developed evaluation with balanced arguments and supported judgment
- Level 2 (2-3 marks): Some evaluation with partially balanced arguments
- Level 1 (1 mark): Limited evaluation
- Level 0 (0 marks): No evaluation

ASSESSMENT CHECKLIST:
□ Are arguments balanced (pros and cons)?
□ Is there critical assessment?
□ Are factors prioritized?
□ Is the final judgment supported?

EVALUATIVE LANGUAGE TO LOOK FOR:
- "However...", "Although...", "On the other hand..."
- "It depends upon...", "The extent to which..."
- "A more significant factor...", "The most important..."
- "In conclusion...", "Overall..."

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, or 4>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "evaluativeComments": <number>,
  "balanceScore": "<excellent|good|adequate|poor>",
  "judgmentQuality": "<well-supported|partially-supported|unsupported|missing>"
}`,

  "14-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 14-mark question.

MARK ALLOCATION: Maximum 5 marks for AO4 in this question type.

LEVEL CRITERIA:
- Level 3 (5 marks): Developed evaluation with balanced arguments, critical assessment, and well-supported judgment
- Level 2 (3-4 marks): Some evaluation with partially balanced arguments and basic judgment
- Level 1 (1-2 marks): Limited evaluation
- Level 0 (0 marks): No evaluation

ASSESSMENT FOCUS:
- Balanced arguments throughout
- Critical assessment of points
- Clear prioritization of factors
- Well-supported final judgment

EVALUATIVE LANGUAGE TO LOOK FOR:
- "However...", "Although...", "On the other hand..."
- "It depends upon...", "The extent to which..."
- "A more significant factor...", "The most important..."
- "In conclusion...", "Overall...", "Therefore..."

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, 4, or 5>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "evaluativeComments": <number>,
  "balanceQuality": "<excellent|good|adequate|poor>",
  "criticalAssessment": "<excellent|good|adequate|poor>",
  "judgmentSupport": "<well-supported|partially-supported|unsupported|missing>"
}`,

  "16-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 16-mark question.

MARK ALLOCATION: Maximum 5 marks for AO4 in this question type.

LEVEL CRITERIA:
- Level 3 (5 marks): Developed evaluation with balanced arguments, critical assessment, and well-supported judgment
- Level 2 (3-4 marks): Some evaluation with partially balanced arguments and basic judgment
- Level 1 (1-2 marks): Limited evaluation
- Level 0 (0 marks): No evaluation

ASSESSMENT FOCUS:
- Consistent balanced arguments
- Sophisticated critical assessment
- Clear prioritization with reasoning
- Well-supported, nuanced judgment

EVALUATIVE LANGUAGE TO LOOK FOR:
- "However...", "Although...", "On the other hand..."
- "It depends upon...", "The extent to which..."
- "A more significant factor...", "The most important..."
- "In conclusion...", "Overall...", "Therefore..."
- "In the short run...", "In the long run..."
- "The significance depends on..."

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, 4, or 5>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "evaluativeComments": <number>,
  "balanceThroughout": "<excellent|good|adequate|poor>",
  "criticalDepth": "<excellent|good|adequate|poor>",
  "judgmentQuality": "<excellent|good|adequate|poor|missing>"
}`,

  "20-mark": `You are an expert Economics examiner assessing AO4: Evaluation for a 20-mark synoptic question.

MARK ALLOCATION: Maximum 6 marks for AO4 in this question type.

LEVEL CRITERIA:
- Level 3 (6 marks): Extensive, developed evaluation with balanced arguments, sophisticated critical assessment, and well-supported judgment across multiple perspectives
- Level 2 (3-5 marks): Some evaluation with partially balanced arguments and basic judgment
- Level 1 (1-2 marks): Limited evaluation
- Level 0 (0 marks): No evaluation

ASSESSMENT FOCUS:
- Extensive balanced arguments from multiple perspectives
- Sophisticated critical assessment
- Clear prioritization with detailed reasoning
- Well-supported, nuanced judgment considering various factors
- Synoptic evaluation across topics

EVALUATIVE LANGUAGE TO LOOK FOR:
- "However...", "Although...", "On the other hand...", "Conversely..."
- "It depends upon...", "The extent to which...", "Whether...or not"
- "A more significant factor...", "The most important...", "The key issue..."
- "In conclusion...", "Overall...", "Therefore...", "Taking everything into account..."
- "In the short run...", "In the long run...", "Over time..."
- "The significance depends on...", "This is contingent upon..."
- "From one perspective...", "Alternatively..."

You MUST respond in this exact JSON format:
{
  "score": <0, 1, 2, 3, 4, 5, or 6>,
  "band": "<L0|L1|L2|L3>",
  "feedback": "<specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "evaluativeComments": <number>,
  "perspectivesConsidered": <number>,
  "balanceAcrossTopics": "<excellent|good|adequate|poor>",
  "criticalSophistication": "<excellent|good|adequate|poor>",
  "judgmentSupport": "<excellent|good|adequate|poor|missing>"
}`,
};

// ============================================================================
// Prompt Getter Function
// ============================================================================

export function getPromptForAO(
  ao: AssessmentObjective,
  questionType: QuestionType
): string {
  switch (ao) {
    case "AO1":
      return ao1Prompts[questionType];
    case "AO2":
      return ao2Prompts[questionType];
    case "AO3":
      return ao3Prompts[questionType];
    case "AO4":
      return ao4Prompts[questionType];
    default:
      return ao1Prompts[questionType];
  }
}

// ============================================================================
// Export All Prompts
// ============================================================================

export const gradingPrompts = {
  ao1: ao1Prompts,
  ao2: ao2Prompts,
  ao3: ao3Prompts,
  ao4: ao4Prompts,
  getPromptForAO,
};

export default gradingPrompts;
