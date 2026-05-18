const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');
const { COLORS, h1, h2, h3, body, bullet, spacer, headerRow, dataRow } = require('./report_helpers');

function chapitreMethodologie() {
  return [
    h1('Chapitre 0 : Méthodologie de Travail'),
    body("Avant d'entrer dans le détail des aspects techniques du projet, il nous semble essentiel de présenter la méthodologie de gestion de projet que nous avons adoptée pour organiser notre travail en équipe, gérer les délais et assurer une livraison de qualité."),

    h2('0.1 Choix de la Méthodologie Agile (Scrum)'),
    body("Dans le cadre de ce projet, nous avons opté pour une méthodologie de développement Agile, plus précisément le framework Scrum. Ce choix a été motivé par plusieurs raisons :"),
    bullet("La nature évolutive des besoins : Les exigences du projet, bien que définies dans un cahier des charges initial, ont nécessité des ajustements et des précisions au fur et à mesure de l'avancement du développement."),
    bullet("La taille et la composition de l'équipe : Une équipe de trois développeurs est idéalement adaptée à une approche Scrum légère, où chaque membre peut assumer plusieurs responsabilités."),
    bullet("La prioritisation des fonctionnalités : Scrum permet de définir clairement les fonctionnalités à livrer en priorité (product backlog) et d'adapter le plan en fonction des retours et des contraintes rencontrées."),
    body("Le framework Scrum repose sur des cycles de développement courts appelés 'Sprints', d'une durée de deux semaines dans notre cas. À chaque sprint, l'équipe sélectionne un ensemble de tâches depuis le product backlog et s'engage à les livrer sous forme d'un incrément fonctionnel du logiciel."),

    h2('0.2 Organisation des Sprints'),
    body("Le projet a été découpé en cinq sprints principaux, couvrant une période totale d'environ dix semaines :"),

    new Table({
      columnWidths: [1500, 2500, 5360],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Sprint', 'Durée', 'Fonctionnalités Livrées'], [1500, 2500, 5360]),
        dataRow(['Sprint 1', '2 semaines', 'Mise en place de l\'environnement, authentification (login/logout), gestion des rôles de base'], [1500, 2500, 5360]),
        dataRow(['Sprint 2', '2 semaines', 'CRUD formations, thèmes, sites, hébergements, et gestion des utilisateurs'], [1500, 2500, 5360], true),
        dataRow(['Sprint 3', '2 semaines', 'Création des plans de formation avec le formulaire Wizard multi-étapes'], [1500, 2500, 5360]),
        dataRow(['Sprint 4', '2 semaines', 'Workflow d\'approbation complet (soumission, validation, rejet, resoumission), gestion des absences'], [1500, 2500, 5360], true),
        dataRow(['Sprint 5', '2 semaines', 'Tableau de bord analytique, gestion documentaire (Cloudflare R2), tests et corrections'], [1500, 2500, 5360]),
      ],
    }),
    ...spacer(1),

    h2('0.3 Outils de Gestion de Projet et de Collaboration'),
    body("Pour faciliter le travail en équipe et assurer une communication efficace, nous avons utilisé les outils suivants :"),
    bullet("Git & GitHub : Pour le contrôle de versions distribué. Nous avons adopté un workflow Git basé sur les branches (feature branches), où chaque nouvelle fonctionnalité est développée sur une branche dédiée avant d'être fusionnée dans la branche principale via une Pull Request."),
    bullet("Visual Studio Code : Comme éditeur de code principal, configuré avec des extensions communes (ESLint, Prettier, PHP Intelephense) pour garantir une uniformité du code entre les membres de l'équipe."),
    bullet("Postman : Pour tester les endpoints de l'API REST backend pendant le développement, avant l'intégration avec le frontend."),
    bullet("MySQL Workbench : Pour la conception visuelle du schéma de base de données et la vérification des migrations."),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function chapitreSecurity() {
  return [
    h1('Chapitre 4 : Sécurité et Tests'),

    h2('4.1 Sécurité de l\'Application'),
    body("La sécurité est une préoccupation transversale qui a guidé l'ensemble de nos décisions de développement. Nous avons mis en place plusieurs mécanismes de sécurité complémentaires pour protéger le système et les données de l'OFPPT."),

    h3('4.1.1 Authentification par Tokens (Laravel Sanctum)'),
    body("Nous avons choisi Laravel Sanctum pour gérer l'authentification de l'API. Sanctum est une solution légère d'authentification par tokens fournie nativement par Laravel. Son fonctionnement est le suivant :"),
    bullet("L'utilisateur envoie ses identifiants (email + mot de passe) à l'endpoint /api/login."),
    bullet("Le backend vérifie les identifiants et, en cas de succès, génère un token API unique et le retourne au client."),
    bullet("Le client (frontend React) stocke ce token de manière sécurisée et l'inclut dans l'en-tête Authorization de toutes les requêtes suivantes (format : Bearer {token})."),
    bullet("Le middleware auth:sanctum vérifie la validité du token à chaque requête protégée. Si le token est invalide ou expiré, une réponse 401 (Unauthorized) est retournée."),
    body("Les mots de passe des utilisateurs sont systématiquement hachés avec l'algorithme bcrypt avant d'être stockés en base de données. Bcrypt est un algorithme de hachage adaptatif qui inclut un facteur de coût (cost factor) permettant d'augmenter le temps de calcul nécessaire pour tester un mot de passe, rendant les attaques par force brute très difficiles."),

    h3('4.1.2 Validation des Données'),
    body("Toutes les données entrantes, qu'elles proviennent de formulaires ou de requêtes API, sont validées côté serveur avant tout traitement. Laravel offre un mécanisme de validation puissant via les FormRequest. Voici un exemple de la validation appliquée lors de la création d'un plan de formation :"),
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "$validated = $request->validate([\n  'formation_id' => 'required|exists:formations,id',\n  'site_id'      => 'required|exists:sites,id',\n  'status'       => 'required|in:draft,en_attente,approuve,rejete,completed,cancelled',\n  'start_date'   => 'required|date',\n  'end_date'     => 'required|date|after_or_equal:start_date',\n  'participants' => 'array',\n  'participants.*.userId' => 'exists:utilisateurs,id',\n]);", font: 'Courier New', size: 18, color: '1E2D5A' })] }),
    body("Cette validation garantit que : les IDs de formation et de site existent réellement en base de données (évitant les références orphelines), que le statut ne peut prendre qu'une des valeurs autorisées (évitant les états invalides), et que la date de fin ne peut pas être antérieure à la date de début."),

    h3('4.1.3 Protection CORS'),
    body("Pour éviter les attaques Cross-Origin Resource Sharing (CORS), nous avons configuré le middleware CORS de Laravel pour n'autoriser les requêtes qu'en provenance du domaine du frontend (localhost:5173 en développement). En production, seul le domaine officiel de l'application sera autorisé."),

    h3('4.1.4 Isolation des Données (Multi-Entité)'),
    body("L'un des mécanismes de sécurité les plus importants de notre système est l'isolation des données entre les entités organisationnelles. Chaque requête à l'API est filtrée en fonction du rôle et de l'entité (centre ou direction) de l'utilisateur authentifié. Cela garantit qu'un Responsable CDC du centre de Casablanca ne pourra jamais accéder aux plans de formation d'un centre de Marrakech, même en manipulant directement les requêtes API."),

    h2('4.2 Tests et Validation'),
    h3('4.2.1 Tests Manuels via Postman'),
    body("Durant la phase de développement, nous avons effectué des tests manuels systématiques de tous les endpoints de l'API en utilisant Postman. Pour chaque endpoint, nous avons testé les scénarios suivants :"),
    bullet("Scénario nominal : La requête est correcte et les données sont valides. Nous vérifions que la réponse est conforme aux attentes (code HTTP 200/201, structure JSON correcte)."),
    bullet("Scénario d'erreur de validation : La requête contient des données invalides (champ manquant, format incorrect). Nous vérifions que le serveur retourne un code HTTP 422 (Unprocessable Entity) avec des messages d'erreur explicites."),
    bullet("Scénario d'autorisation : La requête est effectuée par un utilisateur n'ayant pas les droits nécessaires. Nous vérifions que le serveur retourne un code HTTP 403 (Forbidden)."),
    bullet("Scénario d'authentification : La requête est effectuée sans token ou avec un token invalide. Nous vérifions que le serveur retourne un code HTTP 401 (Unauthorized)."),
    
    h3('4.2.2 Tests d\'Intégration Frontend-Backend'),
    body("Après l'intégration du frontend avec le backend, nous avons effectué des tests d'intégration end-to-end en parcourant manuellement les principaux scénarios d'utilisation depuis l'interface graphique. Ces tests ont couvert les parcours utilisateurs suivants :"),

    new Table({
      columnWidths: [3000, 2500, 3860],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Scénario Testé', 'Résultat Attendu', 'Statut'], [3000, 2500, 3860]),
        dataRow(['Connexion avec des identifiants valides', 'Redirection vers le tableau de bord', '✅ Validé'], [3000, 2500, 3860]),
        dataRow(['Connexion avec un mauvais mot de passe', 'Message d\'erreur visible', '✅ Validé'], [3000, 2500, 3860], true),
        dataRow(['Création d\'un plan par un CDC', 'Plan créé avec statut "draft"', '✅ Validé'], [3000, 2500, 3860]),
        dataRow(['Soumission d\'un plan pour validation', 'Statut passe à "en_attente"', '✅ Validé'], [3000, 2500, 3860], true),
        dataRow(['Approbation d\'un plan par le DR', 'Statut passe à "approuve"', '✅ Validé'], [3000, 2500, 3860]),
        dataRow(['Rejet d\'un plan avec motif', 'Statut "rejete", motif visible', '✅ Validé'], [3000, 2500, 3860], true),
        dataRow(['Upload d\'un fichier (PDF, JPG)', 'Fichier stocké sur R2, accessible', '✅ Validé'], [3000, 2500, 3860]),
        dataRow(['Tentative de modifier un plan approuvé', 'Action refusée (403)', '✅ Validé'], [3000, 2500, 3860], true),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

module.exports = { chapitreMethodologie, chapitreSecurity };
