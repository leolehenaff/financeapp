"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [["/", "Ce mois"], ["/patrimoine", "Patrimoine"], ["/journal", "Journal"]] as const;

export function Nav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 -mb-px" aria-label="Principal">
      {ITEMS.map(([href, label]) => {
        const active = path === href;
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`px-3 py-3 text-[14px] border-b-2 transition-colors duration-200 ${active ? "border-ink text-ink font-medium" : "border-transparent text-ink-2 hover:text-ink"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
