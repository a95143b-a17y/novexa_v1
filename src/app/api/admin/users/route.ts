import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders, isPlatformAdmin } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const ASSIGNABLE_ROLES = ["learner", "parent", "teacher", "institution_admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function isAssignableRole(role: unknown): role is AssignableRole {
  return typeof role === "string" && ASSIGNABLE_ROLES.includes(role as AssignableRole);
}

export async function GET(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  const search = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  const offset = Math.max(0, Math.min(5000, Number(request.nextUrl.searchParams.get("offset") || "0") || 0));

  try {
    const result = await getDatabasePool().query(
      `SELECT u.id, u.name, u.email, u.role,
              u."emailVerified" AS email_verified,
              p.status::text AS profile_status,
              p.created_at
       FROM "user" u
       LEFT JOIN profiles p ON p.id = u.id
       WHERE ($1 = '' OR u.email ILIKE '%' || $1 || '%' OR u.name ILIKE '%' || $1 || '%')
       ORDER BY p.created_at DESC NULLS LAST, u.id DESC
       LIMIT 50 OFFSET $2`,
      [search, offset]
    );
    return NextResponse.json({
      users: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        emailVerified: Boolean(row.email_verified),
        status: row.profile_status || "profile_missing",
        createdAt: row.created_at
      })),
      offset,
      limit: 50
    });
  } catch {
    return NextResponse.json({ error: "Impossible de lire les comptes. Vérifie que Better Auth et les migrations NOVEXA sont appliqués." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Session expirée." }, { status: 401 });

  let body: { userId?: string; role?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 }); }
  const userId = typeof body.userId === "string" ? body.userId.slice(0, 128) : "";
  if (!userId || !isAssignableRole(body.role)) return NextResponse.json({ error: "Compte ou rôle invalide. Le rôle administrateur principal est exclu." }, { status: 400 });
  if (userId === session.user.id) return NextResponse.json({ error: "Tu ne peux pas modifier ton propre rôle ici." }, { status: 403 });

  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const target = await client.query('SELECT id, role, name FROM "user" WHERE id = $1 FOR UPDATE', [userId]);
    if (target.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
    }
    if (target.rows[0].role === "platform_admin") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Le rôle administrateur principal est protégé." }, { status: 403 });
    }

    await client.query('UPDATE "user" SET role = $1 WHERE id = $2', [body.role, userId]);
    await client.query(
      "INSERT INTO profiles (id, display_name, role) VALUES ($1, $2, $3::app_role) ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, display_name = EXCLUDED.display_name, updated_at = NOW()",
      [userId, target.rows[0].name || "Utilisateur NOVEXA", body.role]
    );
    await client.query(
      "INSERT INTO audit_events (actor_user_id, action, target_type, target_id, status, requires_human_approval, approved_by, approved_at, event_data) VALUES ($1, 'account.role.changed', 'user', $2, 'executed', false, $1, NOW(), $3::jsonb)",
      [session.user.id, userId, JSON.stringify({ oldRole: target.rows[0].role, newRole: body.role })]
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true, userId, role: body.role });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "Modification du rôle échouée. Aucun changement confirmé." }, { status: 503 });
  } finally {
    client.release();
  }
}
