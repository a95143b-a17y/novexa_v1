import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import PersonalizationWizard from "@/components/personalization-wizard";

export const metadata: Metadata = { title: "Personnaliser mon espace" };
export const dynamic = "force-dynamic";

export default async function PersonalisationPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect(" /connexion?next=%2Fpersonnalisation".trim());
  return <main className="personalization-shell">
    <header className="personalization-top">
      <Link href="/" className="billing-brand">NOV<span>X</span>EXA</Link>
      <nav className="personalization-page-nav">
        <Link href="/personnalisation/avancee">50 choix avancés ↗</Link>
        <Link href="/app" className="personalization-exit">Quitter la configuration</Link>
      </nav>
    </header>
    <PersonalizationWizard />
  </main>;
}
