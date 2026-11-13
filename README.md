# NOVEXA

**Plateforme éducative modulaire — socle technique V1**

NOVEXA a pour objectif de réunir les parcours pédagogiques, les cours, les exercices, les évaluations, l'assistance par IA et les espaces destinés aux apprenants, parents, enseignants et établissements.

> État actuel : fondation technique initialisée. Les domaines fonctionnels décrits dans la documentation sont une cible de développement, pas des fonctionnalités déjà activées.

## Stack technique

- Next.js 16.4.6 — App Router
- React 19
- TypeScript en mode strict
- CSS responsive
- Node.js 20.9 ou supérieur

## Démarrage local

1. Installer Node.js 20.9 ou une version supérieure.
2. Cloner ce dépôt.
3. Installer les dépendances : `npm install`.
4. Copier `.env.example` vers `.env.local` si nécessaire.
5. Démarrer le serveur : `npm run dev`.
6. Ouvrir http://localhost:3000.

Commandes : `npm run dev`, `npm run typecheck`, `npm run build`, `npm start`.

## Organisation

- `src/app` : routes, layout et interface.
- `src/lib` : rôles, permissions et configuration partagée.
- `src/modules` : domaines fonctionnels.
- `src/types` : types partagés.
- `src/data/curricula` : registres initiaux des sources pédagogiques.
- `docs` : architecture, feuille de route et spécifications ATLAS.
- `SECURITY.md` : règles de sécurité.

## ATLAS — programmes officiels

ATLAS est le sixième agent administrateur. Son objectif est de rechercher, vérifier, structurer et suivre les référentiels éducatifs officiels des pays et territoires couverts progressivement par NOVEXA.

- Stratégie : couverture mondiale progressive, autorité par autorité.
- Premier pays pilote : France.
- Les sources normatives, pages de navigation et ressources d'accompagnement sont distinguées.
- Toute publication d'un programme dans le catalogue actif exige une validation humaine.
- Les documents sont importés uniquement lorsque leur accès et leurs droits de réutilisation le permettent.

Consulter [les spécifications d'ATLAS](docs/AGENT_ATLAS.md), [le pilote France](docs/FRANCE_PILOT.md) et [le pipeline d'importation](docs/CURRICULUM_INGESTION.md).

## Console administrateur

- Connexion : `/admin/login`.
- Tableau de bord et six assistants spécialisés : `/admin`.
- ATLAS utilise la recherche Web OpenAI sur les sources institutionnelles françaises, un lecteur de pages publiques et des propositions GitHub par Pull Request.
- Les assistants restent consultatifs tant que les systèmes métier réels ne sont pas connectés.
- Voir `docs/ADMIN_CONSOLE.md` pour configurer les secrets côté serveur.

## Veille automatique ATLAS

Après déploiement en production sur Vercel et configuration de `CRON_SECRET`, `OPENAI_API_KEY` et de la GitHub App, ATLAS lance une veille chaque lundi à 05:00 UTC. Les changements matériels sourcés donnent lieu à une Pull Request de revue ; aucun programme n'est publié automatiquement. Voir `vercel.json` et `docs/ADMIN_CONSOLE.md`.

## Principes

1. Architecture par domaines métier.
2. Contrôles d'accès côté serveur.
3. Clés API conservées côté serveur.
4. Minimisation des données et protection renforcée des comptes de mineurs.
5. Intégrations scolaires uniquement via des interfaces officielles et autorisées.
6. Chaque fonctionnalité doit être testée avant d'être déclarée disponible.

## État de la V1

- [x] Socle Next.js et TypeScript.
- [x] Première interface de présentation.
- [x] Référentiel initial des rôles et permissions.
- [x] Référentiel des six agents administrateur.
- [x] Spécification ATLAS et pipeline mondial.
- [x] Sources institutionnelles initiales du pilote France documentées.
- [ ] Installer les dépendances et vérifier le build dans l'environnement de développement.
- [ ] Authentification réelle.
- [ ] Base de données et modèles persistants.
- [ ] Modules pédagogiques fonctionnels.
- [ ] Connexions OpenAI, navigateur contrôlé et GitHub App dans NOVEXA.

Les cases non cochées ne sont pas encore livrées.
