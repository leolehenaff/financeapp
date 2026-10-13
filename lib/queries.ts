import { db } from "./db";
import { addDays, irr, today, type Flow } from "./format";

export type Position = {
  account_id: number; account: string; owner: string; account_kind: string;
  instrument_id: number; instrument: string; ticker: string | null; kind: string; geo: string | null;
  price_source: string; quantity: number; cost: number; price: number | null; price_date: string | null;
  value: number; dividends: number; sold: number; bought: number; gain: number; tri: number | null; last_date: string;
};

/** Positions dérivées des transactions (coût moyen pondéré), dernier prix connu. `closed` : les lignes soldées (quantité nulle) à la place. */
export async function getPositions(closed = false): Promise<Position[]> {
  const r = await db.execute(`
    WITH agg AS (
      SELECT account_id, instrument_id,
        SUM(CASE type WHEN 'buy' THEN quantity WHEN 'sell' THEN -quantity ELSE 0 END) AS quantity,
        SUM(CASE type WHEN 'buy' THEN amount ELSE 0 END) AS bought,
        SUM(CASE type WHEN 'buy' THEN quantity ELSE 0 END) AS bought_qty,
        SUM(CASE type WHEN 'dividend' THEN amount ELSE 0 END) AS dividends,
        SUM(CASE type WHEN 'sell' THEN amount ELSE 0 END) AS sold,
        MAX(date) AS last_date
      FROM transactions GROUP BY 1, 2),
    lp AS (
      SELECT instrument_id, price, date FROM prices p
      WHERE date = (SELECT MAX(date) FROM prices WHERE instrument_id = p.instrument_id))
    SELECT a.id account_id, a.name account, a.owner, a.kind account_kind,
      i.id instrument_id, i.name instrument, i.ticker, i.kind, i.geo, i.price_source,
      agg.quantity,
      CASE WHEN agg.bought_qty > 0 THEN agg.bought / agg.bought_qty * agg.quantity ELSE 0 END AS cost,
      lp.price, lp.date price_date, agg.quantity * COALESCE(lp.price, 0) AS value, agg.dividends, agg.sold, agg.bought,
      agg.quantity * COALESCE(lp.price, 0) + agg.sold + agg.dividends - agg.bought AS gain, agg.last_date
    FROM agg
    JOIN accounts a ON a.id = agg.account_id
    JOIN instruments i ON i.id = agg.instrument_id
    LEFT JOIN lp ON lp.instrument_id = i.id
    WHERE agg.quantity ${closed ? "<=" : ">"} 0.000001
    ORDER BY a.owner, a.name, value DESC`);
  const positions = r.rows as unknown as Position[];
  // TRI par ligne : achats sortis de la poche, ventes et dividendes rentrés, valeur actuelle en face. Null sans achat payé ou avant 30 jours d'historique.
  const tx = await db.execute("SELECT date, account_id, instrument_id, type, amount FROM transactions ORDER BY date");
  const flows = new Map<string, Flow[]>();
  for (const t of tx.rows) {
    const k = `${t.account_id}:${t.instrument_id}`;
    flows.set(k, [...(flows.get(k) ?? []), { date: String(t.date), amount: (t.type === "buy" ? -1 : 1) * Number(t.amount) }]);
  }
  for (const p of positions) {
    const f = flows.get(`${p.account_id}:${p.instrument_id}`) ?? [];
    const old = f[0] && Date.parse(today()) - Date.parse(f[0].date) > 30 * 864e5;
    p.tri = old && f.some((x) => x.amount < 0) ? irr(closed ? f : [...f, { date: today(), amount: p.value }]) : null;
  }
  return positions;
}

export type AllocRow = { key: string; target: number; actual: number; value: number; gap: number };

/** Poids : valeur, sauf Start-up au coût d'achat (stratégie). Géo sur la poche Stock seulement. */
export async function getAllocation(positions: Position[]) {
  const obj = (await db.execute("SELECT category, key, target_percent FROM allocation_objectives")).rows as unknown as
    { category: string; key: string; target_percent: number }[];
  const weight = (p: Position) => (p.kind === "Start-up" ? p.cost : p.value);
  const build = (cat: string, items: Position[], by: (p: Position) => string | null) => {
    const total = items.reduce((s, p) => s + weight(p), 0);
    return obj.filter((o) => o.category === cat).map((o) => {
      const value = items.filter((p) => by(p) === o.key).reduce((s, p) => s + weight(p), 0);
      const actual = total ? (value / total) * 100 : 0;
      return { key: o.key, target: o.target_percent, actual, value, gap: (o.target_percent / 100) * total - value };
    });
  };
  return {
    type: build("type", positions, (p) => p.kind),
    geo: build("geo", positions.filter((p) => p.kind === "Stock"), (p) => p.geo),
  };
}

export type FlowProgress = { id: number; owner: string; account: string; label: string; planned: number; done: number; instrument_id: number | null; price: number | null };

