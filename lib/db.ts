import { createClient, Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function initDb() {
  const db = getDb();

  // Create assets table
  await db.execute(`
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

  // Create hypotheses table
  await db.execute(`
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

  // Create snapshots table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_date TEXT NOT NULL,
      total_value REAL NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create index on snapshot_date
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_snapshots_date ON snapshots(snapshot_date)
  `);

  // Create dividends table
  await db.execute(`
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

  // Insert default hypotheses if they don't exist
  const assetTypes = ["Stock", "Crypto", "Start-up", "Livret", "Active Cash"];
  for (const type of assetTypes) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO hypotheses (asset_type, pessimistic_rate, avg_rate, optimistic_rate, monthly_contribution_leo, monthly_contribution_julie)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        type,
        type === "Livret" ? 2 : type === "Stock" ? 3 : type === "Crypto" ? -10 : 0,
        type === "Livret" ? 3 : type === "Stock" ? 7 : type === "Crypto" ? 10 : 5,
        type === "Livret" ? 4 : type === "Stock" ? 12 : type === "Crypto" ? 30 : 20,
        type === "Stock" ? 500 : type === "Crypto" ? 500 : 0,
        type === "Stock" ? 200 : 0,
      ],
    });
  }
}
