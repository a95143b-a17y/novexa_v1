# Architecture technique NOVEXA

## Objectif

Construire une plateforme éducative modulaire pour les apprenants, les parents, les enseignants et les établissements. Les domaines décrits ici sont une cible de développement ; ils ne sont pas tous opérationnels.

## Socle retenu

- Application web : Next.js 16.4.6, App Router et React.
- Langage : TypeScript en mode strict.
- Interface : composants accessibles et feuille de styles partagée.
- API : Route Handlers et services côté serveur.
- Base de données : PostgreSQL ; le schéma et les migrations initiales sont présents dans `database/migrations`, mais ils doivent encore être appliqués sur une instance configurée.
- Authentification : Better Auth est intégré au code (e-mail/mot de passe, vérification e-mail et rôles). Son activation réelle dépend de PostgreSQL, des secrets serveur, du service e-mail et de tests en environnement configuré.

Node.js 20.9 ou supérieur est requis par ce socle.

## Domaines métier

| Domaine | Responsabilité |
| --- | --- |
| Identity | Comptes, profils, sessions et autorisations |
| Curriculum | Pays, programmes, niveaux, matières et référentiels |
| Learning | Cours, contenus, ressources et progression |
| Assessment | Exercices, quiz, examens blancs et résultats |
| AI | Assistant NOVA, professeurs IA, modèles et limites d'usage |
| Media | Bibliothèque de médias et génération vidéo |
| Collaboration | Classes, groupes, échanges et retours |
| Institutions | Établissements, équipes et espaces dédiés |
| Integrations | Connecteurs tiers et synchronisation autorisée |
| Billing | Offres, abonnements et facturation |
| Analytics | Indicateurs agrégés et suivi opérationnel |

## Organisation des couches

- app : routes, layouts et présentation.
- components : composants d'interface réutilisables.
- modules : domaines métier et contrats propres.
- lib : configuration, fonctions transverses et contrôle d'accès.
- types : types partagés strictement nécessaires.
- docs : architecture, sécurité et feuille de route.

Les contrôles d'autorisation doivent être exécutés côté serveur à chaque opération protégée. L'interface seule ne constitue jamais une barrière de sécurité.

## Flux IA

Le navigateur appelle le serveur NOVEXA. Le serveur valide la session, le rôle, les limites d'usage et le contexte pédagogique, puis transmet la demande au fournisseur IA sélectionné. Les clés fournisseurs restent dans des variables d'environnement côté serveur. Les données partagées avec un fournisseur doivent être limitées au strict nécessaire.

La sélection des fournisseurs sera configurable sans exposer de clé au navigateur. Les fournisseurs et modèles restent à confirmer.

## Intégrations externes

Les intégrations Pronote/ENT seront développées uniquement à partir d'API officielles, de mécanismes documentés ou d'accords d'accès autorisés. Aucun contournement de connexion ni collecte de mots de passe tiers ne doit être mis en place.

Les intégrations vidéo et paiement seront isolées derrière des adaptateurs et ne seront activées qu'après configuration et tests.

## Données et protection

Le modèle doit distinguer les comptes individuels, les liens parent-apprenant, les enseignants et les appartenances à un établissement. Les permissions sont limitées au périmètre nécessaire. Un rôle déclaré dans l'interface ne vaut jamais autorisation.

Avant toute ouverture publique : minimisation des données, règles adaptées aux comptes de mineurs, consentements nécessaires, durées de conservation, procédures d'accès et de suppression, et évaluation des fournisseurs externes.

Ce document est une orientation technique, pas une certification de conformité ou de sécurité.

## Décisions encore ouvertes

- Fournisseur PostgreSQL définitif, stratégie de sauvegarde et application vérifiée des migrations.
- Configuration de production Better Auth, service e-mail et règles de gestion adaptées aux comptes de mineurs.
- Hébergement et environnement de production.
- Passerelle IA, modèles autorisés, quotas et coûts.
- Fournisseur de paiement.
- Accès réels aux API scolaires.
- Politique de confidentialité, consentements et conservation des données.