# État d'implémentation NOVEXA V1

Dernière révision : 15 novembre 2026. Ce document distingue les écrans et composants présents dans le dépôt des fonctions réellement activées sur une base et des fournisseurs externes.

## Présent dans le dépôt

- Socle Next.js 16, React 19 et TypeScript.
- Pages publiques d'accueil, d'inscription, de connexion, d'abonnements et de catalogue pédagogique.
- Interface responsive et personnalisation de l'apparence.
- Assistant de personnalisation avec plus de 50 réglages répartis en catégories.
- Better Auth : configuration e-mail/mot de passe, vérification e-mail, sessions et rôle initial apprenant.
- Schéma PostgreSQL et migrations applicatives 0001 à 0009.
- Début d'espace apprenant, consultation des cours publiés, suivi par leçon et premier quiz à choix unique.
- Espace enseignant initial pour créer des cours et évaluations avec publication contrôlée.
- Registre initial de sources institutionnelles françaises et modèle de catalogue international.
- Console administrateur et six profils d'agents consultatifs.
- Pipeline ATLAS de découverte et de proposition de mise à jour, avec validation humaine avant publication.
- Routes de gestion des préférences, de l'apparence et des documents privés.
- Intégration Stripe en mode TEST dans le code, avec validation de signature webhook.
- CI GitHub et déploiements Preview Vercel.

## Vérifié sur l'aperçu actuel

Le commit `2494949e83076d7a202e1af46fb3b3f93647fd6f` est déployé sur l'aperçu Vercel de la branche `feat/france-curriculum-catalog`. Les pages publiques principales répondent correctement. L'accès aux pages privées redirige vers la connexion lorsque l'utilisateur n'est pas authentifié.

Cette vérification HTTP des pages publiques ne prouve pas que les comptes, les écritures en base, les e-mails, les fichiers, les paiements ou les assistants IA fonctionnent de bout en bout.

## Bloqué par la configuration externe

- PostgreSQL : aucune variable `DATABASE_URL` n'est configurée sur Preview ; les migrations 0001 à 0009 ne sont pas appliquées à une base distante.
- Better Auth : `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` doivent être renseignées sur l'environnement ciblé.
- E-mail : Resend et un expéditeur vérifié sont nécessaires pour la vérification d'adresse et la réinitialisation.
- Documents : le code attend un Blob Store Vercel privé et `BLOB_READ_WRITE_TOKEN`.
- Stripe : les clés et Price IDs de test ainsi que le webhook ne sont pas configurés ; les paiements réels sont refusés par le code.
- Assistants IA : `OPENAI_API_KEY` est nécessaire ; l'API OpenAI est facturée séparément d'un abonnement ChatGPT.
- ATLAS/GitHub : une GitHub App et ses permissions minimales sont nécessaires pour créer des propositions sous forme de Pull Requests.
- Veille planifiée : nécessite `CRON_SECRET`, OpenAI et GitHub App.
- HeyGen : une variable de clé seule ne constitue pas une intégration vidéo ; le flux de génération n'est pas livré.

## Pas encore livré ou pas encore validé

- Catalogue exhaustif des programmes français et extension mondiale réelle à tous les pays, juridictions, matières et spécialités.
- Importation, extraction, versionnage et validation humaine d'un corpus pédagogique complet.
- Planning intelligent et modifiable, synchronisé avec les cours et les disponibilités.
- Synchronisation Pronote/ENT via des API officielles ou des autorisations documentées.
- Assistant d'accueil entièrement configurable par nom et style, et professeurs IA opérationnels par matière.
- Génération de vidéos pédagogiques HeyGen.
- Deux formats complets d'examens blancs, avec chronométrage, notation et rapports.
- Parcours complets parent, enseignant et établissement.
- Abonnements réellement facturés, tarifs définitifs des niveaux 2 et 3, factures et portail de gestion opérationnels.
- Procédures complètes de confidentialité, export/suppression, conservation, audit indépendant, tests de charge et de sécurité.

## Garde-fous

Les agents ne doivent pas prétendre consulter des données auxquelles ils ne sont pas connectés. Les propositions ATLAS ne sont pas publiées automatiquement. Les intégrations scolaires ne doivent pas contourner les contrôles de connexion ni demander les mots de passe d'autres services. La protection des données des mineurs, les autorisations et la validation par un responsable légal ou une entité habilitée doivent précéder toute ouverture publique.
