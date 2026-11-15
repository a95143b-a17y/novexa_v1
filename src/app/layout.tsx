import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./novexa-appearance.css";
import { AppearanceProvider } from "@/components/appearance-provider";

export const metadata: Metadata = {
  title: {
    default: "NOVEXA — Apprendre avec méthode",
    template: "%s | NOVEXA"
  },
  description:
    "NOVEXA réunit les parcours pédagogiques, le suivi des apprentissages et des outils éducatifs dans un même environnement.",
  applicationName: "NOVEXA"
};

export const viewport: Viewport = {
  themeColor: "#090d1b",
  colorScheme: "dark"
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AppearanceProvider>
          <div className="novexa-ambient" aria-hidden="true">
            <span className="novexa-orb novexa-orb-one" />
            <span className="novexa-orb novexa-orb-two" />
            <span className="novexa-orb novexa-orb-three" />
            <span className="novexa-orbit-line" />
          </div>
          <div className="novexa-app-content">{children}</div>
        </AppearanceProvider>
      </body>
    </html>
  );
}
