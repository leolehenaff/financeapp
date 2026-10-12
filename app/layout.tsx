import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Patrimoine", description: "Cockpit patrimonial Léo et Julie" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="mx-auto max-w-4xl px-4 pb-16">{children}</body>
    </html>
  );
}
