import { getAuth, isAuthConfigured } from "@/lib/auth";

type AuthSession = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>
>;

type SessionWithRole = AuthSession & {
  user: AuthSession["user"] & { role: string };
};

function hasStringRole(
  session: AuthSession | null
): session is SessionWithRole {
  return Boolean(session && typeof session.user.role === "string");
}

export async function getSessionFromHeaders(
  headers: Headers
): Promise<SessionWithRole | null> {
  if (!isAuthConfigured()) return null;

  const session = await getAuth().api.getSession({ headers });
  return hasStringRole(session) ? session : null;
}

export async function isPlatformAdmin(headers: Headers): Promise<boolean> {
  const session = await getSessionFromHeaders(headers);
  return session?.user.role === "platform_admin";
}
