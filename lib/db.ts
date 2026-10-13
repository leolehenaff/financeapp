import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  // fetch natif (undici) au lieu de node-fetch : node-fetch réutilise une socket keep-alive
  // fermée pendant le gel de la fonction Vercel, d'où des ECONNRESET « socket hang up ».
  // hrana passe une Request node-fetch, qu'undici ne sait pas lire telle quelle.
  fetch: async (req: Request) =>
    fetch(req.url, { method: req.method, headers: req.headers, body: await req.text() }),
});

export const KINDS = ["Stock", "Crypto", "Start-up", "Livret", "Active Cash"] as const;
export const GEOS = ["US", "EU", "FR", "OTHER"] as const;
export const ACCOUNT_KINDS = ["PEA", "CTO", "PEE", "AV", "Livret", "Crypto", "Startup", "Cash"] as const;

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL, opened_on TEXT, notes TEXT)`,
  `CREATE TABLE IF NOT EXISTS instruments (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, ticker TEXT UNIQUE, kind TEXT NOT NULL,
    geo TEXT, price_source TEXT NOT NULL DEFAULT 'manual', notes TEXT)`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY, date TEXT NOT NULL,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    instrument_id INTEGER NOT NULL REFERENCES instruments(id),
    type TEXT NOT NULL CHECK (type IN ('buy','sell','dividend')),
    quantity REAL NOT NULL DEFAULT 0, amount REAL NOT NULL, note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS prices (
    instrument_id INTEGER NOT NULL REFERENCES instruments(id), date TEXT NOT NULL,
    price REAL NOT NULL, PRIMARY KEY (instrument_id, date))`,
  `CREATE TABLE IF NOT EXISTS contributions (
    id INTEGER PRIMARY KEY, date TEXT NOT NULL,
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    amount REAL NOT NULL, note TEXT)`,
  `CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY, section TEXT NOT NULL, title TEXT NOT NULL, due_date TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','done','dropped')),
    done_on TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
];
