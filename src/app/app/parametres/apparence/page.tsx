import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import AppearanceSettings from "@/components/appearance-settings";

export const metadata: Metadata = { title: "Personnaliser mon apparence" };
export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp%2Fparametres%2Fapparence");
  return <><header className="learning-top"><Link href="/app" className="auth-brand">← Retour à mon espace</Link></header><AppearanceSettings /></>;
}
