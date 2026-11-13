import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isPlatformAdmin, getSessionFromHeaders } from "@/lib/auth-guards";
import { isAuthConfigured } from "@/lib/auth";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const ALLOWED_DOMAINS = ["education.gouv.fr", "eduscol.education.gouv.fr", "eduscol.education.fr", "enseignementsup-recherche.gouv.fr", "legifrance.gouv.fr", "journal-officiel.gouv.fr"];
const NODE_TYPES = ["level", "subject", "topic", "competency", "learning_outcome", "assessment_guide", "other"];

function safeDate(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}
function isOfficialUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && ALLOWED_DOMAINS.some((domain) => host === domain || host.endsWith("." + domain));
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "Authentification non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });
  try {
    const result = await getDatabasePool().query(
      `SELECT v.id AS version_id, v.version_label, v.academic_year, v.review_status,
              v.publication_date, v.effective_from, c.official_title, c.education_stage,
              s.source_title, s.source_url
       FROM curriculum_versions v
       JOIN curricula c ON c.id = v.curriculum_id
       JOIN curriculum_sources s ON s.id = v.source_id
       WHERE v.review_status IN ('review_required','approved')
       ORDER BY v.created_at DESC LIMIT 100`
    );
    return NextResponse.json({ drafts: result.rows });
  } catch {
    return NextResponse.json({ error: "Impossible de lire les brouillons. Applique les migrations NOVEXA." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "Authentification non configurée." }, { status: 503 });
  if (!(await isPlatformAdmin(request.headers))) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Base de données non configurée." }, { status: 503 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 }); }
  if (body.countryCode !== "FR" || !isOfficialUrl(body.sourceUrl) ||
      typeof body.academicYear !== "string" || body.academicYear.length > 20 ||
      !body.normalized || typeof body.normalized !== "object") {
    return NextResponse.json({ error: "Métadonnées du brouillon invalides." }, { status: 400 });
  }

  const normalized = body.normalized;
  const title = String(normalized.curriculumTitle || body.sourceTitle || "Référentiel France").slice(0, 300);
  const stage = String(body.stage || normalized.level || "Non précisé").slice(0, 100);
  const subject = String(body.subject || normalized.subject || "Non précisée").slice(0, 100);
  const language = String(normalized.originalLanguage || "fr").slice(0, 12);
  const nodes = Array.isArray(normalized.nodes) ? normalized.nodes.slice(0, 100) : [];
  if (nodes.some((node: any) => !NODE_TYPES.includes(node.nodeType) || typeof node.title !== "string" || !node.title.trim())) {
    return NextResponse.json({ error: "La structure des éléments pédagogiques est invalide." }, { status: 400 });
  }

  const session = await getSessionFromHeaders(request.headers);
  if (!session) return NextResponse.json({ error: "Session expirée." }, { status: 401 });

  const client = await getDatabasePool().connect();
  const idSuffix = randomUUID().slice(0, 8);
  try {
    await client.query("BEGIN");
    const source = await client.query(
      `SELECT s.id AS source_id, s.authority_id, s.reuse_rights_status
       FROM curriculum_sources s
       JOIN curriculum_authorities a ON a.id = s.authority_id
       WHERE s.source_url = $1 AND a.country_code = 'FR'
         AND a.verification_status = 'verified'
         AND s.verification_status = 'verified'`,
      [body.sourceUrl]
    );
    if (source.rowCount !== 1) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cette URL n'est pas présente dans le registre des sources vérifiées. Applique la migration 0003 et contrôle le registre." }, { status: 400 });
    }

    const curriculumCode = "fr-" + (subject + "-" + stage).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + "-" + idSuffix;
    const curriculum = await client.query(
      `INSERT INTO curricula (country_code, territory_code, authority_id, curriculum_code, official_title, education_stage, language, status)
       VALUES ('FR', '', $1, $2, $3, $4, $5, 'draft') RETURNING id`,
      [source.rows[0].authority_id, curriculumCode, title, stage, language]
    );
    const versionLabel = "atlas-" + idSuffix;
    const version = await client.query(
      `INSERT INTO curriculum_versions
       (curriculum_id, source_id, version_label, academic_year, publication_date, effective_from, effective_until, original_language, rights_review_status, review_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'review_required') RETURNING id`,
      [
        curriculum.rows[0].id,
        source.rows[0].source_id,
        versionLabel,
        body.academicYear,
        safeDate(normalized.publicationDate),
        safeDate(normalized.effectiveFrom),
        safeDate(normalized.effectiveUntil),
        language,
        source.rows[0].reuse_rights_status
      ]
    );

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      await client.query(
        `INSERT INTO curriculum_nodes
         (curriculum_version_id, node_type, title, description, source_locator, position, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
        [
          version.rows[0].id,
          node.nodeType,
          String(node.title).slice(0, 500),
          String(node.description || "").slice(0, 4000),
          String(node.sourceLocator || "").slice(0, 250),
          i,
          JSON.stringify({ countryCode: "FR", stage, subject, originalLanguage: language })
        ]
      );
    }

    await client.query(
      `INSERT INTO audit_events
       (actor_user_id, agent_id, action, target_type, target_id, status, requires_human_approval, event_data)
       VALUES ($1, 'atlas', 'curriculum.draft.created', 'curriculum_version', $2, 'proposed', true, $3::jsonb)`,
      [session.user.id, version.rows[0].id, JSON.stringify({ sourceUrl: body.sourceUrl, nodeCount: nodes.length })]
    );
    await client.query("COMMIT");
    return NextResponse.json({
      success: true,
      curriculumId: curriculum.rows[0].id,
      versionId: version.rows[0].id,
      versionLabel,
      nodeCount: nodes.length,
      status: "review_required"
    });
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return NextResponse.json({ error: "Impossible d'enregistrer le brouillon. Vérifie le schéma PostgreSQL." }, { status: 503 });
  } finally {
    client.release();
  }
}
