import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import Link from "next/link";
import LearnerAssessments from "./learner-assessments";

export const metadata: Metadata = { title: "Mes évaluations" };
export const dynamic = "force-dynamic";

export default async function LearnerAssessmentsPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp%2Fevaluations");
  if (!["learner", "platform_admin"].includes(session.user.role)) redirect("/app");
  return (
    <main className="learning-shell">
      <header className="learning-top"><Link href="/app" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link><Link href="/app" className="learning-back-link">← Mon espace</Link></header>
      <section className="learning-content">
        <p className="auth-eyebrow">ENTRAÎNEMENT & ÉVALUATION</p><h1>Mes évaluations</h1>
        <p className="learning-lead">Retrouve les quiz publiés par tes enseignants et consulte tes corrections après chaque tentative.</p>
        <LearnerAssessments />
      </section>
    </main>
  );
}
