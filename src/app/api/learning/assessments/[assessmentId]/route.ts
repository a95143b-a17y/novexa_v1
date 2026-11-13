import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.user.role !== "learner" && session.user.role !== "platform_admin") return NextResponse.json({ error: "Espace apprenant réservé." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const { assessmentId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  try {
    const pool = getDatabasePool();
    const assessment = await pool.query(
      "SELECT id, title, assessment_type, duration_minutes FROM assessments WHERE id = $1 AND status = 'active' AND published_at IS NOT NULL",
      [assessmentId]
    );
    if (assessment.rowCount !== 1) return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 });
    const items = await pool.query(
      "SELECT id, item_type, prompt, position FROM assessment_items WHERE assessment_id = $1 ORDER BY position",
      [assessmentId]
    );
    return NextResponse.json({ assessment: assessment.rows[0], items: items.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de charger cette évaluation." }, { status: 503 });
  }
}
