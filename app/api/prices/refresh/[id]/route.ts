import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getQuote, convertToEur } from "@/lib/yahoo-finance";
import { AssetRow } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Get the asset
    const result = await db.execute({
      sql: "SELECT * FROM assets WHERE id = ?",
      args: [parseInt(id)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const asset = result.rows[0] as unknown as AssetRow;

    if (!asset.ticker) {
      return NextResponse.json({ error: "Asset has no ticker" }, { status: 400 });
    }

    // Fetch quote
    const quote = await getQuote(asset.ticker);

    if (!quote) {
      return NextResponse.json(
        { error: `Failed to fetch quote for ${asset.ticker}` },
        { status: 500 }
      );
    }

    // Convert to EUR if needed
    const priceInEur = await convertToEur(quote.price, quote.currency);
    const dividendInEur = await convertToEur(quote.dividendPerShare, quote.currency);
    const newAmount = asset.quantity * priceInEur;

    // Update the asset with price and dividend
    await db.execute({
      sql: `UPDATE assets SET current_value = ?, current_amount = ?, dividend_per_share = ?, updated_at = datetime('now') WHERE id = ?`,
      args: [priceInEur, newAmount, dividendInEur, asset.id],
    });

    return NextResponse.json({
      success: true,
      ticker: asset.ticker,
      oldValue: asset.current_value,
      newValue: priceInEur,
      oldAmount: asset.current_amount,
      newAmount: newAmount,
    });
  } catch (error) {
    console.error("Error refreshing price:", error);
    return NextResponse.json({ error: "Failed to refresh price" }, { status: 500 });
  }
}
