import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin, getSessionFromHeaders } from "@/lib/auth-guards";
import { isAuthConfigured } from "@/lib/auth";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ versionId: string }> }) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "Authentification non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Session expirée." }, { status: 401 });

  const { versionId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(versionId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  let body: { decision?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps invalide." }, { status: 400 }); }
  if (!["approved", "rejected", "published"].includes(String(body.decision))) return NextResponse.json({ error: "Décision non autorisée." }, { status: 400 });

  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const current = await client.query(
      `SELECT v.id, v.review_status, v.rights_review_status, v.curriculum_id
       FROM curriculum_versions v WHERE v.id = $1 FOR UPDATE`,
      [versionId]
    );
    if (current.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Brouillon introuvable." }, { status: 404 });
    }
    const oldStatus = current.rows[0].review_status;
    const decision = body.decision;
    if (decision === "published" && (oldStatus !== "approved" || current.rows[0].rights_review_status !== "verified")) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Publication refusée : le brouillon doit d'abord être approuvé et ses droits de réutilisation vérifiés." }, { status: 409 });
    }
    if (decision === "approved" && oldStatus !== "review_required") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Seul un brouillon en attente de revue peut être approuvé." }, { status: 409 });
    }

    if (decision === "published") {
      await client.query(
        "UPDATE curriculum_versions SET review_status = 'published', published_at = NOW(), approved_by = $2, approved_at = NOW() WHERE id = $1",
        [versionId, session.user.id]
      );
      await client.query("UPDATE curricula SET status = 'active', updated_at = NOW() WHERE id = $1", [current.rows[0].curriculum_id]);
    } else {
      await client.query(
        "UPDATE curriculum_versions SET review_status = $2, approved_by = $3, approved_at = NOW() WHERE id = $1",
        [versionId, decision, session.user.id]
      );
      if (decision === "rejected") await client.query("UPDATE curricula SET status = 'archived', updated_at = NOW() WHERE id = $1", [current.rows[0].curriculum_id]);
    }

    await client.query(
      `INSERT INTO audit_events
       (actor_user_id, agent_id, action, target_type, target_id, status, requires_human_approval, approved_by, approved_at, event_data)
       VALUES ($1, 'atlas', 'curriculum.review.' || $2, 'curriculum_version', $3, $4, false, $1, NOW(), $5::jsonb)`,
      [session.user.id, decision, versionId, decision, JSON.stringify({ previousStatus: oldStatus })]
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true, status: decision });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "Décision non enregistrée." }, { status: 503 });
  } finally {
    client.release();
  }
}
