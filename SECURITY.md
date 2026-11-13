# Politique de sécurité — NOVEXA

## Signalement

Pour signaler un problème de sécurité, contacte le responsable du projet par un canal adapté. N'inclus jamais de mot de passe, jeton, clé API ou donnée personnelle dans une issue publique.

## Règles de développement

- Ne jamais ajouter de secret dans le code ou dans un commit.
- Conserver les fichiers .env.local hors du dépôt.
- Utiliser .env.example uniquement pour les noms de variables et des valeurs vides ou fictives.
- Vérifier les autorisations sur le serveur, pas seulement dans l'interface.
- Valider les entrées utilisateur côté serveur.
- Limiter les données personnelles stockées et transmises.
- Ne pas activer publiquement une fonctionnalité manipulant des données de mineurs sans revue dédiée.

## État

Ce dépôt est une base de développement. Il n'a pas encore fait l'objet d'un audit de sécurité et ne doit pas être considéré comme prêt pour des utilisateurs réels.