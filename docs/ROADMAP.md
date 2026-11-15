# Feuille de route NOVEXA

Les étapes ci-dessous décrivent le travail restant et l'ordre recommandé. Une case cochée indique que du code ou un écran existe ; elle ne signifie pas que le service externe est connecté ni que le flux complet a été validé.

## Phase 0 — Socle
- [x] Initialiser Next.js et TypeScript.
- [x] Définir les premiers rôles et contrôles d'accès serveur.
- [x] Définir les profils des six agents administrateur.
- [x] Créer la console administrateur et le premier pipeline de propositions ATLAS.
- [x] Ajouter les pages publiques, l'inscription, la connexion et les abonnements.
- [x] Définir les niveaux tarifaires 1 gratuit, 2 payant et 3 payant dans l'interface.
- [x] Mettre en place une CI et un aperçu Vercel de la branche de développement.

## Phase 1 — Identité, données et fichiers
- [x] Intégrer Better Auth dans le code.
- [x] Définir les migrations PostgreSQL applicatives 0001 à 0009.
- [x] Ajouter les écrans de personnalisation et d'onboarding.
- [x] Ajouter les routes de persistance des préférences et de l'apparence.
- [x] Ajouter les routes d'importation, téléchargement et suppression de documents privés.
- [ ] Provisionner une base PostgreSQL de test et appliquer les migrations dans l'ordre documenté.
- [ ] Configurer Better Auth et vérifier le parcours de bout en bout.
- [ ] Configurer un expéditeur e-mail vérifié et tester confirmation et réinitialisation.
- [ ] Connecter un Blob Store privé et tester les droits d'accès aux documents.
- [ ] Tester les autorisations, les relations parent-apprenant et les règles de comptes de mineurs.

## Phase 2 — Cœur pédagogique
- [x] Créer le tableau de bord apprenant et la lecture de cours publiés.
- [x] Ajouter le suivi de progression par leçon.
- [x] Ajouter un premier quiz à choix unique et sa correction côté serveur.
- [x] Créer un premier espace de gestion de cours et d'évaluations pour enseignants.
- [ ] Ajouter les formats de questions multiples, texte libre et barèmes partiels.
- [ ] Construire deux formats d'examens blancs, avec chronométrage, notation et rapports.
- [ ] Construire un planning hybride, automatique et modifiable par l'apprenant.
- [ ] Tester toutes les écritures et lectures pédagogiques sur PostgreSQL.

## Phase 3 — Catalogue national et international
- [x] Définir le modèle des pays, juridictions, systèmes, niveaux ISCED, domaines ISCED-F, matières et parcours.
- [x] Ajouter la page d'entrée du catalogue et le premier registre de sources institutionnelles françaises.
- [ ] Décomposer et valider les programmes français par niveau, matière, voie, spécialité et année d'application.
- [ ] Référencer les autorités officielles de chaque pays et juridiction.
- [ ] Collecter puis vérifier les matières, filières et programmes par système éducatif.
- [ ] Publier les indicateurs de couverture et la date de dernière vérification par pays.
- [ ] Étendre progressivement le corpus mondial sans annoncer une couverture exhaustive avant preuve.

## Phase 4 — IA, assistants et vidéos
- [x] Ajouter une première console d'agents consultatifs et une base ATLAS de découverte.
- [ ] Configurer le fournisseur IA, les modèles, les quotas, les plafonds de coûts et les journaux.
- [ ] Rendre l'assistant d'accueil configurable par nom, langue et style.
- [ ] Développer les professeurs IA par matière avec contenus validés et contrôle pédagogique.
- [ ] Configurer une GitHub App et tester le cycle de proposition ATLAS sans fusion automatique.
- [ ] Construire le flux HeyGen : script validé, génération, stockage privé, sous-titres et lecture.
- [ ] Évaluer la qualité des réponses et la protection des données envoyées aux fournisseurs.

## Phase 5 — Intégrations et collaboration
- [ ] Étudier les API officielles ou autorisations disponibles pour Pronote et les ENT.
- [ ] Ajouter uniquement des connecteurs autorisés et documentés.
- [ ] Terminer les espaces parent et établissement.
- [ ] Ajouter les classes, groupes et retours enseignants.

## Phase 6 — Abonnements et lancement
- [x] Présenter les niveaux 1 gratuit, 2 payant et 3 payant dans l'interface.
- [x] Ajouter une intégration Stripe en mode TEST dans le code.
- [ ] Définir les prix des niveaux 2 et 3.
- [ ] Configurer Stripe TEST et vérifier checkout, webhooks, abonnements et portail.
- [ ] Faire valider toute activation de paiements réels par une personne adulte et l'entité légalement autorisée.
- [ ] Réaliser les revues sécurité, confidentialité, accessibilité et protection des mineurs.
- [ ] Tester sauvegarde/restauration, charge, incidents et suppression/export des données.
- [ ] Préparer un lancement restreint avant toute ouverture générale.

## État des dépendances

La prévisualisation Vercel est disponible, mais la branche Preview n'a pas encore de variables d'environnement configurées. Les migrations ne sont pas appliquées à une base distante. Les tâches qui dépendent de PostgreSQL, e-mail, Blob, Stripe, OpenAI, GitHub App ou HeyGen restent donc à connecter et à valider selon `docs/DEPLOYMENT_SETUP.md`.

Aucune ouverture publique ne doit avoir lieu avant la validation des autorisations, de la protection des données des mineurs, des sauvegardes, des procédures d'incident et des tests de sécurité.
