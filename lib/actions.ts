"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { createToken } from "./token";
import { today, TX_PAGE, type TxFilter, type TxRow } from "./format";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string) => {
  const n = Number(str(fd, k).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n)) throw new Error(`Champ ${k} invalide`);
  return n;
};
const refresh = () => revalidatePath("/", "layout");

export async function login(fd: FormData) {
  if (str(fd, "password") !== process.env.AUTH_PASSWORD) redirect("/login?error=1");
  (await cookies()).set("auth_token", await createToken(process.env.AUTH_SECRET!), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 86400, path: "/",
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete("auth_token");
  redirect("/login");
}

/** Versement du mois : quantité et prix unitaire, saisis sous le flux. */
export async function recordFlow(fd: FormData) {
  const quantity = num(fd, "quantity"), price = num(fd, "price");
  if (quantity <= 0 || price <= 0) throw new Error("Quantité et prix doivent être positifs");
  const f = (await db.execute({ sql: "SELECT account_id, instrument_id FROM plan_flows WHERE id = ?", args: [num(fd, "flow_id")] }))
    .rows[0] as unknown as { account_id: number; instrument_id: number | null } | undefined;
  if (!f?.instrument_id) throw new Error("Flux sans instrument : passer par le Journal");
  const amount = Math.round(quantity * price * 100) / 100;
  await db.execute({
    sql: "INSERT INTO transactions (date, account_id, instrument_id, type, quantity, amount, note) VALUES (?,?,?,'buy',?,?,'versement du mois')",
    args: [today(), f.account_id, f.instrument_id, quantity, amount],
  });
  await contribute(today(), f.account_id, amount, "versement du mois");
  refresh();
}

const contribute = (date: string, account: number, amount: number, note: string | null) =>
  db.execute({ sql: "INSERT INTO contributions (date, account_id, amount, note) VALUES (?,?,?,?)", args: [date, account, amount, note] });

export async function setPrice(fd: FormData) {
  await db.execute({
    sql: "INSERT OR REPLACE INTO prices (instrument_id, date, price) VALUES (?,?,?)",
    args: [num(fd, "instrument_id"), today(), num(fd, "price")],
  });
  refresh();
}

export async function completeAction(id: number) {
  await db.execute({ sql: "UPDATE actions SET status = 'done', done_on = ? WHERE id = ?", args: [today(), id] });
  refresh();
}

export async function addAction(fd: FormData) {
  const title = str(fd, "title");
  if (!title || !str(fd, "due_date")) throw new Error("Titre et échéance requis : une action sans date va dans docs/actions.md");
  await db.execute({
    sql: "INSERT INTO actions (section, title, due_date) VALUES (?,?,?)",
    args: [str(fd, "section") || "Calendrier des ventes et achats", title, str(fd, "due_date")],
  });
  refresh();
}



/** Transactions filtrées et paginées, lues par le tableau du Journal sans recharger la page. */
export async function listTransactions(f: TxFilter, page: number): Promise<{ rows: TxRow[]; count: number }> {
  const where = ["1=1", f.from && "t.date >= ?", f.to && "t.date <= ?", f.instrument && "t.instrument_id = ?", f.type && "t.type = ?"].filter(Boolean).join(" AND ");
  const args = [f.from, f.to, f.instrument, f.type].filter(Boolean);
  const count = Number((await db.execute({ sql: `SELECT COUNT(*) n FROM transactions t WHERE ${where}`, args })).rows[0].n);
  const rows = (await db.execute({ sql: `
    SELECT t.id, t.date, a.owner, a.name account, i.name instrument, i.kind, t.type, t.quantity, t.amount, t.note
    FROM transactions t JOIN accounts a ON a.id = t.account_id JOIN instruments i ON i.id = t.instrument_id
    WHERE ${where} ORDER BY t.date DESC, t.id DESC LIMIT ${TX_PAGE} OFFSET ${(Math.max(1, page) - 1) * TX_PAGE}`, args })).rows.map((r) => ({ ...r })) as unknown as TxRow[];
  return { rows, count };
}
