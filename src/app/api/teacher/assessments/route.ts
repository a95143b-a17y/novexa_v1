import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const AUTHOR_ROLES = ["teacher", "platform_admin"];

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!AUTHOR_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Accès réservé aux enseignants." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  try {
    const admin = session.user.role === "platform_admin";
    const result = await getDatabasePool().query(
      `SELECT a.id, a.title, a.assessment_type, a.duration_minutes, a.status,
              a.published_at, a.created_at,
              COUNT(ai.id)::int AS item_count
       FROM assessments a
       LEFT JOIN assessment_items ai ON ai.assessment_id = a.id
       WHERE ($1::boolean = TRUE OR a.author_id = $2)
       GROUP BY a.id
       ORDER BY a.created_at DESC LIMIT 100`,
      [admin, session.user.id]
    );
    return NextResponse.json({ assessments: result.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les évaluations." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!AUTHOR_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Accès réservé aux enseignants." }, { status: 403 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 }); }
  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 160) : "";
  const duration = Number(input.durationMinutes);
  if (title.length < 4) return NextResponse.json({ error: "Le titre doit contenir au moins 4 caractères." }, { status: 400 });
  if (!Number.isInteger(duration) || duration < 1 || duration > 240) return NextResponse.json({ error: "La durée doit être comprise entre 1 et 240 minutes." }, { status: 400 });
  try {
    const result = await getDatabasePool().query(
      `INSERT INTO assessments (author_id, title, assessment_type, duration_minutes, status)
       VALUES ($1, $2, 'quiz', $3, 'draft')
       RETURNING id, title, assessment_type, duration_minutes, status`,
      [session.user.id, title, duration]
    );
    return NextResponse.json({ assessment: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Le brouillon de l'évaluation n'a pas pu être créé." }, { status: 503 });
  }
}
