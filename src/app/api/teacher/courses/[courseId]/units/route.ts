import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

async function canEdit(courseId: string, userId: string, role: string) {
  const result = await getDatabasePool().query(
    "SELECT created_by, status FROM courses WHERE id = $1",
    [courseId]
  );
  if (result.rowCount !== 1) return { allowed: false, status: "missing" };
  return {
    allowed: role === "platform_admin" || result.rows[0].created_by === userId,
    status: result.rows[0].status
  };
}

export async function GET(request: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const { courseId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });

  try {
    const access = await canEdit(courseId, session.user.id, session.user.role);
    if (!access.allowed) return NextResponse.json({ error: "Accès refusé." }, { status: access.status === "missing" ? 404 : 403 });
    const result = await getDatabasePool().query(
      "SELECT id, title, body, position, estimated_minutes FROM course_units WHERE course_id = $1 ORDER BY position",
      [courseId]
    );
    return NextResponse.json({ units: result.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de lire les leçons." }, { status: 503 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!["teacher", "platform_admin"].includes(session.user.role)) return NextResponse.json({ error: "Espace enseignant réservé." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  const { courseId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps invalide." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 12000) : "";
  const minutes = Number(body.estimatedMinutes);
  if (title.length < 3 || text.length < 20) return NextResponse.json({ error: "Chaque leçon doit avoir un titre et au moins 20 caractères de contenu." }, { status: 400 });
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) return NextResponse.json({ error: "Durée estimée invalide (1 à 240 minutes)." }, { status: 400 });

  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const course = await client.query("SELECT id, created_by, status FROM courses WHERE id = $1 FOR UPDATE", [courseId]);
    if (course.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cours introuvable." }, { status: 404 });
    }
    if (course.rows[0].created_by !== session.user.id && session.user.role !== "platform_admin") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Tu ne peux pas modifier ce cours." }, { status: 403 });
    }
    if (course.rows[0].status !== "draft") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Seuls les cours en brouillon peuvent être modifiés." }, { status: 409 });
    }
    const position = await client.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM course_units WHERE course_id = $1",
      [courseId]
    );
    const inserted = await client.query(
      "INSERT INTO course_units (course_id, title, body, position, estimated_minutes) VALUES ($1, $2, $3::jsonb, $4, $5) RETURNING id, title, position, estimated_minutes",
      [courseId, title, JSON.stringify({ text }), position.rows[0].next_position, minutes]
    );
    await client.query(
      "INSERT INTO audit_events (actor_user_id, action, target_type, target_id, status, requires_human_approval, event_data) VALUES ($1, 'course.unit.created', 'course', $2, 'recorded', false, $3::jsonb)",
      [session.user.id, courseId, JSON.stringify({ unitId: inserted.rows[0].id })]
    );
    await client.query("COMMIT");
    return NextResponse.json({ unit: inserted.rows[0] }, { status: 201 });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "La leçon n'a pas été enregistrée." }, { status: 503 });
  } finally { client.release(); }
}
