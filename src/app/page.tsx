const modules = [
  {
    number: "01",
    icon: "▤",
    name: "Cours et parcours",
    description: "Des contenus organisés par niveau, matière et programme."
  },
  {
    number: "02",
    icon: "✦",
    name: "Professeurs IA",
    description: "Des assistants pédagogiques spécialisés par discipline."
  },
  {
    number: "03",
    icon: "⌁",
    name: "Exercices et révisions",
    description: "Des entraînements, quiz et cartes de mémorisation."
  },
  {
    number: "04",
    icon: "◷",
    name: "Évaluations",
    description: "Des bilans de compétences et examens blancs."
  },
  {
    number: "05",
    icon: "◉",
    name: "Assistant NOVA",
    description: "Un assistant personnalisable pour accompagner le travail."
  },
  {
    number: "06",
    icon: "▶",
    name: "Vidéos pédagogiques",
    description: "Des explications vidéo intégrées aux parcours."
  }
];

export default function HomePage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="#accueil" aria-label="NOVEXA, accueil">
          <span className="brand-mark">N</span>
          <span className="brand-word">NOVEXA<span className="brand-dot">.</span></span>
        </a>
        <div className="sidebar-label">ESPACE DE TRAVAIL</div>
        <nav className="side-nav" aria-label="Navigation principale">
          <a className="nav-link active" href="#accueil"><span>⌂</span> Vue d'ensemble</a>
          <a className="nav-link" href="#modules"><span>▦</span> Modules</a>
          <a className="nav-link" href="#architecture"><span>⌘</span> Architecture</a>
          <a className="nav-link" href="/programmes/france"><span>◎</span> Programmes France</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-light" /> Projet initialisé</div>
          <p>Une base technique évolutive pour construire NOVEXA étape par étape.</p>
          <span className="version-tag">VERSION 0.1.0</span>
        </div>
      </aside>

      <section className="main-panel" id="accueil">
        <header className="topbar">
          <div className="breadcrumb">NOVEXA <span>/</span> Vue d'ensemble</div>
          <div className="topbar-right">
            <a className="text-button" href="/connexion">Se connecter</a>
            <a className="text-button" href="/inscription">Créer un compte ↗</a>
            <a className="text-button" href="/admin/login">Console administrateur</a>
            <a className="text-button" href="/programmes/france">Programmes France</a>
            <span className="env-tag"><span /> ENVIRONNEMENT DE DÉVELOPPEMENT</span>
            <div className="avatar" aria-label="Compte de démonstration">N</div>
          </div>
        </header>

        <div className="content">
          <section className="welcome-block">
            <div className="eyebrow"><span className="eyebrow-line" /> SOCLE DU PROJET</div>
            <h1>Construire une nouvelle<br /><span>façon d’apprendre.</span></h1>
            <p className="welcome-copy">
              NOVEXA rassemble les outils pédagogiques, le suivi des apprentissages
              et l’intelligence artificielle dans un même environnement.
            </p>
            <div className="welcome-actions">
              <a className="primary-button" href="#modules">Explorer les modules <span>↗</span></a>
              <a className="text-button" href="#architecture">Voir l’architecture <span>→</span></a>
              <a className="text-button" href="/programmes/france">Explorer le pilote France <span>↗</span></a>
            </div>
          </section>

          <section className="notice-card" aria-label="État du projet">
            <div className="notice-icon">i</div>
            <div>
              <strong>Socle technique en cours de mise en place</strong>
              <p>Cette première version est une fondation de développement. Les modules ci-dessous décrivent la cible fonctionnelle ; ils ne sont pas encore activés.</p>
            </div>
            <span className="notice-badge">V1 · INITIALISATION</span>
          </section>

          <section className="section-block" id="modules">
            <div className="section-heading">
              <div>
                <div className="eyebrow">ÉCOSYSTÈME NOVEXA</div>
                <h2>Les domaines de la plateforme</h2>
              </div>
              <span className="section-count">06 DOMAINES PRÉVUS</span>
            </div>
            <div className="module-grid">
              {modules.map((module) => (
                <article className="module-card" key={module.number}>
                  <div className="module-top">
                    <span className="module-icon">{module.icon}</span>
                    <span className="module-number">{module.number}</span>
                  </div>
                  <h3>{module.name}</h3>
                  <p>{module.description}</p>
                  <div className="module-footer"><span className="planned-dot" /> À construire</div>
                </article>
              ))}
            </div>
          </section>

          <section className="lower-grid" id="architecture">
            <article className="panel-card">
              <div className="eyebrow">CHANTIER TECHNIQUE</div>
              <h2>Fondations préparées</h2>
              <ul className="foundation-list">
                <li><span className="check-mark">✓</span> Application Next.js et TypeScript</li>
                <li><span className="check-mark">✓</span> Référentiel initial des rôles</li>
                <li><span className="check-mark">✓</span> Découpage des domaines fonctionnels</li>
                <li><span className="check-mark">✓</span> Documentation sécurité et architecture</li>
              </ul>
            </article>
            <article className="panel-card">
              <div className="eyebrow">PRINCIPES DE CONCEPTION</div>
              <h2>Une architecture par domaines</h2>
              <p>Chaque domaine possède ses propres règles métier. Les services partagés assurent les contrôles d’accès, la configuration et les échanges avec les fournisseurs externes.</p>
              <div className="architecture-tags">
                <span>TypeScript</span><span>App Router</span><span>API sécurisées</span><span>Modularité</span>
              </div>
            </article>
          </section>

          <footer className="footer">
            <span>© NOVEXA · Projet en développement</span>
            <span>Une base évolutive, sans intégration fictive.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}