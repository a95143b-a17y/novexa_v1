import type { Metadata } from "next";
import OnboardingGuide from "@/components/onboarding-guide";

export const metadata: Metadata = { title: "Bienvenue sur NOVEXA" };

export default function HomePage() {
  return <OnboardingGuide />;
}
