import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "@/lib/auth-guards";
import { isAuthConfigured } from "@/lib/auth";
import { createAtlasProposal, isGithubAppConfigured } from "@/lib/github-app";

export const runtime = "nodejs";
export const maxDuration = 45;
const ALLOWED_DOMAINS = ["education.gouv.fr", "eduscol.education.gouv.fr", "eduscol.education.fr", "enseignementsup-recherche.gouv.fr", "legifrance.gouv.fr", "journal-officiel.gouv.fr"];

function isOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith("." + domain));
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "Authentification non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  if (!isGithubAppConfigured()) return NextResponse.json({ error: "GitHub App non configurée. Configure ses secrets et permissions côté serveur." }, { status: 503 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 }); }
  if (body.countryCode !== "FR" || typeof body.summary !== "string" || body.summary.length < 30 || body.summary.length > 16000) return NextResponse.json({ error: "Rapport invalide ou périmètre non autorisé." }, { status: 400 });
  if (typeof body.stage !== "string" || body.stage.length > 100 || typeof body.subject !== "string" || body.subject.length > 100 || typeof body.academicYear !== "string" || body.academicYear.length > 20) return NextResponse.json({ error: "Métadonnées invalides." }, { status: 400 });

  const sources = (Array.isArray(body.sources) ? body.sources.slice(0, 20) : [])
    .filter((source: any) => source && typeof source.url === "string" && isOfficialUrl(source.url))
    .map((source: any) => ({ title: String(source.title || "Source officielle").slice(0, 250), url: source.url }));
  if (sources.length === 0) return NextResponse.json({ error: "Aucune source institutionnelle vérifiable n'a été fournie." }, { status: 400 });

  try {
    const proposal = await createAtlasProposal({ countryCode: "FR", stage: body.stage, subject: body.subject, academicYear: body.academicYear, summary: body.summary, sources });
    return NextResponse.json(proposal);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur GitHub." }, { status: 502 });
  }
}
