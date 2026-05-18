const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');
const { COLORS, h1, h2, h3, body, bullet, spacer, headerRow, dataRow } = require('./report_helpers');

function conclusion() {
  return [
    h1('Conclusion Générale et Perspectives'),

    h2('Bilan du Travail Accompli'),
    body("Au terme de ce projet de fin d'études, nous pouvons affirmer que l'ensemble des objectifs fixés dans le cahier des charges ont été atteints. Nous avons conçu et développé, de A à Z, le Système de Gestion des Formations des Formateurs (SGFF), une plateforme web moderne et complète qui répond aux besoins réels des différents acteurs de l'OFPPT."),
    body("Les réalisations majeures de ce projet peuvent être résumées comme suit :"),
    bullet("Mise en place d'une architecture web découplée et robuste basée sur Laravel 11 (API REST) et React 18 (TypeScript), garantissant une séparation claire des responsabilités et une maintenabilité optimale du code."),
    bullet("Implémentation d'un système de contrôle d'accès basé sur les rôles (RBAC) avec six profils distincts (Admin, DR, CDC, Formateur Animateur, Formateur Participant, Responsable Formation), assurant la sécurité et la confidentialité des données."),
    bullet("Développement d'un workflow de validation complet et traçable pour les plans de formation, avec six états distincts (Brouillon, En Attente, Approuvé, Rejeté, Terminé, Annulé), incluant la fonctionnalité de resoumission après rejet."),
    bullet("Intégration d'un système de gestion documentaire sécurisé via Cloudflare R2, avec génération d'URLs temporaires signées pour protéger l'accès aux fichiers."),
    bullet("Création d'un tableau de bord analytique et adaptatif affichant des métriques en temps réel et des graphiques de répartition, personnalisés selon le rôle de l'utilisateur connecté."),
    bullet("Développement d'un formulaire de création de plan intelligent à plusieurs étapes (Wizard), qui simplifie considérablement la saisie de données complexes."),

    h2('Difficultés Rencontrées et Solutions Adoptées'),
    body("La réalisation de ce projet n'a pas été exempte de défis. Nous avons rencontré plusieurs difficultés techniques que nous avons surmontées grâce à un travail de recherche et d'investigation approfondi :"),
    bullet("Complexité du Workflow de Validation : La gestion de l'état d'un plan de formation avec plusieurs transitions possibles (approbation, rejet, resoumission) était complexe. Nous avons résolu ce problème en adoptant le pattern 'Single Source of Truth', avec un seul champ 'status' dans la base de données et une logique de transition stricte côté backend."),
    bullet("Isolation des données par rôle : Garantir que chaque acteur ne voit que les données relevant de ses attributions (un DR de Casablanca ne doit pas voir les plans de Marrakech) a nécessité une conception soigneuse des requêtes Eloquent avec des filtres conditionnels basés sur les relations entre les entités."),
    bullet("Configuration de Cloudflare R2 : L'intégration de Cloudflare R2 avec le driver S3 de Laravel a nécessité une configuration spécifique (use_path_style_endpoint à true) et la génération correcte des URLs signées temporaires pour assurer la sécurité des accès aux fichiers."),
    bullet("Typage TypeScript strict : L'utilisation de TypeScript dans le frontend a parfois rallenti le développement initial, mais a largement compensé en éliminant une grande catégorie de bugs à la compilation et en améliorant la qualité globale du code."),

    h2('Perspectives d\'Évolution'),
    body("Le système SGFF, dans sa version actuelle (MVP – Minimum Viable Product), constitue une base solide et fonctionnelle. Plusieurs améliorations et extensions sont envisageables pour les versions futures :"),
    
    h3('Court Terme (1-3 mois)'),
    bullet("Système de Notifications : Intégrer un système de notifications en temps réel (par email et/ou push notifications dans l'application) pour alerter automatiquement les acteurs lors de chaque changement d'état d'un plan (soumission, approbation, rejet)."),
    bullet("Export PDF : Permettre l'export en PDF des plans de formation approuvés avec un en-tête officiel de l'OFPPT, pour servir de document de référence lors des formations."),
    bullet("Évaluation des Formations : Implémenter le module d'évaluation permettant aux formateurs participants de donner leur avis sur les formations suivies via un questionnaire en ligne."),
    
    h3('Moyen Terme (3-12 mois)'),
    bullet("Application Mobile : Développer une application mobile (React Native ou Flutter) consommant la même API REST, pour permettre aux formateurs d'accéder à leur planning et de marquer les présences directement depuis leur smartphone."),
    bullet("Tableaux de Bord Analytiques Avancés : Enrichir le module de reporting avec des graphiques évolutifs (historique des formations sur plusieurs années, analyse des tendances d'absentéisme) et la possibilité d'exporter les rapports au format Excel."),
    bullet("Intégration SSO : Intégrer un système d'authentification unique (Single Sign-On) basé sur le protocole OAuth 2.0 ou SAML avec le système d'information existant de l'OFPPT."),
    
    h3('Long Terme (au-delà de 12 mois)'),
    bullet("Intelligence Artificielle : Intégrer des fonctionnalités d'IA pour la suggestion automatique de formateurs animateurs disponibles et adaptés à chaque thème, ou pour la prédiction des taux d'absentéisme."),
    bullet("Déploiement Cloud : Migrer l'hébergement du système vers une infrastructure cloud complète (AWS, GCP ou Azure) avec un pipeline CI/CD automatisé pour garantir la disponibilité et la scalabilité en production."),

    h2('Conclusion'),
    body("Ce projet de fin d'études a été une expérience d'apprentissage extrêmement enrichissante sur les plans technique et humain. Il nous a permis de confronter les connaissances théoriques acquises durant notre formation aux exigences réelles d'un projet de développement logiciel professionnel."),
    body("Nous avons pu maîtriser des technologies de pointe largement utilisées dans l'industrie (Laravel, React, TypeScript, Cloudflare R2), et développer des compétences essentielles en matière de conception de systèmes d'information, de sécurité applicative et de gestion de projet."),
    body("Le système SGFF, tel qu'il a été développé, est prêt à être déployé et à répondre aux besoins immédiats de l'OFPPT en matière de gestion des formations de ses formateurs. Son architecture modulaire et les perspectives d'évolution que nous avons identifiées lui confèrent également un fort potentiel d'adaptation aux besoins futurs de l'organisation."),
    body("Nous espérons que ce travail sera à la fois utile pour l'OFPPT et représentatif des compétences que nous avons développées au cours de notre formation."),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function bibliographie() {
  return [
    h1('Bibliographie et Webographie'),
    h2('Ouvrages et Documentation Technique'),
    bullet("OTWELL, Taylor. Laravel Documentation (v11). laravel.com/docs/11.x – Documentation officielle du framework Laravel."),
    bullet("FACEBOOK INC. React Documentation (v18). react.dev – Documentation officielle de la bibliothèque React."),
    bullet("MICROSOFT. TypeScript Handbook. typescriptlang.org/docs – Documentation officielle du langage TypeScript."),
    bullet("CLOUDFLARE. R2 Documentation. developers.cloudflare.com/r2 – Documentation de Cloudflare R2 Object Storage."),

    h2('Ressources en Ligne'),
    bullet("OFPPT. Portail Officiel. ofppt.ma – Site institutionnel de l'OFPPT."),
    bullet("TANSTACK. React Query Documentation. tanstack.com/query/v5 – Documentation de TanStack Query v5."),
    bullet("SHADCN. Shadcn/ui Documentation. ui.shadcn.com – Documentation des composants Shadcn/ui."),
    bullet("MYSQL. MySQL 8.0 Reference Manual. dev.mysql.com/doc/refman/8.0 – Documentation de référence de MySQL 8.0."),
  ];
}

module.exports = { conclusion, bibliographie };
