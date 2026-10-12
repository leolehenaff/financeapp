export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const pct = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
export const dateFr = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
/** Date du jour à Paris, en ISO (Vercel tourne en UTC). */
export const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
export const addDays = (iso: string, d: number) => {
  const t = new Date(iso); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10);
};
export const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
