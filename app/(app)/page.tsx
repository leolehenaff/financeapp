import { completeAction, setPrice } from "@/lib/actions";
import { dateFr, eur, monthLabel, today } from "@/lib/format";
import { dueSoon, getActions, getMonthProgress, getPositions, stale, type Action, type Position } from "@/lib/queries";
import { Bar, Check, Dot, Empty, Section } from "@/components/ui";

export const dynamic = "force-dynamic";

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

function ActionRow({ a, day }: { a: Action; day: string }) {
  return (
    <li className="flex gap-3 items-start py-3">
      <form action={completeAction.bind(null, a.id)} className="pt-0.5"><Check /></form>
      <div className="text-[14px] leading-snug">
        <span className={`chip tnum mr-2 ${a.due_date! < day ? "bg-down-soft text-down" : "bg-surface-2 text-ink-2"}`}>{dateFr(a.due_date)}</span>
        {a.title}
      </div>
    </li>
  );
}

export default async function ThisMonth() {
  const day = today(), ym = day.slice(0, 7);
  const positions = await getPositions();
  const [flows, actions] = await Promise.all([getMonthProgress(ym), getActions()]);
  const planned = flows.reduce((s, f) => s + f.planned, 0);
  const done = flows.reduce((s, f) => s + Math.min(f.done, f.planned), 0);
  const due = dueSoon(actions);
  const later = actions.filter((a) => a.status === "todo" && !due.includes(a));
  const late = due.filter((a) => a.due_date! < day).length;
  const old = stale(positions);
  const remaining = flows.filter((f) => f.done < f.planned);

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

      <Section title="Versements du mois" aside={remaining.length ? `${remaining.length} personne${remaining.length > 1 ? "s" : ""} en attente` : undefined}>
        <ul className="panel p-5 divide-y divide-line">
          {flows.map((f) => {
            const ok = f.done >= f.planned;
            return (
              <li key={f.owner} className="py-2.5">
                <div className="flex items-center justify-between gap-3 text-[14px]">
                  <span className={ok ? "text-ink-3" : ""}>{f.owner}</span>
                  <span className="num"><span className={ok ? "text-ink-3" : "font-semibold"}>{eur(f.done)}</span><span className="text-ink-3"> / {eur(f.planned)}</span></span>
                </div>
                <Bar value={f.done} max={f.planned} color="var(--accent)" className="h-1.5 mt-1.5" />
              </li>
            );
          })}
        </ul>
        <p className="text-[12px] text-ink-3 mt-3">Apports externes du mois, saisis par l&apos;agent depuis les exports. La répartition par instrument est dans le calendrier chaque 1er du mois.</p>
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
        {due.length === 0 ? <Empty>Rien sous 30 jours.</Empty> : <ul className="divide-y divide-line">{due.map((a) => <ActionRow key={a.id} a={a} day={day} />)}</ul>}
        {later.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[13px] text-ink-2 hover:text-ink inline-block">Plus tard, {later.length} action{later.length > 1 ? "s" : ""}</summary>
            <ul className="divide-y divide-line mt-1">{later.map((a) => <ActionRow key={a.id} a={a} day={day} />)}</ul>
          </details>
        )}
      </Section>


    </>
  );
}
