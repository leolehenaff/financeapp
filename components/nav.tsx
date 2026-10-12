"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [["/", "Ce mois"], ["/patrimoine", "Patrimoine"], ["/journal", "Journal"]] as const;

/** Onglets en pilule : l'actif est blanc sur fond gris. */
export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex gap-0.5 p-1 rounded-full bg-surface-2" aria-label="Principal">
      {ITEMS.map(([href, label]) => {
        const active = path === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`px-3.5 py-1.5 text-[14px] rounded-full transition-colors duration-200 ${active ? "bg-surface text-ink font-semibold shadow-[var(--shadow)]" : "text-ink-2 hover:text-ink"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
