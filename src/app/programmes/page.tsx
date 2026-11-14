import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Catalogue international",
  description: "Référentiels pédagogiques par pays, système éducatif, niveau, matière et parcours."
};

export default function ProgrammesIndexPage() {
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
        <p className="auth-eyebrow">ATLAS · RÉFÉRENTIELS INTERNATIONAUX</p>
        <h1>Programmes du monde entier</h1>
        <p className="catalog-lead">
          Le catalogue NOVEXA est conçu pour organiser les programmes par pays,
          système éducatif, niveau, matière et parcours. Chaque système conserve
          ses propres règles, ses langues et ses années d’application.
        </p>
        <section className="catalog-notice" aria-label="Méthode internationale">
          <strong>Une structure commune, des programmes nationaux distincts</strong>
          <p>
            Les classifications UNESCO servent à comparer les niveaux et les
            domaines d’études. Elles ne remplacent pas les programmes officiels
            de chaque pays. Une ressource n’est considérée comme publiée qu’après
            vérification de sa source, de sa version, de ses dates et de ses droits.
          </p>
        </section>
        <div className="catalog-section-heading">
          <div>
            <p className="auth-eyebrow">PREMIER SYSTÈME RÉFÉRENCÉ</p>
            <h2>France</h2>
          </div>
          <span>PAYS PILOTE</span>
        </div>
        <section className="catalog-next">
          <div>
            <p className="auth-eyebrow">FR · FRANCE</p>
            <h2>Référentiel pédagogique français</h2>
            <p>
              Le registre initial rassemble des sources ministérielles et
              disciplinaires. La collecte exhaustive des programmes, matières,
              spécialités et voies reste à réaliser et à vérifier.
            </p>
          </div>
          <Link href="/programmes/france" className="catalog-admin-link">
            Explorer la France <span aria-hidden="true">↗</span>
          </Link>
        </section>
        <section className="catalog-notice" aria-label="État de la couverture">
          <strong>Couverture internationale en construction</strong>
          <p>
            Les autres pays et juridictions seront ajoutés à partir de leurs
            autorités éducatives officielles. NOVEXA affichera séparément les
            systèmes simplement référencés, les programmes collectés, ceux
            vérifiés et ceux réellement publiés.
          </p>
        </section>
        <footer className="catalog-footer">
          <Link href="/">← Retour à l’accueil NOVEXA</Link>
          <span>ATLAS · Catalogue international</span>
        </footer>
      </div>
    </main>
  );
}
