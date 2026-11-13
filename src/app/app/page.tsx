import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";

export const metadata: Metadata = { title: "Mon espace" };
export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  learner: "Apprenant",
  parent: "Parent / responsable",
  teacher: "Enseignant",
  institution_admin: "Administrateur d'établissement",
  platform_admin: "Administrateur NOVEXA"
};

export default async function LearnerHomePage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp");

  return (
    <main className="user-home-shell">
      <header className="user-home-top">
        <Link href="/" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link>
        <form action="/api/auth/sign-out" method="post"><button className="user-signout">Se déconnecter</button></form>
      </header>
      <section className="user-home-content">
        <p className="auth-eyebrow">ESPACE PERSONNEL</p>
        <h1>Bienvenue, {session.user.name || "sur NOVEXA"}.</h1>
        <p className="user-home-subtitle">Ton espace de travail éducatif est initialisé.</p>
        <div className="user-role-card"><span>RÔLE DU COMPTE</span><strong>{roleLabels[session.user.role] || "Utilisateur"}</strong><small>Adresse confirmée : {session.user.email}</small></div>
        <div className="user-home-notice"><strong>Modules pédagogiques en cours de construction</strong><p>Les cours, programmes, exercices et tableaux de progression seront activés à mesure que leurs services et leurs données seront connectés.</p></div>
        <Link href="/" className="user-home-link">Retour à l'accueil NOVEXA ↗</Link>
      </section>
    </main>
  );
}
