/**
 * Registre initial des sources institutionnelles du pilote France.
 *
 * Ce fichier référence des pages officielles de découverte et de suivi.
 * Il ne signifie pas que les documents ont déjà été importés ou validés.
 */
export type FranceSourceKind =
  | "normative_publication"
  | "national_curriculum_index"
  | "implementation_guidance"
  | "higher_education_index";

export type OfficialSource = {
  id: string;
  title: string;
  authority: string;
  url: string;
  kind: FranceSourceKind;
  intendedUse: string;
  priority: number;
  requiresDocumentLevelVerification: boolean;
};

export const FRANCE_CURRICULUM_PROFILE = {
  countryCode: "FR",
  countryName: "France",
  rolloutRole: "first_pilot",
  strategy: "global_progressive",
  language: "fr",
  targetEducationStages: [
    "college",
    "lycee_general_technologique",
    "lycee_professionnel",
    "higher_education_licence",
    "higher_education_master",
    "higher_education_doctorate",
    "primary_and_preschool"
  ],
  publicationRule: "human_approval_required"
} as const;

export const FRANCE_OFFICIAL_SOURCES: readonly OfficialSource[] = [
  {
    id: "fr-national-bulletin-officiel",
    title: "Bulletin officiel de l'Éducation nationale",
    authority: "Ministère de l'Éducation nationale",
    url: "https://www.education.gouv.fr/le-bulletin-officiel-de-l-education-nationale-de-la-jeunesse-et-des-sports",
    kind: "normative_publication",
    intendedUse:
      "Identifier les arrêtés, programmes adoptés, dates d'application et textes réglementaires publiés.",
    priority: 1,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-ministry-curriculum-index",
    title: "Programmes scolaires",
    authority: "Ministère de l'Éducation nationale",
    url: "https://www.education.gouv.fr/programmes-scolaires-41483",
    kind: "national_curriculum_index",
    intendedUse:
      "Point d'entrée national pour cartographier les programmes de la maternelle au lycée.",
    priority: 2,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-ministry-college-programmes",
    title: "Les programmes du collège",
    authority: "Ministère de l'Éducation nationale",
    url: "https://www.education.gouv.fr/les-programmes-du-college-470408",
    kind: "national_curriculum_index",
    intendedUse:
      "Découvrir les programmes du collège et leurs calendriers d'entrée en vigueur.",
    priority: 2,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-eduscol-levels-calendar",
    title: "Niveaux et calendrier de mise en œuvre",
    authority: "Éduscol — DGESCO",
    url: "https://eduscol.education.gouv.fr/4332/niveaux",
    kind: "implementation_guidance",
    intendedUse:
      "Suivre les ressources d'accompagnement et le calendrier d'application par niveau.",
    priority: 3,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-higher-education-index",
    title: "Formations, diplômes, établissements",
    authority: "Ministère de l'Enseignement supérieur et de la Recherche",
    url: "https://www.enseignementsup-recherche.gouv.fr/fr/formations-diplomes-etablissements-103236",
    kind: "higher_education_index",
    intendedUse:
      "Cartographier les voies de formation, diplômes et établissements ; vérifier ensuite les accréditations et maquettes officielles applicables.",
    priority: 2,
    requiresDocumentLevelVerification: true
  }
] as const;
