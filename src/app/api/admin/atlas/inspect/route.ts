import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-session";

export const runtime = "nodejs";
const ALLOWED_DOMAINS = ["education.gouv.fr", "eduscol.education.gouv.fr", "eduscol.education.fr", "enseignementsup-recherche.gouv.fr", "legifrance.gouv.fr", "journal-officiel.gouv.fr"];

function isAllowed(url: URL) {
  const host = url.hostname.toLowerCase();
  return url.protocol === "https:" && !url.username && !url.password && (url.port === "" || url.port === "443") &&
    ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith("." + domain));
}

function cleanHtml(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() || "";
  const text = html
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
  return { title, text: text.slice(0, 18000) };
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  let body: { url?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps invalide." }, { status: 400 }); }
  let url: URL;
  try { url = new URL(String(body.url || "")); } catch { return NextResponse.json({ error: "URL invalide." }, { status: 400 }); }
  if (!isAllowed(url)) return NextResponse.json({ error: "Domaine non autorisé pour le pilote France." }, { status: 400 });

  try {
    let response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "NOVEXA-ATLAS/1.0 (+public curriculum source reader)", "Accept": "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(12000)
    });
    for (let hop = 0; response.status >= 300 && response.status < 400 && hop < 3; hop++) {
      const location = response.headers.get("location");
      if (!location) break;
      const next = new URL(location, url);
      if (!isAllowed(next)) return NextResponse.json({ error: "Redirection hors domaine autorisé : lecture arrêtée." }, { status: 400 });
      url = next;
      response = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "NOVEXA-ATLAS/1.0 (+public curriculum source reader)", "Accept": "text/html,application/xhtml+xml" },
        signal: AbortSignal.timeout(12000)
      });
    }
    if (!response.ok) return NextResponse.json({ error: "La page officielle a répondu avec le statut " + response.status + "." }, { status: 502 });
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) return NextResponse.json({ error: "Le lecteur prend actuellement en charge les pages HTML. Les PDF nécessitent le module documentaire." }, { status: 415 });
    if (Number(response.headers.get("content-length") || 0) > 2_000_000) return NextResponse.json({ error: "La page dépasse la limite de 2 Mo." }, { status: 413 });
    const html = await response.text();
    if (html.length > 2_000_000) return NextResponse.json({ error: "La page dépasse la limite de 2 Mo." }, { status: 413 });
    return NextResponse.json({ url: response.url || url.toString(), ...cleanHtml(html) });
  } catch {
    return NextResponse.json({ error: "La page n'a pas pu être lue. Vérifie son accessibilité publique." }, { status: 502 });
  }
}
