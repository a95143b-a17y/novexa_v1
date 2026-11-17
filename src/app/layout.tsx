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
  applicationName: "NOVEXA",
  icons: { icon: "/novexa-logo.jpg", apple: "/novexa-logo.jpg" }
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
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Allura&family=Alex+Brush&family=Great+Vibes&family=Dancing+Script&family=Parisienne&family=Sacramento&family=Tangerine&family=Petit+Formal+Script&family=Marck+Script&family=Satisfy&family=Caveat&family=Kalam&family=Patrick+Hand&family=Shadows+Into+Light&family=Permanent+Marker&family=Indie+Flower&family=Architects+Daughter&family=Amatic+SC&family=Gloria+Hallelujah&family=Handlee&family=Playfair+Display&family=Cormorant+Garamond&family=EB+Garamond&family=Libre+Baskerville&family=Lora&family=Merriweather&family=Crimson+Text&family=Bodoni+Moda&family=DM+Serif+Display&family=Fraunces&family=Montserrat&family=Poppins&family=Inter&family=Manrope&family=Nunito&family=Raleway&family=Oswald&family=Roboto&family=Lato&family=Space+Grotesk&family=Fira+Code&family=JetBrains+Mono&family=IBM+Plex+Mono&family=Space+Mono&family=Source+Code+Pro&family=Orbitron&family=Audiowide&family=Exo+2&family=Rajdhani&family=Barlow+Condensed&display=swap" /></head>
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
