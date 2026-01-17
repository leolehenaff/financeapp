import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
config({ path: ".env.local" });

import { createClient } from "@libsql/client";

// Get person names from environment
const PERSON_1 = process.env.NEXT_PUBLIC_PERSON_1 || "Person 1";

// Parse French number format (e.g., "28 268,43 €" -> 28268.43)
function parseFrenchNumber(str: string): number {
  if (!str || str === "-" || str === "") return 0;
  // Remove currency symbol and spaces
  const cleaned = str
    .replace(/€/g, "")
    .replace(/\s/g, "")
    .replace(/,/g, ".")
    .replace(/%/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Parse boolean from string
function parseBoolean(str: string): number {
  return str?.toUpperCase() === "TRUE" ? 1 : 0;
}

// Map asset type
function mapAssetType(type: string): string {
  const types: Record<string, string> = {
    Stock: "Stock",
    Crypto: "Crypto",
    "Start-up": "Start-up",
    Livret: "Livret",
    "Active Cash": "Active Cash",
  };
  return types[type] || type;
}

// Map geo
function mapGeo(geo: string): string | null {
  if (!geo || geo === "-" || geo === "") return null;
  const geos: Record<string, string> = {
    FR: "FR",
    US: "US",
    EU: "EU",
    OTHER: "OTHER",
  };
  return geos[geo] || null;
}

// Parse CSV line (handling commas in quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function seed() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("TURSO_DATABASE_URL is required");
    process.exit(1);
  }

  const client = createClient({
    url: dbUrl,
    authToken,
  });

  console.log("Initializing database...");

  await client.execute(`DROP TABLE IF EXISTS assets`);
  await client.execute(`DROP TABLE IF EXISTS hypotheses`);
  await client.execute(`DROP TABLE IF EXISTS snapshots`);
  await client.execute(`DROP TABLE IF EXISTS dividends`);

  // Create tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ticker TEXT,
      isin TEXT,
      who TEXT NOT NULL,
      asset_type TEXT NOT NULL,
      geo TEXT,
      quantity REAL NOT NULL DEFAULT 0,
      buying_value REAL NOT NULL DEFAULT 0,
      buying_amount REAL NOT NULL DEFAULT 0,
      current_value REAL NOT NULL DEFAULT 0,
      current_amount REAL NOT NULL DEFAULT 0,
      auto_refresh INTEGER NOT NULL DEFAULT 0,
      dividend_per_share REAL DEFAULT 0,
      notes TEXT,
      startup_rating TEXT,
      ir_reduction TEXT,
      alert_high REAL,
      alert_low REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS hypotheses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_type TEXT NOT NULL UNIQUE,
      pessimistic_rate REAL NOT NULL DEFAULT 0,
      avg_rate REAL NOT NULL DEFAULT 0,
      optimistic_rate REAL NOT NULL DEFAULT 0,
      monthly_contribution_leo REAL NOT NULL DEFAULT 0,
      monthly_contribution_julie REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_date TEXT NOT NULL,
      total_value REAL NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_date ON snapshots(snapshot_date)
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS dividends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
      UNIQUE(asset_id, year)
    )
  `);

  // Insert default hypotheses
  const assetTypes = ["Stock", "Crypto", "Start-up", "Livret", "Active Cash"];
  for (const type of assetTypes) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO hypotheses (asset_type, pessimistic_rate, avg_rate, optimistic_rate, monthly_contribution_leo, monthly_contribution_julie)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        type,
        type === "Livret" ? 1 : type === "Stock" ? 5.5 : type === "Crypto" ? 8 : type === "Start-up" ? 5 : 5,
        type === "Livret" ? 1.5 : type === "Stock" ? 7.5 : type === "Crypto" ? 10 : type === "Start-up" ? 15 : 7,
        type === "Livret" ? 3 : type === "Stock" ? 10 : type === "Crypto" ? 15 : type === "Start-up" ? 25 : 10,
        type === "Stock" ? 0 : type === "Crypto" ? 500 : type === "Start-up" ? 750 : type === "Active Cash" ? 500 : type === "Livret" ? 250 : 0,
        type === "Stock" ? 1500 : type === "Crypto" ? 0 : type === "Start-up" ? 0 : type === "Active Cash" ? 0 : type === "Livret" ? 250 : 0,
      ],
    });
  }

  // Read CSV file
  const csvPath = process.argv[2] || path.join(process.cwd(), "../Downloads/Portfolio Assets.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    console.log("Please provide the CSV file path as an argument");
    process.exit(1);
  }

  console.log(`Reading CSV from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n");

  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log("CSV Headers:", header);

  // Column indices
  const colMap: Record<string, number> = {};
  header.forEach((col, idx) => {
    colMap[col.trim()] = idx;
  });

  // Process each row
  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    if (cols.length < 5) continue;

    const name = cols[colMap["Name / Ticker"]] || "";
    if (!name) continue;

    const who = cols[colMap["Who"]] || PERSON_1;
    const assetType = mapAssetType(cols[colMap["Asset Type"]] || "Stock");
    const autoRefresh = parseBoolean(cols[colMap["Auto Refresh"]] || "FALSE");
    const geo = mapGeo(cols[colMap["Geo"]] || "");
    const quantity = parseFrenchNumber(cols[colMap["Qty"]] || "0");
    const buyingValue = parseFrenchNumber(cols[colMap["Buying value"]] || "0");
    const buyingAmount = parseFrenchNumber(cols[colMap["Buying Amount"]] || "0");
    const currentValue = parseFrenchNumber(cols[colMap["Current Value"]] || "0");
    const currentAmount = parseFrenchNumber(cols[colMap["Amount (€)"]] || "0");
    const dividendPerShare = parseFrenchNumber(cols[colMap["Dividende/action"]] || "0");
    const notes = cols[colMap["Notes"]] || null;
    const isin = cols[colMap["ISIN"]] || null;
    const ticker = cols[colMap["Ticker"]] || null;
    const startupRating = cols[colMap["Etat start-up"]] || null;

    // Extract IR reduction from notes if asset type is Start-up
    let irReduction: string | null = null;
    if (assetType === "Start-up" && notes) {
      const irMatch = notes.match(/(\d+%?\s*IR)/i);
      if (irMatch) {
        irReduction = irMatch[1];
      }
    }

    try {
      await client.execute({
        sql: `INSERT INTO assets (
          name, ticker, isin, who, asset_type, geo, quantity,
          buying_value, buying_amount, current_value, current_amount,
          auto_refresh, dividend_per_share, notes, startup_rating,
          ir_reduction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          name,
          ticker || null,
          isin || null,
          who,
          assetType,
          geo,
          quantity,
          buyingValue,
          buyingAmount,
          currentValue,
          currentAmount,
          autoRefresh,
          dividendPerShare,
          notes || null,
          startupRating || null,
          irReduction,
        ],
      });
      imported++;
      console.log(`Imported: ${name}`);
    } catch (error) {
      console.error(`Error importing ${name}:`, error);
    }
  }

  console.log(`\nSuccessfully imported ${imported} assets`);

  // Create initial snapshot
  const assetsResult = await client.execute("SELECT * FROM assets");
  const totalValue = assetsResult.rows.reduce(
    (sum, row) => sum + (row.current_amount as number),
    0
  );

  const byType: Record<string, number> = {};
  const byWho: Record<string, number> = {};
  const byGeo: Record<string, number> = {};

  for (const row of assetsResult.rows) {
    byType[row.asset_type as string] =
      (byType[row.asset_type as string] || 0) + (row.current_amount as number);
    byWho[row.who as string] = (byWho[row.who as string] || 0) + (row.current_amount as number);
    if (row.geo) {
      byGeo[row.geo as string] = (byGeo[row.geo as string] || 0) + (row.current_amount as number);
    }
  }

  const snapshotData = {
    assets: assetsResult.rows,
    by_type: byType,
    by_who: byWho,
    by_geo: byGeo,
  };

  const today = new Date().toISOString().split("T")[0];
  await client.execute({
    sql: "INSERT INTO snapshots (snapshot_date, total_value, data_json) VALUES (?, ?, ?)",
    args: [today, totalValue, JSON.stringify(snapshotData)],
  });

  console.log(`\nCreated initial snapshot with total value: ${totalValue.toFixed(2)} €`);
  console.log("\nSeed completed!");
}

seed().catch(console.error);
