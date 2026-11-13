import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}