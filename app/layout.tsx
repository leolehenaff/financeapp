import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = { title: "Remco", description: "Le gestionnaire de patrimoine de Julie et Léo", icons: "/remco-renard.png" };
export const viewport: Viewport = { themeColor: "#f7f8fa", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={instrument.variable}>
      <body>{children}</body>
    </html>
  );
}
