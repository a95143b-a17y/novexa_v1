# Connexions Google, Microsoft et Apple

NOVEXA utilise Better Auth. Les trois fournisseurs sont présents dans le parcours de connexion. Un bouton n'est actif que lorsque les identifiants OAuth officiels du fournisseur sont configurés dans l'environnement Vercel.

## URL de retour pour l'aperçu Vercel

- Google : https://novexa-v1-git-feat-france-curriculum-catalog-a95143b-3867.vercel.app/api/auth/callback/google
- Microsoft : https://novexa-v1-git-feat-france-curriculum-catalog-a95143b-3867.vercel.app/api/auth/callback/microsoft
- Apple : https://novexa-v1-git-feat-france-curriculum-catalog-a95143b-3867.vercel.app/api/auth/callback/apple

Pour un autre domaine, remplacer uniquement l'origine par ce domaine et conserver le chemin de rappel du fournisseur.

## Variables à enregistrer dans Vercel

| Fournisseur | Variables serveur |
| --- | --- |
| Google | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET |
| Microsoft | MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID |
| Apple | APPLE_CLIENT_ID, APPLE_CLIENT_SECRET |

Définir MICROSOFT_TENANT_ID à common pour accepter les comptes personnels et professionnels lorsque l'application Microsoft est configurée dans ce sens.

Enregistrer les valeurs comme variables sensibles, uniquement dans l'environnement Preview concerné. Ne jamais écrire de secret dans GitHub, dans une capture ou dans un message.

L'activation des fournisseurs exige aussi un service d'authentification opérationnel : DATABASE_URL, BETTER_AUTH_URL et BETTER_AUTH_SECRET doivent être valides, et les migrations Better Auth doivent être appliquées. Après configuration, relancer le déploiement Preview et tester la redirection, le retour et la création de session pour chaque fournisseur.

## Accès administrateur

- Utilisateurs : /connexion.
- Administrateurs : /admin/login.

Les deux chemins authentifient le compte NOVEXA. La route /admin vérifie ensuite le rôle platform_admin côté serveur. Un compte utilisateur classique ne reçoit aucun droit supplémentaire en choisissant le parcours administrateur. Le premier administrateur doit être promu depuis un environnement sécurisé au moyen de la commande npm run auth:promote-admin -- adresse-verifiee@example.com.

Les formulaires publics ne peuvent pas s'attribuer le rôle platform_admin.