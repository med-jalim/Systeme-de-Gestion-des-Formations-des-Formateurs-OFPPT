const { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = require('docx');
const { COLORS, h1, h2, h3, body, bullet, spacer, sectionBox, headerRow, dataRow, codeBlock } = require('./report_helpers');

function chapitre3() {
  return [
    h1('Chapitre 3 : Réalisation et Implémentation'),
    body("Ce chapitre détaille les choix techniques effectués lors de la réalisation du projet, et présente les principales fonctionnalités implémentées avec des extraits de code commentés."),

    h2('3.1 Environnement de Développement'),
    h3('3.1.1 Outils et Technologies Utilisés'),
    body("Le développement du système SGFF a nécessité l'utilisation d'un ensemble d'outils et de technologies modernes, sélectionnés pour leur performance, leur popularité dans l'industrie et leur compatibilité :"),

    new Table({
      columnWidths: [2200, 2400, 4760],
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      rows: [
        headerRow(['Catégorie', 'Technologie', 'Version / Justification'], [2200, 2400, 4760]),
        dataRow(['Backend Framework', 'Laravel', 'v11 – Framework PHP le plus populaire, architecture MVC robuste'], [2200, 2400, 4760]),
        dataRow(['Langage Backend', 'PHP', 'v8.2 – Typage fort, fibers, performances améliorées'], [2200, 2400, 4760], true),
        dataRow(['Authentification', 'Laravel Sanctum', 'Authentification par tokens API légère et sécurisée'], [2200, 2400, 4760]),
        dataRow(['Frontend Framework', 'React', 'v18 – Composants réutilisables, Virtual DOM, grande communauté'], [2200, 2400, 4760], true),
        dataRow(['Langage Frontend', 'TypeScript', 'v5 – Typage statique pour réduire les erreurs à la compilation'], [2200, 2400, 4760]),
        dataRow(['Styles CSS', 'Tailwind CSS', 'v3 – Utilitaires CSS pour un prototypage rapide et cohérent'], [2200, 2400, 4760], true),
        dataRow(['Composants UI', 'Shadcn/ui', 'Bibliothèque de composants accessibles et personnalisables'], [2200, 2400, 4760]),
        dataRow(['Gestion d\'état & Requêtes', 'React Query (TanStack)', 'v5 – Cache intelligent, synchronisation, gestion du loading/error'], [2200, 2400, 4760], true),
        dataRow(['Base de Données', 'MySQL', 'v8.0 – SGBD relationnel stable, performant, largement supporté'], [2200, 2400, 4760]),
        dataRow(['Stockage Fichiers', 'Cloudflare R2', 'Stockage objet S3-compatible, hautes performances, sans frais de sortie'], [2200, 2400, 4760], true),
        dataRow(['Gestion de versions', 'Git / GitHub', 'Contrôle de versions distribué, collaboration en équipe'], [2200, 2400, 4760]),
      ],
    }),
    ...spacer(1),

    h2('3.2 Implémentation du Backend (Laravel 11)'),
    h3('3.2.1 Structure du Projet Laravel'),
    body("Le projet Laravel est organisé selon la structure conventionnelle du framework, enrichie de quelques couches supplémentaires pour améliorer la séparation des responsabilités. Les routes API sont définies dans le fichier routes/api.php et regroupées sous le middleware auth:sanctum pour sécuriser l'accès."),
    body("Voici les principaux endpoints de l'API REST que nous avons développés :"),

    new Table({
      columnWidths: [1500, 1500, 2000, 4360],
      margins: { top: 80, bottom: 80, left: 150, right: 150 },
      rows: [
        headerRow(['Méthode', 'Endpoint', 'Contrôleur', 'Description'], [1500, 1500, 2000, 4360]),
        dataRow(['POST', '/api/login', 'AuthController', 'Authentification et génération du token Sanctum'], [1500, 1500, 2000, 4360]),
        dataRow(['GET', '/api/dashboard', 'DashboardController', 'Métriques et statistiques adaptées au rôle'], [1500, 1500, 2000, 4360], true),
        dataRow(['GET/POST', '/api/plans', 'TrainingPlansController', 'Liste et création des plans de formation'], [1500, 1500, 2000, 4360]),
        dataRow(['GET/PUT/DEL', '/api/plans/{id}', 'TrainingPlansController', 'Consultation, modification et suppression d\'un plan'], [1500, 1500, 2000, 4360], true),
        dataRow(['POST', '/api/plans/{id}/approve', 'TrainingPlansController', 'Approbation ou rejet d\'un plan par le DR'], [1500, 1500, 2000, 4360]),
        dataRow(['GET/POST', '/api/sessions', 'TrainingSessionsController', 'Gestion des sessions de formation'], [1500, 1500, 2000, 4360], true),
        dataRow(['GET/POST', '/api/absences', 'AbsencesController', 'Consultation et saisie batch des absences'], [1500, 1500, 2000, 4360]),
        dataRow(['POST', '/api/files', 'FilesController', 'Upload de fichiers vers Cloudflare R2'], [1500, 1500, 2000, 4360], true),
      ],
    }),
    ...spacer(1),

    h3('3.2.2 Implémentation du Contrôleur de Plans de Formation'),
    body("Le TrainingPlansController est le contrôleur central de notre application. Il gère l'intégralité des opérations CRUD sur les plans de formation, ainsi que le workflow d'approbation. Voici les aspects clés de son implémentation :"),
    body("La méthode index() applique des filtres dynamiques basés sur le rôle de l'utilisateur connecté, garantissant l'isolation des données entre les différentes entités organisationnelles (principe du moindre privilège) :"),
    
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "// Filtrage des plans selon le rôle de l'utilisateur\npublic function index() {\n  $query = TrainingPlan::with(['formation','site','participants','creator','validator']);\n  if ($authUser->role === 'responsable_dr') {\n    // Le DR ne voit que les plans de sa région\n    $query->whereHas('site.centre',\n      fn($c) => $c->where('direction_id', $authUser->direction_id));\n  } elseif ($authUser->role === 'responsable_cdc') {\n    // Le CDC ne voit que les plans de son centre\n    $query->where('created_by', $authUser->id)\n           ->orWhereHas('site', fn($s) => $s->where('centre_id', $authUser->centre_id));\n  }\n  return response()->json($query->get());\n}", font: 'Courier New', size: 18, color: '1E2D5A' })] }),

    body("La méthode approve() gère le circuit de validation. Elle s'assure que seuls les DR de la région concernée (ou l'administrateur) peuvent approuver ou rejeter un plan. La décision est enregistrée avec le motif de rejet le cas échéant :"),
    
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "// Circuit de validation du plan\npublic function approve(Request $request, TrainingPlan $plan) {\n  $user = auth()->user();\n  $isDrOfRegion = $user->role === 'responsable_dr'\n    && $plan->site->centre->direction_id === $user->direction_id;\n\n  if (!$user || ($user->role !== 'admin' && !$isDrOfRegion)) {\n    abort(403, 'Permission refusée');\n  }\n  $validated = $request->validate([\n    'status' => 'required|in:approuve,rejete',\n    'rejection_reason' => 'nullable|string'\n  ]);\n  $plan->update([\n    'status'           => $validated['status'],\n    'validated_by'     => $user->id,\n    'rejection_reason' => $validated['status'] === 'approuve'\n        ? null : ($validated['rejection_reason'] ?? null)\n  ]);\n  return response()->json($plan->load(['creator', 'validator']));\n}", font: 'Courier New', size: 18, color: '1E2D5A' })] }),

    h3('3.2.3 Gestion du Stockage Documentaire (Cloudflare R2)'),
    body("Pour la gestion des documents, nous avons configuré un disque de stockage 'r2' dans le fichier config/filesystems.php. Ce disque utilise le driver 's3' de Laravel avec un endpoint personnalisé pointant vers l'API de Cloudflare R2, qui est compatible avec le protocole S3 d'Amazon :"),
    
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "'r2' => [\n  'driver'   => 's3',\n  'key'      => env('R2_ACCESS_KEY_ID'),\n  'secret'   => env('R2_SECRET_ACCESS_KEY'),\n  'region'   => env('R2_REGION', 'auto'),\n  'bucket'   => env('R2_BUCKET'),\n  'endpoint' => env('R2_ENDPOINT'),\n  'url'      => env('R2_URL'),\n  'use_path_style_endpoint' => true,\n]", font: 'Courier New', size: 18, color: '1E2D5A' })] }),

    body("Pour télécharger un fichier de manière sécurisée sans exposer directement les clés d'accès, nous utilisons des URLs signées temporaires (Signed URLs) générées à la volée par Cloudflare R2. Ces URLs expirent après une durée définie (15 minutes pour le téléchargement, 60 minutes pour la prévisualisation) :"),
    
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "// Génération d'un lien de téléchargement sécurisé\npublic function download(File $file) {\n  $url = Storage::disk('r2')->temporaryUrl(\n    $file->file_key,\n    now()->addMinutes(15)\n  );\n  return response()->json(['url' => $url]);\n}", font: 'Courier New', size: 18, color: '1E2D5A' })] }),

    h2('3.3 Implémentation du Frontend (React 18 + TypeScript)'),
    h3('3.3.1 Architecture de l\'Application React'),
    body("L'application frontend est structurée selon une organisation par fonctionnalités (Feature-Based Architecture). Chaque grande fonctionnalité du système (authentification, plans de formation, utilisateurs, etc.) possède son propre répertoire contenant ses composants, ses hooks et ses services d'API."),
    body("La gestion des requêtes vers l'API backend est centralisée via TanStack React Query, qui apporte une gestion automatique du cache, des états de chargement (loading) et d'erreur, évitant ainsi la réécriture de logique répétitive dans chaque composant."),
    
    h3('3.3.2 Gestion de l\'Authentification et des Routes Protégées'),
    body("L'authentification est gérée via un contexte React (AuthContext) qui stocke le token Sanctum et les informations de l'utilisateur connecté. Ce contexte est consommé par un composant PrivateRoute qui redirige automatiquement les utilisateurs non authentifiés vers la page de connexion :"),
    
    new Paragraph({ spacing: { before: 100, after: 100 }, indent: { left: 360 }, children: [new TextRun({ text: "// Composant de route protégée\nconst PrivateRoute = ({ children, allowedRoles }) => {\n  const { user, isLoading } = useAuth();\n  if (isLoading) return <LoadingSpinner />;\n  if (!user) return <Navigate to='/login' replace />;\n  if (allowedRoles && !allowedRoles.includes(user.role))\n    return <Navigate to='/unauthorized' replace />;\n  return children;\n};", font: 'Courier New', size: 18, color: '1E2D5A' })] }),

    h3('3.3.3 Tableau de Bord Adaptatif'),
    body("Le tableau de bord est la première page que voit l'utilisateur après connexion. Sa particularité est d'être entièrement adaptatif selon le rôle : un Administrateur verra des statistiques globales, un DR verra uniquement les données de sa région, et un CDC verra uniquement ses propres plans."),
    body("Cette adaptation est réalisée côté backend dans le DashboardController qui filtre automatiquement les données selon l'utilisateur authentifié. Côté frontend, un seul composant Dashboard consomme l'endpoint /api/dashboard et affiche les métriques retournées, sans avoir besoin de connaître le rôle de l'utilisateur."),

    h2('3.4 Présentation des Interfaces Utilisateur'),
    h3('3.4.1 Page de Connexion'),
    body("La page de connexion constitue le point d'entrée de l'application. Elle présente un formulaire simple avec un champ email et un champ mot de passe. En cas d'erreur d'authentification, un message d'alerte est affiché à l'utilisateur. Le formulaire est entièrement géré par React Hook Form avec validation côté client avant l'envoi au serveur."),
    body("[Figure 1 : Interface de la page de connexion - Insérer la capture d'écran ici]"),
    ...spacer(1),

    h3('3.4.2 Tableau de Bord (Dashboard)'),
    body("Le tableau de bord offre une vision globale et synthétique de l'activité de l'OFPPT. Il se compose de cartes métriques (KPIs) affichant le nombre total de plans, le nombre de plans en attente, le taux de présence global, et le nombre total d'utilisateurs. Des graphiques interactifs complètent cette vue avec la répartition des plans par statut et par site."),
    body("[Figure 2 : Tableau de bord principal - Insérer la capture d'écran ici]"),
    ...spacer(1),

    h3('3.4.3 Formulaire de Création de Plan (Wizard Multi-étapes)'),
    body("La création d'un plan de formation est guidée par un formulaire en plusieurs étapes (Wizard). Cette approche améliore considérablement l'expérience utilisateur en décomposant un formulaire complexe (avec de nombreux champs et relations) en étapes logiques et progressives :"),
    bullet("Étape 1 : Informations générales (sélection de la formation, du site, des dates, du titre)."),
    bullet("Étape 2 : Sélection des participants (liste des formateurs participants disponibles avec recherche)."),
    bullet("Étape 3 : Sélection des formateurs animateurs et affectation aux thèmes de la formation."),
    bullet("Étape 4 : Organisation logistique (affectation des hébergements aux participants avec les dates de check-in et check-out)."),
    bullet("Récapitulatif et Soumission : Synthèse de toutes les informations saisies avant la validation finale."),
    body("[Figure 3 : Formulaire de création de plan (étape 1) - Insérer la capture d'écran ici]"),
    ...spacer(1),

    h3('3.4.4 Page de Détails d\'un Plan'),
    body("La page de détails d'un plan présente l'ensemble des informations relatives à un plan de formation : son statut actuel (avec un badge coloré), ses dates, ses participants, ses formateurs, les thèmes abordés, et les documents associés. Les actions disponibles (Modifier, Soumettre, Approuver, Rejeter) sont affichées dynamiquement selon le rôle de l'utilisateur et l'état actuel du plan."),
    body("[Figure 4 : Page de détails d'un plan de formation - Insérer la capture d'écran ici]"),

    new Paragraph({ children: [new PageBreak()] }),
  ];
}

module.exports = { chapitre3 };
