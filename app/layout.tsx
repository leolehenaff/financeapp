import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = { title: "Carnet de bord", description: "Cockpit patrimonial de Léo et Julie" };
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f8f6f1" }, { media: "(prefers-color-scheme: dark)", color: "#1c1917" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={instrument.variable}>
      <body>{children}</body>
    </html>
  );
}
