const { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, AlignmentType } = require('docx');
const fs = require('fs');
const { COLORS } = require('./report_helpers');
const { coverPage, remerciements, resume } = require('./report_part1');
const { chapitre1 } = require('./report_part2');
const { chapitre2 } = require('./report_part3');
const { chapitre3 } = require('./report_part4');
const { conclusion, bibliographie } = require('./report_part5');

async function buildReport() {
  console.log('Building full report...');

  const allChildren = [
    ...coverPage(),
    ...remerciements(),
    ...resume(),
    ...chapitre1(),
    ...chapitre2(),
    ...chapitre3(),
    ...conclusion(),
    ...bibliographie(),
  ];

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: 'Arial', size: 24, color: COLORS.darkText } }
      },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, color: COLORS.navy, font: 'Arial' },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, color: COLORS.orange, font: 'Arial' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 }
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, color: COLORS.blue, font: 'Arial' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
        }
      ]
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1296, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: 'single', size: 6, color: COLORS.orange } },
            children: [new TextRun({ text: "SGFF – Rapport de Projet de Fin d'Études | 2025-2026", color: COLORS.gray, size: 18, font: 'Arial' })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: 'single', size: 6, color: COLORS.navy } },
            children: [
              new TextRun({ text: 'Page ', size: 18, color: COLORS.gray }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLORS.navy, bold: true }),
              new TextRun({ text: ' / ', size: 18, color: COLORS.gray }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLORS.gray }),
            ]
          })]
        })
      },
      children: allChildren,
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = '/home/med-jalim/Projects/projets de synthèse/SGFF/docs/Rapport_SGFF_Complet.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✅ Rapport généré avec succès : ${outputPath}`);
}

buildReport().catch(console.error);
