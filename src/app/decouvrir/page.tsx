import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Découvrir NOVEXA" };

export default function DecouvrirPage() {
  return <main className="billing-shell">
    <header className="billing-top">
      <Link href="/" className="billing-brand">NOV<span>X</span>EXA</Link>
      <nav><Link href="/">Accueil</Link><Link href="/personnalisation">Personnalisation</Link><Link href="/abonnement">Abonnements</Link></nav>
      <Link className="billing-top-cta" href="/inscription?next=%2Fpersonnalisation">Commencer</Link>
    </header>
    <section className="billing-content">
      <p className="auth-eyebrow">LA PLATEFORME D’APPRENTISSAGE PERSONNALISABLE</p>
      <h1>Apprendre avec méthode.<br/><em>À ton rythme.</em></h1>
      <p className="billing-lead">NOVEXA rassemble ton profil scolaire, tes ressources, tes préférences de travail et ton suivi pédagogique dans un espace que tu peux personnaliser.</p>
      <div className="learning-overview-grid">
        <article className="learning-overview-card"><span>PERSONNALISATION</span><strong>110</strong><small>60 réglages initiaux et 50 options avancées</small></article>
        <article className="learning-overview-card"><span>FORMULES</span><strong>3</strong><small>Découverte, Plus et Premium</small></article>
        <article className="learning-overview-card"><span>OBJECTIF</span><strong>Votre espace</strong><small>Un environnement adapté à votre parcours</small></article>
      </div>
      <div className="hero-actions">
        <Link href="/" className="welcome-primary">Reprendre le guide NOVA <span>↗</span></Link>
        <Link href="/abonnement" className="welcome-secondary">Voir le comparatif des formules</Link>
      </div>
      <p className="billing-footnote">NOVEXA est en développement. Certaines fonctions des niveaux Plus et Premium sont indiquées comme prévues et ne sont pas encore disponibles. Les paiements restent désactivés.</p>
    </section>
  </main>;
}
