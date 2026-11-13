# Feuille de route NOVEXA

Les étapes ci-dessous sont un ordre de réalisation proposé, pas des fonctionnalités déjà livrées.

## Phase 0 — Socle
- [x] Initialiser Next.js et TypeScript.
- [x] Définir le référentiel initial des rôles.
- [x] Documenter les domaines et les principes de sécurité.
- [x] Définir les six agents administrateur et leurs périmètres.
- [x] Définir ATLAS et son pipeline d'importation mondial.
- [x] Enregistrer la France comme premier pilote et référencer les sources institutionnelles initiales.
- [ ] Installer les dépendances et vérifier le build dans l'environnement de développement.

## Phase 1 — Identité et structure
- [x] Intégrer Better Auth au code : inscription, connexion, sessions, vérification e-mail et rôles initiaux.
- [x] Définir le schéma PostgreSQL initial et les migrations versionnées.
- [x] Construire le premier espace personnel et le début de l'espace enseignant.
- [x] Ajouter les premières routes API de création et de gestion des cours côté enseignant.
- [ ] Provisionner PostgreSQL, appliquer les migrations et configurer les secrets de production.
- [ ] Configurer et tester l'envoi des e-mails de vérification et de réinitialisation.
- [ ] Finaliser les espaces parent et établissement.
- [ ] Compléter les tests d'autorisations, de séparation des rôles et des comptes de mineurs.

**État :** le code de base est présent ; la validation de bout en bout reste bloquée par la configuration des services externes et de la base.

## Phase 2 — Cœur pédagogique et référentiels
- [ ] Construire le catalogue de programmes et de matières.
- [ ] Implémenter le pipeline de collecte France en lecture seule.
- [ ] Vérifier la provenance, les dates d'application et les droits de réutilisation.
- [ ] Ajouter les cours et ressources pédagogiques.
- [x] Ajouter le tableau de bord apprenant, la lecture des cours publiés et le suivi par leçon dans le code (migration 0004 à appliquer).\n- [ ] Étendre la progression aux objectifs, parcours et statistiques détaillées.
- [ ] Créer les exercices, quiz et évaluations.

## Phase 3 — Intelligence artificielle et ATLAS
- [ ] Choisir et configurer la passerelle IA côté serveur.
- [ ] Connecter ATLAS à la recherche Web et au navigateur contrôlé.
- [ ] Configurer une GitHub App à permissions minimales et workflow par Pull Request.
- [ ] Ajouter les limites d'usage, journaux d'audit et contrôles de coût.
- [ ] Construire NOVA et les assistants spécialisés.
- [ ] Tester la qualité des extractions et des réponses pédagogiques.

## Phase 4 — Extension internationale et collaboration
- [ ] Valider le pilote France sur plusieurs niveaux et matières.
- [ ] Ajouter progressivement de nouveaux pays et leurs autorités compétentes.
- [ ] Ajouter les vidéos et ressources multimédias.
- [ ] Construire les classes, groupes et retours enseignants.
- [ ] Évaluer les intégrations scolaires officielles.

## Phase 5 — Offre et lancement
- [ ] Construire la gestion des offres et abonnements.
- [ ] Réaliser les revues sécurité, confidentialité et accessibilité.
- [ ] Effectuer les tests de charge, sécurité et sauvegarde.
- [ ] Préparer un lancement limité avant toute ouverture générale.

Aucune ouverture publique ne doit avoir lieu avant la validation de l'authentification, des autorisations, de la protection des données des mineurs, des sauvegardes, des procédures d'incident et des tests de sécurité.

## État technique — 13 novembre 2026

- Le tableau de bord apprenant, la consultation des cours publiés et l'enregistrement de la progression par leçon sont implémentés sur la branche de travail.
- La migration `0004_lesson_progress.sql` est ajoutée, mais elle n'est pas appliquée à une base distante.
- Le guide de configuration et de déploiement est disponible dans `docs/DEPLOYMENT_SETUP.md`.
- L'authentification, les e-mails, les assistants IA et les données persistantes restent conditionnés par les variables d'environnement et les services externes.
- La Pull Request reste en brouillon tant que la CI et les vérifications de prévisualisation ne sont pas terminées.
