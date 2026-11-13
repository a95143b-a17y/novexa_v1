import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import TeacherWorkspace from "./teacher-workspace";

export const metadata: Metadata = { title: "Espace enseignant" };
export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp%2Fenseignant");
  if (!["teacher", "platform_admin"].includes(session.user.role)) redirect("/app");
  return <TeacherWorkspace isAdmin={session.user.role === "platform_admin"} />;
}
