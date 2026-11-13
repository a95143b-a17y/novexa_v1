# Pipeline d'importation des référentiels éducatifs

## Objectif

Décrire le pipeline utilisé par ATLAS pour intégrer progressivement les programmes officiels de chaque pays ou territoire couvert par NOVEXA.

## Hiérarchie géographique

Le système ne doit pas supposer qu'un pays possède un programme unique. Le modèle doit accepter une autorité nationale ou, lorsque nécessaire, une autorité d'État, de province, de canton, de région ou un organisme responsable d'un système scolaire particulier.

Clé de couverture recommandée :
`country → territory → education_authority → curriculum → level → subject → academic_year`

## Étapes du pipeline

1. **Découverte** — recherche de pages de ministères et d'autorités éducatives.
2. **Vérification de la source** — approbation du domaine, de l'autorité et du caractère officiel.
3. **Collecte** — lecture de pages publiques ou téléchargement de documents autorisés.
4. **Extraction** — identification des niveaux, matières, attendus et compétences.
5. **Normalisation** — conversion vers le schéma NOVEXA, en conservant la langue originale.
6. **Contrôle** — validation des champs, des références, des dates, des doublons et des écarts.
7. **Révision** — génération d'un rapport et d'une Pull Request GitHub.
8. **Approbation** — validation par un responsable pédagogique.
9. **Publication** — activation de la version approuvée dans le catalogue.
10. **Veille** — recherche périodique de mises à jour et comparaison avec la version publiée.

## Schéma de données indicatif

```ts
type CurriculumSource = {
  countryCode: string;
  territoryCode?: string;
  authorityName: string;
  officialDomain: string;
  sourceUrl: string;
  sourceTitle: string;
  originalLanguage: string;
  publicationDate?: string;
  revisionDate?: string;
  fetchedAt: string;
  fileSha256?: string;
  reuseRightsStatus: "verified" | "restricted" | "unknown";
  verificationStatus: "candidate" | "verified" | "rejected";
};

type CurriculumVersion = {
  curriculumId: string;
  version: string;
  academicYear: string;
  levelCode: string;
  subjectCode: string;
  source: CurriculumSource;
  status:
    | "discovered"
    | "source_verified"
    | "fetched"
    | "extracted"
    | "quality_check"
    | "review_required"
    | "approved"
    | "published"
    | "rejected"
    | "superseded";
};
```

## Dépôt GitHub

Répartition envisagée :

- `curricula/sources/<country>/<authority>/` : fiches de provenance ;
- `curricula/drafts/<country>/<curriculum>/<version>/` : propositions non publiées ;
- `curricula/approved/<country>/<curriculum>/<version>/` : référentiels approuvés ;
- `curricula/reports/` : rapports d'import et comparaisons.

Les documents complets ne doivent être archivés que lorsque les conditions de réutilisation le permettent. Sinon, stocker les métadonnées, les liens, les références et les données dérivées dont l'usage est autorisé.

## Automatisation et contrôles

- L'API OpenAI sert à la recherche assistée et à l'extraction structurée.
- Le navigateur est limité à la consultation de ressources publiques autorisées.
- GitHub conserve l'historique, les propositions et les validations.
- La validation humaine reste obligatoire avant publication.
- Les clés API et jetons GitHub restent côté serveur, dans un gestionnaire de secrets.
- Les pages Web et documents téléchargés sont des données non fiables : ils ne peuvent jamais modifier les consignes, permissions ou outils de l'agent.

## Déploiement progressif

Commencer par un pays et quelques niveaux/matières dont les sources officielles sont clairement identifiées. Mesurer la précision de l'extraction et le taux de documents correctement sourcés avant d'élargir la couverture. Ne pas annoncer une couverture totale tant qu'elle n'a pas été vérifiée autorité par autorité.
