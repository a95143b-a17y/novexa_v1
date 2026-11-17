import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  try {
    const result = await getDatabasePool().query(
      "SELECT preferences->'advancedSettings' AS advanced_settings FROM profiles WHERE id = $1 LIMIT 1",
      [session.user.id]
    );
    return NextResponse.json({ advancedSettings: result.rows[0]?.advanced_settings || {} });
  } catch {
    return NextResponse.json({ error: "Applique la migration 0009 pour activer les préférences avancées." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!isRecord(body) || !isRecord(body.advancedSettings)) {
    return NextResponse.json({ error: "Les 50 préférences reçues sont invalides." }, { status: 400 });
  }
  const serialized = JSON.stringify(body.advancedSettings);
  if (serialized.length > 32_000) return NextResponse.json({ error: "Les préférences dépassent la taille autorisée." }, { status: 413 });
  try {
    const result = await getDatabasePool().query(
      "UPDATE profiles SET preferences = jsonb_set(COALESCE(preferences, '{}'::jsonb), '{advancedSettings}', $2::jsonb, true), updated_at = NOW() WHERE id = $1 RETURNING id",
      [session.user.id, serialized]
    );
    if (result.rowCount !== 1) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Impossible d’enregistrer les préférences avancées. Vérifie la migration 0009." }, { status: 503 });
  }
}
