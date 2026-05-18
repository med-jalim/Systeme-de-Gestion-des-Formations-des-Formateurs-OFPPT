const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');
const { COLORS, h1, h2, h3, body, bullet, spacer, sectionBox, headerRow, dataRow, codeBlock } = require('./report_helpers');

function chapitre1() {
  return [
    h1('Chapitre 1 : Contexte Général et Spécification des Besoins'),

    h2('1.1 Présentation de l\'Organisme d\'Accueil'),
    h3('1.1.1 L\'Office de la Formation Professionnelle et de la Promotion du Travail (OFPPT)'),
    body("L'Office de la Formation Professionnelle et de la Promotion du Travail, communément désigné par l'acronyme OFPPT, est un établissement public marocain doté de la personnalité morale et de l'autonomie financière, placé sous la tutelle du Ministère chargé de la Formation Professionnelle. Fondé en 1974, il constitue le principal opérateur public de formation professionnelle au Royaume du Maroc."),
    body("La mission fondamentale de l'OFPPT est de contribuer à la promotion sociale et économique des citoyens marocains en leur offrant des formations qualifiantes adaptées aux exigences du marché du travail national et international. À travers un réseau dense d'établissements répartis sur l'ensemble du territoire national, l'Office dispense des formations dans de nombreux secteurs d'activité, allant de l'industrie et de l'artisanat à la tertiaire, en passant par le numérique et les nouvelles technologies."),
    body("L'OFPPT est organisé de manière hiérarchique. Au sommet, la Direction Générale définit les orientations stratégiques. En dessous, les Directions Régionales (DR) assurent la coordination et le suivi des activités de formation dans leurs zones géographiques respectives. Enfin, les Centres de Développement des Compétences (CDC) et les instituts de formation constituent le maillon opérationnel de cet ensemble, en assurant directement la mise en œuvre des programmes de formation."),
    
    h3('1.1.2 La Formation des Formateurs au sein de l\'OFPPT'),
    body("La qualité de la formation dispensée aux stagiaires est directement conditionnée par le niveau de qualification et la maîtrise pédagogique des formateurs. C'est pourquoi l'OFPPT accorde une importance capitale à la formation continue et au perfectionnement de son corps formateur."),
    body("Le Service de la Formation et du Perfectionnement des Compétences (SFPC) est chargé de planifier, organiser et évaluer les actions de formation destinées aux formateurs. Ces formations couvrent aussi bien les aspects techniques propres aux filières d'enseignement que les aspects pédagogiques et didactiques nécessaires à l'exercice du métier de formateur."),
    body("Le processus de gestion de ces formations implique une multitude d'acteurs et de niveaux hiérarchiques, ce qui en fait un processus complexe nécessitant des outils de gestion performants et fiables."),

    h2('1.2 Cadre du Projet et Problématique'),
    h3('1.2.1 Étude de l\'Existant'),
    body("Avant la mise en place du système SGFF, la gestion des formations des formateurs au sein de l'OFPPT reposait sur des processus largement manuels et peu coordonnés. Les principaux outils utilisés étaient des tableurs Microsoft Excel, des formulaires papier, et des échanges par courrier électronique."),
    body("Cette approche présentait de nombreux inconvénients structurels que nous avons identifiés lors de l'analyse préliminaire du projet :"),
    bullet("Dispersion de l'information : Les données relatives aux plans de formation, aux participants, aux formateurs animateurs, et aux hébergements étaient stockées dans des fichiers Excel distincts, souvent non partagés, ce qui rendait difficile toute vision consolidée."),
    bullet("Manque de traçabilité dans le circuit d'approbation : La soumission d'un plan de formation pour validation par la Direction Régionale se faisait par courrier ou par email, sans système de suivi de l'état d'avancement de la demande. Il était impossible de savoir, en temps réel, si un plan était en attente d'approbation, approuvé ou rejeté."),
    bullet("Risque d'erreurs et de doublons : La saisie manuelle des données dans des fichiers non connectés augmentait considérablement le risque d'erreurs de saisie et de duplication d'informations."),
    bullet("Gestion logistique complexe : L'organisation des hébergements pour les formateurs participants (attribution des chambres, dates d'arrivée et de départ) exigeait une coordination chronophage entre les différents services."),
    bullet("Absence de tableaux de bord analytiques : Il était difficile d'obtenir des statistiques fiables sur le taux de participation, le taux d'absentéisme, ou la distribution géographique des formations."),
    
    h3('1.2.2 Problématique Générale'),
    body("L'ensemble de ces constats nous amène à formuler la problématique centrale de ce projet de la manière suivante :"),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, shading: { fill: 'EFF6FF', type: ShadingType.CLEAR }, indent: { left: 720, right: 720 }, children: [new TextRun({ text: "Comment concevoir et développer une plateforme web centralisée, sécurisée et intuitive, permettant de digitaliser et d'automatiser l'ensemble du cycle de gestion des plans de formation des formateurs au sein de l'OFPPT, depuis la création d'un plan jusqu'à son approbation finale et son suivi opérationnel ?", italics: true, bold: true, size: 24, color: COLORS.navy })] }),

    h2('1.3 Objectifs du Projet'),
    h3('1.3.1 Objectif Général'),
    body("L'objectif général de ce projet est de mettre en place une solution de gestion intégrée, baptisée SGFF (Système de Gestion des Formations des Formateurs), permettant de planifier, soumettre, valider, suivre et évaluer les formations des formateurs au sein de l'OFPPT, tout en centralisant les données relatives à leur progression, à leurs absences et à la logistique associée."),
    
    h3('1.3.2 Objectifs Spécifiques'),
    body("De manière plus granulaire, les objectifs spécifiques du système sont les suivants :"),
    bullet("Centralisation : Offrir une source unique de vérité (Single Source of Truth) pour toutes les données relatives aux formations, éliminant ainsi la dispersion des informations."),
    bullet("Automatisation du Workflow : Remplacer le circuit d'approbation manuel par un workflow numérique clair, traçable et instantané, avec notification automatique à chaque changement d'état."),
    bullet("Gestion des Rôles : Mettre en place un système de contrôle d'accès basé sur les rôles (RBAC) garantissant que chaque acteur ne voit et ne modifie que ce qui relève de ses attributions."),
    bullet("Suivi des Présences : Permettre aux formateurs animateurs d'enregistrer les présences et les absences directement dans le système, avec génération automatique de tableaux de bord."),
    bullet("Gestion Documentaire : Centraliser le stockage et l'accès aux documents de formation via une solution cloud fiable."),
    bullet("Reporting et Analytique : Générer des statistiques et des indicateurs de performance (KPIs) en temps réel pour aider à la prise de décision."),

    h2('1.4 Analyse et Spécification des Besoins'),
    h3('1.4.1 Identification des Acteurs'),
    body("L'analyse du cahier des charges nous a permis d'identifier six catégories d'acteurs interagissant avec le système SGFF :"),
    
    new Table({
      columnWidths: [2500, 3000, 3860],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Acteur', 'Rôle Métier', 'Responsabilités Principales'], [2500, 3000, 3860]),
        dataRow(['Administrateur Système', 'Admin Global', 'Gestion des comptes, configuration du système, supervision globale'], [2500, 3000, 3860]),
        dataRow(['Responsable DR', 'Direction Régionale', 'Consulter et valider les plans de formation de sa région'], [2500, 3000, 3860], true),
        dataRow(['Responsable CDC', 'Responsable de Centre', 'Créer, soumettre et gérer les plans de formation de son centre'], [2500, 3000, 3860]),
        dataRow(['Formateur Animateur', 'Encadreur de Formation', 'Gérer les absences, enrichir les contenus pédagogiques'], [2500, 3000, 3860], true),
        dataRow(['Formateur Participant', 'Apprenant', 'Suivre ses formations, consulter son planning, donner son avis'], [2500, 3000, 3860]),
        dataRow(['Responsable de Formation', 'SFPC', 'Superviser l\'ensemble du processus de formation au niveau national'], [2500, 3000, 3860], true),
      ],
    }),
    ...spacer(1),
    
    h3('1.4.2 Besoins Fonctionnels'),
    body("Les besoins fonctionnels décrivent ce que le système doit faire. Nous les avons organisés par module fonctionnel :"),
    
    h3('Module 1 : Authentification et Gestion des Accès'),
    bullet("Le système doit permettre aux utilisateurs de se connecter avec un identifiant et un mot de passe sécurisé."),
    bullet("L'authentification doit être sécurisée par un mécanisme de tokens (Laravel Sanctum)."),
    bullet("Chaque utilisateur doit se voir attribuer un rôle unique déterminant ses droits d'accès dans l'application."),
    bullet("La session d'un utilisateur doit expirer après une période d'inactivité définie."),
    
    h3('Module 2 : Gestion des Plans de Formation'),
    bullet("Un Responsable CDC doit pouvoir créer un plan de formation en spécifiant la formation concernée, le site, les dates, les participants, les formateurs animateurs, et l'hébergement."),
    bullet("Le plan créé doit être initialement en statut 'Brouillon', permettant à son créateur de le modifier avant soumission."),
    bullet("Le CDC doit pouvoir soumettre son plan à la validation du DR, faisant passer le statut à 'En Attente'."),
    bullet("Le Responsable DR de la région concernée doit pouvoir Approuver ou Rejeter le plan, avec possibilité d'ajouter un motif de rejet."),
    bullet("En cas de rejet, le CDC doit pouvoir modifier et resoumettre le plan."),
    bullet("Le système doit proposer une vue de liste de tous les plans, filtrable par statut, avec un tableau de bord de suivi."),
    
    h3('Module 3 : Gestion des Absences'),
    bullet("Le Formateur Animateur doit pouvoir accéder à la liste des participants à une session et marquer leur statut (Présent, Absent, Retard)."),
    bullet("Le système doit calculer automatiquement le taux d'absentéisme par session, par plan et par participant."),
    
    h3('Module 4 : Gestion Documentaire'),
    bullet("Les utilisateurs autorisés doivent pouvoir uploader des fichiers (supports de cours, attestations, rapports) associés à un plan de formation."),
    bullet("Les fichiers doivent être stockés de manière sécurisée sur Cloudflare R2 et accessibles via des liens temporaires signés (Signed URLs)."),
    
    h3('Module 5 : Tableau de Bord et Reporting'),
    bullet("Le système doit afficher un tableau de bord personnalisé selon le rôle de l'utilisateur connecté."),
    bullet("Le tableau de bord doit afficher des métriques clés : nombre total de plans, plans en attente, taux de présence global, etc."),
    bullet("Des graphiques de répartition (plans par statut, par site, utilisateurs par rôle) doivent être disponibles."),
    
    h3('1.4.3 Besoins Non Fonctionnels'),
    body("Les besoins non fonctionnels définissent les critères de qualité que doit respecter le système :"),
    bullet("Performance : Le temps de réponse des API ne doit pas dépasser 500ms pour les opérations courantes. La pagination doit être implémentée pour les longues listes."),
    bullet("Sécurité : Toutes les communications doivent être chiffrées via HTTPS. Les données sensibles (mots de passe) doivent être hachées avec bcrypt. La validation des données doit être effectuée côté serveur pour toutes les requêtes."),
    bullet("Disponibilité : Le système doit être conçu pour une haute disponibilité, avec une infrastructure cloud permettant une montée en charge aisée."),
    bullet("Ergonomie et Accessibilité : L'interface utilisateur doit être intuitive, moderne et accessible depuis tout type d'appareil (PC, tablette, mobile) grâce à un design responsif."),
    bullet("Maintenabilité : Le code doit être structuré selon les bonnes pratiques (Clean Code, SOLID Principles) et documenté pour faciliter les évolutions futures."),
    bullet("Scalabilité : L'architecture doit permettre l'ajout de nouvelles fonctionnalités sans refonte majeure du système existant."),
    
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

module.exports = { chapitre1 };
