import { NextRequest, NextResponse } from 'next/server';
import { runPlannerAgent } from '@/lib/agents/planner';
import { runInsightAgent } from '@/lib/agents/insight';
import { runExecutorAgent } from '@/lib/agents/executor';
import { ReportData } from '@/types/report';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
  try {
    const { problemStatement } = await request.json();
    if (!problemStatement || typeof problemStatement !== 'string') {
      return NextResponse.json(
        { error: 'Problem statement is required' },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`)
          );
        };

        try {
          // Step 1: Planner Agent
          sendEvent('agent-start', {
            agent: 'Planner Agent',
            status: 'running',
            reasoning: 'Analyzing problem statement and breaking it into structured components...',
          });

          const plannerOutput = await runPlannerAgent(problemStatement);

          sendEvent('agent-complete', {
            agent: 'Planner Agent',
            status: 'completed',
            reasoning: plannerOutput.reasoning,
          });

          // Step 2: Insight Agent
          sendEvent('agent-start', {
            agent: 'Insight Agent',
            status: 'running',
            reasoning: 'Enriching analysis with deeper context and strategic insights...',
          });

          const insightOutput = await runInsightAgent(plannerOutput, problemStatement);

          sendEvent('agent-complete', {
            agent: 'Insight Agent',
            status: 'completed',
            reasoning: insightOutput.reasoning,
          });

          // Step 3: Executor Agent
          sendEvent('agent-start', {
            agent: 'Execution Agent',
            status: 'running',
            reasoning: 'Synthesizing all insights into a polished, structured report...',
          });

          const executorOutput = await runExecutorAgent(
            plannerOutput,
            insightOutput,
            problemStatement
          );

          sendEvent('agent-complete', {
            agent: 'Execution Agent',
            status: 'completed',
            reasoning: executorOutput.reasoning,
          });

          // Final report
          const report: ReportData = {
            id: crypto.randomUUID(),
            problemStatement,
            sections: executorOutput.sections,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          sendEvent('report-complete', { report });
          sendEvent('done', {});
        } catch (error) {
          sendEvent('error', {
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          });
          console.error('Agent Pipeline Error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}
