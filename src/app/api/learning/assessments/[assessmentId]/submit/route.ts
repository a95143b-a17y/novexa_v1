import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (session.user.role !== "learner") return NextResponse.json({ error: "Seuls les apprenants peuvent répondre à une évaluation." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const { assessmentId } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 }); }
  const responses = (body as Record<string, unknown>).responses;
  if (!responses || typeof responses !== "object" || Array.isArray(responses)) return NextResponse.json({ error: "Réponses invalides." }, { status: 400 });

  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const assessment = await client.query(
      "SELECT id, title FROM assessments WHERE id = $1 AND status = 'active' AND published_at IS NOT NULL FOR UPDATE",
      [assessmentId]
    );
    if (assessment.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Évaluation introuvable ou non publiée." }, { status: 404 });
    }
    const items = await client.query(
      "SELECT id, prompt, grading_config FROM assessment_items WHERE assessment_id = $1 ORDER BY position",
      [assessmentId]
    );
    if (!items.rowCount) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cette évaluation ne contient aucune question." }, { status: 409 });
    }
    const submitted = responses as Record<string, unknown>;
    const allowedIds = new Set(items.rows.map((item) => item.id));
    if (Object.keys(submitted).some((id) => !allowedIds.has(id))) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "La réponse contient une question inconnue." }, { status: 400 });
    }
    let score = 0;
    const corrections = items.rows.map((item) => {
      const selected = typeof submitted[item.id] === "string" ? submitted[item.id] : null;
      const options = Array.isArray(item.prompt?.options) ? item.prompt.options : [];
      const validOption = options.some((option: { id?: string }) => option.id === selected);
      const correctOptionId = item.grading_config?.correctOptionId;
      const correct = validOption && selected === correctOptionId;
      if (correct) score += 1;
      const selectedOption = options.find((option: { id?: string }) => option.id === selected);
      const correctOption = options.find((option: { id?: string }) => option.id === correctOptionId);
      return {
        itemId: item.id,
        question: item.prompt?.question ?? "",
        selectedOptionId: validOption ? selected : null,
        selectedOptionText: selectedOption?.text ?? null,
        correctOptionId,
        correctOptionText: correctOption?.text ?? "",
        correct,
        explanation: item.grading_config?.explanation ?? ""
      };
    });
    const maximum = items.rows.length;
    const feedback = { corrections };
    const inserted = await client.query(
      `INSERT INTO assessment_attempts
       (assessment_id, learner_id, submitted_at, score, maximum_score, responses, feedback)
       VALUES ($1, $2, NOW(), $3, $4, $5::jsonb, $6::jsonb)
       RETURNING id, score, maximum_score, submitted_at`,
      [assessmentId, session.user.id, score, maximum, JSON.stringify(submitted), JSON.stringify(feedback)]
    );
    await client.query("COMMIT");
    return NextResponse.json({
      attempt: inserted.rows[0],
      percentage: Math.round((score / maximum) * 100),
      corrections
    }, { status: 201 });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "Les réponses n'ont pas pu être corrigées." }, { status: 503 });
  } finally { client.release(); }
}
