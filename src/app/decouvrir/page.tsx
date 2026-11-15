import type { Metadata } from "next";
import LandingExperience from "@/components/landing-experience";

export const metadata: Metadata = { title: "Découvrir NOVEXA" };

export default function DecouvrirPage() {
  return <LandingExperience />;
}
