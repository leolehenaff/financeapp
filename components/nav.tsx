"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const svg = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const ITEMS = [
  ["/", "Ce mois", <svg key="m" {...svg}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>],
  ["/patrimoine", "Patrimoine", <svg key="p" {...svg}><path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z" /><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15z" /></svg>],
  ["/journal", "Journal", <svg key="j" {...svg}><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.5" cy="6.5" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="17.5" r="1" /></svg>],
] as const;

/** Onglets en pilule : l'actif est blanc sur fond gris. Masqués sous 640 px, où MobileNav prend le relais. */
export function Nav() {
  const path = usePathname();
  return (
    <nav className="hidden sm:flex gap-0.5 p-1 rounded-full bg-surface-2" aria-label="Principal">
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

/** Barre d'onglets en bas d'écran sous 640 px : icône sur pastille indigo pâle pour l'actif. */
export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="sm:hidden fixed inset-x-0 bottom-0 z-10 bg-surface/95 backdrop-blur-sm border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Principal">
      <div className="grid grid-cols-3">
        {ITEMS.map(([href, label, icon]) => {
          const active = path === href;
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] transition-colors duration-200 ${active ? "text-accent font-semibold" : "text-ink-2"}`}>
              <span className={`grid place-items-center h-8 w-14 rounded-full transition-colors duration-200 ${active ? "bg-accent-soft" : ""}`}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
