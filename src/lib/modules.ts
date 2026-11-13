export type ModuleStatus = "planned" | "in_progress" | "available";

export type ProductModule = {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  ownerDomain: string;
};

export const PRODUCT_MODULES: readonly ProductModule[] = [
  {
    id: "identity",
    title: "Comptes et espaces",
    description: "Identités, profils, rôles et espaces personnels ou institutionnels.",
    status: "in_progress",
    ownerDomain: "identity"
  },
  {
    id: "curriculum",
    title: "Programmes et catalogues",
    description: "Niveaux, matières, programmes et référentiels pédagogiques.",
    status: "planned",
    ownerDomain: "curriculum"
  },
  {
    id: "learning",
    title: "Cours et apprentissages",
    description: "Leçons, ressources, parcours et progression.",
    status: "planned",
    ownerDomain: "learning"
  },
  {
    id: "assessment",
    title: "Exercices et évaluations",
    description: "Quiz, entraînements, examens blancs et résultats.",
    status: "planned",
    ownerDomain: "assessment"
  },
  {
    id: "ai",
    title: "Assistant et professeurs IA",
    description: "Assistance pédagogique avec fournisseurs IA interchangeables.",
    status: "planned",
    ownerDomain: "ai"
  },
  {
    id: "media",
    title: "Médias pédagogiques",
    description: "Bibliothèque de médias et contenus vidéo.",
    status: "planned",
    ownerDomain: "media"
  },
  {
    id: "collaboration",
    title: "Classes et collaboration",
    description: "Groupes, classes, échanges et retours pédagogiques.",
    status: "planned",
    ownerDomain: "collaboration"
  },
  {
    id: "integrations",
    title: "Intégrations externes",
    description: "Connecteurs autorisés vers les outils scolaires et services tiers.",
    status: "planned",
    ownerDomain: "integrations"
  },
  {
    id: "billing",
    title: "Offres et établissements",
    description: "Abonnements, facturation et gestion des offres institutionnelles.",
    status: "planned",
    ownerDomain: "billing"
  }
];