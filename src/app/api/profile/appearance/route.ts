import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";
import { DEFAULT_NOVEXA_FONT, isNovexaFontId, isNovexaGradientId } from "@/lib/appearance-options";

export const runtime = "nodejs";
const themes = ["light", "dark"] as const;
const accents = ["violet", "blue", "mint", "rose"] as const;
const backgrounds = ["aurora", "paper", "midnight", "forest"] as const;
const validHex = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

function validAppearance(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  if (!themes.includes(input.theme as typeof themes[number])) return null;
  if (!accents.includes(input.accent as typeof accents[number])) return null;
  if (!backgrounds.includes(input.background as typeof backgrounds[number])) return null;
  if (typeof input.writer !== "boolean" || typeof input.motion !== "boolean") return null;
  if (input.backgroundColor !== undefined && !validHex(input.backgroundColor)) return null;
  if (input.fontFamily !== undefined && !isNovexaFontId(input.fontFamily)) return null;
  if (input.backgroundGradient !== undefined && !isNovexaGradientId(input.backgroundGradient)) return null;
  return {
    theme: input.theme,
    accent: input.accent,
    background: input.background,
    backgroundColor: validHex(input.backgroundColor) ? input.backgroundColor : "#101a36",
    backgroundGradient: isNovexaGradientId(input.backgroundGradient) ? input.backgroundGradient : undefined,
    writer: input.writer,
    motion: input.motion,
    fontFamily: isNovexaFontId(input.fontFamily) ? input.fontFamily : DEFAULT_NOVEXA_FONT
  };
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  try {
    const result = await getDatabasePool().query(
      "SELECT appearance FROM profiles WHERE id = $1 LIMIT 1",
      [session.user.id]
    );
    return NextResponse.json({ appearance: result.rows[0]?.appearance || {} });
  } catch {
    return NextResponse.json({ error: "La migration 0007_profile_appearance.sql doit être appliquée." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const appearance = validAppearance(body?.appearance);
  if (!appearance) return NextResponse.json({ error: "Préférences d'apparence invalides." }, { status: 400 });
  try {
    await getDatabasePool().query(
      "UPDATE profiles SET appearance = $2::jsonb, updated_at = NOW() WHERE id = $1",
      [session.user.id, JSON.stringify(appearance)]
    );
    return NextResponse.json({ success: true, appearance });
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer les préférences. Vérifie la migration 0007." }, { status: 503 });
  }
}
