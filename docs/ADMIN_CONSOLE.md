# Console administrateur NOVEXA

## Accès

- Inscription/connexion : `/inscription` et `/connexion`.
- Console administrateur : `/admin`.
- L'authentification multi-utilisateur utilise Better Auth avec PostgreSQL.
- Les sessions sont vérifiées côté serveur.
- Les secrets ne sont jamais envoyés au navigateur.

## Configuration requise

Configurer côté serveur :

- `DATABASE_URL` : PostgreSQL.
- `BETTER_AUTH_URL` : URL publique de l'application.
- `BETTER_AUTH_SECRET` : secret aléatoire de 32 caractères minimum.
- `RESEND_API_KEY` : service transactionnel de vérification et réinitialisation.
- `EMAIL_FROM` : expéditeur validé chez le fournisseur e-mail.

Générer un secret localement : `openssl rand -base64 48`. Ne pas le partager dans un chat ou dans GitHub.

## Initialisation de la base

1. Configurer `DATABASE_URL` dans l'environnement sécurisé.
2. Configurer `BETTER_AUTH_SECRET` et les variables e-mail.
3. Lancer `npm run auth:migrate` pour créer les tables Better Auth et le champ de rôle.
4. Appliquer `database/migrations/0001_initial.sql`.
5. Appliquer `database/migrations/0002_auth_profile_links.sql`.
6. Définir des politiques PostgreSQL Row-Level Security et les tester avant d'importer des données réelles.

## Créer le premier administrateur

1. Créer le compte depuis `/inscription`.
2. Vérifier son adresse e-mail.
3. Depuis un environnement sécurisé, exécuter :
   `npm run auth:promote-admin -- adresse-administrateur@example.com`
4. Se déconnecter puis se reconnecter.
5. Ouvrir `/admin`.

L'inscription publique attribue toujours le rôle `learner). Le champ de rôle n'est pas modifiable dans le navigateur. Le rôle `platform_admin` doit être attribué par la procédure d'administration sécurisée.

Les rôles parent, enseignant et établissement doivent également être attribués par un administrateur après vérification. Un utilisateur ne peut pas s'accorder lui-même des privilèges.

## E-mails

Better Auth impose la vérification de l'adresse e-mail avant d'ouvrir une session par mot de passe. NOVEXA utilise Resend pour envoyer les liens de vérification et de réinitialisation. Sans les variables Resend, l'inscription et les opérations de vérification restent indisponibles.

## ATLAS — recherche

`POST /api/admin/atlas/discover` nécessite une session Better Auth avec le rôle `platform_admin`. La route appelle OpenAI Responses API avec Web Search, filtre les résultats sur les domaines institutionnels français et retourne un rapport sourcé. Elle ne publie ni ne remplace automatiquement un programme.

Variable requise : `OPENAI_API_KEY`. Modèle configurable avec `OPENAI_MODEL`.

## Lecteur Web contrôlé

`POST /api/admin/atlas/inspect` lit uniquement les pages HTTPS des domaines institutionnels autorisés pour la France. Il refuse les redirections hors liste, les contenus non HTML et les pages de plus de 2 Mo. Les PDF nécessitent un module documentaire distinct.

## GitHub

`POST /api/admin/atlas/proposal` nécessite le rôle `platform_admin`, utilise une GitHub App installée sur le dépôt cible, crée une branche distincte et une Pull Request. Il ne pousse jamais directement sur la branche principale.

Variables requises : `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID`, `GITHUB_OWNER`, `GITHUB_REPO` et `GITHUB_BASE_BRANCH`.

Permissions nécessaires : Contents read/write et Pull requests read/write. Limiter l'installation au dépôt NOVEXA V1.

## Veille automatique ATLAS

Après déploiement en production sur Vercel et configuration de `CRON_SECRET`, `OPENAI_API_KEY` et des secrets GitHub App, ATLAS effectue une veille hebdomadaire sur les sources officielles françaises et crée une Pull Request si un changement matériel est confirmé. Aucun programme n'est publié automatiquement.

## Limites avant ouverture publique

Avant ouverture publique : migrations appliquées, RLS testée, récupération de compte, vérification e-mail, limitation persistante des tentatives, audit de sécurité, règles de conservation/suppression et protection adaptée aux comptes de mineurs.

Les robots restent consultatifs : les données financières, journaux de sécurité, comptes et métriques d'infrastructure ne sont pas encore connectés.
