# Déploiement et configuration — NOVEXA V1

Ce document décrit la configuration minimale avant d'activer les fonctions dynamiques. Les valeurs réelles doivent être enregistrées dans les variables d'environnement Vercel ou dans un gestionnaire de secrets local. Ne jamais committer un fichier `.env` contenant des secrets.

## 1. Services nécessaires

| Service | Variables | Utilisation | Priorité |
|---|---|---|---|
| PostgreSQL | `DATABASE_URL` | Comptes, profils, cours, leçons, progression, catalogue | Bloquante |
| Better Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Sessions et authentification | Bloquante |
| URL de l'application | `NEXT_PUBLIC_APP_URL` | Liens et origines de l'application | Bloquante |
| E-mail transactionnel | `RESEND_API_KEY`, `EMAIL_FROM` | Vérification d'adresse et réinitialisation du mot de passe | Bloquante pour l'inscription vérifiée |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` | Assistants administrateur et recherche ATLAS | Facultative pour le socle pédagogique |
| Tâches planifiées | `CRON_SECRET` | Protection des routes de veille planifiée | Selon activation |
| GitHub App | `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_INSTALLATION_ID` | Actions GitHub automatisées à permissions minimales | Selon activation |
| Vidéo | `HEYGEN_API_KEY` | Génération de vidéos pédagogiques | Non activée |
| Paiement | `PAYMENT_PROVIDER`, `PAYMENT_PROVIDER_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` | Abonnements et webhooks | Non activée |

Le secret Better Auth doit comporter au moins 32 caractères aléatoires à haute entropie. La valeur de `BETTER_AUTH_URL` doit correspondre exactement à l'origine du déploiement ciblé. Pour un environnement de prévisualisation, utiliser l'URL de prévisualisation correspondante et configurer séparément la production.

## 2. Ordre d'initialisation PostgreSQL

Créer une base dédiée à NOVEXA, avec un utilisateur applicatif limité aux opérations nécessaires. Appliquer les migrations dans cet ordre :

1. `database/migrations/0001_initial.sql`
2. `database/migrations/0002_auth_profile_links.sql`
3. `database/migrations/0003_seed_france_curriculum_sources.sql`
4. `database/migrations/0004_lesson_progress.sql`

Les migrations applicatives ne sont pas exécutées automatiquement au démarrage. Conserver un journal des migrations appliquées et sauvegarder la base avant toute évolution de schéma.

Better Auth possède ses propres tables de comptes et de sessions. Après configuration de `DATABASE_URL`, exécuter également la commande documentée dans `package.json` :

```bash
npm run auth:migrate
```

Vérifier que les tables Better Auth et les tables métier existent avant d'autoriser les inscriptions.

## 3. Vérifications après configuration

- [ ] Déploiement de prévisualisation accessible aux testeurs autorisés.
- [ ] Inscription avec vérification e-mail effective.
- [ ] Connexion, déconnexion et réinitialisation de mot de passe testées.
- [ ] Rôle apprenant attribué par défaut ; aucun formulaire public ne peut attribuer un rôle enseignant ou administrateur.
- [ ] Compte enseignant attribué par un administrateur, puis création d'un cours brouillon et de leçons.
- [ ] Publication réservée au rôle autorisé et limitée aux cours validés.
- [ ] Un apprenant ne consulte que les cours publiés et ne modifie que sa propre progression.
- [ ] Tests d'accès refusé pour les rôles non autorisés et les identifiants invalides.
- [ ] Sauvegarde et restauration PostgreSQL testées.
- [ ] Revue de confidentialité, de sécurité et d'accessibilité réalisée avant ouverture publique.

## 4. Garde-fous de lancement

Ne pas activer la facturation, les intégrations scolaires, la génération vidéo ou la veille automatisée tant que leurs fournisseurs, coûts, conditions d'utilisation, secrets et procédures de contrôle n'ont pas été validés.

Le catalogue France doit conserver la provenance, la version, les dates d'application et les droits de réutilisation de chaque ressource. Une source découverte par ATLAS ne devient pas automatiquement un programme validé : la publication requiert une vérification humaine.

Pour les comptes de mineurs, limiter les données collectées, documenter les finalités et durées de conservation, prévoir les mécanismes d'exercice des droits et faire valider le dispositif de protection des données avant lancement.
