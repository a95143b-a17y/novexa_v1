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
- `docs` : architecture et feuille de route.
- `SECURITY.md` : règles de sécurité.

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
- [x] Documentation d'architecture, sécurité et roadmap.
- [ ] Authentification réelle.
- [ ] Base de données et modèles persistants.
- [ ] Modules pédagogiques fonctionnels.
- [ ] Services IA et intégrations externes.

Les cases non cochées ne sont pas encore livrées.
