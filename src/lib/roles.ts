/**
 * Référentiel initial des rôles et permissions.
 * Ces constantes ne remplacent pas une authentification ni un contrôle serveur.
 */
export const ACCOUNT_ROLES = [
  "learner",
  "parent",
  "teacher",
  "institution_admin",
  "platform_admin"
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

export const PERMISSIONS = [
  "profile:read:self",
  "profile:update:self",
  "learning:read",
  "progress:read:self",
  "progress:update:self",
  "assessment:take",
  "assessment:author",
  "classroom:manage",
  "learners:manage",
  "institution:manage",
  "platform:manage",
  "guardian:read:linked"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS = {
  learner: [
    "profile:read:self",
    "profile:update:self",
    "learning:read",
    "progress:read:self",
    "progress:update:self",
    "assessment:take"
  ],
  parent: [
    "profile:read:self",
    "profile:update:self",
    "guardian:read:linked"
  ],
  teacher: [
    "profile:read:self",
    "profile:update:self",
    "learning:read",
    "assessment:author",
    "classroom:manage"
  ],
  institution_admin: [
    "profile:read:self",
    "profile:update:self",
    "learning:read",
    "classroom:manage",
    "learners:manage",
    "institution:manage"
  ],
  platform_admin: [...PERMISSIONS]
} as const satisfies Record<AccountRole, readonly Permission[]>;

export function roleHasPermission(
  role: AccountRole,
  permission: Permission
): boolean {
  return (ROLE_PERMISSIONS[role] as readonly Permission[]).includes(permission);
}