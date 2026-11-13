import { cookies } from "next/headers";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "novexa_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const encodedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!configuredEmail || !encodedHash || !process.env.ADMIN_SESSION_SECRET) return false;
  if (!safeEqual(email.trim().toLowerCase(), configuredEmail)) return false;
  const [salt, expectedHex] = encodedHash.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
  try {
    const actualHex = scryptSync(password, salt, 64).toString("hex");
    return safeEqual(actualHex, expectedHex);
  } catch {
    return false;
  }
}

function signPayload(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("ADMIN_SESSION_SECRET doit contenir au moins 32 caractères.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminSessionToken(email: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ email: email.trim().toLowerCase(), exp: expiresAt })).toString("base64url");
  return { token: payload + "." + signPayload(payload), maxAge: SESSION_TTL_SECONDS };
}

export function verifyAdminSessionToken(token?: string): boolean {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  try {
    if (!safeEqual(signature, signPayload(payload))) return false;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; exp?: number };
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    return Boolean(configuredEmail && parsed.email === configuredEmail && typeof parsed.exp === "number" && parsed.exp > Math.floor(Date.now() / 1000));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
