import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import Link from "next/link";
import QuizRunner from "./quiz-runner";

export const metadata: Metadata = { title: "Passer une évaluation" };
export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp%2Fevaluations");
  if (!["learner", "platform_admin"].includes(session.user.role)) redirect("/app");
  const { assessmentId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(assessmentId)) notFound();
  return <main className="learning-shell">
    <header className="learning-top"><Link href="/app" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link><Link href="/app/evaluations" className="learning-back-link">← Mes évaluations</Link></header>
    <section className="learning-content"><p className="auth-eyebrow">ÉVALUATION</p><QuizRunner assessmentId={assessmentId} /></section>
  </main>;
}
