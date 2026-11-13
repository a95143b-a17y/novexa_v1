import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Inscription" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") && !params.next.startsWith("//") ? params.next : "/app";
  return <AuthForm mode="sign-up" nextPath={nextPath} />;
}
