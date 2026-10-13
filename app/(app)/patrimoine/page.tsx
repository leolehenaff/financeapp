import { dateFr, eur, pct, today } from "@/lib/format";
import { FIRE, getAllocation, getFire, getContributions, getHistory, getLedger, getPlan, getPositions, planTotal, type AllocRow } from "@/lib/queries";
import { Delta, Dot, Section, pocket } from "@/components/ui";
import { Chart } from "@/components/chart";
import { Positions } from "@/components/positions";
import { Refresh } from "@/components/refresh";

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
              {/* Plein jusqu'à la cible, hachuré au-delà : le surplus se voit, le manque est l'espace vide avant le trait. */}
              <i style={{ width: `${(Math.min(r.actual, r.target) / max) * 100}%`, background: color }} />
              {r.actual > r.target && <span className="absolute inset-y-0 hatch" style={{ left: `${(r.target / max) * 100}%`, width: `${((r.actual - r.target) / max) * 100}%`, "--hatch": color } as React.CSSProperties} title={`Surplus ${eur(-r.gap)}`} />}
              <span className="absolute top-[-3px] h-[16px] w-[2px] bg-ink rounded-full" style={{ left: `${(r.target / max) * 100}%` }} title={`Cible ${pct(r.target)}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function Patrimoine() {
  const positions = await getPositions();
  const [history, contributions, closed, ledger, alloc] = await Promise.all([getHistory(), getContributions(), getPositions(true), getLedger(), getAllocation(positions)]);
  const plan = getPlan(), monthly = planTotal();
  const fire = await getFire(positions, monthly);
  const total = positions.reduce((s, p) => s + p.value, 0);
  const year = Number(today().slice(0, 4));
  // Le snapshot du jour date de minuit : on le remplace par le total en direct, le versé net restant celui du cumul des transactions.
  const live = [...history.filter((h) => h.date < today()), { date: today(), value: total, cost: history.at(-1)?.cost ?? 0 }];

  return (
    <>
      <p className="text-[13px] text-ink-2">Patrimoine au {dateFr(today())}</p>
      <div className="flex items-center gap-3 mt-0.5">
        <h1 className="text-[38px] font-bold tracking-[-0.03em] leading-tight tnum">{eur(total)}</h1>
        <Refresh />
      </div>
      <Chart points={live} flows={contributions} ledger={ledger} plan={plan} />
      {/* Carte héros : la seule mise en avant de la page, fond dégradé indigo pâle. Une piste remplie au prorata du seuil complet ; les seuils sont des repères. */}
      <section className="panel mt-10 p-5 sm:p-6 bg-[linear-gradient(135deg,var(--accent-soft),var(--surface)_75%)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[13px] font-semibold text-accent">Trajectoire</h2>
            <p className="text-[22px] sm:text-[26px] font-bold tracking-[-0.02em] leading-tight mt-1">Seuil hors crédit en {year + fire.partial}</p>
            <p className="text-[14px] text-ink-2 mt-1 tnum">dans {fire.partial} ans, seuil complet en {year + fire.full}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[26px] sm:text-[30px] font-bold tracking-[-0.03em] leading-none tnum text-accent">{pct(Math.min(100, (total / FIRE.full) * 100))}</div>
            <div className="text-[12px] text-ink-3 mt-1">du seuil complet</div>
          </div>
        </div>
        <div className="relative h-3.5 rounded-full bg-surface mt-5 shadow-[inset_0_0_0_1px_var(--line)]">
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (total / FIRE.full) * 100)}%`, background: "var(--accent)" }} />
          {[FIRE.partial / FIRE.full, 1].map((f) => <span key={f} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-ink ring-2 ring-surface" style={{ left: `${f * 100}%` }} />)}
        </div>
        <ol className="grid grid-cols-3 text-[13px] mt-3">
          {[
            ["Aujourd'hui", eur(total), year, "text-left", "", ""],
            ["Seuil hors crédit", "870 k€", year + fire.partial, "text-center", "Capital, en euros d'aujourd'hui, qui couvre le coût de vie avec un enfant d'âge scolaire (4 550 €/mois) sauf le crédit immobilier (1 974 €), à 3,5 % de retrait brut par an, soit 28 fois 31 000 €. Fiscalité des retraits non déduite.", "2 580 €/mois"],
            ["Seuil complet", "1,53 M€", year + fire.full, "text-right", "Capital, en euros d'aujourd'hui, qui couvre tout le coût de vie avec un enfant d'âge scolaire (4 550 €/mois), crédit compris, à 3,5 % de retrait brut par an, soit 28 fois 54 600 €. Année estimée au rendement réel (nominal moins 2 % d'inflation) avec 3 700 € par mois indexés.", "4 550 €/mois"],
          ].map(([l, v, y, a, tip, lives]) => (
            <li key={l} className={String(a)}>
              <div className="text-ink-3">{tip ? <span className={`tip ${a === "text-right" ? "tip-right" : ""}`} tabIndex={0} data-tip={tip}>{l}</span> : l}</div>
              <div className="font-semibold text-[15px] tnum">{v}</div>
              <div className="text-ink-2 tnum">{y}, {Number(y) - 1997} ans</div>
              {lives && <div className="text-ink-3 tnum text-[12px] mt-0.5">pour vivre avec <span className="whitespace-nowrap">{lives}</span></div>}
            </li>
          ))}
        </ol>
        <p className="text-[12px] text-ink-3 mt-4 pt-3 border-t border-line">{pct(fire.real * 100)} réels attendus ({pct(fire.rate * 100)} moins 2 % d&apos;inflation), {eur(monthly)} versés par mois.</p>
      </section>

      <div className="grid md:grid-cols-2 gap-x-10">
        <Section title="Par poche"><Targets rows={alloc.type} byPocket /></Section>
        <Section title="Actions par zone" aside="poche actions seule"><Targets rows={alloc.geo} byPocket={false} /></Section>
      </div>
      <p className="text-[12px] text-ink-3 mt-3">Le trait noir est la cible. Hachuré au-delà : surplus. Vide avant le trait : manque à combler, c&apos;est là que vont les prochains versements.</p>



      <Positions positions={positions.map((p) => ({ ...p }))} closed={closed.map((p) => ({ ...p }))} />
    </>
  );
}
