export const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const pct = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
export const dateFr = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
/** Date du jour à Paris, en ISO (Vercel tourne en UTC). */
/** Date relative, en jours : « aujourd'hui », « hier », « il y a 12 j », « il y a 3 mois », « il y a 1 an ». */
export const ago = (iso: string | null) => {
  if (!iso) return "jamais";
  const d = Math.round((Date.parse(today()) - Date.parse(iso.slice(0, 10))) / 86_400_000);
  if (d <= 0) return "aujourd'hui";
  if (d === 1) return "hier";
  if (d < 60) return `il y a ${d} j`;
  if (d < 365) return `il y a ${Math.round(d / 30)} mois`;
  return `il y a ${Math.round(d / 365)} an${d >= 730 ? "s" : ""}`;
};
export const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
export const addDays = (iso: string, d: number) => {
  const t = new Date(iso); t.setUTCDate(t.getUTCDate() + d); return t.toISOString().slice(0, 10);
};
export const monthLabel = (ym: string) =>
  new Date(`${ym}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
