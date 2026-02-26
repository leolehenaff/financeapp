import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getQuotes, convertToEur } from "@/lib/yahoo-finance";
import { AssetRow } from "@/lib/types";

export async function POST() {
  try {
    const db = getDb();

    // Get all assets with tickers (manual refresh updates all)
    const result = await db.execute(
      "SELECT * FROM assets WHERE ticker IS NOT NULL AND ticker != ''"
    );

    const assets = result.rows as unknown as AssetRow[];

    if (assets.length === 0) {
      return NextResponse.json({ message: "No assets to refresh", updated: 0, total: 0, errors: [] });
    }

    // Get unique tickers
    const tickers = [...new Set(assets.map((a) => a.ticker).filter(Boolean))] as string[];

    // Fetch quotes
    const quotes = await getQuotes(tickers);

    // Update each asset
    let updatedCount = 0;
    const errors: { ticker: string; name: string; reason: string }[] = [];

    for (const asset of assets) {
      if (!asset.ticker) continue;

      const quote = quotes.get(asset.ticker);
      if (!quote) {
        errors.push({ ticker: asset.ticker, name: asset.name, reason: "No quote returned" });
        continue;
      }

      try {
        // Convert to EUR if needed
        const priceInEur = await convertToEur(quote.price, quote.currency);
        const dividendInEur = await convertToEur(quote.dividendPerShare, quote.currency);
        const newAmount = asset.quantity * priceInEur;

        await db.execute({
          sql: `UPDATE assets SET current_value = ?, current_amount = ?, dividend_per_share = ?, updated_at = datetime('now') WHERE id = ?`,
          args: [priceInEur, newAmount, dividendInEur, asset.id],
        });

        updatedCount++;
      } catch (err) {
        errors.push({
          ticker: asset.ticker,
          name: asset.name,
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: "Prices refreshed",
      updated: updatedCount,
      total: assets.length,
      errors,
    });
  } catch (error) {
    console.error("Error refreshing prices:", error);
    return NextResponse.json({ error: "Failed to refresh prices" }, { status: 500 });
  }
}
