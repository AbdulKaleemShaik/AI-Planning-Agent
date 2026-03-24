import { NextRequest, NextResponse } from 'next/server';
import { generateDocx } from '@/lib/export/docx-generator';

export async function POST(request: NextRequest) {
  try {
    const { report } = await request.json();

    if (!report || !report.sections) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }

    const buffer = await generateDocx(report);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="PlanForce-Report-${Date.now()}.docx"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate DOCX' },
      { status: 500 }
    );
  }
}
