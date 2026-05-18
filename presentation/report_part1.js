const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak, Header, Footer, PageNumber, Document, Packer } = require('docx');
const fs = require('fs');
const { COLORS, h1, h2, h3, body, bullet, spacer, sectionBox, headerRow, dataRow, codeBlock } = require('./report_helpers');

// ============================================================
// COVER PAGE
// ============================================================
function coverPage() {
  return [
    ...spacer(2),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'ROYAUME DU MAROC', bold: true, size: 22, color: COLORS.navy })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: "Office de la Formation Professionnelle et de la Promotion du Travail", bold: true, size: 22, color: COLORS.navy })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [
      new TextRun({ text: '─────────────────────────────────────', color: COLORS.orange, size: 24 })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "RAPPORT DE PROJET DE FIN D'ÉTUDES", bold: true, size: 48, color: COLORS.navy })] }),
    ...spacer(1),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 400 }, children: [
      new TextRun({ text: 'Système de Gestion des Formations des Formateurs', bold: true, size: 40, color: COLORS.orange })
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: '(SGFF)', bold: true, size: 40, color: COLORS.orange })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 }, children: [
      new TextRun({ text: '─────────────────────────────────────', color: COLORS.orange, size: 24 })
    ]}),
    ...spacer(2),
    new Table({
      columnWidths: [4680, 4680],
      margins: { top: 150, bottom: 150, left: 200, right: 200 },
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 4680, type: WidthType.DXA }, shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Réalisé par :', bold: true, size: 26, color: COLORS.navy })] }),
          new Paragraph({ children: [new TextRun({ text: 'Mohamed Jalim', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Habiba Elhomiti', size: 24 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Ikram Ghousmi', size: 24 })] }),
        ]}),
        new TableCell({ width: { size: 4680, type: WidthType.DXA }, shading: { fill: COLORS.lightGray, type: ShadingType.CLEAR }, children: [
          new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'Encadré par :', bold: true, size: 26, color: COLORS.navy })] }),
          new Paragraph({ children: [new TextRun({ text: 'M. Zaher MECHBOUK', size: 24 })] }),
        ]}),
      ]})],
    }),
    ...spacer(3),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: 'Année Académique : 2025 – 2026', bold: true, size: 26, color: COLORS.navy })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// REMERCIEMENTS
// ============================================================
function remerciements() {
  return [
    h1('Remerciements'),
    body("Avant tout développement, il nous paraît essentiel de commencer ce rapport par l'expression de notre profonde gratitude envers toutes les personnes qui ont contribué, de près ou de loin, à la réussite de ce projet de fin d'études."),
    body("En premier lieu, nous tenons à adresser nos sincères remerciements à notre encadrant, Monsieur Zaher MECHBOUK, pour la qualité de son suivi, ses précieux conseils, sa disponibilité et son soutien indéfectible tout au long de la durée de ce projet. Ses orientations éclairées ont été déterminantes pour mener ce travail à bien."),
    body("Nous remercions également l'ensemble du corps professoral et administratif de l'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT) pour la richesse et la qualité de la formation qu'ils nous ont dispensée au cours de nos années d'études."),
    body("Nos remerciements s'étendent aussi à nos familles et amis qui nous ont apporté un soutien moral et affectif inestimable durant toute la durée de notre formation et lors des moments les plus difficiles de la réalisation de ce projet."),
    body("Enfin, nous exprimons notre reconnaissance à toutes les personnes dont les travaux, publications et ressources open source ont contribué à enrichir nos connaissances et à faciliter la réalisation technique de ce système."),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ============================================================
// RÉSUMÉ
// ============================================================
function resume() {
  return [
    h1('Résumé'),
    body("Le présent rapport décrit la conception et le développement d'un Système de Gestion des Formations des Formateurs (SGFF) au sein de l'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT) au Maroc."),
    body("Face à la complexité croissante des processus de gestion des formations et au manque d'outils centralisés adaptés aux besoins des différents acteurs (Directions Régionales, Centres de Développement des Compétences, Formateurs), ce projet propose une solution web complète et moderne permettant de digitaliser l'intégralité du cycle de vie des plans de formation."),
    body("La solution développée repose sur une architecture découplée (Decoupled Architecture) composée d'un backend RESTful réalisé avec le framework Laravel 11 (PHP 8.2) et d'un frontend moderne développé avec React 18 et TypeScript. La gestion des fichiers est assurée via le service de stockage cloud Cloudflare R2, offrant une haute disponibilité et une sécurité optimale des données."),
    body("Le système met en œuvre un workflow d'approbation structuré en plusieurs statuts distincts (Brouillon, En Attente, Approuvé, Rejeté, Terminé, Annulé), avec une gestion fine des rôles et des permissions (RBAC – Role-Based Access Control) garantissant que chaque acteur n'accède qu'aux données et fonctionnalités qui lui sont autorisées."),
    body("Les résultats obtenus démontrent la faisabilité et l'efficacité de la solution proposée, qui répond pleinement aux exigences du cahier des charges initial tout en offrant des perspectives d'évolution prometteuses."),
    ...spacer(1),
    new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Mots-clés : ', bold: true, size: 24 }), new TextRun({ text: 'SGFF, OFPPT, Formation des Formateurs, Laravel, React, TypeScript, RBAC, Workflow, Cloudflare R2, API REST, Gestion Documentaire.', size: 24, italics: true })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

module.exports = { coverPage, remerciements, resume };
