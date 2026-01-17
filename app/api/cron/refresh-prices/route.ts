import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getQuotes, convertToEur } from "@/lib/yahoo-finance";
import { AssetRow } from "@/lib/types";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Get all assets with auto_refresh enabled
    const result = await db.execute(
      "SELECT * FROM assets WHERE auto_refresh = 1 AND ticker IS NOT NULL"
    );

    const assets = result.rows as unknown as AssetRow[];

    if (assets.length === 0) {
      return NextResponse.json({ message: "No assets to refresh", updated: 0 });
    }

    // Get unique tickers
    const tickers = [...new Set(assets.map((a) => a.ticker).filter(Boolean))] as string[];

    // Fetch quotes
    const quotes = await getQuotes(tickers);

    // Update each asset
    let updatedCount = 0;
    for (const asset of assets) {
      if (!asset.ticker) continue;

      const quote = quotes.get(asset.ticker);
      if (!quote) {
        console.log(`No quote found for ${asset.ticker}`);
        continue;
      }

      // Convert to EUR if needed
      const priceInEur = await convertToEur(quote.price, quote.currency);
      const dividendInEur = await convertToEur(quote.dividendPerShare, quote.currency);
      const newAmount = asset.quantity * priceInEur;

      await db.execute({
        sql: `UPDATE assets SET current_value = ?, current_amount = ?, dividend_per_share = ?, updated_at = datetime('now') WHERE id = ?`,
        args: [priceInEur, newAmount, dividendInEur, asset.id],
      });

      updatedCount++;
    }

    return NextResponse.json({
      message: "Prices refreshed via cron",
      updated: updatedCount,
      total: assets.length,
    });
  } catch (error) {
    console.error("Error in cron refresh-prices:", error);
    return NextResponse.json({ error: "Failed to refresh prices" }, { status: 500 });
  }
}
