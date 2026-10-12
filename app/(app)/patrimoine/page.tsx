import { dateFr, eur, pct, today } from "@/lib/format";
import { getFire, getHistory, getMonthProgress, getPositions, type Position } from "@/lib/queries";
import { Delta, Dot, POCKET, Section, pocket } from "@/components/ui";

export const dynamic = "force-dynamic";

function Chart({ points }: { points: { date: string; value: number }[] }) {
  if (points.length < 2) return null;
  const W = 600, H = 120;
  const vs = points.map((p) => p.value), min = Math.min(...vs) * 0.97, max = Math.max(...vs) * 1.02;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * W, H - ((p.value - min) / (max - min)) * H]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32 mt-4" preserveAspectRatio="none" role="img" aria-label="Évolution du patrimoine sur un an">
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="var(--c-stock)" opacity="0.15" />
      <polyline points={line} fill="none" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

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

function group<T>(items: T[], by: (t: T) => string) {
  return items.reduce<Map<string, T[]>>((m, t) => (m.set(by(t), [...(m.get(by(t)) ?? []), t]), m), new Map());
}

export default async function Patrimoine() {
  const positions = await getPositions();
  const [history, flows] = await Promise.all([getHistory(), getMonthProgress(today().slice(0, 7))]);
  const monthly = flows.reduce((s, f) => s + f.planned, 0);
  const fire = await getFire(positions, monthly);
  const total = positions.reduce((s, p) => s + p.value, 0);
  const sum = (ps: Position[], k: "value" | "cost") => ps.reduce((s, p) => s + p[k], 0);
  const perf = (ps: Position[]) => { const c = sum(ps, "cost"), v = sum(ps, "value"); return c ? ((v - c) / c) * 100 : 0; };
  const first = history[0]?.value;
  const year = Number(today().slice(0, 4));

  return (
    <>
      <p className="text-[13px] text-ink-2">Patrimoine au {dateFr(today())}</p>
      <h1 className="text-[34px] font-semibold tracking-[-0.02em] leading-tight tnum mt-0.5">{eur(total)}</h1>
      <p className="text-[15px] text-ink-2 mt-2">
        {first && <><Delta value={Math.round(total - first)} suffix=" €" /> depuis le {dateFr(history[0].date)}, </>}
        <Delta value={perf(positions)} suffix=" %" /> sur le coût d&apos;achat.
      </p>
      <Chart points={history} />
      <div className="mt-6"><Composition positions={positions} total={total} /></div>

      <Section title="Trajectoire" aside={`${pct(fire.rate * 100)} attendus, ${eur(monthly)} par mois`}>
        <ol className="grid grid-cols-3 text-[13px]">
          {[["Aujourd'hui", eur(total), year], ["Seuil hors crédit", "680 k€", year + fire.partial], ["Seuil complet", "1,4 M€", year + fire.full]].map(([l, v, y], i) => (
            <li key={l} className="relative pt-4">
              <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: i === 0 ? "var(--ink)" : "var(--line-strong)" }} />
              <span className="absolute top-[-3px] left-0 w-2 h-2 rounded-full bg-ink" />
              <div className="text-ink-3">{l}</div>
              <div className="font-semibold text-[15px] tnum">{v}</div>
              <div className="text-ink-2 tnum">{y}</div>
            </li>
          ))}
        </ol>
      </Section>

      {[...group(positions, (p) => p.owner)].map(([owner, ps]) => (
        <Section key={owner} title={<>{owner} <span className="text-ink-2 font-normal tnum">{eur(sum(ps, "value"))}</span></>} aside={<Delta value={perf(ps)} suffix=" %" />}>
          <div className="space-y-4">
            {[...group(ps, (p) => p.account)].map(([account, aps]) => (
              <div key={account} className="panel overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>{account}</th><th className="num">Qté</th><th className="num">Prix</th><th className="num">Valeur</th><th className="num">Coût</th><th className="num">+/-</th><th className="num">Au</th></tr></thead>
                  <tbody>
                    {aps.map((p) => (
                      <tr key={p.instrument_id}>
                        <td><div className="flex items-center gap-2"><Dot kind={p.kind} /><span>{p.instrument}</span>{p.geo && <span className="text-ink-3 text-[12px]">{p.geo}</span>}</div></td>
                        <td className="num text-ink-2">{p.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
                        <td className="num text-ink-2">{p.price?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? "?"}</td>
                        <td className="num font-medium">{eur(p.value)}</td>
                        <td className="num text-ink-2">{eur(p.cost)}</td>
                        <td className="num">{p.cost ? <Delta value={((p.value - p.cost) / p.cost) * 100} suffix=" %" /> : ""}</td>
                        <td className="num text-ink-3 text-[12px]">{dateFr(p.price_date)}</td>
                      </tr>
                    ))}
                    {aps.length > 1 && <tr className="total"><td>Total</td><td /><td /><td className="num">{eur(sum(aps, "value"))}</td><td className="num">{eur(sum(aps, "cost"))}</td><td className="num"><Delta value={perf(aps)} suffix=" %" /></td><td /></tr>}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
