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
  },
  {
    id: "fr-eduscol-nsi",
    title: "Programmes et ressources en numérique et sciences informatiques",
    authority: "Éduscol — DGESCO",
    url: "https://eduscol.education.gouv.fr/5823/programmes-et-ressources-en-numerique-et-sciences-informatiques-voie-g",
    kind: "national_curriculum_index",
    intendedUse: "Référencer les programmes de spécialité NSI de première et terminale générale, ainsi que les ressources d'accompagnement. Vérifier séparément le BO et les modalités d'épreuve applicables.",
    priority: 1,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-eduscol-ses",
    title: "Programmes et ressources en sciences économiques et sociales",
    authority: "Éduscol — DGESCO",
    url: "https://eduscol.education.gouv.fr/5838/programmes-et-ressources-en-sciences-economiques-et-sociales-voie-gt",
    kind: "national_curriculum_index",
    intendedUse: "Référencer l'enseignement commun de SES en seconde et la spécialité SES en première et terminale générale, en distinguant programme et modalités d'examen.",
    priority: 1,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-eduscol-histoire-geographie",
    title: "Programmes et ressources en histoire-géographie",
    authority: "Éduscol — DGESCO",
    url: "https://eduscol.education.gouv.fr/5799/programmes-et-ressources-en-histoire-geographie-voie-gt",
    kind: "national_curriculum_index",
    intendedUse: "Référencer les programmes d'histoire-géographie de seconde, première et terminale des voies générale et technologique, avec vérification des adaptations territoriales éventuelles.",
    priority: 2,
    requiresDocumentLevelVerification: true
  },
  {
    id: "fr-eduscol-snt",
    title: "Programmes et ressources en sciences numériques et technologie",
    authority: "Éduscol — DGESCO",
    url: "https://eduscol.education.gouv.fr/5841/programmes-et-ressources-en-sciences-numeriques-et-technologie-voie-gt",
    kind: "national_curriculum_index",
    intendedUse: "Référencer le programme de SNT de seconde générale et technologique et ses ressources d'accompagnement.",
    priority: 2,
    requiresDocumentLevelVerification: true
  },
] as const;
