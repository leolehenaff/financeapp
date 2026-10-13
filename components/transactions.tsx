"use client";
import { useState, useTransition } from "react";
import { listTransactions } from "@/lib/actions";
import { dateFr, eur, TX_PAGE, type TxFilter, type TxRow } from "@/lib/format";
import { Delta, Dot, Empty } from "@/components/ui";
import { DatePicker } from "@/components/datepicker";

const TYPES: Record<string, string> = { buy: "Achat", sell: "Vente", dividend: "Dividende" };
const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`flex flex-col gap-1 text-[12px] text-ink-2 ${className}`}>{label}{children}</label>
);

/** Tableau des transactions : filtres et page rechargent seulement le tableau via une server action. */
export function Transactions({ instruments, initial }: { instruments: { id: number; name: string }[]; initial: { rows: TxRow[]; count: number } }) {
  const [f, setF] = useState<TxFilter>({ from: "", to: "", instrument: "", type: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(initial);
  const [pending, start] = useTransition();
  const pages = Math.max(1, Math.ceil(data.count / TX_PAGE));
  const load = (nf: TxFilter, p: number) => { setF(nf); setPage(p); start(async () => setData(await listTransactions(nf, p))); };
  const set = (k: keyof TxFilter) => (v: string) => load({ ...f, [k]: v }, 1);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-3 items-end">
        <Field label="Du"><DatePicker name="from" placeholder="Début" className="w-36" onChange={set("from")} /></Field>
        <Field label="Au"><DatePicker name="to" placeholder="Fin" className="w-36" onChange={set("to")} /></Field>
        <Field label="Instrument">
          <select value={f.instrument} onChange={(e) => set("instrument")(e.target.value)} className="field"><option value="">Tous</option>{instruments.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        </Field>
        <Field label="Type"><select value={f.type} onChange={(e) => set("type")(e.target.value)} className="field"><option value="">Tous</option>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <div className="flex items-center gap-1 sm:ml-auto h-10 text-[13px] tnum">
          <button type="button" disabled={page <= 1} onClick={() => load(f, page - 1)} className="btn btn-ghost !h-8 !w-8 !p-0" aria-label="Page précédente">‹</button>
          <select value={page} onChange={(e) => load(f, Number(e.target.value))} className="field !w-auto !h-8 !pr-7 text-[13px]" aria-label="Page">
            {Array.from({ length: pages }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} / {pages}</option>)}
          </select>
          <button type="button" disabled={page >= pages} onClick={() => load(f, page + 1)} className="btn btn-ghost !h-8 !w-8 !p-0" aria-label="Page suivante">›</button>
          <span className="text-ink-3 ml-2">{data.count} ligne{data.count > 1 ? "s" : ""}</span>
        </div>
      </div>
      {data.rows.length === 0 ? <Empty>Aucune transaction pour ces filtres.</Empty> : (
        <div className={`panel overflow-x-auto transition-opacity ${pending ? "opacity-50" : ""}`}>
          <table className="tbl">
            <thead><tr><th>Date</th><th className="max-md:w-full max-md:max-w-0">Instrument</th><th className="max-md:hidden">Compte</th><th className="max-md:hidden">Type</th><th className="num max-md:hidden">Qté</th><th className="num">Montant</th><th className="max-md:hidden">Note</th></tr></thead>
            <tbody>
              {data.rows.map((t) => (
                <tr key={t.id}>
                  <td className="tnum text-ink-2 whitespace-nowrap">{dateFr(t.date)}</td>
                  <td className="max-md:w-full max-md:max-w-0">
                    <div className="flex items-center gap-2 min-w-0"><Dot kind={t.kind} /><span className="truncate">{t.instrument}</span></div>
                    <div className="md:hidden text-ink-3 text-[12px] truncate pl-[18px]">{TYPES[t.type]} · {t.account}</div>
                  </td>
                  <td className="text-ink-2 whitespace-nowrap max-md:hidden">{t.owner} · {t.account}</td>
                  <td className="max-md:hidden">{TYPES[t.type]}</td>
                  <td className="num text-ink-2 max-md:hidden">{t.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
                  <td className="num font-medium"><Delta value={Math.round(t.type === "buy" ? -t.amount : t.amount)} suffix=" €" /></td>
                  <td className="text-ink-3 text-[13px] max-md:hidden">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
