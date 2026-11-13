# Console administrateur NOVEXA

## Accès

- URL : `/admin/login`
- Accès contrôlé côté serveur par un cookie HTTP-only signé.
- Durée maximale de session : huit heures.
- Les secrets sont lus uniquement côté serveur.
- Cette première version utilise un compte administrateur mono-compte configuré par variables d'environnement. Ce n'est pas encore le système complet multi-utilisateur.

## Initialisation locale

1. Installer les dépendances : `npm install`.
2. Générer un hash : `node scripts/hash-admin-password.mjs`.
3. Renseigner `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` et `ADMIN_SESSION_SECRET` dans `.env.local`.
4. Lancer `npm run dev`.
5. Ouvrir `/admin/login`.

Le hash utilise scrypt et un sel aléatoire. Le secret de session doit contenir au moins 32 caractères.

Une limitation simple des tentatives est incluse dans le processus serveur. Avant production, ajouter une limitation persistante via Redis ou un service de protection de l'hébergeur, car la mémoire du processus n'est pas partagée entre instances.

## ATLAS — recherche

`POST /api/admin/atlas/discover` :
- nécessite une session administrateur ;
- appelle l'API OpenAI Responses ;
- force une recherche Web ;
- limite la recherche aux domaines institutionnels du pilote France ;
- retourne le rapport et les citations extraites ;
- ne publie ni ne remplace automatiquement un programme.

Variable requise : `OPENAI_API_KEY`. Modèle configurable avec `OPENAI_MODEL`.

## Lecteur Web contrôlé

`POST /api/admin/atlas/inspect` lit uniquement les pages HTTPS de la liste institutionnelle France. Il refuse les redirections hors liste, les contenus non HTML et les pages de plus de 2 Mo. Le traitement des PDF nécessite le module documentaire suivant.

## GitHub

`POST /api/admin/atlas/proposal` :
- nécessite une session administrateur ;
- utilise une GitHub App installée sur le dépôt cible ;
- crée une branche distincte ;
- ajoute un rapport JSON de recherche avec les sources ;
- crée une Pull Request vers la branche de base ;
- ne pousse jamais directement sur la branche principale.

Variables requises : `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID`, `GITHUB_OWNER`, `GITHUB_REPO` et facultativement `GITHUB_BASE_BRANCH`.

Permissions nécessaires de la GitHub App : Contents read/write et Pull requests read/write. Limiter son installation au dépôt NOVEXA V1.

## Limites et sécurité avant production

Cette première porte d'accès n'est pas le système complet de comptes. Avant ouverture publique : authentification multi-utilisateur, rôles et permissions côté serveur, limitation persistante des tentatives, tests de sécurité, journal d'audit, quotas de tâches IA, contrôle des coûts et protection des comptes de mineurs.
