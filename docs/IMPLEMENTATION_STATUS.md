# État d'implémentation NOVEXA V1

Ce document distingue ce qui existe dans le dépôt de ce qui nécessite encore un fournisseur externe, une base ou un développement supplémentaire.

## Implémenté dans le dépôt

- Socle Next.js 16.4.6, React et TypeScript.
- Page d'accueil et console administrateur.
- Référentiel des six robots : NEXUS, FINORA, AEGIS, ORBIS, PULSE et ATLAS.
- Chat consultatif spécialisé pour les six agents, via OpenAI Responses API.
- Session administrateur initiale mono-compte, signée côté serveur.
- Recherche ATLAS avec Web Search, limitée à des domaines officiels français.
- Lecteur de pages HTML HTTPS limité aux domaines institutionnels autorisés.
- Création de rapports de recherche dans une Pull Request GitHub via une GitHub App.
- Route de veille hebdomadaire ATLAS et configuration Vercel Cron.
- Pipeline CI configuré pour installer, vérifier TypeScript et lancer un build.
- Schéma PostgreSQL initial proposé dans `database/migrations/0001_initial.sql`.

## Nécessite des secrets ou un service externe

- `OPENAI_API_KEY` : assistants IA et recherche ATLAS.
- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID` : Pull Requests automatisées.
- `CRON_SECRET` : autoriser la veille planifiée Vercel.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` : accès à la console mono-compte.
- `DATABASE_URL` : base PostgreSQL, pas encore connectée ni migrée.
- Un fournisseur de messagerie est requis avant l'activation de la vérification e-mail.
- Un fournisseur de paiement et un fournisseur vidéo sont à configurer avant toute facturation ou génération vidéo.

## Pas encore implémenté

- Authentification multi-utilisateur et inscription sécurisée.
- Espaces réels apprenant, parent, enseignant et établissement.
- Gestion opérationnelle des utilisateurs et des demandes de support.
- Connexion aux données financières, aux systèmes de paiement et aux journaux de sécurité.
- Monitoring live de l'infrastructure et actions d'exploitation.
- Importation complète des documents PDF et extraction de programmes.
- Bibliothèque officielle complète des programmes français.
- Extension effective à d'autres pays.
- Cours, quiz, évaluations, progression et contenus persistés.
- Gestion des abonnements, factures et accès institutionnels.
- Intégrations Pronote/ENT : uniquement après identification d'API officielles et autorisées.
- Politiques de conservation, export et suppression des données ainsi que revue de sécurité indépendante.

## Limites de sécurité actuelles

La connexion administrateur mono-compte est un bootstrap technique, pas une solution d'authentification de production. Sa limitation de tentatives est en mémoire et ne partage pas son état entre instances serverless. Ne pas ouvrir la console au public avant migration vers un fournisseur d'authentification maintenu, stockage persistant du rate limit, revue des permissions, tests CSRF/session et audit de sécurité.

Le chat des robots est consultatif. Les cinq agents hors ATLAS n'ont pas accès aux données live du produit et ne peuvent effectuer d'action opérationnelle. ATLAS ne publie pas directement dans les référentiels approuvés : il prépare des rapports et des Pull Requests.

## Vérification et test

Le dépôt et les commits ont été vérifiés par lecture GitHub. La compilation npm et les tests end-to-end n'ont pas pu être exécutés dans cet environnement. Le workflow GitHub Actions est configuré, mais aucune exécution de CI n'a encore été observée.
