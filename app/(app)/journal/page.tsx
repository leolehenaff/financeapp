import { addAction, addInstrument, addTransaction, completeAction } from "@/lib/actions";
import { db, GEOS, KINDS } from "@/lib/db";
import { dateFr, eur, today } from "@/lib/format";
import { getActions, lists } from "@/lib/queries";
import { Check, Dot, Section, pocket } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { buy: "Achat", sell: "Vente", dividend: "Dividende" };
const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`flex flex-col gap-1 text-[12px] text-ink-2 ${className}`}>{label}{children}</label>
);

export default async function Journal() {
  const { accounts, instruments } = await lists();
  const actions = await getActions();
  const tx = (await db.execute(`
    SELECT t.id, t.date, a.owner, a.name account, i.name instrument, i.kind, t.type, t.quantity, t.amount, t.note
    FROM transactions t JOIN accounts a ON a.id = t.account_id JOIN instruments i ON i.id = t.instrument_id
    ORDER BY t.date DESC, t.id DESC LIMIT 100`)).rows as unknown as
    { id: number; date: string; owner: string; account: string; instrument: string; kind: string; type: string; quantity: number; amount: number; note: string | null }[];
  const sections = [...new Set(actions.map((a) => a.section))];
  const open = actions.filter((a) => a.status === "todo").length;

  return (
    <>
      <p className="text-[13px] text-ink-2">Journal</p>
      <h1 className="text-[30px] font-bold tracking-[-0.025em] leading-tight mt-0.5">Ce qui a été fait, ce qui reste à faire.</h1>

      <Section title="Saisir une transaction">
        <form action={addTransaction} className="panel p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Date"><input type="date" name="date" defaultValue={today()} className="field" required /></Field>
          <Field label="Compte"><select name="account_id" className="field" required>{accounts.map((a) => <option key={a.id} value={a.id}>{a.owner} · {a.name}</option>)}</select></Field>
          <Field label="Instrument" className="col-span-2">
            <select name="instrument_id" className="field" required>
              {KINDS.map((k) => <optgroup key={k} label={pocket(k).label}>{instruments.filter((i) => i.kind === k).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</optgroup>)}
            </select>
          </Field>
          <Field label="Type"><select name="type" className="field">{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
          <Field label="Quantité"><input name="quantity" inputMode="decimal" placeholder="0 si dividende" className="field" /></Field>
          <Field label="Montant total €"><input name="amount" inputMode="decimal" placeholder="1 850" className="field" required /></Field>
          <Field label="Note"><input name="note" placeholder="Virement du 1er" className="field" /></Field>
          <div className="col-span-2 md:col-span-4 flex items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 text-[13px] text-ink-2"><input type="checkbox" name="fresh" defaultChecked className="accent-[var(--accent)]" />Argent frais : l&apos;achat est un apport externe, pas un réinvestissement</label>
            <button type="submit" className="btn btn-primary">Enregistrer</button>
          </div>
        </form>
        <details className="mt-3">
          <summary className="cursor-pointer text-[13px] text-ink-2 hover:text-ink inline-block">Créer un instrument</summary>
          <form action={addInstrument} className="panel p-5 mt-2 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <Field label="Nom"><input name="name" placeholder="MSCI World (CW8)" className="field" required /></Field>
            <Field label="Ticker Yahoo"><input name="ticker" placeholder="CW8.PA, optionnel" className="field" /></Field>
            <Field label="Poche"><select name="kind" className="field">{KINDS.map((k) => <option key={k} value={k}>{pocket(k).label}</option>)}</select></Field>
            <Field label="Zone"><select name="geo" className="field"><option value="">Sans</option>{GEOS.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <button type="submit" className="btn btn-ghost">Créer</button>
          </form>
        </details>
      </Section>

      <Section title="Transactions" aside={`${tx.length} dernières`}>
        <div className="panel overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Date</th><th>Instrument</th><th>Compte</th><th>Type</th><th className="num">Qté</th><th className="num">Montant</th><th>Note</th></tr></thead>
            <tbody>
              {tx.map((t) => (
                <tr key={t.id}>
                  <td className="tnum text-ink-2 whitespace-nowrap">{dateFr(t.date)}</td>
                  <td><div className="flex items-center gap-2"><Dot kind={t.kind} />{t.instrument}</div></td>
                  <td className="text-ink-2 whitespace-nowrap">{t.owner} · {t.account}</td>
                  <td>{TYPES[t.type]}</td>
                  <td className="num text-ink-2">{t.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
                  <td className="num font-medium">{eur(t.amount)}</td>
                  <td className="text-ink-3 text-[13px]">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Actions" aside={`${open} ouverte${open > 1 ? "s" : ""}`}>
        <form action={addAction} className="panel p-5 grid grid-cols-2 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end mb-6">
          <Field label="Nouvelle action" className="col-span-2 md:col-span-1"><input name="title" placeholder="Vendre les 88 derniers Capgemini" className="field" required /></Field>
          <Field label="Échéance"><input type="date" name="due_date" className="field" /></Field>
          <Field label="Section"><select name="section" className="field">{sections.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <button type="submit" className="btn btn-ghost">Ajouter</button>
        </form>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
          {sections.map((s) => (
            <div key={s}>
              <h3 className="text-[13px] font-medium text-ink-2 mb-2">{s}</h3>
              <ul className="divide-y divide-line">
                {actions.filter((a) => a.section === s).map((a) => (
                  <li key={a.id} className="flex gap-3 items-start py-2.5 text-[14px] leading-snug">
                    {a.status === "todo" ? <form action={completeAction.bind(null, a.id)} className="pt-px"><Check /></form> : <Check done />}
                    <span className={a.status !== "todo" ? "text-ink-3" : ""}>
                      {a.due_date && <span className="tnum text-[12px] font-medium px-1.5 py-0.5 rounded-sm mr-2 bg-surface-2 text-ink-2">{dateFr(a.due_date)}</span>}
                      <span className={a.status === "dropped" ? "line-through" : ""}>{a.title}</span>
                      {a.done_on && <span className="text-ink-3 text-[12px]"> fait le {dateFr(a.done_on)}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
