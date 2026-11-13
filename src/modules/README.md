# Découpage des domaines

Les domaines fonctionnels doivent rester indépendants et exposer des contrats explicites.

- identity : comptes, profils, authentification et autorisations.
- curriculum : pays, programmes, niveaux et matières.
- learning : cours, ressources, parcours et progression.
- assessment : exercices, quiz, évaluations et corrections.
- ai : assistant NOVA, agents pédagogiques et routage des fournisseurs.
- media : bibliothèque de médias et génération vidéo.
- collaboration : classes, groupes, échanges et retours.
- integrations : connecteurs tiers et synchronisation autorisée.
- billing : offres, abonnements et facturation.
- institutions : établissements, équipes et espaces dédiés.

Règle : un domaine ne doit pas accéder directement aux tables internes d'un autre domaine. Les échanges passent par des services ou contrats documentés.

Cette arborescence décrit la cible. Les modules métier ne sont pas encore implémentés.