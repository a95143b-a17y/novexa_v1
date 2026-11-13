import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/app";
  return <AuthForm mode="sign-in" nextPath={nextPath} />;
}
