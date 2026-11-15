import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import DocumentLibrary from "@/components/document-library";

export const metadata:Metadata={title:"Mes documents"};
export const dynamic="force-dynamic";

export default async function DocumentsPage(){
  const session=await getSessionFromHeaders(await headers());
  if(!session)redirect("/connexion?next=%2Fapp%2Ffichiers");
  return <main className="learning-shell">
    <header className="learning-top"><Link href="/app" className="auth-brand">← Retour à mon espace</Link><nav className="learning-nav"><Link href="/personnalisation?edit=1">Personnalisation</Link><Link href="/abonnement">Abonnements</Link></nav></header>
    <section className="learning-content"><p className="auth-eyebrow">VOTRE ESPACE · DOCUMENTS</p><h1>Mes fichiers.</h1><p className="learning-lead">Importez et gérez vos cours, fiches, programmes et ressources pédagogiques depuis un espace privé.</p><DocumentLibrary/></section>
  </main>;
}