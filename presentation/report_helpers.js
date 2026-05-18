const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');

const COLORS = {
  navy: '1E2D5A',
  orange: 'E85D04',
  blue: '4472C4',
  gray: '64748B',
  lightGray: 'F1F5F9',
  darkText: '1E293B',
  white: 'FFFFFF',
  green: '16A085',
};

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)], pageBreakBefore: true });
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}

function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}

function body(text, opts = {}) {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: opts.before || 120, after: opts.after || 120, line: 360, lineRule: 'auto' },
    children: [new TextRun({ text, size: 24, color: COLORS.darkText, ...opts.run })]
  });
}

function bullet(text) {
  return new Paragraph({
    indent: { left: 720, hanging: 360 },
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: '\u2022  ', bold: true, color: COLORS.orange }),
      new TextRun({ text, size: 24, color: COLORS.darkText })
    ]
  });
}

function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')] }));
}

function sectionBox(label, value) {
  return new Table({
    columnWidths: [3500, 5860],
    margins: { top: 80, bottom: 80, left: 150, right: 150 },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 3500, type: WidthType.DXA }, shading: { fill: COLORS.navy, type: ShadingType.CLEAR }, borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: COLORS.white, size: 22 })] })] }),
      new TableCell({ width: { size: 5860, type: WidthType.DXA }, borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })] })
    ]})],
  });
}

function headerRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((col, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: COLORS.navy, type: ShadingType.CLEAR },
      borders: cellBorders,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: col, bold: true, color: COLORS.white, size: 22 })] })]
    }))
  });
}

function dataRow(cols, widths, shade = false) {
  return new TableRow({
    children: cols.map((col, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: shade ? COLORS.lightGray : COLORS.white, type: ShadingType.CLEAR },
      borders: cellBorders,
      children: [new Paragraph({ children: [new TextRun({ text: col, size: 22 })] })]
    }))
  });
}

function codeBlock(text) {
  return new Paragraph({
    indent: { left: 720 },
    spacing: { before: 100, after: 100 },
    shading: { fill: 'F8F9FC', type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: '1E2D5A' })]
  });
}

module.exports = { COLORS, h1, h2, h3, body, bullet, spacer, sectionBox, headerRow, dataRow, codeBlock };
