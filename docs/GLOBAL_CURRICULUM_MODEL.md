# Modèle du catalogue pédagogique international NOVEXA

## Objectif

NOVEXA doit pouvoir représenter les programmes scolaires, professionnels et universitaires de différents pays, y compris les systèmes décentralisés. Le catalogue ne doit pas supposer qu'une classe, une matière, une spécialité ou un diplôme a le même sens partout.

## Principe de comparaison

La classification ISCED 2011 de l'UNESCO sert de couche de comparaison des niveaux (0 à 8). La classification ISCED-F 2013 sert de taxonomie internationale de référence pour les grands domaines d'études. Ces référentiels facilitent le rapprochement des systèmes ; ils ne remplacent jamais les programmes nationaux ou régionaux.

## Hiérarchie métier

1. Pays (code ISO 3166-1 alpha-2).
2. Juridiction éducative : pays, État fédéré, province, région ou territoire.
3. Système éducatif : autorité nationale, fédérale, provinciale, régionale ou institutionnelle.
4. Niveau local et niveau ISCED correspondant (sans supposer une équivalence parfaite).
5. Curriculum et version : année scolaire, texte source, publication, date d'entrée en vigueur et date de fin.
6. Matières, modules, disciplines et domaines d'apprentissage.
7. Parcours : filière, spécialité, option, majeure, mineure, concentration ou voie professionnelle.
8. Compétences, objectifs, chapitres, ressources et évaluations.

## Règles de qualité obligatoires

- Une entrée doit conserver son libellé original, sa langue et son territoire.
- Une correspondance ISCED est une métadonnée de comparaison, pas une traduction ni une équivalence automatique.
- Une spécialité n'est enregistrée que si une source officielle ou une documentation institutionnelle fiable l'atteste.
- Les programmes sont versionnés par année scolaire et dates d'application.
- Chaque document doit conserver son URL, son autorité émettrice, sa date, son empreinte, sa langue et son statut de droits de réutilisation.
- Les sources découvertes par ATLAS restent des candidates jusqu'à vérification documentaire.
- Les contenus pédagogiques générés ou extraits ne sont publiés qu'après contrôle humain.
- Les systèmes fédéraux et régionaux doivent pouvoir être représentés séparément (ex. États/provinces) sans créer une fausse version nationale uniforme.
- Les langues d'interface, langues d'enseignement et langues des documents sources sont trois notions distinctes.
- Les matières et parcours ne sont pas supposés identiques entre niveaux ou entre versions.

## Taxonomie internationale de domaines

La migration `0006_global_curriculum_catalog.sql` initialise les grands domaines et sous-domaines de la classification ISCED-F 2013 : éducation ; arts et lettres ; sciences sociales, journalisme et information ; commerce, administration et droit ; sciences naturelles, mathématiques et statistiques ; TIC ; ingénierie, industries et construction ; agriculture et sciences vétérinaires ; santé et protection sociale ; services.

Cette taxonomie sert d'index transversal. Elle n'est pas une liste exhaustive des matières réellement enseignées dans chaque pays.

## Premier déploiement : France

La France reste le premier pilote. Le registre français actuel référence des sources institutionnelles et des pages disciplinaires ; il ne constitue pas encore une bibliothèque exhaustive de programmes validés. Le travail suivant consiste à décomposer les sources en documents officiels précis, puis à relever chaque niveau, matière, spécialité, voie, version et date d'application.

## Ordre d'extension

1. Terminer le pilote France : maternelle, élémentaire, collège, voies générale/technologique/professionnelle, apprentissage et enseignement supérieur.
2. Ajouter les systèmes nationaux et sous-nationaux avec leurs autorités officielles.
3. Prioriser les systèmes ayant des données officielles accessibles et des besoins utilisateurs confirmés.
4. Étendre par région du monde, sans présenter une couverture partielle comme mondiale.
5. Publier un indicateur de couverture transparent : pays/systèmes référencés, programmes collectés, programmes vérifiés, programmes publiés et dernière date de contrôle.

## Hors périmètre d'une simple importation

La présence d'un pays, d'un niveau ou d'un domaine dans la taxonomie ne signifie pas que ses programmes, examens, cours ou corrigés sont déjà disponibles. Les ressources sous droits ne doivent pas être copiées intégralement sans autorisation ; NOVEXA peut référencer les documents et créer des explications originales conformes aux droits applicables.
