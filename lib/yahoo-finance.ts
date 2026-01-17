import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export interface QuoteResult {
  symbol: string;
  price: number;
  dividendPerShare: number;
  dividendYield: number;
  currency: string;
  name?: string;
}

interface YahooQuote {
  regularMarketPrice?: number;
  dividendRate?: number;
  dividendYield?: number;
  currency?: string;
  shortName?: string;
  longName?: string;
}

export async function getQuote(ticker: string): Promise<QuoteResult | null> {
  try {
    const result = (await yahooFinance.quote(ticker)) as unknown as YahooQuote;

    if (!result || !result.regularMarketPrice) {
      console.error(`No price found for ${ticker}`);
      return null;
    }

    console.log('Fetched quote for', ticker);
    return {
      symbol: ticker,
      price: result.regularMarketPrice,
      currency: result.currency || "EUR",
      name: result.shortName || result.longName,
      dividendPerShare: result.dividendRate || 0,
      dividendYield: result.dividendYield || 0,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<Map<string, QuoteResult>> {
  const results = new Map<string, QuoteResult>();

  // Process in batches of 10 to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);

    const promises = batch.map(async (ticker) => {
      const quote = await getQuote(ticker);
      if (quote) {
        results.set(ticker, quote);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < tickers.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

// Convert price to EUR if needed
export async function convertToEur(price: number, fromCurrency: string): Promise<number> {
  console.log("Converting", price, "from", fromCurrency, "to EUR");
  if (fromCurrency === "EUR") return price;

  try {
    const pair = `${fromCurrency}EUR=X`;
    const quote = (await yahooFinance.quote(pair)) as unknown as YahooQuote;

    if (quote?.regularMarketPrice) {
      return price * quote.regularMarketPrice;
    }
  } catch (error) {
    console.error(`Error converting ${fromCurrency} to EUR:`, error);
  }

  return price;
}
