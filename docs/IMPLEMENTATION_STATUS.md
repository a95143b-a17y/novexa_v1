# État d'implémentation NOVEXA V1

## Implémenté dans le dépôt

- Socle Next.js 16.4.6, React 19 et TypeScript strict.
- Page d'accueil, console administrateur et interface responsive.
- Six agents spécialisés et une interface de discussion consultative.
- Better Auth exporté sous `auth` pour l'utilisation serveur et la génération de schéma CLI ; hook de création du profil utilisateur ; e-mail/mot de passe et rôle initial apprenant.
- Pages d'inscription, de connexion et espace personnel.
- Contrôle serveur du rôle platform_admin pour la console et ses API.
- Procédure de promotion du premier administrateur.
- Recherche ATLAS via OpenAI Web Search limitée aux domaines institutionnels français.
- Lecteur HTML contrôlé et propositions de Pull Request GitHub.
- Veille ATLAS hebdomadaire via Vercel Cron.
- Schéma PostgreSQL initial pour établissements, liens parent-apprenant, référentiels, cours, évaluations, progression, conversations d'agents, audit et facturation.
- Pipeline CI avec vérification TypeScript et build.

## Configuration externe requise

- PostgreSQL et application réelle des migrations.
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `DATABASE_URL`.
- Resend : `RESEND_API_KEY`, `EMAIL_FROM`.
- OpenAI : `OPENAI_API_KEY` (facturation API distincte d'un abonnement ChatGPT).
- GitHub App : `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID`.
- Vercel Production : `CRON_SECRET` et déploiement.
- Fournisseurs de paiement et vidéo : non activés.

## Pas encore livré ou validé fonctionnellement

- Migrations appliquées, RLS et tests des permissions.
- Parcours complets parent, enseignant et établissement.
- Connexions live aux finances, journaux de sécurité et métriques infrastructure.
- Extraction PDF complète et importation exhaustive des programmes.
- Catalogue français complet et extension mondiale effective.
- Cours, quiz, évaluations et progression persistés.
- Abonnements, factures et intégrations Pronote/ENT.
- Procédures complètes de confidentialité, export/suppression et audit indépendant.

## Limites

Les cinq robots autres qu'ATLAS ne disposent pas encore des données opérationnelles auxquelles ils devront se connecter. Ils restent consultatifs et n'exécutent aucune action financière, technique ou de gestion de compte. ATLAS produit des rapports et des Pull Requests non approuvés, sans publication automatique.

Le système Better Auth est présent dans le code mais nécessite PostgreSQL, un service e-mail, l'application des migrations et des tests avant toute ouverture publique. Le schéma SQL seul ne signifie pas que les tables sont créées dans une base.
