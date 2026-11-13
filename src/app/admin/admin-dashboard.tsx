"use client";

import { useState, type FormEvent } from "react";
import { ADMIN_AGENTS } from "@/lib/admin-agents";
import AgentDesk from "./agent-desk";
import UserManagement from "./user-management";

type Source = { title: string; url: string };
type Discovery = { text: string; sources: Source[]; createdAt: string };
type Inspection = { url: string; title: string; text: string };

const agentIcons: Record<string, string> = { nexus: "◈", finora: "€", aegis: "⬡", orbis: "◎", pulse: "⌁", atlas: "✦" };

export default function AdminDashboard() {
  const [stage, setStage] = useState("collège et lycée");
  const [subject, setSubject] = useState("toutes les matières");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [proposalUrl, setProposalUrl] = useState("");

  async function logout() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.assign("/connexion?next=%2Fadmin");
  }

  async function discover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setDiscovery(null); setInspection(null); setProposalUrl("");
    try {
      const response = await fetch("/api/admin/atlas/discover", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "FR", stage, subject, academicYear })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Recherche impossible.");
      setDiscovery({ text: data.text, sources: data.sources || [], createdAt: data.createdAt });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de recherche.");
    } finally { setBusy(false); }
  }

  async function inspect(url: string) {
    setBusy(true); setMessage(""); setInspection(null);
    try {
      const response = await fetch("/api/admin/atlas/inspect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lecture impossible.");
      setInspection(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de lecture.");
    } finally { setBusy(false); }
  }

  async function createProposal() {
    if (!discovery) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/atlas/proposal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "FR", stage, subject, academicYear, summary: discovery.text, sources: discovery.sources })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création de Pull Request impossible.");
      setProposalUrl(data.url);
      setMessage("Proposition créée. Elle doit encore être examinée et approuvée.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur GitHub.");
    } finally { setBusy(false); }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><span className="admin-brand-mark">N</span>NOVEXA<span className="admin-brand-dot">.</span></a>
        <p className="admin-nav-label">DIRECTION</p>
        <a className="admin-nav-link active" href="#overview">◈ Vue générale</a>
        <a className="admin-nav-link" href="#agents">✦ Équipe IA</a>
        <a className="admin-nav-link" href="#accounts">◎ Comptes</a>
        <a className="admin-nav-link" href="#atlas">◎ Programmes · ATLAS</a>
        <a className="admin-nav-link" href="#activity">⌁ Intégrations</a>
        <div className="admin-sidebar-bottom"><span className="admin-live-dot" /> Espace administrateur<p>Les connecteurs externes restent désactivés tant que leurs secrets ne sont pas configurés.</p></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-muted">NOVEXA / </span>Console de commandement</div>
          <div className="admin-top-actions"><span className="admin-env">ENVIRONNEMENT DE CONFIGURATION</span><button className="admin-ghost-button" onClick={logout}>Déconnexion ↗</button></div>
        </header>
        <div className="admin-content" id="overview">
          <div className="admin-heading">
            <div><p className="admin-kicker">CENTRE DE PILOTAGE · V1</p><h1>Commandement <span>NOVEXA</span></h1><p className="admin-muted">Une équipe de six agents spécialisés pour superviser la plateforme et préparer les opérations.</p></div>
            <div className="admin-status-card"><span className="admin-status-dot" /> Console protégée <small>Les connecteurs doivent encore être configurés.</small></div>
          </div>
          <div className="admin-notice"><b>Mode initialisation</b><span>Les six robots sont définis. ATLAS dispose d'un premier flux de recherche qui nécessite une clé OpenAI.</span></div>

          <section className="admin-section" id="agents">
            <div className="admin-section-heading"><div><p className="admin-kicker">DIRECTION ET DÉPARTEMENTS</p><h2>Les six robots administrateurs</h2></div><span className="admin-count">06 AGENTS DÉFINIS</span></div>
            <div className="admin-agent-grid">
              {ADMIN_AGENTS.map((agent) => (
                <article className={agent.id === "atlas" ? "admin-agent-card atlas-card" : "admin-agent-card"} key={agent.id}>
                  <div className="admin-agent-card-top"><span className="admin-agent-icon">{agentIcons[agent.id]}</span><span className="admin-agent-state">À connecter</span></div>
                  <h3>{agent.name}</h3><p className="admin-agent-title">{agent.title}</p>
                  <p className="admin-agent-mission">{agent.mission}</p>
                  <div className="admin-agent-footer"><span>{agent.id === "atlas" ? "Recherche documentaire" : "Supervision spécialisée"}</span><span>↗</span></div>
                </article>
              ))}
            </div>
          </section>

          <UserManagement />

          <AgentDesk />

          <section className="admin-section" id="atlas">
            <div className="admin-section-heading"><div><p className="admin-kicker">PROGRAMMES OFFICIELS · FRANCE</p><h2>Centre de recherche ATLAS</h2></div><span className="admin-count">PAYS PILOTE : FR</span></div>
            <div className="atlas-layout">
              <div className="atlas-form-card">
                <div className="atlas-mark">✦</div><h3>Nouvelle recherche officielle</h3>
                <p className="admin-muted">ATLAS recherche dans les domaines institutionnels français autorisés. La recherche ne publie aucun programme.</p>
                <form onSubmit={discover} className="atlas-form">
                  <label htmlFor="atlas-stage">Niveau scolaire</label>
                  <select id="atlas-stage" value={stage} onChange={(event) => setStage(event.target.value)}>
                    <option>école primaire</option><option>collège</option><option>lycée général et technologique</option><option>lycée professionnel</option><option>enseignement supérieur</option><option>collège et lycée</option>
                  </select>
                  <label htmlFor="atlas-subject">Matière ou domaine</label>
                  <input id="atlas-subject" value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} />
                  <label htmlFor="atlas-year">Année scolaire</label>
                  <input id="atlas-year" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} maxLength={20} />
                  <button className="admin-primary-button" disabled={busy}>{busy ? "Recherche en cours…" : "Lancer la recherche ATLAS"} <span>↗</span></button>
                </form>
              </div>
              <div className="atlas-results-card">
                <div className="atlas-results-head"><div><p className="admin-kicker">RÉSULTATS ET SOURCES</p><h3>Rapport de recherche</h3></div><span className="atlas-status-pill">Validation humaine</span></div>
                {message && <div className="admin-feedback" role="status">{message}</div>}
                {!discovery && !inspection && <div className="atlas-empty"><span>◎</span><b>Aucune recherche lancée</b><p>Choisis un niveau et une matière, puis lance une recherche. Les résultats seront accompagnés de leurs sources.</p></div>}
                {discovery && <div className="atlas-report">
                  <div className="atlas-report-meta">Recherche effectuée le {new Date(discovery.createdAt).toLocaleString("fr-FR")}</div>
                  <div className="atlas-report-text">{discovery.text}</div><h4>Sources identifiées</h4>
                  {discovery.sources.length === 0 ? <p className="admin-muted">Aucune citation exploitable n'a été extraite.</p> : <ul className="atlas-source-list">{discovery.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url} ↗</a><button className="admin-small-button" onClick={() => inspect(source.url)} disabled={busy}>Lire la page</button></li>)}</ul>}
                  <button className="admin-secondary-button" onClick={createProposal} disabled={busy || discovery.sources.length === 0}>Préparer une Pull Request GitHub</button>
                  {proposalUrl && <p><a href={proposalUrl} target="_blank" rel="noreferrer">Ouvrir la Pull Request créée ↗</a></p>}
                </div>}
                {inspection && <div className="atlas-inspection"><button className="admin-small-button" onClick={() => setInspection(null)}>← Retour au rapport</button><h4>{inspection.title || "Page officielle"}</h4><a href={inspection.url} target="_blank" rel="noreferrer">{inspection.url} ↗</a><pre>{inspection.text}</pre></div>}
              </div>
            </div>
          </section>

          <section className="admin-section" id="activity">
            <div className="admin-section-heading"><div><p className="admin-kicker">TRAÇABILITÉ</p><h2>État des intégrations</h2></div></div>
            <div className="admin-integration-grid">
              <div><b>OpenAI Responses API</b><span>Recherche web ATLAS</span><em>Clé serveur requise</em></div>
              <div><b>Lecteur Web contrôlé</b><span>Pages institutionnelles publiques</span><em>Lecture HTML autorisée</em></div>
              <div><b>GitHub App</b><span>Propositions par Pull Request</span><em>App et permissions requises</em></div>
              <div><b>Veille Vercel</b><span>Recherche automatique hebdomadaire</span><em>Production + CRON_SECRET requis</em></div>
            </div>
          </section>
          <footer className="admin-footer">NOVEXA · Console administrateur · Aucun programme n'est publié sans validation humaine.</footer>
        </div>
      </section>
    </main>
  );
}
