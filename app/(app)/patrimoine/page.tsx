import { eur, pct, dateFr } from "@/lib/format";
import { getFire, getHistory, getMonthProgress, getPositions, type Position } from "@/lib/queries";
import { today } from "@/lib/format";

export const dynamic = "force-dynamic";

function Chart({ points }: { points: { date: string; value: number }[] }) {
  if (points.length < 2) return null;
  const vs = points.map((p) => p.value), min = Math.min(...vs) * 0.98, max = Math.max(...vs) * 1.02;
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 600},${100 - ((p.value - min) / (max - min)) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 600 100" className="w-full h-24 mt-2" preserveAspectRatio="none">
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
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
  const perf = (ps: Position[]) => { const c = sum(ps, "cost"), v = sum(ps, "value"); return c ? pct(((v - c) / c) * 100) : ""; };
  const first = history[0]?.value;

  return (
    <>
      <h1>{eur(total)}</h1>
      <p className="text-sm text-neutral-500">
        {first ? `${eur(total - first)} sur un an. ` : ""}
        Rendement attendu {pct(fire.rate * 100)}, {eur(monthly)}/mois : seuil hors crédit (680 k€) dans {fire.partial} ans, seuil complet (1,4 M€) dans {fire.full} ans.
      </p>
      <Chart points={history} />

      {[...group(positions, (p) => p.owner)].map(([owner, ps]) => (
        <section key={owner}>
          <h2>{owner} : {eur(sum(ps, "value"))} <span className="text-neutral-500 font-normal text-sm">{perf(ps)}</span></h2>
          {[...group(ps, (p) => p.account)].map(([account, aps]) => (
            <table key={account} className="mb-4">
              <thead>
                <tr><th>{account}</th><th className="num">Qté</th><th className="num">Prix</th><th className="num">Valeur</th><th className="num">Coût</th><th className="num">+/-</th><th>Au</th></tr>
              </thead>
              <tbody>
                {aps.map((p) => (
                  <tr key={p.instrument_id}>
                    <td>{p.instrument}{p.geo && <span className="text-neutral-400 text-xs"> {p.geo}</span>}</td>
                    <td className="num">{p.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}</td>
                    <td className="num">{p.price?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? "?"}</td>
                    <td className="num">{eur(p.value)}</td><td className="num text-neutral-500">{eur(p.cost)}</td>
                    <td className={`num ${p.value >= p.cost ? "text-emerald-600" : "text-red-600"}`}>{p.cost ? pct(((p.value - p.cost) / p.cost) * 100) : ""}</td>
                    <td className="text-neutral-400 text-xs">{dateFr(p.price_date)}</td>
                  </tr>
                ))}
                <tr className="font-medium"><td>Total</td><td /><td /><td className="num">{eur(sum(aps, "value"))}</td><td className="num">{eur(sum(aps, "cost"))}</td><td className="num">{perf(aps)}</td><td /></tr>
              </tbody>
            </table>
          ))}
        </section>
      ))}
    </>
  );
}
