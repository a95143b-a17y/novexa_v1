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
      "SELECT preferences, onboarding_completed_at FROM profiles WHERE id = $1 LIMIT 1",
      [session.user.id]
    );
    if (result.rowCount !== 1) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    return NextResponse.json({ preferences: result.rows[0].preferences || {}, onboardingCompletedAt: result.rows[0].onboarding_completed_at || null });
  } catch {
    return NextResponse.json({ error: "Applique la migration 0009_profile_preferences_documents_billing.sql pour activer les préférences." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!isRecord(body) || !isRecord(body.preferences) || !isRecord(body.preferences.education) || !isRecord(body.preferences.settings)) {
    return NextResponse.json({ error: "Les préférences reçues sont invalides." }, { status: 400 });
  }
  const serialized = JSON.stringify(body.preferences);
  if (serialized.length > 32_000) return NextResponse.json({ error: "Les préférences dépassent la taille autorisée." }, { status: 413 });
  const education = body.preferences.education;
  const country = typeof education.countryCode === "string" ? education.countryCode.trim().slice(0, 2).toUpperCase() : "";
  const level = typeof education.level === "string" ? education.level.trim().slice(0, 80) : "";
  const language = typeof education.preferredLanguage === "string" ? education.preferredLanguage.trim().slice(0, 12) : "fr";
  const timezone = typeof education.timezone === "string" ? education.timezone.trim().slice(0, 64) : "Europe/Paris";
  if (!/^[A-Z]{2}$/.test(country) || !level || !language) {
    return NextResponse.json({ error: "Renseigne au minimum le pays, le niveau d’études et la langue." }, { status: 400 });
  }
  try {
    const result = await getDatabasePool().query(
      `UPDATE profiles SET preferences = $2::jsonb, preferred_language = $3, timezone = $4,
       onboarding_completed_at = CASE WHEN $5::boolean THEN COALESCE(onboarding_completed_at, NOW()) ELSE onboarding_completed_at END,
       updated_at = NOW() WHERE id = $1 RETURNING id`,
      [session.user.id, serialized, language, timezone || null, body.onboardingCompleted === true]
    );
    if (result.rowCount !== 1) return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Impossible d’enregistrer le profil. Vérifie la migration 0009." }, { status: 503 });
  }
}