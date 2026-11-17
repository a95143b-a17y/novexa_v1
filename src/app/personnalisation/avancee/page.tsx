import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import AdvancedPersonalization from "@/components/advanced-personalization";

export const metadata: Metadata = { title: "50 choix avancés" };
export const dynamic = "force-dynamic";

export default async function AdvancedPersonalizationPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fpersonnalisation%2Favancee");
  return <main className="personalization-shell">
    <header className="personalization-top">
      <Link href="/" className="billing-brand">NOV<span>X</span>EXA</Link>
      <Link href="/personnalisation" className="personalization-exit">Retour à la personnalisation</Link>
    </header>
    <div className="personalization-content">
      <header className="personalization-heading">
        <p className="auth-eyebrow">CONFIGURATION · OPTIONS AVANCÉES</p>
        <h1>50 nouveaux choix.<br/><em>À ta façon.</em></h1>
        <p>Cette page est séparée du profil initial pour te permettre d’affiner chaque détail sans surcharger la première configuration.</p>
      </header>
      <AdvancedPersonalization />
    </div>
  </main>;
}
