import { completeAction, setPrice } from "@/lib/actions";
import { dateFr, eur, monthLabel, pct, today } from "@/lib/format";
import { dueSoon, getActions, getAllocation, getMonthProgress, getPositions, stale, type AllocRow } from "@/lib/queries";

export const dynamic = "force-dynamic";

function AllocTable({ title, rows }: { title: string; rows: AllocRow[] }) {
  return (
    <table>
      <thead><tr><th>{title}</th><th className="num">Cible</th><th className="num">Réel</th><th className="num">Écart</th></tr></thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <td>{r.key}</td><td className="num">{pct(r.target)}</td><td className="num">{pct(r.actual)}</td>
            <td className={`num ${r.gap > 0 ? "text-emerald-600" : "text-red-600"}`}>{r.gap > 0 ? "+" : ""}{eur(r.gap)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function ThisMonth() {
  const day = today(), ym = day.slice(0, 7);
  const positions = await getPositions();
  const [alloc, flows, actions] = await Promise.all([getAllocation(positions), getMonthProgress(ym), getActions()]);
  const total = positions.reduce((s, p) => s + p.value, 0);
  const cost = positions.reduce((s, p) => s + p.cost, 0);
  const planned = flows.reduce((s, f) => s + f.planned, 0);
  const done = flows.reduce((s, f) => s + Math.min(f.done, f.planned), 0);
  const due = dueSoon(actions);
  const old = stale(positions);

  return (
    <>
      <h1 className="capitalize">{monthLabel(ym)}</h1>
      <p className="text-neutral-500 text-sm">
        Patrimoine {eur(total)}, coût {eur(cost)}, {pct(cost ? ((total - cost) / cost) * 100 : 0)}
      </p>

      <h2>Versements du mois : {eur(done)} / {eur(planned)}</h2>
      <table>
        <thead><tr><th>Qui</th><th>Compte</th><th>Instrument</th><th className="num">Plan</th><th className="num">Fait</th><th className="num">Reste</th></tr></thead>
        <tbody>
          {flows.map((f) => (
            <tr key={f.id} className={f.done >= f.planned ? "text-neutral-400" : ""}>
              <td>{f.owner}</td><td>{f.account}</td><td>{f.label}</td>
              <td className="num">{eur(f.planned)}</td><td className="num">{eur(f.done)}</td>
              <td className="num font-medium">{eur(Math.max(0, f.planned - f.done))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-neutral-500 mt-1">Un versement fait = une transaction « achat » saisie dans le Journal.</p>

      <h2>Actions à 30 jours ({due.length})</h2>
      {due.length === 0 && <p className="text-sm text-neutral-500">Rien à échéance.</p>}
      <ul className="text-sm space-y-2">
        {due.map((a) => (
          <li key={a.id} className="flex gap-3 items-start">
            <form action={completeAction.bind(null, a.id)}><button>Fait</button></form>
            <span className={a.due_date! < day ? "text-red-600" : ""}>
              <b>{dateFr(a.due_date)}</b> : {a.title}
            </span>
          </li>
        ))}
      </ul>

      <h2>Écart aux cibles</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <AllocTable title="Type (start-up au coût)" rows={alloc.type} />
        <AllocTable title="Géo (poche actions)" rows={alloc.geo} />
      </div>
      <p className="text-xs text-neutral-500 mt-1">Écart positif : la poche est sous sa cible, c&apos;est là que vont les prochains versements.</p>

      <h2>Valorisations périmées ({old.length})</h2>
      {old.length === 0 && <p className="text-sm text-neutral-500">Tout a moins de 90 jours.</p>}
      <table>
        <tbody>
          {old.map((p) => (
            <tr key={`${p.account_id}-${p.instrument_id}`}>
              <td>{p.owner}</td><td>{p.instrument}</td>
              <td className="text-neutral-500">{p.price_date ? dateFr(p.price_date) : "jamais"}</td>
              <td className="num">{p.quantity.toLocaleString("fr-FR")} × {p.price?.toLocaleString("fr-FR") ?? "?"}</td>
              <td>
                <form action={setPrice} className="flex gap-1 justify-end">
                  <input type="hidden" name="instrument_id" value={p.instrument_id} />
                  <input name="price" inputMode="decimal" placeholder="prix unitaire" className="w-28" required />
                  <button>OK</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
