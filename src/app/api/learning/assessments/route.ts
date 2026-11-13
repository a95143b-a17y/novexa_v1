import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.user.role !== "learner" && session.user.role !== "platform_admin") return NextResponse.json({ error: "Espace apprenant réservé." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  try {
    const result = await getDatabasePool().query(
      `SELECT a.id, a.title, a.assessment_type, a.duration_minutes, a.published_at,
              COUNT(ai.id)::int AS question_count,
              (SELECT COUNT(*)::int FROM assessment_attempts aa
               WHERE aa.assessment_id = a.id AND aa.learner_id = $1) AS attempts,
              latest.score AS last_score,
              latest.maximum_score AS last_maximum_score,
              latest.submitted_at AS last_submitted_at
       FROM assessments a
       LEFT JOIN assessment_items ai ON ai.assessment_id = a.id
       LEFT JOIN LATERAL (
         SELECT score, maximum_score, submitted_at
         FROM assessment_attempts aa
         WHERE aa.assessment_id = a.id AND aa.learner_id = $1
         ORDER BY aa.submitted_at DESC LIMIT 1
       ) latest ON TRUE
       WHERE a.status = 'active' AND a.published_at IS NOT NULL
       GROUP BY a.id
       ORDER BY a.published_at DESC LIMIT 100`,
      [session.user.id]
    );
    return NextResponse.json({ assessments: result.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les évaluations." }, { status: 503 });
  }
}
