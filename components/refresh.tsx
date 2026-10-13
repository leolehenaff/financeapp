"use client";
import { useState, useTransition } from "react";
import { refreshQuotes } from "@/lib/actions";

/** Bouton de rafraîchissement des cours Yahoo, avec le résultat en ligne. */
export function Refresh() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-ink-3">
      {msg}
      <button type="button" disabled={pending} onClick={() => start(async () => { const r = await refreshQuotes(); setMsg(`${r.updated} cours sur ${r.total} mis à jour`); })} className="btn btn-ghost btn-sm">
        {pending ? "Mise à jour…" : "Actualiser les cours"}
      </button>
    </span>
  );
}
