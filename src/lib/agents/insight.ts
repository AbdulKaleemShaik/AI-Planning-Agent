import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { z } from 'zod';
import { PlannerOutput } from './planner';

export interface InsightOutput {
  solutionApproach: string;
  deepInsights: string;
  reasoning: string;
}

const InsightOutputSchema = z.object({
  solutionApproach: z.string(),
  deepInsights: z.string(),
  reasoning: z.string(),
});

const INSIGHT_SYSTEM_PROMPT = `You are the Insight Agent — a deep thinker who adds depth, context, and a robust solution strategy to a problem analysis.

Your job is to take the initial breakdown from the Planner and:
1. Develop a comprehensive Solution Approach (high-level strategy, methodology, and key pillars)
2. Provide Deep Insights (market context, risks, opportunities, and non-obvious observations)

Rules:
- Build upon the Planner's work, don't just repeat it
- Be strategic and forward-thinking
- Focus on the "HOW" and the "WHY"
- Use professional markdown formatting INSIDE the JSON string fields
- Each section should be detailed and well-argued

CRITICAL JSON RULES:
1. You MUST respond with ONLY a valid, parseable JSON object.
2. ALL string values MUST be wrapped in double quotes.
3. ALL newlines within strings MUST be escaped as \\n.
4. ALL quotes within strings MUST be escaped as \\".
5. Do NOT include any markdown code blocks (like \`\`\`json) around the output.

EXPECTED JSON STRUCTURE:
{
  "solutionApproach": "### High-level Strategy\\n* Pillar 1\\n* Pillar 2",
  "deepInsights": "### Market Context\\n* Insight 1\\n* Insight 2",
  "reasoning": "Internal reasoning..."
}`;

export async function runInsightAgent(plannerOutput: PlannerOutput): Promise<InsightOutput> {
  const prompt = `Based on the following problem analysis:
  
Problem Breakdown:
${plannerOutput.problemBreakdown}

Stakeholders:
${plannerOutput.stakeholders}

Key Components:
${plannerOutput.keyComponents.join(', ')}

Now enrich this analysis with deeper insights, context, and a comprehensive solution approach.`;

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: INSIGHT_SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/\\'/g, "'").trim();
    const raw = JSON.parse(cleaned);
    return InsightOutputSchema.parse(raw);
  } catch (e) {
    console.error('Insight Agent JSON Parse Error:', text);
    throw new Error('Insight Agent failed to produce valid structured output');
  }
}
