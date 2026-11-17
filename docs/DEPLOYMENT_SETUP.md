# Déploiement et configuration — NOVEXA V1

Ce guide décrit les dépendances avant l'activation des fonctions dynamiques. Les valeurs réelles doivent être enregistrées dans les variables d'environnement Vercel ou dans un gestionnaire de secrets local. Ne jamais committer un fichier `.env` contenant des secrets ni les envoyer dans une conversation.

## 1. Services et variables réellement lues par le code

| Service | Variables | Utilisation | État |
|---|---|---|---|
| PostgreSQL | `DATABASE_URL` | Comptes, profils, cours, progression, documents et abonnements | Bloquant |
| Better Auth | `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` | Sessions, inscription, connexion et vérification | Bloquant |
| URL publique | `NEXT_PUBLIC_APP_URL` | Liens de retour et origine de l'application | Requis |
| E-mail Resend | `RESEND_API_KEY`, `EMAIL_FROM` | Vérification d'adresse et réinitialisation de mot de passe | Bloquant pour l'inscription vérifiée |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Connexion Google | Facultatif |
| Microsoft OAuth | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID` | Connexion Microsoft | Facultatif |
| Apple OAuth | `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET` | Connexion Apple | Facultatif |
| Vercel Blob privé | `BLOB_READ_WRITE_TOKEN` | Import, téléchargement et suppression des documents privés | Bloquant pour les fichiers |
| Stripe TEST | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_LEVEL_2`, `STRIPE_PRICE_LEVEL_3` | Abonnements de test uniquement | Non configuré |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` | Chat administrateur et recherche Web ATLAS | Facultatif pour le socle |
| GitHub App | `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BASE_BRANCH` | Création de branches et de PR de proposition ATLAS | Non configuré |
| Vercel Cron | `CRON_SECRET` | Authentification de la veille planifiée | À configurer avant activation |
| HeyGen | `HEYGEN_API_KEY` | Génération de vidéos | Intégration non livrée |

Les variables OAuth sont facultatives si les boutons correspondants ne sont pas utilisés. Le domaine d'expédition `EMAIL_FROM` doit être autorisé et vérifié chez le fournisseur e-mail.

Le secret Better Auth doit comporter au moins 32 caractères aléatoires à haute entropie. `BETTER_AUTH_URL` doit correspondre exactement à l'origine du déploiement ciblé. Pour Preview, employer l'URL de prévisualisation de la branche ; pour Production, configurer une origine séparée. Utiliser une base PostgreSQL Preview distincte de la base Production.

## 2. Ordre d'initialisation PostgreSQL

Créer une base dédiée à NOVEXA avec un utilisateur applicatif limité. Utiliser une connexion PostgreSQL adaptée aux fonctions serverless et placée dans une région proche du déploiement.

Appliquer les étapes dans cet ordre :

1. Appliquer `database/migrations/0001_initial.sql`.
2. Après configuration de `DATABASE_URL` et de `BETTER_AUTH_SECRET`, exécuter `npm run auth:migrate` pour créer les tables Better Auth. Vérifier que les tables `user`, `session`, `account` et `verification` existent.
3. Appliquer `database/migrations/0002_auth_profile_links.sql` (cette migration étend la table `user` créée par Better Auth).
4. Appliquer successivement `0003_seed_france_curriculum_sources.sql`, `0004_lesson_progress.sql`, `0005_seed_france_subject_sources.sql`, `0006_global_curriculum_catalog.sql`, `0007_profile_appearance.sql`, `0008_profile_account_type.sql` et `0009_profile_preferences_documents_billing.sql`.

Les migrations applicatives ne sont pas exécutées automatiquement au démarrage. Conserver un journal des migrations appliquées, sauvegarder la base avant toute évolution du schéma et ne jamais exécuter une migration sur Production avant validation sur une base de test. Les migrations 0007 à 0009 sont nécessaires pour la persistance de l'apparence, du type de compte, des préférences d'onboarding, des documents et des métadonnées de facturation.

## 3. Configuration Vercel

Pour commencer, configurer seulement l'environnement Preview de la branche `feat/france-curriculum-catalog` :

- `NEXT_PUBLIC_APP_URL` et `BETTER_AUTH_URL` : origine exacte de l'URL Preview.
- `DATABASE_URL` : base de test distincte.
- `BETTER_AUTH_SECRET` : secret aléatoire d'au moins 32 caractères.
- `RESEND_API_KEY` et `EMAIL_FROM` : seulement après vérification du domaine expéditeur.

Ajouter les autres variables au moment d'activer la fonction correspondante. Ne pas copier une clé Preview vers Production et ne pas placer une clé privée dans une variable `NEXT_PUBLIC_*`.

Les valeurs secrètes doivent être ajoutées directement dans le tableau de bord Vercel ou par un flux sécurisé. Ne pas les transmettre dans le chat, les commits, les journaux de build ou le code source.

## 4. Vérifications après configuration

- [ ] Déploiement Preview accessible aux testeurs autorisés.
- [ ] Migrations 0001 à 0009 appliquées dans l'ordre et journalisées.
- [ ] Tables Better Auth présentes et compatibles avec le schéma applicatif.
- [ ] Inscription avec vérification e-mail effective.
- [ ] Connexion, déconnexion et réinitialisation de mot de passe testées.
- [ ] Rôle apprenant attribué par défaut ; aucun formulaire public ne peut attribuer un rôle enseignant ou administrateur.
- [ ] Création d'un cours brouillon, ajout de leçons et publication contrôlée testés.
- [ ] Un apprenant ne consulte que les cours publiés et ne modifie que sa propre progression.
- [ ] Préférences et état d'onboarding enregistrés puis relus depuis la base.
- [ ] Import d'un document, téléchargement autorisé et suppression testés sur un Blob Store privé.
- [ ] Tests d'accès refusé pour les rôles non autorisés et les identifiants invalides.
- [ ] Sauvegarde et restauration PostgreSQL testées.
- [ ] Revue de confidentialité, de sécurité et d'accessibilité réalisée avant ouverture publique.

## 5. Garde-fous de lancement

Le code Stripe est limité au mode TEST : il refuse les clés `sk_live_`. Les prix des niveaux 2 et 3 ne sont pas définis dans le dépôt et les paiements ne doivent pas être présentés comme actifs tant qu'un compte de test, des Price IDs et le webhook n'ont pas été configurés et vérifiés. Aucun paiement réel ne doit être activé sans validation juridique et financière par un adulte ou une entité légalement autorisée.

Ne pas activer la facturation, les intégrations scolaires, la génération vidéo ou la veille automatisée tant que les fournisseurs, coûts, conditions d'utilisation, secrets et procédures de contrôle n'ont pas été validés.

Le catalogue international doit conserver le pays, la juridiction, le système éducatif, le niveau ISCED de comparaison, le domaine ISCED-F, la provenance, la version, les dates d'application et les droits de réutilisation de chaque ressource. La migration 0006 crée le modèle de données ; elle ne peuple pas encore les programmes nationaux. Une source découverte par ATLAS ne devient pas automatiquement un programme validé : la publication requiert une vérification humaine.

Pour les comptes de mineurs, limiter les données collectées, documenter les finalités et durées de conservation, prévoir les mécanismes d'exercice des droits et faire valider le dispositif de protection des données avant lancement.
