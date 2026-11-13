import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  if (session.user.role !== "learner" && session.user.role !== "platform_admin") {
    return NextResponse.json({ error: "Cet espace est réservé aux apprenants." }, { status: 403 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  try {
    const result = await getDatabasePool().query(
      `SELECT
         c.id,
         c.title,
         COALESCE(c.description, '') AS description,
         c.language,
         COUNT(DISTINCT cu.id)::int AS unit_count,
         COUNT(DISTINCT lp.course_unit_id)::int AS completed_count,
         CASE
           WHEN COUNT(DISTINCT cu.id) = 0 THEN 0
           ELSE ROUND(
             COUNT(DISTINCT lp.course_unit_id)::numeric
             / COUNT(DISTINCT cu.id)::numeric * 100
           )::int
         END AS completion_percent
       FROM courses c
       LEFT JOIN course_units cu ON cu.course_id = c.id
       LEFT JOIN lesson_progress lp
         ON lp.course_unit_id = cu.id AND lp.learner_id = $1
       WHERE c.status = 'active' AND c.visibility = 'public'
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 100`,
      [session.user.id]
    );
    return NextResponse.json({ courses: result.rows });
  } catch {
    return NextResponse.json(
      { error: "Le catalogue n'est pas encore initialisé. Vérifie les migrations PostgreSQL, notamment 0004_lesson_progress.sql." },
      { status: 503 }
    );
  }
}
