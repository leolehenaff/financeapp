import { dateFr, eur, pct, today } from "@/lib/format";
import { FIRE, getFire, getHistory, getMonthProgress, getPositions, type Position } from "@/lib/queries";
import { Dot, POCKET, Section, pocket } from "@/components/ui";
import { Chart } from "@/components/chart";
import { Positions } from "@/components/positions";

export const dynamic = "force-dynamic";

/** Bande de composition : la signature visuelle, une poche = un segment. */
function Composition({ positions, total }: { positions: Position[]; total: number }) {
  const parts = Object.keys(POCKET).map((k) => ({ k, v: positions.filter((p) => p.kind === k).reduce((s, p) => s + p.value, 0) })).filter((x) => x.v > 0);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {parts.map((x) => <span key={x.k} style={{ width: `${(x.v / total) * 100}%`, background: pocket(x.k).color }} title={`${pocket(x.k).label} ${pct((x.v / total) * 100)}`} />)}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[13px]">
        {parts.map((x) => <li key={x.k} className="flex items-center gap-1.5"><Dot kind={x.k} />{pocket(x.k).label} <span className="text-ink-3 tnum">{pct((x.v / total) * 100)}</span></li>)}
      </ul>
    </div>
  );
}

export default async function Patrimoine() {
  const positions = await getPositions();
  const [history, flows] = await Promise.all([getHistory(), getMonthProgress(today().slice(0, 7))]);
  const monthly = flows.reduce((s, f) => s + f.planned, 0);
  const fire = await getFire(positions, monthly);
  const total = positions.reduce((s, p) => s + p.value, 0);
  const year = Number(today().slice(0, 4));
  // Le snapshot du jour date de minuit : on le remplace par les positions en direct pour que KPI et total coïncident.
  const live = [...history.filter((h) => h.date < today()), { date: today(), value: total, cost: positions.reduce((s, p) => s + p.cost, 0) }];

  return (
    <>
      <p className="text-[13px] text-ink-2">Patrimoine au {dateFr(today())}</p>
      <h1 className="text-[38px] font-bold tracking-[-0.03em] leading-tight tnum mt-0.5">{eur(total)}</h1>
      <Chart points={live} />
      <p className="flex gap-5 text-[12px] text-ink-3 mt-1.5"><span><span className="inline-block w-4 border-t-[1.5px] border-ink align-middle mr-1.5" />Valeur</span><span><span className="inline-block w-4 border-t border-dashed border-ink-3 align-middle mr-1.5" />Versé net</span></p>
      <div className="mt-6"><Composition positions={positions} total={total} /></div>

      <Section title="Trajectoire" aside={`${pct(fire.real * 100)} réels attendus (${pct(fire.rate * 100)} moins 2 % d'inflation), ${eur(monthly)} par mois`}>
        {/* Une seule piste, remplie au prorata du chemin vers le seuil complet ; les seuils sont des repères, pas des étapes franchies. */}
        <div className="relative h-3 rounded-full bg-surface-2">
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (total / FIRE.full) * 100)}%`, background: "var(--accent)" }} />
          {[FIRE.partial / FIRE.full, 1].map((f) => <span key={f} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-ink" style={{ left: `${f * 100}%` }} />)}
        </div>
        <ol className="grid grid-cols-3 text-[13px] mt-3">
          {[
            ["Aujourd'hui", eur(total), year, "text-left", "", ""],
            ["Seuil hors crédit", "870 k€", year + fire.partial, "text-center", "Capital, en euros d'aujourd'hui, qui couvre le coût de vie avec un enfant d'âge scolaire (4 550 €/mois) sauf le crédit immobilier (1 974 €), à 3,5 % de retrait brut par an, soit 28 fois 31 000 €. Fiscalité des retraits non déduite.", "2 580 € par mois, crédit payé par ailleurs"],
            ["Seuil complet", "1,53 M€", year + fire.full, "text-right", "Capital, en euros d'aujourd'hui, qui couvre tout le coût de vie avec un enfant d'âge scolaire (4 550 €/mois), crédit compris, à 3,5 % de retrait brut par an, soit 28 fois 54 600 €. Année estimée au rendement réel (nominal moins 2 % d'inflation) avec 3 700 € par mois indexés.", "4 550 € par mois, crédit compris"],
          ].map(([l, v, y, a, tip, lives]) => (
            <li key={l} className={String(a)}>
              <div className="text-ink-3">{tip ? <span className={`tip ${a === "text-right" ? "tip-right" : ""}`} tabIndex={0} data-tip={tip}>{l}</span> : l}</div>
              <div className="font-semibold text-[15px] tnum">{v}</div>
              <div className="text-ink-2 tnum">{y}, {Number(y) - 1997} ans</div>
              {lives && <div className="text-ink-3 tnum text-[12px] mt-0.5">pour vivre avec {lives}</div>}
            </li>
          ))}
        </ol>
      </Section>

      <Positions positions={positions.map((p) => ({ ...p }))} />
    </>
  );
}
