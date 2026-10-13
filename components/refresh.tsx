"use client";
import { useState, useTransition } from "react";
import { refreshQuotes } from "@/lib/actions";

const icon = { width: 15, height: 15, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** Rafraîchit les cours Yahoo. Succès : coche verte 2 s. Échec partiel : pastille rouge « 29/32 » qui reste. */
export function Refresh() {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<{ updated: number; total: number } | null>(null);
  const ok = res !== null && res.updated === res.total;
  const run = () => start(async () => {
    const r = await refreshQuotes();
    setRes(r);
    if (r.updated === r.total) setTimeout(() => setRes(null), 2000);
  });
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" disabled={pending} onClick={run} aria-label="Actualiser les cours" title="Actualiser les cours"
        className={`btn btn-sm w-8 px-0 transition-colors duration-200 ${ok ? "bg-up-soft text-up" : "btn-ghost"}`}>
        {ok ? <svg {...icon}><path d="m3.5 8.5 3 3 6-7" /></svg>
          : <svg {...icon} className={pending ? "animate-spin" : ""}><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" /></svg>}
      </button>
      {res && !ok && <span className="text-[12px] font-semibold text-down bg-down-soft rounded-full px-2 py-0.5 tnum whitespace-nowrap" title={`${res.total - res.updated} cours non récupérés chez Yahoo`}>{res.updated}/{res.total}</span>}
      <span className="sr-only" aria-live="polite">{res ? `${res.updated} cours sur ${res.total} mis à jour` : ""}</span>
    </span>
  );
}
