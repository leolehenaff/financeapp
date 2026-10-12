import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance();
const fx = new Map<string, number>();

async function quote(symbol: string) {
  const q = (await yf.quote(symbol)) as { regularMarketPrice?: number; currency?: string };
  return q?.regularMarketPrice ? { price: q.regularMarketPrice, currency: q.currency ?? "EUR" } : null;
}

/** Cours en EUR, ou null si Yahoo ne répond pas. */
export async function priceEur(ticker: string): Promise<number | null> {
  try {
    const q = await quote(ticker);
    if (!q) return null;
    if (q.currency === "EUR") return q.price;
    if (!fx.has(q.currency)) fx.set(q.currency, (await quote(`${q.currency}EUR=X`))?.price ?? NaN);
    const rate = fx.get(q.currency)!;
    return Number.isNaN(rate) ? null : q.price * rate;
  } catch (e) {
    console.error(`Yahoo ${ticker}:`, e);
    return null;
  }
}
