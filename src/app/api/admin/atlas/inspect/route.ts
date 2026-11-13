import { NextRequest, NextResponse } from "next/server";
import { isPlatformAdmin } from "@/lib/auth-guards";
import { isAuthConfigured } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 40;

const ALLOWED_DOMAINS = ["education.gouv.fr", "eduscol.education.gouv.fr", "eduscol.education.fr", "enseignementsup-recherche.gouv.fr", "legifrance.gouv.fr", "journal-officiel.gouv.fr"];
const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
const MAX_PDF_PAGES = 100;

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
  return { title, text: text.slice(0, 30000), kind: "html" as const };
}

async function extractPdf(bytes: Uint8Array) {
  const { getDocumentProxy, extractText } = await import("unpdf");
  const document = await getDocumentProxy(bytes);
  try {
    const pageCount = document.numPages;
    if (pageCount > MAX_PDF_PAGES) {
      throw new Error("PDF trop volumineux en nombre de pages : limite de " + MAX_PDF_PAGES + " pages.");
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("L'extraction PDF a dépassé le délai autorisé.")), 20000);
      });
      const extraction = await Promise.race([
        extractText(document, { mergePages: true }),
        timeout
      ]);
      const text = typeof extraction.text === "string" ? extraction.text : extraction.text.join("\n\n");
      if (text.trim().length < 40) {
        throw new Error("Ce PDF ne contient pas assez de texte exploitable. Il peut s'agir d'un document scanné ; l'OCR n'est pas encore activé.");
      }
      return {
        kind: "pdf" as const,
        pageCount,
        title: "",
        text: text.trim().slice(0, 40000)
      };
    } finally {
      if (timer) clearTimeout(timer);
    }
  } finally {
    await document.destroy().catch(() => undefined);
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "Authentification non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });

  let body: { url?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps invalide." }, { status: 400 }); }

  let url: URL;
  try { url = new URL(String(body.url || "")); } catch { return NextResponse.json({ error: "URL invalide." }, { status: 400 }); }
  if (!isAllowed(url)) return NextResponse.json({ error: "Domaine non autorisé pour le pilote France." }, { status: 400 });

  try {
    let response = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "NOVEXA-ATLAS/1.0 (+public curriculum source reader)", "Accept": "text/html,application/xhtml+xml,application/pdf" },
      signal: AbortSignal.timeout(15000)
    });
    for (let hop = 0; response.status >= 300 && response.status < 400 && hop < 3; hop++) {
      const location = response.headers.get("location");
      if (!location) break;
      const next = new URL(location, url);
      if (!isAllowed(next)) return NextResponse.json({ error: "Redirection hors domaine autorisé : lecture arrêtée." }, { status: 400 });
      url = next;
      response = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "NOVEXA-ATLAS/1.0 (+public curriculum source reader)", "Accept": "text/html,application/xhtml+xml,application/pdf" },
        signal: AbortSignal.timeout(15000)
      });
    }
    if (!response.ok) return NextResponse.json({ error: "La source officielle a répondu avec le statut " + response.status + "." }, { status: 502 });
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "Le document dépasse la limite de 8 Mo." }, { status: 413 });

    if (contentType.includes("application/pdf") || url.pathname.toLowerCase().endsWith(".pdf")) {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "Le document dépasse la limite de 8 Mo." }, { status: 413 });
      const bytes = new Uint8Array(buffer);
      const signature = new TextDecoder().decode(bytes.slice(0, 5));
      if (signature !== "%PDF-") return NextResponse.json({ error: "La source est déclarée comme PDF mais sa signature est invalide." }, { status: 415 });
      const extracted = await extractPdf(bytes);
      const fallbackTitle = decodeURIComponent(url.pathname.split("/").pop() || "Document PDF");
      return NextResponse.json({
        url: response.url || url.toString(),
        title: extracted.title || fallbackTitle,
        kind: extracted.kind,
        pageCount: extracted.pageCount,
        text: extracted.text
      });
    }

    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      return NextResponse.json({ error: "Format non pris en charge. Le lecteur accepte HTML et PDF." }, { status: 415 });
    }
    const html = await response.text();
    if (html.length > 2_000_000) return NextResponse.json({ error: "La page HTML dépasse la limite de 2 Mo." }, { status: 413 });
    return NextResponse.json({ url: response.url || url.toString(), ...cleanHtml(html) });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "La source officielle n'a pas pu être lue."
    }, { status: 502 });
  }
}
