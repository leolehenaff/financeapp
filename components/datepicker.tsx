"use client";
import { useState } from "react";
import { dateFr, today } from "@/lib/format";

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Champ date au design de l'app : bouton + grille du mois, lundi en premier. Soumet via un input caché `name`. */
export function DatePicker({ name, defaultValue = "", placeholder = "Date", className = "" }: { name: string; defaultValue?: string; placeholder?: string; className?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [ym, setYm] = useState(() => (value || today()).slice(0, 7));
  const [y, m] = ym.split("-").map(Number);
  const month = m - 1;
  const first = new Date(y, month, 1), start = (first.getDay() + 6) % 7; // décalage lundi
  const prev = new Date(y, month, 0).getDate(), days = new Date(y, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const n = i - start + 1;
    if (n < 1) return { d: prev + n, iso: iso(month ? y : y - 1, (month + 11) % 12, prev + n), out: true };
    if (n > days) return { d: n - days, iso: iso(month === 11 ? y + 1 : y, (month + 1) % 12, n - days), out: true };
    return { d: n, iso: iso(y, month, n), out: false };
  });
  const shift = (k: number) => { const d = new Date(y, month + k, 1); setYm(iso(d.getFullYear(), d.getMonth(), 1).slice(0, 7)); };
  const pick = (v: string) => { setValue(v); setOpen(false); if (v) setYm(v.slice(0, 7)); };

  return (
    <div className={`relative ${className}`} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <input type="hidden" name={name} value={value} />
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`field flex items-center justify-between gap-2 text-left tnum ${value ? "" : "!text-ink-3"}`}>
        {value ? dateFr(value) : placeholder}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-ink-3"><rect x="2" y="3" width="12" height="11" rx="2" /><path d="M2 7h12M5 1.5v3M11 1.5v3" /></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 left-0 panel p-3 w-[252px] text-[13px]" role="dialog">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => shift(-1)} className="btn btn-ghost !h-7 !w-7 !p-0 !border-0" aria-label="Mois précédent">‹</button>
            <span className="font-semibold capitalize">{MONTHS[month]} {y}</span>
            <button type="button" onClick={() => shift(1)} className="btn btn-ghost !h-7 !w-7 !p-0 !border-0" aria-label="Mois suivant">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-ink-3 font-medium mb-1">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}</div>
          <div className="grid grid-cols-7">
            {cells.map((c) => (
              <button key={c.iso} type="button" onClick={() => pick(c.iso)}
                className={`h-8 rounded-[8px] tnum transition-colors ${c.iso === value ? "bg-accent text-white font-semibold" : c.iso === today() ? "text-accent font-semibold hover:bg-accent-soft" : c.out ? "text-ink-3 hover:bg-surface-2" : "hover:bg-surface-2"}`}>
                {c.d}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-line text-[12px]">
            <button type="button" onClick={() => pick("")} className="text-ink-2 hover:text-ink">Effacer</button>
            <button type="button" onClick={() => pick(today())} className="text-accent font-medium">Aujourd&apos;hui</button>
          </div>
        </div>
      )}
    </div>
  );
}
