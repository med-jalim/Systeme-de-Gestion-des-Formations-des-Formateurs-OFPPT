const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');
const { COLORS, h1, h2, h3, body, bullet, spacer, sectionBox, headerRow, dataRow, codeBlock } = require('./report_helpers');

function chapitre2() {
  return [
    h1('Chapitre 2 : Conception du Système'),
    body("Ce chapitre présente la démarche de conception adoptée pour le développement du système SGFF. Nous y décrivons les choix architecturaux, le modèle de données, et le workflow central de l'application."),

    h2('2.1 Architecture Générale du Système'),
    h3('2.1.1 Choix de l\'Architecture'),
    body("Nous avons opté pour une architecture en couches découplées (Decoupled Architecture), communément appelée architecture Client-Serveur avec API REST. Ce choix architectural présente plusieurs avantages majeurs pour notre projet :"),
    bullet("Séparation des responsabilités : Le frontend (interface utilisateur) est totalement indépendant du backend (logique métier et accès aux données). Ils communiquent uniquement via des requêtes HTTP standardisées."),
    bullet("Flexibilité et maintenabilité : Toute modification de l'interface utilisateur n'affecte pas le backend, et vice-versa. Il serait possible, à terme, de remplacer le frontend React par une application mobile sans toucher à l'API."),
    bullet("Scalabilité : Chaque partie (frontend, backend, base de données) peut être mise à l'échelle indépendamment selon les besoins en charge."),
    bullet("Réutilisabilité de l'API : L'API REST développée peut être consommée par d'autres clients (applications mobiles, outils tiers) sans modification."),

    h3('2.1.2 Vue d\'Ensemble de l\'Architecture'),
    body("L'architecture du système SGFF est composée de trois couches principales qui interagissent entre elles :"),
    
    new Table({
      columnWidths: [2300, 4000, 3060],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Couche', 'Technologie', 'Rôle'], [2300, 4000, 3060]),
        dataRow(['Couche Présentation', 'React 18 + TypeScript + Tailwind CSS', 'Interface utilisateur, rendu dynamique, gestion de l\'état'], [2300, 4000, 3060]),
        dataRow(['Couche Métier (API)', 'Laravel 11 (PHP 8.2) + Sanctum', 'Logique métier, authentification, contrôle des accès, validation'], [2300, 4000, 3060], true),
        dataRow(['Couche Données', 'MySQL 8.0 + Cloudflare R2', 'Persistance des données relationnelles et stockage des fichiers'], [2300, 4000, 3060]),
      ],
    }),
    ...spacer(1),

    h2('2.2 Conception de la Base de Données'),
    h3('2.2.1 Entités Principales et Descriptions'),
    body("La base de données du système SGFF est composée de seize tables interdépendantes. Nous décrivons ci-dessous les tables les plus importantes avec leurs attributs et leur rôle dans le système :"),
    
    h3('Table : directions'),
    body("Cette table représente les Directions Régionales (DR) de l'OFPPT. Elle est la racine de la hiérarchie organisationnelle du système."),
    new Table({
      columnWidths: [2000, 2000, 5360],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Colonne', 'Type', 'Description'], [2000, 2000, 5360]),
        dataRow(['id', 'BIGINT (PK)', 'Identifiant unique auto-incrémenté'], [2000, 2000, 5360]),
        dataRow(['code', 'VARCHAR(unique)', 'Code alphanumérique unique de la Direction (ex: DR-CASA)'], [2000, 2000, 5360], true),
        dataRow(['name', 'VARCHAR', 'Dénomination complète de la Direction Régionale'], [2000, 2000, 5360]),
        dataRow(['created_at / updated_at', 'TIMESTAMP', 'Horodatage de création et de mise à jour automatique'], [2000, 2000, 5360], true),
      ],
    }),
    ...spacer(1),
    
    h3('Table : centres'),
    body("Représente les Centres de Développement des Compétences (CDC). Chaque centre est rattaché à une Direction Régionale."),
    new Table({
      columnWidths: [2000, 2000, 5360],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Colonne', 'Type', 'Description'], [2000, 2000, 5360]),
        dataRow(['id', 'BIGINT (PK)', 'Identifiant unique auto-incrémenté'], [2000, 2000, 5360]),
        dataRow(['direction_id', 'FK → directions', 'Référence à la Direction Régionale de rattachement'], [2000, 2000, 5360], true),
        dataRow(['code', 'VARCHAR(unique)', 'Code unique du centre'], [2000, 2000, 5360]),
        dataRow(['name', 'VARCHAR', 'Dénomination complète du centre'], [2000, 2000, 5360], true),
      ],
    }),
    ...spacer(1),

    h3('Table : utilisateurs'),
    body("Contient l'ensemble des comptes utilisateurs du système. C'est une table centrale qui gère l'identité et le rôle de chaque acteur."),
    new Table({
      columnWidths: [2200, 2000, 5160],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Colonne', 'Type', 'Description'], [2200, 2000, 5160]),
        dataRow(['id', 'BIGINT (PK)', 'Identifiant unique'], [2200, 2000, 5160]),
        dataRow(['first_name / last_name', 'VARCHAR', 'Prénom et nom de l\'utilisateur'], [2200, 2000, 5160], true),
        dataRow(['email', 'VARCHAR(unique)', 'Adresse e-mail utilisée comme identifiant de connexion'], [2200, 2000, 5160]),
        dataRow(['password', 'VARCHAR', 'Mot de passe haché avec bcrypt (jamais stocké en clair)'], [2200, 2000, 5160], true),
        dataRow(['role', 'ENUM', 'admin | responsable_dr | responsable_cdc | formateur_animateur | formateur_participant'], [2200, 2000, 5160]),
        dataRow(['matricule', 'VARCHAR', 'Matricule professionnel de l\'agent'], [2200, 2000, 5160], true),
        dataRow(['centre_id', 'FK → centres', 'Centre de rattachement (pour CDC et Formateurs)'], [2200, 2000, 5160]),
        dataRow(['direction_id', 'FK → directions', 'Direction de rattachement (pour les DR)'], [2200, 2000, 5160], true),
      ],
    }),
    ...spacer(1),

    h3('Table : plan_formations (Cœur du Système)'),
    body("C'est la table centrale du système. Elle représente un plan de formation complet, avec toutes ses métadonnées et son état dans le workflow de validation."),
    new Table({
      columnWidths: [2200, 2000, 5160],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Colonne', 'Type', 'Description'], [2200, 2000, 5160]),
        dataRow(['id', 'BIGINT (PK)', 'Identifiant unique du plan'], [2200, 2000, 5160]),
        dataRow(['formation_id', 'FK → formations', 'La formation du catalogue à laquelle ce plan est rattaché'], [2200, 2000, 5160], true),
        dataRow(['site_id', 'FK → sites', 'Le site (lieu) où se déroulera la formation'], [2200, 2000, 5160]),
        dataRow(['title', 'VARCHAR(nullable)', 'Titre personnalisé optionnel pour le plan'], [2200, 2000, 5160], true),
        dataRow(['status', 'VARCHAR', 'État du plan : draft | en_attente | approuve | rejete | completed | cancelled'], [2200, 2000, 5160]),
        dataRow(['start_date / end_date', 'DATE', 'Dates de début et de fin de la formation'], [2200, 2000, 5160], true),
        dataRow(['created_by', 'FK → utilisateurs', 'L\'utilisateur (CDC) qui a créé le plan'], [2200, 2000, 5160]),
        dataRow(['validated_by', 'FK → utilisateurs', 'L\'utilisateur (DR/Admin) qui a validé ou rejeté le plan'], [2200, 2000, 5160], true),
        dataRow(['rejection_reason', 'TEXT(nullable)', 'Motif de rejet saisi par le validateur'], [2200, 2000, 5160]),
      ],
    }),
    ...spacer(1),

    h2('2.3 Conception du Workflow de Validation'),
    h3('2.3.1 Le Statut Unifié : Source Unique de Vérité'),
    body("L'une des décisions de conception les plus importantes de ce projet a été de définir un seul champ 'status' pour gérer l'intégralité du cycle de vie d'un plan de formation. Cette approche, appelée 'Single Source of Truth', permet d'éviter les incohérences qui pourraient résulter de l'utilisation de plusieurs champs d'état redondants."),
    body("Le cycle de vie d'un plan de formation est modélisé par les états suivants :"),

    new Table({
      columnWidths: [2000, 3000, 4360],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Statut', 'Déclencheur', 'Description'], [2000, 3000, 4360]),
        dataRow(['draft (Brouillon)', 'Création par le CDC', 'Plan en cours de rédaction, modifiable et non soumis'], [2000, 3000, 4360]),
        dataRow(['en_attente', 'Soumission par le CDC', 'Plan soumis, en attente de décision du Responsable DR'], [2000, 3000, 4360], true),
        dataRow(['approuve', 'Validation par le DR', 'Plan approuvé, la formation peut être planifiée'], [2000, 3000, 4360]),
        dataRow(['rejete', 'Rejet par le DR', 'Plan rejeté avec motif, le CDC peut le modifier et resoumettre'], [2000, 3000, 4360], true),
        dataRow(['completed', 'Clôture manuelle', 'Formation terminée et archivée avec succès'], [2000, 3000, 4360]),
        dataRow(['cancelled', 'Annulation', 'Plan annulé avant exécution'], [2000, 3000, 4360], true),
      ],
    }),
    ...spacer(1),

    h3('2.3.2 Diagramme du Workflow'),
    body("Le flux de validation peut être représenté de manière séquentielle comme suit : Le CDC crée un plan (statut 'draft'). Il le soumet (statut 'en_attente'). Le DR le reçoit, l'examine et prend une décision : soit il l'approuve (statut 'approuve'), soit il le rejette avec un motif (statut 'rejete'). En cas de rejet, le CDC peut modifier le plan et le resoumettre, recommençant le cycle. Une fois la formation réalisée, le plan peut être clôturé (statut 'completed')."),

    h2('2.4 Conception de la Sécurité (RBAC)'),
    body("Le système implémente un contrôle d'accès basé sur les rôles (Role-Based Access Control – RBAC). Chaque route de l'API et chaque action dans l'interface est conditionnée au rôle de l'utilisateur authentifié. Le tableau ci-dessous résume les permissions de chaque rôle :"),

    new Table({
      columnWidths: [2200, 1250, 1250, 1250, 1250, 1250, 1150],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Action', 'Admin', 'DR', 'CDC', 'F. Anim.', 'F. Part.', 'Resp. Form.'], [2200, 1250, 1250, 1250, 1250, 1250, 1150]),
        dataRow(['Créer un plan', '✓', '✗', '✓', '✗', '✗', '✗'], [2200, 1250, 1250, 1250, 1250, 1250, 1150]),
        dataRow(['Soumettre un plan', '✓', '✗', '✓', '✗', '✗', '✗'], [2200, 1250, 1250, 1250, 1250, 1250, 1150], true),
        dataRow(['Approuver / Rejeter', '✓', '✓', '✗', '✗', '✗', '✗'], [2200, 1250, 1250, 1250, 1250, 1250, 1150]),
        dataRow(['Gérer les absences', '✓', '✗', '✗', '✓', '✗', '✗'], [2200, 1250, 1250, 1250, 1250, 1250, 1150], true),
        dataRow(['Consulter les plans', '✓', '✓', '✓', '✓', '✓', '✓'], [2200, 1250, 1250, 1250, 1250, 1250, 1150]),
        dataRow(['Gérer les utilisateurs', '✓', '✗', '✗', '✗', '✗', '✗'], [2200, 1250, 1250, 1250, 1250, 1250, 1150], true),
        dataRow(['Uploader des fichiers', '✓', '✓', '✓', '✓', '✗', '✓'], [2200, 1250, 1250, 1250, 1250, 1250, 1150]),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

module.exports = { chapitre2 };
