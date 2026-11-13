import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ unitId: string }> }
) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  if (session.user.role !== "learner") {
    return NextResponse.json({ error: "Seuls les comptes apprenants peuvent enregistrer leur progression." }, { status: 403 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  }

  const { unitId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(unitId)) {
    return NextResponse.json({ error: "Identifiant de leçon invalide." }, { status: 400 });
  }

  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const unit = await client.query(
      `SELECT cu.id, cu.course_id
       FROM course_units cu
       JOIN courses c ON c.id = cu.course_id
       WHERE cu.id = $1 AND c.status = 'active' AND c.visibility = 'public'
       FOR UPDATE OF cu`,
      [unitId]
    );

    if (unit.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Leçon introuvable ou non publiée." }, { status: 404 });
    }

    const courseId = unit.rows[0].course_id;
    await client.query(
      `INSERT INTO lesson_progress (learner_id, course_unit_id)
       VALUES ($1, $2)
       ON CONFLICT (learner_id, course_unit_id) DO NOTHING`,
      [session.user.id, unitId]
    );

    const progress = await client.query(
      `WITH totals AS (
         SELECT
           COUNT(cu.id)::int AS total,
           COUNT(lp.id)::int AS completed
         FROM course_units cu
         LEFT JOIN lesson_progress lp
           ON lp.course_unit_id = cu.id AND lp.learner_id = $1
         WHERE cu.course_id = $2
       )
       INSERT INTO learner_progress
         (learner_id, course_id, completion_percent, last_activity_at)
       SELECT
         $1,
         $2,
         CASE WHEN total = 0 THEN 0
              ELSE ROUND(completed::numeric / total::numeric * 100, 2)
         END,
         NOW()
       FROM totals
       ON CONFLICT (learner_id, course_id)
       DO UPDATE SET
         completion_percent = EXCLUDED.completion_percent,
         last_activity_at = NOW(),
         updated_at = NOW()
       RETURNING completion_percent`,
      [session.user.id, courseId]
    );

    await client.query("COMMIT");
    return NextResponse.json({
      completed: true,
      completionPercent: Number(progress.rows[0]?.completion_percent ?? 0)
    });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "La progression n'a pas pu être enregistrée." }, { status: 503 });
  } finally {
    client.release();
  }
}
