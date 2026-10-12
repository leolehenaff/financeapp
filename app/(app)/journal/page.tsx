import { addAction, addInstrument, addTransaction, completeAction } from "@/lib/actions";
import { db, GEOS, KINDS } from "@/lib/db";
import { dateFr, eur, today } from "@/lib/format";
import { getActions, lists } from "@/lib/queries";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = { buy: "Achat", sell: "Vente", dividend: "Dividende" };

export default async function Journal() {
  const { accounts, instruments } = await lists();
  const actions = await getActions();
  const tx = (await db.execute(`
    SELECT t.id, t.date, a.owner, a.name account, i.name instrument, t.type, t.quantity, t.amount, t.note
    FROM transactions t JOIN accounts a ON a.id = t.account_id JOIN instruments i ON i.id = t.instrument_id
    ORDER BY t.date DESC, t.id DESC LIMIT 100`)).rows as unknown as
    { id: number; date: string; owner: string; account: string; instrument: string; type: string; quantity: number; amount: number; note: string | null }[];
  const sections = [...new Set(actions.map((a) => a.section))];

  return (
    <>
      <h1>Journal</h1>

      <h2>Nouvelle transaction</h2>
      <form action={addTransaction} className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <input type="date" name="date" defaultValue={today()} required />
        <select name="account_id" required>{accounts.map((a) => <option key={a.id} value={a.id}>{a.owner} : {a.name}</option>)}</select>
        <select name="instrument_id" required>{instruments.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
        <select name="type">{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <input name="quantity" inputMode="decimal" placeholder="Quantité (0 si dividende)" />
        <input name="amount" inputMode="decimal" placeholder="Montant € total" required />
        <input name="note" placeholder="Note" />
        <button type="submit">Enregistrer</button>
      </form>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-neutral-500">Nouvel instrument</summary>
        <form action={addInstrument} className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
          <input name="name" placeholder="Nom" required />
          <input name="ticker" placeholder="Ticker Yahoo (optionnel)" />
          <select name="kind">{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
          <select name="geo"><option value="">Géo</option>{GEOS.map((g) => <option key={g}>{g}</option>)}</select>
          <button type="submit">Créer</button>
        </form>
      </details>

      <h2>Transactions</h2>
      <table>
        <thead><tr><th>Date</th><th>Qui</th><th>Compte</th><th>Instrument</th><th>Type</th><th className="num">Qté</th><th className="num">Montant</th><th>Note</th></tr></thead>
        <tbody>
          {tx.map((t) => (
            <tr key={t.id}>
              <td>{dateFr(t.date)}</td><td>{t.owner}</td><td>{t.account}</td><td>{t.instrument}</td><td>{TYPES[t.type]}</td>
              <td className="num">{t.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
              <td className="num">{eur(t.amount)}</td><td className="text-neutral-500">{t.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Actions</h2>
      <form action={addAction} className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-4">
        <input name="title" placeholder="Nouvelle action" required className="col-span-2" />
        <input type="date" name="due_date" />
        <select name="section">{sections.map((s) => <option key={s}>{s}</option>)}</select>
        <button type="submit" className="col-span-2 md:col-span-4">Ajouter</button>
      </form>
      {sections.map((s) => (
        <section key={s}>
          <h3 className="font-medium mt-4 mb-1">{s}</h3>
          <ul className="text-sm space-y-1">
            {actions.filter((a) => a.section === s).map((a) => (
              <li key={a.id} className={`flex gap-3 items-start ${a.status !== "todo" ? "text-neutral-400 line-through" : ""}`}>
                {a.status === "todo" ? <form action={completeAction.bind(null, a.id)}><button className="px-2 py-0">Fait</button></form> : <span className="w-9 text-center">✓</span>}
                <span>{a.due_date && <b>{dateFr(a.due_date)} : </b>}{a.title}{a.done_on && <i> (fait le {dateFr(a.done_on)})</i>}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
