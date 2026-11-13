/**
 * Référentiel des six agents de l'espace administrateur NOVEXA.
 * Décrit leurs rôles cibles ; ne constitue pas une connexion opérationnelle
 * aux fournisseurs externes ni un système d'autorisation complet.
 */
export type AdminAgentId =
  | "nexus"
  | "finora"
  | "aegis"
  | "orbis"
  | "pulse"
  | "atlas";

export type AdminAgent = {
  id: AdminAgentId;
  name: string;
  title: string;
  mission: string;
  responsibilities: readonly string[];
  integrations: readonly string[];
  accessMode: "read" | "propose" | "limited_execution";
  humanApprovalRequired: readonly string[];
};

export const ADMIN_AGENTS: readonly AdminAgent[] = [
  {
    id: "nexus",
    name: "NEXUS",
    title: "Directeur général IA",
    mission: "Coordonner les cinq autres agents et présenter une vision globale de NOVEXA.",
    responsibilities: [
      "Consolider les rapports et indicateurs des départements",
      "Détecter les priorités et conflits entre missions",
      "Distribuer les tâches aux agents spécialisés",
      "Préparer des synthèses et recommandations pour l'administrateur"
    ],
    integrations: ["internal_agent_hub", "audit_log"],
    accessMode: "propose",
    humanApprovalRequired: [
      "Toute modification de politique ou de configuration globale",
      "Toute action administrative irréversible"
    ]
  },
  {
    id: "finora",
    name: "FINORA",
    title: "Directrice financière IA",
    mission: "Suivre les recettes, coûts, abonnements et indicateurs économiques.",
    responsibilities: [
      "Analyser recettes, dépenses et abonnements",
      "Suivre les coûts des modèles IA et services externes",
      "Détecter les anomalies de facturation",
      "Produire des prévisions et comparaisons de scénarios"
    ],
    integrations: ["billing_read_api", "analytics_read_api"],
    accessMode: "read",
    humanApprovalRequired: [
      "Remboursement, paiement, transfert ou modification tarifaire",
      "Modification d'un abonnement ou d'une facture"
    ]
  },
  {
    id: "aegis",
    name: "AEGIS",
    title: "Directeur cybersécurité IA",
    mission: "Surveiller les risques techniques et protéger les comptes et les données.",
    responsibilities: [
      "Analyser les événements de sécurité",
      "Repérer les connexions et comportements anormaux",
      "Contrôler les permissions et configurations",
      "Préparer des rapports d'incident et recommandations"
    ],
    integrations: ["security_events_read_api", "audit_log", "monitoring_read_api"],
    accessMode: "propose",
    humanApprovalRequired: [
      "Blocage durable d'un compte ou d'un utilisateur",
      "Changement de règles d'accès ou de sécurité",
      "Suppression ou export de données personnelles"
    ]
  },
  {
    id: "orbis",
    name: "ORBIS",
    title: "Directeur des comptes IA",
    mission: "Superviser les comptes, profils, rôles et relations entre utilisateurs.",
    responsibilities: [
      "Suivre les inscriptions et l'activité des comptes",
      "Repérer les doublons et incohérences de profils",
      "Contrôler les liens parent-apprenant et établissement-apprenant",
      "Préparer le traitement des demandes de compte"
    ],
    integrations: ["identity_read_api", "support_read_api"],
    accessMode: "propose",
    humanApprovalRequired: [
      "Changement de rôle ou de privilèges",
      "Fusion, fermeture ou suppression de compte",
      "Accès à des données personnelles d'un autre utilisateur"
    ]
  },
  {
    id: "pulse",
    name: "PULSE",
    title: "Directeur technique IA",
    mission: "Surveiller la disponibilité, les performances et l'exploitation technique.",
    responsibilities: [
      "Surveiller disponibilité et temps de réponse",
      "Détecter les erreurs applicatives et intégrations défaillantes",
      "Contrôler l'état des sauvegardes",
      "Préparer des rapports de déploiement et de maintenance"
    ],
    integrations: ["application_metrics_read_api", "deployment_status_read_api"],
    accessMode: "propose",
    humanApprovalRequired: [
      "Déploiement en production ou retour arrière",
      "Modification de l'infrastructure ou des secrets",
      "Action qui peut interrompre le service"
    ]
  },
  {
    id: "atlas",
    name: "ATLAS",
    title: "Directeur des programmes officiels et de la qualité pédagogique",
    mission:
      "Découvrir, vérifier, structurer et suivre les référentiels pédagogiques officiels des pays et territoires couverts par NOVEXA.",
    responsibilities: [
      "Rechercher les sources officielles des ministères et autorités éducatives",
      "Collecter les documents publics autorisés et leurs métadonnées",
      "Extraire les niveaux, matières, compétences et attendus dans un format commun",
      "Comparer les versions et repérer les modifications de programmes",
      "Signaler les sources absentes, ambiguës, anciennes ou contradictoires",
      "Contrôler la cohérence pédagogique des contenus associés"
    ],
    integrations: [
      "openai_responses_api",
      "openai_web_search",
      "restricted_browser_crawler",
      "github_app"
    ],
    accessMode: "propose",
    humanApprovalRequired: [
      "Validation d'une nouvelle autorité ou source officielle",
      "Publication ou remplacement d'un programme dans le catalogue actif",
      "Interprétation d'un document ambigu ou d'une traduction non officielle",
      "Fusion de référentiels régionaux ou nationaux"
    ]
  }
] as const;

export function getAdminAgent(id: AdminAgentId): AdminAgent | undefined {
  return ADMIN_AGENTS.find((agent) => agent.id === id);
}
