"use client";

import { useState } from "react";

type Normalized = {
  curriculumTitle: string;
  level: string;
  subject: string;
  originalLanguage: string;
  publicationDate: string;
  effectiveFrom: string;
  effectiveUntil: string;
  summary: string;
  uncertaintyNotes: string[];
  nodes: { nodeType: string; title: string; description: string; sourceLocator: string }[];
};

type Draft = {
  sourceUrl: string;
  sourceTitle: string;
  stage: string;
  subject: string;
  academicYear: string;
  normalized: Normalized;
};

type Inspected = { url: string; title: string; text: string; kind?: string; pageCount?: number };

export default function AtlasPipeline() {
  const [sourceUrl, setSourceUrl] = useState("https://www.education.gouv.fr/programmes-scolaires-41483");
  const [stage, setStage] = useState("collège");
  const [subject, setSubject] = useState("toutes les matières");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [inspected, setInspected] = useState<Inspected | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function readSource() {
    setBusy(true); setError(""); setMessage(""); setInspected(null); setDraft(null); setSaved(false);
    try {
      const response = await fetch("/api/admin/atlas/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lecture de la source impossible.");
      setInspected(data);
      setMessage("Source lue. Tu peux demander à ATLAS de la structurer.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur de lecture.");
    } finally { setBusy(false); }
  }

  async function normalize() {
    if (!inspected) return;
    setBusy(true); setError(""); setMessage(""); setDraft(null); setSaved(false);
    try {
      const response = await fetch("/api/admin/atlas/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: "FR", sourceUrl: inspected.url, sourceTitle: inspected.title,
          documentText: inspected.text, stage, subject, academicYear
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Structuration impossible.");
      setDraft(data);
      setMessage("Structure provisoire créée. Relis chaque élément avant l'enregistrement.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur de structuration.");
    } finally { setBusy(false); }
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/atlas/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: "FR", sourceUrl: draft.sourceUrl, sourceTitle: draft.sourceTitle,
          stage: draft.stage, subject: draft.subject, academicYear: draft.academicYear,
          normalized: draft.normalized
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Enregistrement impossible.");
      setSaved(true);
      setMessage("Brouillon enregistré dans la file de revue. Il n'est pas publié.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur d'enregistrement.");
    } finally { setBusy(false); }
  }

  return (
    <div className="atlas-pipeline">
      <div className="atlas-pipeline-head">
        <p className="admin-kicker">IMPORTATION CONTRÔLÉE</p>
        <h3>Lire et structurer un document officiel</h3>
        <p>Le flux accepte les pages HTML et les PDF avec texte des domaines institutionnels autorisés. Les documents scannés nécessitent un OCR séparé.</p>
      </div>
      <div className="atlas-pipeline-form">
        <label htmlFor="atlas-source-url">Adresse de la source officielle</label>
        <input id="atlas-source-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} maxLength={1000} required />
        <div className="atlas-pipeline-fields">
          <div><label htmlFor="atlas-source-stage">Niveau</label><select id="atlas-source-stage" value={stage} onChange={(event) => setStage(event.target.value)}><option>école primaire</option><option>collège</option><option>lycée général et technologique</option><option>lycée professionnel</option><option>enseignement supérieur</option></select></div>
          <div><label htmlFor="atlas-source-subject">Matière</label><input id="atlas-source-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} /></div>
          <div><label htmlFor="atlas-source-year">Année scolaire</label><input id="atlas-source-year" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} maxLength={20} /></div>
        </div>
        <button className="admin-primary-button" onClick={readSource} disabled={busy || !sourceUrl.trim()}>{busy ? "Lecture…" : "1. Lire la source"} <span>↗</span></button>
      </div>
      {error && <p className="user-management-error" role="alert">{error}</p>}
      {message && <p className="user-management-success" role="status">{message}</p>}
      {inspected && <div className="atlas-pipeline-document">
        <div><b>{inspected.title || "Document officiel"}</b><span>{inspected.kind === "pdf" ? "PDF · " + inspected.pageCount + " pages" : "Page HTML"}</span></div>
        <a href={inspected.url} target="_blank" rel="noreferrer">{inspected.url} ↗</a>
        <p className="atlas-document-preview">{inspected.text.slice(0, 2400)}{inspected.text.length > 2400 ? "…" : ""}</p>
        <button className="admin-secondary-button" onClick={normalize} disabled={busy || inspected.text.length < 100}>{busy ? "Analyse IA…" : "2. Structurer avec ATLAS"}</button>
      </div>}
      {draft && <div className="atlas-normalized">
        <p className="admin-kicker">BROUILLON STRUCTURÉ · NON PUBLIÉ</p>
        <h4>{draft.normalized.curriculumTitle}</h4>
        <p>{draft.normalized.summary}</p>
        <div className="atlas-normalized-meta">{draft.stage} · {draft.subject} · {draft.academicYear}</div>
        <b>{draft.normalized.nodes.length} éléments extraits</b>
        <ul>{draft.normalized.nodes.slice(0, 20).map((node, index) => <li key={index}><strong>{node.title}</strong><span>{node.nodeType} · {node.sourceLocator || "source non précisée"}</span><p>{node.description}</p></li>)}</ul>
        {draft.normalized.uncertaintyNotes.length > 0 && <div className="atlas-uncertainty"><strong>Points à vérifier</strong>{draft.normalized.uncertaintyNotes.map((note, index) => <p key={index}>{note}</p>)}</div>}
        <button className="admin-primary-button" onClick={saveDraft} disabled={busy || saved}>{saved ? "Brouillon enregistré" : "3. Enregistrer dans la file de revue"} <span>↗</span></button>
      </div>}
    </div>
  );
}
