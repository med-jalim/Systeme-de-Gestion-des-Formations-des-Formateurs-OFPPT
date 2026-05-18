const { Document, Packer, Paragraph, TextRun, Header, Footer, PageNumber, AlignmentType, ImageRun, HeadingLevel, ShadingType, Table, TableRow, TableCell, WidthType } = require('docx');
const fs = require('fs');
const { COLORS, h2, h3, body, bullet, spacer, headerRow, dataRow } = require('./report_helpers');
const { coverPage, remerciements, resume } = require('./report_part1');
const { chapitre1 } = require('./report_part2');
const { chapitre2 } = require('./report_part3');
const { chapitre3 } = require('./report_part4');
const { conclusion, bibliographie } = require('./report_part5');
const { chapitreMethodologie, chapitreSecurity } = require('./report_part6');

const SCREENSHOTS = '/home/med-jalim/Projects/projets de synthèse/SGFF/docs/screenshots/';

function screenshotSection(title, caption, filename, description) {
  const imgPath = SCREENSHOTS + filename;
  const exists = fs.existsSync(imgPath);
  const elems = [
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(title)] }),
    body(description),
  ];
  if (exists) {
    const imgData = fs.readFileSync(imgPath);
    elems.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new ImageRun({ type: 'png', data: imgData, transformation: { width: 560, height: 315 }, altText: { title: caption, description: caption, name: caption } })]
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 }, children: [new TextRun({ text: caption, italics: true, size: 20, color: COLORS.gray })] })
    );
  } else {
    elems.push(body(`[${caption} — capture d'écran non disponible]`));
  }
  return elems;
}

function chapitreInterfaces() {
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun('Chapitre 3B : Présentation des Interfaces Utilisateur')] }),
    body("Ce chapitre présente les principales interfaces utilisateur du système SGFF, réalisées avec React 18 et Tailwind CSS. Chaque interface a été conçue pour être intuitive, responsive et adaptée aux besoins spécifiques de chaque rôle d'utilisateur."),

    ...screenshotSection(
      '1. Page de Connexion (Login)',
      'Figure 1 : Page de connexion sécurisée du système SGFF',
      'screen_login.png',
      "La page de connexion est le point d'entrée unique de l'application. Elle présente un formulaire épuré avec deux champs (email et mot de passe) et un bouton de connexion. La validation côté client s'assure que les champs ne sont pas vides avant d'envoyer la requête d'authentification. En cas d'erreur (identifiants incorrects), un message d'alerte rouge s'affiche immédiatement sous le formulaire, sans rechargement de la page, grâce à la gestion réactive de l'état par React."
    ),

    ...screenshotSection(
      '2. Tableau de Bord Principal (Dashboard)',
      'Figure 2 : Tableau de bord adaptatif selon le rôle de l\'utilisateur',
      'screen_dashboard.png',
      "Le tableau de bord est la première page affichée après connexion. Il s'adapte automatiquement au rôle de l'utilisateur connecté : un Administrateur voit les statistiques globales de tout le système, un Responsable DR voit uniquement les données de sa Direction Régionale, et un Responsable CDC voit ses propres données. Le tableau de bord affiche des cartes métriques (KPIs) en haut de page, suivies de graphiques de répartition (plans par statut, plans par site) et d'un tableau des plans récents avec leurs statuts actuels."
    ),

    ...screenshotSection(
      '3. Liste des Plans de Formation',
      'Figure 3 : Vue liste des plans de formation avec filtres et statuts',
      'screen_plans.png',
      "La page de liste des plans de formation présente tous les plans accessibles à l'utilisateur connecté sous forme de tableau interactif. Chaque ligne affiche : le titre du plan, la formation associée, le site, les dates de début et de fin, et le statut actuel représenté par un badge coloré (Brouillon en gris, En Attente en jaune, Approuvé en vert, Rejeté en rouge). Des filtres permettent de rechercher et de trier les plans. Les actions disponibles (Modifier, Soumettre, Approuver) varient dynamiquement selon le rôle de l'utilisateur et l'état du plan."
    ),

    ...screenshotSection(
      '4. Détails d\'un Plan de Formation',
      'Figure 4 : Page de détails complète d\'un plan de formation',
      'screen_details.png',
      "La page de détails d'un plan présente l'ensemble des informations relatives à un plan spécifique, organisées en sections claires : informations générales, liste des participants, liste des formateurs animateurs, affectation des thèmes, gestion des hébergements, et documents attachés. En haut de la page, un bandeau coloré indique clairement le statut actuel du plan. Les boutons d'action (Soumettre, Approuver, Rejeter, Modifier) sont affichés ou masqués dynamiquement selon le rôle de l'utilisateur et l'état du plan."
    ),

    ...screenshotSection(
      '5. Formulaire de Création (Wizard)',
      'Figure 5 : Formulaire de création de plan en plusieurs étapes',
      'screen_wizard.png',
      "Le formulaire de création d'un plan de formation est organisé en plusieurs étapes progressives (Wizard). Une barre de progression en haut du formulaire indique clairement l'étape courante et les étapes à venir. Cette approche réduit la charge cognitive de l'utilisateur en décomposant un formulaire complexe en étapes logiques et séquentielles. Chaque étape est validée avant de passer à la suivante, réduisant ainsi les erreurs de saisie."
    ),
  ];
}

async function buildReport() {
  console.log('🔨 Assemblage du rapport complet...');

  const allChildren = [
    ...coverPage(),
    ...remerciements(),
    ...resume(),
    ...chapitreMethodologie(),
    ...chapitre1(),
    ...chapitre2(),
    ...chapitre3(),
    ...chapitreInterfaces(),
    ...chapitreSecurity(),
    ...conclusion(),
    ...bibliographie(),
  ];

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 24, color: COLORS.darkText } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, color: COLORS.navy, font: 'Arial' },
          paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, color: COLORS.orange, font: 'Arial' },
          paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, color: COLORS.blue, font: 'Arial' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1296, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: 'single', size: 6, color: COLORS.orange } },
            children: [new TextRun({ text: "SGFF – Rapport de Projet de Fin d'Études | 2025-2026", color: COLORS.gray, size: 18 })]
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
  const out = '/home/med-jalim/Projects/projets de synthèse/SGFF/docs/Rapport_SGFF_Final_Complet.docx';
  fs.writeFileSync(out, buffer);
  const size = Math.round(fs.statSync(out).size / 1024);
  console.log(`\n✅ Rapport généré : ${out}`);
  console.log(`📄 Taille : ${size} KB`);
}

buildReport().catch(console.error);
