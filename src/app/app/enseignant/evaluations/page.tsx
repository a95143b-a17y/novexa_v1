import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import TeacherAssessments from "./teacher-assessments";

export const metadata: Metadata = { title: "Évaluations — Espace enseignant" };
export const dynamic = "force-dynamic";

export default async function TeacherAssessmentsPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp%2Fenseignant%2Fevaluations");
  if (!["teacher", "platform_admin"].includes(session.user.role)) redirect("/app");
  return <TeacherAssessments />;
}
