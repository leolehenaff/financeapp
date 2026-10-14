export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const pct = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
export const dateFr = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
/** Date du jour à Paris, en ISO (Vercel tourne en UTC). */
/** Date relative, passée ou future : « aujourd'hui », « hier », « demain », « il y a 12 j », « dans 3 mois », « dans 1 an ». */
export const ago = (iso: string | null) => {
  if (!iso) return "jamais";
  const d = Math.round((Date.parse(today()) - Date.parse(iso.slice(0, 10))) / 86_400_000), n = Math.abs(d);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  if (d === -1) return "demain";
  const span = n < 60 ? `${n} j` : n < 365 ? `${Math.round(n / 30)} mois` : `${Math.round(n / 365)} an${n >= 730 ? "s" : ""}`;
  return d > 0 ? `il y a ${span}` : `dans ${span}`;
};
export const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
export const addDays = (iso: string, d: number) => {
  const t = new Date(iso); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10);
};
export const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

export type Flow = { date: string; amount: number };

/** Taux de rendement interne annuel (bissection) : flux datés, valeur de départ et valeur finale. */
export function irr(flows: Flow[]) {
  const t0 = Date.parse(flows[0].date), yr = 31557600000;
  const npv = (r: number) => flows.reduce((s, f) => s + f.amount / Math.pow(1 + r, (Date.parse(f.date) - t0) / yr), 0);
  let lo = -0.99, hi = 10;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (npv(m) > 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export type TxFilter = { from: string; to: string; instrument: string; type: string };
export type TxRow = { id: number; date: string; owner: string; account: string; instrument: string; kind: string; type: string; quantity: number; amount: number; note: string | null };
export const TX_PAGE = 20;
export type ContribRow = { id: number; date: string; owner: string; account: string; amount: number; note: string | null };
