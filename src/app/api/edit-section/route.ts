import { NextRequest, NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { sectionId, sectionTitle, currentContent, instruction, fullReport } =
      await request.json();

    if (!sectionId || !currentContent || !instruction) {
      return NextResponse.json(
        { error: 'Section ID, current content, and instruction are required' },
        { status: 400 }
      );
    }

    const contextSummary = fullReport?.sections
      ?.map((s: { title: string; content: string }) => `${s.title}: ${s.content.substring(0, 200)}...`)
      .join('\n') || '';

    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an expert report editor. You will receive a section of a structured business report and an editing instruction. 

Your job is to apply the instruction to the section content and return the improved version.

General Rules:
- Only modify the specific section content provided
- Maintain the same general structure and formatting style (markdown)
- Apply the instruction precisely
- Keep the tone professional and consultancy-grade
- Do NOT add any prefixes, explanations, or meta-commentary ('Here is the updated section', 'I have changed X', etc.)
- Return ONLY the raw updated markdown text and absolutely nothing else.`,
      prompt: `Report Context (other sections for reference):
${contextSummary}

Section to edit: "${sectionTitle}"

Current content:
${currentContent}

Instruction: "${instruction}"

Return the updated section content:`,
      temperature: 0.6,
      maxOutputTokens: 1500,
    });

    let updatedContent = text.trim();
    // Remove markdown code block wrappers if the AI accidentally adds them
    if (updatedContent.startsWith('```markdown')) {
      updatedContent = updatedContent.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim();
    } else if (updatedContent.startsWith('```')) {
      updatedContent = updatedContent.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
    }

    return NextResponse.json({
      sectionId,
      updatedContent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to edit section' },
      { status: 500 }
    );
  }
}
