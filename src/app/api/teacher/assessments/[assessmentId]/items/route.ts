import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!["teacher", "platform_admin"].includes(session.user.role)) return NextResponse.json({ error: "Accès réservé aux enseignants." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const { assessmentId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 }); }
  const input = body as Record<string, unknown>;
  const question = typeof input.question === "string" ? input.question.trim().slice(0, 2000) : "";
  const options = Array.isArray(input.options) ? input.options : [];
  const correctOptionId = typeof input.correctOptionId === "string" ? input.correctOptionId : "";
  const explanation = typeof input.explanation === "string" ? input.explanation.trim().slice(0, 2000) : "";
  if (question.length < 8) return NextResponse.json({ error: "La question doit contenir au moins 8 caractères." }, { status: 400 });
  if (options.length < 2 || options.length > 6) return NextResponse.json({ error: "Une question doit proposer de 2 à 6 réponses." }, { status: 400 });
  const cleanOptions = options.map((option) => {
    const item = option as Record<string, unknown>;
    return { id: typeof item.id === "string" ? item.id.slice(0, 24) : "", text: typeof item.text === "string" ? item.text.trim().slice(0, 500) : "" };
  });
  if (cleanOptions.some((option) => !option.id || !option.text) || new Set(cleanOptions.map((option) => option.id)).size !== cleanOptions.length) {
    return NextResponse.json({ error: "Chaque proposition doit avoir un identifiant et un texte distincts." }, { status: 400 });
  }
  if (!cleanOptions.some((option) => option.id === correctOptionId)) return NextResponse.json({ error: "Choisis la bonne réponse parmi les propositions." }, { status: 400 });

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
      return NextResponse.json({ error: "Tu ne peux pas modifier cette évaluation." }, { status: 403 });
    }
    if (assessment.rows[0].status !== "draft") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Une évaluation publiée ne peut plus être modifiée." }, { status: 409 });
    }
    const position = await client.query("SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM assessment_items WHERE assessment_id = $1", [assessmentId]);
    const inserted = await client.query(
      `INSERT INTO assessment_items (assessment_id, item_type, prompt, grading_config, position)
       VALUES ($1, 'single_choice', $2::jsonb, $3::jsonb, $4)
       RETURNING id, position`,
      [assessmentId, JSON.stringify({ question, options: cleanOptions }), JSON.stringify({ correctOptionId, explanation }), position.rows[0].next_position]
    );
    await client.query("COMMIT");
    return NextResponse.json({ item: inserted.rows[0] }, { status: 201 });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "La question n'a pas pu être enregistrée." }, { status: 503 });
  } finally { client.release(); }
}
