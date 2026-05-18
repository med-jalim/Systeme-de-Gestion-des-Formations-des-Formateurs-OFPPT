const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType, PageBreak, Header, Footer, PageNumber, ImageRun } = require('docx');
const fs = require('fs');
const path = require('path');

// Create document
const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 24, color: "000000" } } },
        paragraphStyles: [
            {
                id: "Title",
                name: "Title",
                basedOn: "Normal",
                run: { size: 56, bold: true, color: "1E2D5A", font: "Arial" },
                paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
            },
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 32, bold: true, color: "1E2D5A", font: "Arial" },
                paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0, pageBreakBefore: true }
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 28, bold: true, color: "E85D04", font: "Arial" },
                paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
            },
            {
                id: "Heading3",
                name: "Heading 3",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: { size: 24, bold: true, color: "4472C4", font: "Arial" },
                paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: "Rapport de Projet de Fin d'Études | SGFF", color: "64748B", size: 18 })]
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({ text: "Page ", color: "64748B", size: 18 }),
                            new TextRun({ children: [PageNumber.CURRENT], color: "64748B", size: 18 }),
                            new TextRun({ text: " sur ", color: "64748B", size: 18 }),
                            new TextRun({ children: [PageNumber.TOTAL_PAGES], color: "64748B", size: 18 })
                        ]
                    })
                ]
            })
        },
        children: [
            // PAGE DE GARDE
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RÉPUBLIQUE MAROCAINE", bold: true, size: 20 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Office de la Formation Professionnelle et de la Promotion du Travail", bold: true, size: 20 })] }),
            
            new Paragraph({ spacing: { before: 800, after: 400 }, heading: HeadingLevel.TITLE, children: [new TextRun("RAPPORT DE PROJET DE FIN D'ÉTUDES")] }),
            new Paragraph({ spacing: { after: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Système de Gestion des Formations des Formateurs (SGFF)", bold: true, size: 36, color: "E85D04" })] }),
            
            new Table({
                columnWidths: [4680, 4680],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Réalisé par :", bold: true, size: 22 })] }),
                                                      new Paragraph({ children: [new TextRun("Mohamed Jalim")] }),
                                                      new Paragraph({ children: [new TextRun("Habiba Elhomiti")] }),
                                                      new Paragraph({ children: [new TextRun("Ikram Ghousmi")] })] }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Encadré par :", bold: true, size: 22 })] }),
                                                      new Paragraph({ children: [new TextRun("M. Zaher MECHBOUK")] })] })
                        ]
                    })
                ]
            }),
            
            new Paragraph({ spacing: { before: 1000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Année Académique : 2025-2026", bold: true, size: 20 })] }),
            
            new Paragraph({ children: [new PageBreak()] }),
            
            // REMERCIEMENTS
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Remerciements")] }),
            new Paragraph({ children: [new TextRun("Nous tenons à exprimer nos vifs remerciements à notre encadrant, M. Zaher MECHBOUK, pour ses précieux conseils et son soutien tout au long de la réalisation de ce projet.")] }),
            new Paragraph({ spacing: { before: 200 }, children: [new TextRun("Nous remercions également tout le corps professoral de l'OFPPT pour la qualité de la formation qu'ils nous ont dispensée.")] }),
            
            // INTRODUCTION GÉNÉRALE
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Introduction Générale")] }),
            new Paragraph({ children: [new TextRun("La formation continue des formateurs est un pilier fondamental pour garantir l'excellence pédagogique et l'adaptation aux nouvelles technologies au sein de l'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT). Afin de maintenir un niveau de qualification élevé, l'Office organise régulièrement des sessions de formation et de perfectionnement pour son corps enseignant.")] }),
            new Paragraph({ spacing: { before: 200 }, children: [new TextRun("Cependant, la gestion de ces formations (planification, suivi des absences, logistique, et validation des plans) repose souvent sur des processus manuels ou semi-automatisés. Cette situation engendre des lourdeurs administratives, des risques d'erreurs dans l'affectation des ressources, et un manque de visibilité en temps réel pour les décideurs (Directions Régionales et Centres de Développement des Compétences).")] }),
            new Paragraph({ spacing: { before: 200 }, children: [new TextRun("C'est dans ce contexte que s'inscrit notre projet de fin d'études, qui consiste à concevoir et développer le Système de Gestion des Formations des Formateurs (SGFF). Il s'agit d'une solution Web centralisée visant à digitaliser l'ensemble du cycle de vie des formations.")] }),
            
            // CHAPITRE 1
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Chapitre 1 : Contexte et Spécification des Besoins")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Présentation de l'Organisme")] }),
            new Paragraph({ children: [new TextRun("L'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT) est le principal opérateur public de formation professionnelle au Maroc. Sa mission est de former les jeunes pour répondre aux besoins du marché du travail et d'accompagner les entreprises dans le développement des compétences de leurs salariés.")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Problématique")] }),
            new Paragraph({ children: [new TextRun("La gestion actuelle souffre de plusieurs maux :")] }),
            new Paragraph({ children: [new TextRun("• Centralisation insuffisante : Les données sont éparpillées entre différents services.")] }),
            new Paragraph({ children: [new TextRun("• Circuit de validation opaque : Les demandes d'approbation prennent du temps et manquent de traçabilité.")] }),
            new Paragraph({ children: [new TextRun("• Logistique complexe : L'affectation des hébergements et la gestion des sites sont faites manuellement.")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 Spécification des Besoins")] }),
            new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("1.3.1 Besoins Fonctionnels")] }),
            new Paragraph({ children: [new TextRun("Le système doit offrir les fonctionnalités suivantes :")] }),
            new Paragraph({ children: [new TextRun("- Gestion des utilisateurs et des rôles (RBAC).")] }),
            new Paragraph({ children: [new TextRun("- Création et gestion des plans de formation.")] }),
            new Paragraph({ children: [new TextRun("- Workflow de validation (Brouillon, En attente, Approuvé, Rejeté).")] }),
            new Paragraph({ children: [new TextRun("- Gestion des absences et édition de rapports.")] }),
            new Paragraph({ children: [new TextRun("- Gestion des hébergements pour les participants.")] }),
            
            // CHAPITRE 2
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Chapitre 2 : Conception (Design)")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Diagramme de Cas d'Utilisation")] }),
            new Paragraph({ children: [new TextRun("Pour modéliser les besoins, nous avons créé le diagramme de cas d'utilisation suivant :")] }),
            
            // Insert generated image
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new ImageRun({
                    type: "png",
                    data: fs.readFileSync("/home/med-jalim/.gemini/antigravity/brain/2c3d235f-ae9b-42ec-9bac-82bded078818/use_case_diagram_1779128993575.png"),
                    transformation: { width: 400, height: 400 },
                    altText: { title: "Diagramme de Cas d'Utilisation", description: "Use Case Diagram", name: "Use Case" }
                })]
            }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Modèle Physique de Données (MPD)")] }),
            new Paragraph({ children: [new TextRun("La base de données repose sur les tables principales suivantes :")] }),
            
            new Table({
                columnWidths: [3120, 6240],
                rows: [
                    new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Table", bold: true })] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rôle", bold: true })] })] })] }),
                    new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun("utilisateurs")] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun("Stockage des comptes (Admin, DR, CDC, Formateur)")] })] })] }),
                    new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun("plan_formations")] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun("Cœur du système, contient les demandes de formation")] })] })] }),
                    new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun("hebergements")] })] }), new TableCell({ children: [new Paragraph({ children: [new TextRun("Gestion de la logistique d'accueil")] })] })] })
                ]
            }),
            
            // CHAPITRE 3
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Chapitre 3 : Réalisation")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Environnement Technique")] }),
            new Paragraph({ children: [new TextRun("Nous avons utilisé :")] }),
            new Paragraph({ children: [new TextRun("• Backend : Laravel 11")] }),
            new Paragraph({ children: [new TextRun("• Frontend : React 18 with TypeScript")] }),
            new Paragraph({ children: [new TextRun("• Storage : Cloudflare R2")] }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Implémentation du Workflow")] }),
            new Paragraph({ children: [new TextRun("Voici un extrait du contrôleur gérant l'approbation des plans :")] }),
            
            new Paragraph({
                children: [new TextRun({
                    text: `public function approve(Request $request, TrainingPlan $plan)
{
    $user = auth()->user();
    $validated = $request->validate([
        'status' => 'required|in:approuve,rejete',
        'rejection_reason' => 'nullable|string'
    ]);
    $plan->update([
        'status'            => $validated['status'],
        'validated_by'      => $user->id,
        'rejection_reason'  => $validated['status'] === 'approuve' ? null : ($validated['rejection_reason'] ?? null)
    ]);
    return response()->json($plan->load(['creator', 'validator']));
}`,
                    font: "Courier New",
                    size: 18
                })]
            }),
            
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Interfaces")] }),
            new Paragraph({ children: [new TextRun("*(Veuillez insérer ici les captures d'écran de l'application)*")] }),
            
            // CONCLUSION
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Conclusion")] }),
            new Paragraph({ children: [new TextRun("Ce projet a permis de répondre aux attentes du cahier des charges en fournissant une solution moderne et efficace pour la gestion des formations des formateurs.")] })
        ]
    }]
});

// Save document
Packer.toBuffer(doc).then(buffer => {
    const outputPath = path.join('/home/med-jalim/Projects/projets de synthèse/SGFF/docs', 'Rapport_SGFF_Final.docx');
    fs.writeFileSync(outputPath, buffer);
    console.log(`created file: ${outputPath}`);
}).catch(err => {
    console.error(`ERROR: ${err}`);
});
