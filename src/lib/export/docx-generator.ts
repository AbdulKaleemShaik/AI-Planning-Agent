import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import { ReportData } from '@/types/report';

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, size: 22, font: 'Calibri' }));
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true, size: 22, font: 'Calibri' }));
    } else if (match[6]) {
      runs.push(
        new TextRun({
          text: match[6],
          font: 'Consolas',
          size: 22,
          shading: { type: ShadingType.SOLID, color: 'E8E8E8', fill: 'E8E8E8' },
        })
      );
    } else if (match[7]) {
      runs.push(new TextRun({ text: match[7], size: 22, font: 'Calibri' }));
    }
  }

  return runs || [new TextRun({ text, size: 22, font: 'Calibri' })];
}

function parseMarkdownToElements(content: string, sectionColor: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(new Paragraph({ spacing: { after: 100 } }));
      i++;
      continue;
    }

    // HTML elements or weird tags: safely ignore structure
    if (trimmed.startsWith('<')) {
      i++;
      continue;
    }

    // Table Detection
    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const separatorLine = lines[i + 1].trim();
      if (separatorLine.includes('---')) {
        const tableLines = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        const rows: TableRow[] = [];
        let isHeader = true;

        for (const tLine of tableLines) {
          if (tLine.includes('---')) {
            isHeader = false;
            continue;
          }

          const cells = tLine
            .split('|')
            .map((c) => c.trim())
            .filter((c, idx, arr) => {
              if (idx === 0 && c === '') return false;
              if (idx === arr.length - 1 && c === '') return false;
              return true;
            });

          rows.push(
            new TableRow({
              children: cells.map(
                (cell) =>
                  new TableCell({
                    width: { size: 100 / (cells.length || 1), type: WidthType.PERCENTAGE },
                    shading: isHeader
                      ? { fill: sectionColor, type: ShadingType.CLEAR, color: 'auto' }
                      : undefined,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    children: [
                      new Paragraph({
                        children: isHeader 
                          ? [new TextRun({ text: cell, bold: true, color: "FFFFFF", size: 20, font: "Calibri" })]
                          : parseInlineFormatting(cell),
                      }),
                    ],
                  })
              ),
            })
          );
        }

        elements.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
          })
        );
        // Add spacing after table
        elements.push(new Paragraph({ spacing: { after: 200 } }));
        continue;
      }
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace('### ', ''),
              bold: true,
              size: 24,
              color: sectionColor,
            }),
          ],
        })
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [
            new TextRun({
              text: trimmed.replace('## ', ''),
              bold: true,
              size: 28,
              color: sectionColor,
            }),
          ],
        })
      );
      i++;
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s/, '');
      const runs = parseInlineFormatting(bulletText);
      elements.push(
        new Paragraph({
          bullet: { level: line.startsWith('  ') ? 1 : 0 },
          spacing: { after: 60 },
          children: runs,
        })
      );
      i++;
      continue;
    }

    // Numbered lists
    const numberedMatch = trimmed.match(/^\d+\.\s(.+)/);
    if (numberedMatch) {
      const runs = parseInlineFormatting(numberedMatch[1]);
      elements.push(
        new Paragraph({
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 60 },
          children: runs,
        })
      );
      i++;
      continue;
    }

    // Regular text
    const runs = parseInlineFormatting(trimmed);
    elements.push(
      new Paragraph({
        spacing: { after: 80 },
        children: runs,
      })
    );
    i++;
  }

  return elements;
}

const SECTION_COLORS: Record<string, string> = {
  'problem-breakdown': '6366F1',
  stakeholders: '8B5CF6',
  'solution-approach': 'EC4899',
  'action-plan': 'F59E0B', // Will use this hex for table headers in action-plan
};

export async function generateDocx(report: ReportData): Promise<Buffer> {
  const sectionParagraphs: (Paragraph | Table)[] = [];

  for (const section of report.sections) {
    const color = SECTION_COLORS[section.id] || '6366F1';

    // Section divider
    sectionParagraphs.push(
      new Paragraph({
        spacing: { before: 400, after: 200 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 2, color },
        },
        children: [],
      })
    );

    // Section title
    sectionParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 32,
            color,
            font: 'Calibri',
          }),
        ],
      })
    );

    // Section content
    sectionParagraphs.push(...parseMarkdownToElements(section.content, color));
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: 'Calibri',
            size: 22,
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.2),
              right: convertInchesToTwip(1.2),
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: 'Strategic Planning Report',
                bold: true,
                size: 48,
                color: '6366F1',
                font: 'Calibri',
              }),
            ],
          }),
          // Problem statement
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: report.problemStatement,
                italics: true,
                size: 26,
                color: '666666',
                font: 'Calibri',
              }),
            ],
          }),
          // Date
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `Generated on ${new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                size: 20,
                color: '999999',
                font: 'Calibri',
              }),
            ],
          }),
          // Sections
          ...sectionParagraphs,
          // Footer
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
            children: [
              new TextRun({
                text: 'Generated by PlanForce AI — ForceEquals',
                size: 18,
                color: '999999',
                italics: true,
                font: 'Calibri',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
