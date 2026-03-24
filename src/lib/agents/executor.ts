import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { PlannerOutput } from './planner';
import { InsightOutput } from './insight';
import { ReportSection } from '@/types/report';

export interface ExecutorOutput {
  sections: ReportSection[];
  reasoning: string;
}

const EXECUTOR_SYSTEM_PROMPT = `You are the Execution Agent — a professional consultant who synthesizes information into high-quality, actionable strategic execution plans.

Your job is to take all previous analysis and:
1. Create a detailed Action Plan (milestones, timeline, and immediate next steps)
2. Synthesize everything into a Final Structured Report ready for executive presentation

The Final Report MUST have exactly these 4 sections:
1. id: "problem-breakdown", title: "Problem Breakdown", icon: "Target"
2. id: "stakeholders", title: "Stakeholders", icon: "Users"
3. id: "solution-approach", title: "Solution Approach", icon: "Lightbulb"
4. id: "action-plan", title: "Action Plan", icon: "ListTodo"

Rules:
- Ensure smooth transitions between sections
- Maintain a professional, premium tone throughout
- Use consistent markdown formatting INSIDE the JSON string fields
- Add a summary or conclusion if appropriate

CRITICAL JSON RULES:
1. You MUST respond with ONLY a valid, parseable JSON object.
2. ALL string values MUST be wrapped in double quotes.
3. ALL newlines within strings MUST be escaped as \\n.
4. ALL quotes within strings MUST be escaped as \\".
5. Do NOT include any markdown code blocks (like \`\`\`json) around the output.

EXPECTED JSON STRUCTURE:
{
  "sections": [
    {
      "id": "problem-breakdown",
      "title": "Problem Breakdown",
      "content": "### Content here\\n* Point 1",
      "icon": "Target"
    },
    {
      "id": "stakeholders",
      "title": "Stakeholders",
      "content": "### Stakeholders\\n...",
      "icon": "Users"
    },
    {
      "id": "solution-approach",
      "title": "Solution Approach",
      "content": "### Strategy\\n...",
      "icon": "Lightbulb"
    },
    {
      "id": "action-plan",
      "title": "Action Plan",
      "content": "### Phases\\n...",
      "icon": "ListTodo"
    }
  ],
  "reasoning": "Internal reasoning..."
}`;

export async function runExecutorAgent(
  plannerOutput: PlannerOutput,
  insightOutput: InsightOutput,
  problemStatement: string
): Promise<ExecutorOutput> {
  const prompt = `Problem Statement: "${problemStatement}"

Planner Breakdown:
${plannerOutput.problemBreakdown}

Stakeholders:
${plannerOutput.stakeholders}

Solution Approach & Insights:
${insightOutput.solutionApproach}
${insightOutput.deepInsights}

Now synthesize everything into the final structured report with EXACTLY 4 sections as requested. Make it read like a premium consulting report.`;

  const { text } = await generateText({
    model: groq('llama-3.3-70b-versatile'),
    system: EXECUTOR_SYSTEM_PROMPT,
    prompt,
    temperature: 0.6,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/\\'/g, "'").trim();
    const raw = JSON.parse(cleaned);
    
    if (!raw.sections || !Array.isArray(raw.sections)) {
      throw new Error('Output is missing the sections array');
    }
    
    return raw as ExecutorOutput;
  } catch (e) {
    console.error('Executor Agent JSON Parse Error:', text);
    throw new Error('Executor Agent failed to produce valid structured output');
  }
}
