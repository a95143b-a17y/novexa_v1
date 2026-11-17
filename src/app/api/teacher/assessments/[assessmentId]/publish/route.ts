import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!["teacher", "platform_admin"].includes(session.user.role)) return NextResponse.json({ error: "Accès réservé aux enseignants." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const { assessmentId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const assessment = await client.query("SELECT id, author_id, status FROM assessments WHERE id = $1 FOR UPDATE", [assessmentId]);
    if (assessment.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Évaluation introuvable." }, { status: 404 });
    }
    if (assessment.rows[0].author_id !== session.user.id && session.user.role !== "platform_admin") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Tu ne peux pas publier cette évaluation." }, { status: 403 });
    }
    if (assessment.rows[0].status !== "draft") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cette évaluation n'est plus un brouillon." }, { status: 409 });
    }
    const items = await client.query("SELECT COUNT(*)::int AS count FROM assessment_items WHERE assessment_id = $1", [assessmentId]);
    if (items.rows[0].count < 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Ajoute au moins une question avant publication." }, { status: 409 });
    }
    await client.query("UPDATE assessments SET status = 'active', published_at = NOW() WHERE id = $1", [assessmentId]);
    await client.query("COMMIT");
    return NextResponse.json({ published: true, assessmentId });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "La publication a échoué." }, { status: 503 });
  } finally { client.release(); }
}
