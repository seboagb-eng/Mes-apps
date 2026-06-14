import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PILOT — Pilotez votre entreprise",
  description:
    "Pilotage d'entreprise, trésorerie et recouvrement pour les PME du Bénin. Suivez vos ventes, votre cash et relancez vos clients.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PILOT",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B5FFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
