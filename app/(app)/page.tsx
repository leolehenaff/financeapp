import Link from "next/link";
import { completeAction, recordFlow, setPrice } from "@/lib/actions";
import { dateFr, eur, monthLabel, pct, today } from "@/lib/format";
import { dueSoon, getActions, getAllocation, getMonthProgress, getPositions, stale, type AllocRow, type Position } from "@/lib/queries";
import { Bar, Check, Delta, Dot, Empty, Section, pocket } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Barre horizontale par poche : réel en couleur, repère de cible, écart signé en €. */
function Targets({ rows, byPocket }: { rows: AllocRow[]; byPocket: boolean }) {
  const max = Math.max(...rows.map((r) => Math.max(r.actual, r.target))) * 1.1;
  return (
    <ul className="space-y-3">
      {rows.map((r) => {
        const color = byPocket ? pocket(r.key).color : "var(--c-cash)";
        const label = byPocket ? pocket(r.key).label : { US: "États-Unis", EU: "Europe hors FR", FR: "France", OTHER: "Asie et émergents" }[r.key] ?? r.key;
        return (
          <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-center">
            <div className="flex items-center gap-2 text-[14px] min-w-0">
              {byPocket && <Dot kind={r.key} />}
              <span className="truncate">{label}</span>
              <span className="text-ink-3 text-[13px] tnum">{pct(r.actual)} sur {pct(r.target)}</span>
            </div>
            <Delta value={Math.round(r.gap)} suffix=" €" className="text-[13px]" />
            <div className="relative col-span-2 bar">
              <i style={{ width: `${(r.actual / max) * 100}%`, background: color }} />
              <span className="absolute top-[-3px] h-[16px] w-[2px] bg-ink rounded-full" style={{ left: `${(r.target / max) * 100}%` }} title={`Cible ${pct(r.target)}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function StaleRow({ p }: { p: Position }) {
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="flex items-center gap-2 min-w-0 flex-1 basis-48">
        <Dot kind={p.kind} />
        <div className="min-w-0">
          <div className="text-[14px] truncate">{p.instrument} <span className="text-ink-3 text-[12px]">{p.owner}</span></div>
          <div className="text-[12px] text-ink-3 tnum">{p.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} × {p.price?.toLocaleString("fr-FR") ?? "?"}, {p.price_date ? `au ${dateFr(p.price_date)}` : "jamais valorisé"}</div>
        </div>
      </div>
      <form action={setPrice} className="flex gap-2">
        <input type="hidden" name="instrument_id" value={p.instrument_id} />
        <input name="price" inputMode="decimal" placeholder={String(p.price ?? "")} className="field !w-28 !h-8" required aria-label={`Nouveau prix unitaire pour ${p.instrument}`} />
        <button className="btn btn-ghost btn-sm">OK</button>
      </form>
    </li>
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
  const todo = actions.filter((a) => a.status === "todo");
  const due = dueSoon(actions);
  const late = due.filter((a) => a.due_date! < day).length;
  const old = stale(positions);
  const remaining = flows.filter((f) => f.done < f.planned);
  const kindOf = (f: (typeof flows)[number]) => positions.find((p) => p.account === f.account)?.kind ?? "Stock";

  return (
    <>
      <p className="text-[13px] text-ink-2 capitalize">{monthLabel(ym)}</p>
      <h1 className="text-[30px] font-bold tracking-[-0.025em] leading-tight mt-0.5">
        {remaining.length === 0 ? "Tout est versé, beau mois." : `Il reste ${eur(planned - done)} à verser.`}
      </h1>
      <div className="mt-4 flex items-center gap-4">
        <Bar value={done} max={planned} color="var(--accent)" className="h-5 flex-1" />
        <span className="tnum text-[15px] font-semibold whitespace-nowrap">{planned ? Math.round((done / planned) * 100) : 0} %</span>
      </div>
      <p className="text-[13px] text-ink-2 mt-1.5 tnum">{eur(done)} versés sur {eur(planned)}</p>
      <p className="text-[15px] text-ink-2 mt-4 max-w-[65ch]">
        Patrimoine {eur(total)}, soit <Delta value={cost ? ((total - cost) / cost) * 100 : 0} suffix=" %" /> sur un coût d&apos;achat de {eur(cost)}.
        {due.length > 0 && <> {due.length} action{due.length > 1 ? "s" : ""} à échéance dans les 30 jours{late ? `, dont ${late} en retard` : ""}.</>}
      </p>

      <Section title="Versements du mois" aside={`${remaining.length} flux restant${remaining.length > 1 ? "s" : ""}`}>
        <div className="panel p-5">
          <ul className="divide-y divide-line">
            {flows.map((f) => {
              const ok = f.done >= f.planned;
              return (
                <li key={f.id} className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center py-2.5">
                  <Dot kind={kindOf(f)} />
                  <div className="min-w-0">
                    <div className={`text-[14px] truncate ${ok ? "text-ink-3" : ""}`}>{f.label}</div>
                    <div className="text-[12px] text-ink-3 truncate">{f.owner}, {f.account}</div>
                  </div>
                  <div className="num text-[14px]">
                    <span className={ok ? "text-ink-3" : "font-semibold"}>{eur(f.done)}</span>
                    <span className="text-ink-3"> / {eur(f.planned)}</span>
                  </div>
                  <div className="col-start-2 col-span-2 mt-1.5"><Bar value={f.done} max={f.planned} color={pocket(kindOf(f)).color} className="h-1.5" /></div>
                  {!ok && (f.instrument_id
                    ? <form action={recordFlow} className="col-start-2 col-span-2 mt-2 flex justify-end gap-2">
                        <input type="hidden" name="flow_id" value={f.id} />
                        <label className="flex items-center gap-1.5 text-[12px] text-ink-3">Qté
                          <input name="quantity" type="number" step="any" min="0" placeholder={f.price ? ((f.planned - f.done) / f.price).toFixed(f.price > 1000 ? 5 : 2) : ""} className="field w-24 h-8 text-[13px]" required /></label>
                        <label className="flex items-center gap-1.5 text-[12px] text-ink-3">Prix
                          <input name="price" type="number" step="any" min="0" defaultValue={f.price ? Math.round(f.price * 100) / 100 : undefined} className="field w-24 h-8 text-[13px]" required /></label>
                        <button className="btn btn-sm btn-soft">Versé</button>
                      </form>
                    : <Link href="/journal" className="col-start-2 col-span-2 mt-2 text-[13px] underline underline-offset-2">Saisir dans le Journal</Link>)}
                </li>
              );
            })}
          </ul>
          <p className="text-[12px] text-ink-3 mt-4">Quantité achetée et prix unitaire payé : le montant versé en découle. Le prix est pré-rempli au dernier cours connu, la quantité suggérée est le reste à verser divisé par ce prix. Pour une autre date, passe par le Journal.</p>
        </div>
      </Section>

      <Section title="Valorisations à rafraîchir" aside={old.length ? `${old.length} ligne${old.length > 1 ? "s" : ""} de plus de 90 jours` : undefined}>
        {old.length === 0 ? <Empty>Tout a été valorisé dans les 90 derniers jours.</Empty> : (
          <>
            <ul className="panel divide-y divide-line">{old.slice(0, 6).map((p) => <StaleRow key={p.instrument_id} p={p} />)}</ul>
            {old.length > 6 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-[13px] text-ink-2 hover:text-ink inline-block">Voir les {old.length - 6} autres</summary>
                <ul className="panel divide-y divide-line mt-3">{old.slice(6).map((p) => <StaleRow key={p.instrument_id} p={p} />)}</ul>
              </details>
            )}
          </>
        )}
      </Section>

      <Section title="Calendrier" aside={due.length ? `${due.length} sous 30 jours${late ? `, ${late} en retard` : ""}` : undefined}>
        {todo.length === 0 ? <Empty>Rien de programmé.</Empty> : (
          <ul className="divide-y divide-line">
            {todo.map((a) => (
              <li key={a.id} className="flex gap-3 items-start py-3">
                <form action={completeAction.bind(null, a.id)} className="pt-0.5"><Check /></form>
                <div className="text-[14px] leading-snug">
                  <span className={`chip tnum mr-2 ${a.due_date! < day ? "bg-down-soft text-down" : due.includes(a) ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2"}`}>{dateFr(a.due_date)}</span>
                  {a.title}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="grid md:grid-cols-2 gap-x-10">
        <Section title="Par poche" aside="start-up au coût d'achat"><Targets rows={alloc.type} byPocket /></Section>
        <Section title="Actions par zone" aside="poche actions seule"><Targets rows={alloc.geo} byPocket={false} /></Section>
      </div>
      <p className="text-[12px] text-ink-3 mt-3">Le trait noir est la cible. Un écart positif veut dire « sous la cible » : c&apos;est là que vont les prochains versements.</p>

    </>
  );
}
