import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const requested = params.next && params.next.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : "/personnalisation";
  return <AuthForm mode="sign-up" nextPath={requested} />;
}