import type { Metadata } from "next";
import Link from "next/link";
import {
  FRANCE_OFFICIAL_SOURCES,
  type FranceSourceKind
} from "@/data/curricula/france";

export const metadata: Metadata = {
  title: "Référentiel France",
  description:
    "Sources institutionnelles de référence du pilote français ATLAS de NOVEXA."
};

export default function FranceCurriculumPage() {
  const normativeCount = FRANCE_OFFICIAL_SOURCES.filter(
    (source) => source.kind === "normative_publication"
  ).length;

  return (
    <main className="catalog-shell">
      <header className="catalog-top">
        <Link href="/" className="auth-brand" aria-label="NOVEXA, accueil">
          <span className="auth-brand-mark">N</span>
          NOVEXA<span className="auth-brand-dot">.</span>
        </Link>
        <nav className="catalog-nav" aria-label="Navigation">
          <Link href="/">Accueil</Link>
          <Link href="/connexion">Connexion</Link>
        </nav>
      </header>

      <div className="catalog-content">
        <p className="auth-eyebrow">ATLAS · PREMIER PAYS PILOTE</p>
        <h1>Référentiel pédagogique — France</h1>
        <p className="catalog-lead">
          Un registre de départ des sources institutionnelles utilisées pour
          construire le catalogue français de NOVEXA. Chaque programme devra
          ensuite être vérifié à partir de son document officiel.
        </p>

        <section className="catalog-stats" aria-label="État du registre">
          <article className="catalog-stat">
            <span>SOURCES RÉFÉRENCÉES</span>
            <strong>{FRANCE_OFFICIAL_SOURCES.length}</strong>
            <small>Pages institutionnelles recensées dans le registre initial</small>
          </article>
          <article className="catalog-stat">
            <span>PUBLICATION NORMATIVE</span>
            <strong>{normativeCount}</strong>
            <small>Point de contrôle des textes réglementaires</small>
          </article>
          <article className="catalog-stat">
            <span>STATUT DU CATALOGUE</span>
            <strong className="catalog-stat-status">En préparation</strong>
            <small>Les programmes détaillés ne sont pas encore importés</small>
          </article>
        </section>

        <section className="catalog-notice" aria-label="Limite du catalogue">
          <strong>À distinguer : source recensée et programme publié</strong>
          <p>
            Une page institutionnelle référencée n’est pas, à elle seule, un
            programme pédagogique validé dans NOVEXA. ATLAS doit retrouver le
            texte applicable, contrôler son niveau, sa discipline, sa date
            d’entrée en vigueur et ses droits de réutilisation. La publication
            dans le catalogue actif nécessitera une validation humaine.
          </p>
        </section>

        <div className="catalog-section-heading">
          <div>
            <p className="auth-eyebrow">REGISTRE DES SOURCES</p>
            <h2>Références institutionnelles</h2>
          </div>
          <span>{FRANCE_OFFICIAL_SOURCES.length} ENTRÉES</span>
        </div>

        <FranceSourceExplorer sources={FRANCE_OFFICIAL_SOURCES} />\n\n        <section className="catalog-next">
          <div>
            <p className="auth-eyebrow">PROCHAINE ÉTAPE ATLAS</p>
            <h2>Passer du registre aux programmes vérifiés</h2>
            <p>
              La suite consiste à collecter les références par niveau et
              discipline, comparer les versions et enregistrer leurs dates
              d’application sans confondre projet, texte adopté et ressource
              d’accompagnement.
            </p>
          </div>
          <Link href="/admin/login" className="catalog-admin-link">
            Accès administrateur <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <footer className="catalog-footer">
          <Link href="/">← Retour à l’accueil NOVEXA</Link>
          <span>ATLAS · Pilote France · Registre initial</span>
        </footer>
      </div>
    </main>
  );
}
