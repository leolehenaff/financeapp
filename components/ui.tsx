import type { ReactNode } from "react";

/** Couleur stable par poche, partout (principe « une poche, une couleur »). */
export const POCKET: Record<string, { label: string; color: string }> = {
  Stock: { label: "Actions", color: "var(--c-stock)" },
  "Start-up": { label: "Start-up", color: "var(--c-startup)" },
  Crypto: { label: "Crypto", color: "var(--c-crypto)" },
  Livret: { label: "Livrets", color: "var(--c-livret)" },
  "Active Cash": { label: "Cash", color: "var(--c-cash)" },
};
export const pocket = (kind: string) => POCKET[kind] ?? { label: kind, color: "var(--ink-3)" };

export function Dot({ kind, className = "" }: { kind: string; className?: string }) {
  return <span className={`dot ${className}`} style={{ background: pocket(kind).color }} aria-hidden />;
}

export function Section({ title, aside, children, className = "" }: { title: ReactNode; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`mt-10 ${className}`}>
      <header className="flex items-baseline justify-between gap-4 mb-3">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        {aside && <span className="text-[13px] text-ink-2">{aside}</span>}
      </header>
      {children}
    </section>
  );
}

export function Bar({ value, max, color, className = "" }: { value: number; max: number; color: string; className?: string }) {
  const w = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`bar ${className}`} role="progressbar" aria-valuenow={Math.round(w)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

/** Variation signée : jamais la couleur seule. */
export function Delta({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const tone = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-ink-3";
  return <span className={`tnum ${tone} ${className}`}>{sign}{Math.abs(value).toLocaleString("fr-FR", { maximumFractionDigits: 1 })}{suffix}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="text-[14px] text-ink-2 py-6 text-center border border-dashed border-line rounded-lg">{children}</p>;
}

export function Check({ done = false, label = "Marquer comme fait" }: { done?: boolean; label?: string }) {
  return (
    <button type={done ? "button" : "submit"} className={`check ${done ? "check-done" : ""}`} aria-label={label} disabled={done}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden><path d="M2.5 6.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
