import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod';

export interface PlannerOutput {
  problemBreakdown: string;
  stakeholders: string;
  keyComponents: string[];
  reasoning: string;
}

const PlannerOutputSchema = z.object({
  problemBreakdown: z.string(),
  stakeholders: z.string(),
  keyComponents: z.array(z.string()),
  reasoning: z.string(),
});

const PLANNER_SYSTEM_PROMPT = `You are the Planner Agent — a strategic thinker who excels at breaking down complex problems into structured components.

Your job is to analyze a user's problem statement and produce:
1. A thorough Problem Breakdown that identifies the core challenges, sub-problems, and dimensions of the problem
2. A Stakeholders analysis identifying all parties involved, their needs, pain points, and motivations
3. A list of Key Components that must be addressed

Rules:
- Be thorough and analytical
- Think about the problem from multiple angles
- Consider both technical and business dimensions
- Use clear, structured formatting with markdown INSIDE the JSON string fields
- Use bullet points and sub-bullets for clarity
- Each section should be substantive (at least 3-5 detailed points)

CRITICAL JSON RULES:
1. You MUST respond with ONLY a valid, parseable JSON object.
2. ALL string values MUST be wrapped in double quotes.
3. ALL newlines within strings MUST be escaped as \\n.
4. ALL quotes within strings MUST be escaped as \\".
5. Do NOT include any markdown code blocks (like \`\`\`json) around the output.

EXPECTED JSON STRUCTURE:
{
  "problemBreakdown": "### Core Challenges\\n* Challenge 1\\n* Challenge 2",
  "stakeholders": "### Key Stakeholders\\n* Stakeholder 1\\n* Stakeholder 2",
  "keyComponents": ["Component 1", "Component 2"],
  "reasoning": "Internal reasoning..."
}`;

export async function runPlannerAgent(problemStatement: string): Promise<PlannerOutput> {
  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: PLANNER_SYSTEM_PROMPT,
    prompt: `Analyze the following problem statement and break it down into structured components:\n\n"${problemStatement}"`,
    temperature: 0.7,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/\\'/g, "'").trim();
    const raw = JSON.parse(cleaned);
    return PlannerOutputSchema.parse(raw);
  } catch (e) {
    console.error('Planner Agent JSON Parse Error:', text);
    throw new Error('Planner Agent failed to produce valid structured output');
  }
}
