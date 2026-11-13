import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const AUTHOR_ROLES = ["teacher", "platform_admin"];

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!AUTHOR_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Espace enseignant réservé." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  try {
    const admin = session.user.role === "platform_admin";
    const result = await getDatabasePool().query(
      `SELECT c.id, c.title, c.description, c.language, c.status, c.visibility,
              c.created_at, c.created_by,
              (SELECT COUNT(*)::int FROM course_units u WHERE u.course_id = c.id) AS unit_count
       FROM courses c
       WHERE ($1::boolean = TRUE OR c.created_by = $2)
       ORDER BY c.created_at DESC LIMIT 100`,
      [admin, session.user.id]
    );
    return NextResponse.json({ courses: result.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de lire les cours. Vérifie les migrations PostgreSQL." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!AUTHOR_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Seuls les enseignants et administrateurs peuvent créer un cours." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps invalide." }, { status: 400 }); }
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 2000) : "";
  const language = typeof body.language === "string" && /^[a-z]{2}(-[A-Z]{2})?$/.test(body.language) ? body.language : "fr";
  if (title.length < 4) return NextResponse.json({ error: "Le titre doit contenir au moins 4 caractères." }, { status: 400 });

  try {
    const pool = getDatabasePool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const inserted = await client.query(
        `INSERT INTO courses (created_by, title, description, language, status, visibility)
         VALUES ($1, $2, $3, $4, 'draft', 'private') RETURNING id, title, description, language, status, visibility`,
        [session.user.id, title, description, language]
      );
      await client.query(
        "INSERT INTO audit_events (actor_user_id, action, target_type, target_id, status, requires_human_approval, event_data) VALUES ($1, 'course.draft.created', 'course', $2, 'recorded', false, '{}'::jsonb)",
        [session.user.id, inserted.rows[0].id]
      );
      await client.query("COMMIT");
      return NextResponse.json({ course: inserted.rows[0] }, { status: 201 });
    } catch {
      await client.query("ROLLBACK").catch(() => undefined);
      return NextResponse.json({ error: "Le brouillon du cours n'a pas été enregistré." }, { status: 503 });
    } finally { client.release(); }
  } catch {
    return NextResponse.json({ error: "Base de données indisponible." }, { status: 503 });
  }
}