export async function getMonthProgress(ym: string): Promise<FlowProgress[]> {
  const flows = (await db.execute({
    sql: `SELECT f.id, f.owner, f.account_id, f.instrument_id, f.monthly_amount, a.name account,
            COALESCE(f.label, i.name) label,
            (SELECT price FROM prices WHERE instrument_id = f.instrument_id ORDER BY date DESC LIMIT 1) price
          FROM plan_flows f JOIN accounts a ON a.id = f.account_id LEFT JOIN instruments i ON i.id = f.instrument_id
          WHERE f.from_month <= ? AND (f.to_month IS NULL OR f.to_month >= ?) ORDER BY f.owner, f.id`,
    args: [ym, ym],
  })).rows as unknown as { id: number; owner: string; account_id: number; instrument_id: number | null; monthly_amount: number; account: string; label: string; price: number | null }[];
  const done = (await db.execute({
    sql: `SELECT account_id, instrument_id, SUM(amount) amount FROM transactions
          WHERE type = 'buy' AND substr(date, 1, 7) = ? GROUP BY 1, 2`,
    args: [ym],
  })).rows as unknown as { account_id: number; instrument_id: number; amount: number }[];
  return flows.map((f) => ({
    id: f.id, owner: f.owner, account: f.account, label: f.label, planned: f.monthly_amount, instrument_id: f.instrument_id, price: f.price,
    done: done
      .filter((d) => d.account_id === f.account_id && (f.instrument_id === null || d.instrument_id === f.instrument_id))
      .reduce((s, d) => s + d.amount, 0),
  }));
}

export type Action = { id: number; section: string; title: string; due_date: string | null; status: string; done_on: string | null };

export async function getActions(): Promise<Action[]> {
  const r = await db.execute(
    "SELECT id, section, title, due_date, status, done_on FROM actions ORDER BY due_date IS NULL, due_date, id");
  return r.rows as unknown as Action[];
}

export const dueSoon = (actions: Action[], days = 30) => {
  const limit = addDays(today(), days);
  return actions.filter((a) => a.status === "todo" && a.due_date && a.due_date <= limit);
};

/** Valorisation périmée : manuelle et plus vieille que 90 jours (un an pour les start-up, jamais pour les livrets). */
export const stale = (positions: Position[]) =>
  positions.filter((p) => p.price_source === "manual" && !["Livret", "Active Cash"].includes(p.kind)
    && (!p.price_date || p.price_date < addDays(today(), p.kind === "Start-up" ? -365 : -90)));

/** Mouvements datés pour le graphique par période : achats, ventes, dividendes (montant non nul) et apports. */
export async function getLedger() {
  const r = await db.execute(`SELECT date, type, amount FROM transactions WHERE amount <> 0
    UNION ALL SELECT date, 'contribution', amount FROM contributions ORDER BY date`);
  return r.rows.map((x) => ({ date: String(x.date), type: String(x.type), amount: Number(x.amount) }));
}

/** Objectif de versement mensuel par période du plan, pour la ligne de cible du graphique. */
export async function getPlan() {
  const r = await db.execute("SELECT from_month, to_month, SUM(monthly_amount) amount FROM plan_flows GROUP BY 1, 2");
  return r.rows.map((x) => ({ from: String(x.from_month), to: x.to_month ? String(x.to_month) : null, amount: Number(x.amount) }));
}

/** Tous les apports externes datés, pour le TRI du graphique. */
export async function getContributions() {
  const r = await db.execute("SELECT date, amount FROM contributions ORDER BY date");
  return r.rows.map((x) => ({ date: String(x.date), amount: Number(x.amount) }));
}

/** Tout l'historique : valeur, et versé net (coût d'achat) depuis les snapshots v2 seulement.
 *  Les snapshots v1 ont un coût figé (valeur mise à jour à la main, pas d'achats saisis) : inutilisable. */
export async function getHistory(): Promise<{ date: string; value: number; cost: number }[]> {
  // Versé net à chaque date = cumul des apports externes (table contributions), pas des achats : un dividende réinvesti n'est pas un versement.
  const r = await db.execute(`
    SELECT s.snapshot_date date, s.total_value value,
      (SELECT COALESCE(SUM(amount), 0) FROM contributions c WHERE c.date <= s.snapshot_date) cost
    FROM snapshots s ORDER BY 1`);
  // Objets plats : les Row libsql ne passent pas au composant client.
  return r.rows.map((x) => ({ date: String(x.date), value: Number(x.value), cost: Number(x.cost) }));
}

/** Seuils FIRE en euros constants de 2026 : 28 fois les dépenses annuelles (3,5 % de retrait brut),
 *  sur un coût de vie de 4 550 €/mois (3 956 + 600 pour un enfant d'âge scolaire, la crèche étant finie bien avant).
 *  Voir docs/plan-financier.md. */
export const FIRE = { partial: 870_000, full: 1_530_000, inflation: 0.02 };

/** Rendement nominal pondéré (hypothèses « avg »), puis années jusqu'aux seuils en réel (rendement moins inflation,
 *  versements supposés indexés). */
export async function getFire(positions: Position[], monthly: number) {
  const hyp = (await db.execute("SELECT asset_type, avg_rate FROM hypotheses")).rows as unknown as { asset_type: string; avg_rate: number }[];
  const total = positions.reduce((s, p) => s + p.value, 0);
  const rate = hyp.reduce((s, h) => s + (positions.filter((p) => p.kind === h.asset_type).reduce((a, p) => a + p.value, 0) / total) * h.avg_rate, 0) / 100;
  const real = rate - FIRE.inflation;
  const yearsTo = (target: number) => {
    let c = total, y = 0;
    while (c < target && y < 60) { c = c * (1 + real) + monthly * 12; y++; }
    return y;
  };
  return { rate, real, partial: yearsTo(FIRE.partial), full: yearsTo(FIRE.full) };
}

export const lists = async () => ({
  accounts: (await db.execute("SELECT id, owner, name FROM accounts ORDER BY owner, name")).rows as unknown as { id: number; owner: string; name: string }[],
  instruments: (await db.execute("SELECT id, name, kind FROM instruments ORDER BY kind, name")).rows as unknown as { id: number; name: string; kind: string }[],
});
