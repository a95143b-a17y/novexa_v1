import { getAuth, isAuthConfigured } from "@/lib/auth";

export async function getSessionFromHeaders(headers: Headers) {
  if (!isAuthConfigured()) return null;
  return getAuth().api.getSession({ headers });
}

export async function isPlatformAdmin(headers: Headers): Promise<boolean> {
  const session = await getSessionFromHeaders(headers);
  return session?.user.role === "platform_admin";
}
