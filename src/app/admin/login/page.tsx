import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";
import { getConfiguredSocialProviders, isAuthConfigured, isEmailConfigured } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Accès administrateur" };
export default function AdminLoginPage() {
  return <AuthForm mode="sign-in" nextPath="/admin" authAvailable={isAuthConfigured()} emailAvailable={isEmailConfigured()} socialProviders={getConfiguredSocialProviders()} adminEntry />;
}