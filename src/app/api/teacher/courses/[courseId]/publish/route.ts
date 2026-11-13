import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.user.role !== "platform_admin") return NextResponse.json({ error: "Seul un administrateur NOVEXA peut publier un cours." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  const { courseId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const course = await client.query("SELECT id, title, status, created_by FROM courses WHERE id = $1 FOR UPDATE", [courseId]);
    if (course.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cours introuvable." }, { status: 404 });
    }
    if (course.rows[0].status !== "draft") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Seul un brouillon peut être publié." }, { status: 409 });
    }
    const units = await client.query("SELECT COUNT(*)::int AS count FROM course_units WHERE course_id = $1", [courseId]);
    if (units.rows[0].count < 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Ajoute au moins une leçon avant publication." }, { status: 409 });
    }
    await client.query("UPDATE courses SET status = 'active', visibility = 'public', updated_at = NOW() WHERE id = $1", [courseId]);
    await client.query(
      "INSERT INTO audit_events (actor_user_id, action, target_type, target_id, status, requires_human_approval, approved_by, approved_at, event_data) VALUES ($1, 'course.published', 'course', $2, 'executed', false, $1, NOW(), '{}'::jsonb)",
      [session.user.id, courseId]
    );
    await client.query("COMMIT");
    return NextResponse.json({ success: true, courseId, status: "active", visibility: "public" });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "La publication du cours a échoué." }, { status: 503 });
  } finally { client.release(); }
}
