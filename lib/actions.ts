"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { createToken } from "./token";
import { today, TX_PAGE, type ContribRow, type TxFilter, type TxRow } from "./format";
import { refreshPrices } from "./prices";

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

/** Apports externes paginés, lus par le second tableau du Journal. */
export async function listContributions(sign: "" | "in" | "out", page: number): Promise<{ rows: ContribRow[]; count: number }> {
  const where = sign === "in" ? "c.amount > 0" : sign === "out" ? "c.amount < 0" : "1=1";
  const count = Number((await db.execute(`SELECT COUNT(*) n FROM contributions c WHERE ${where}`)).rows[0].n);
  const rows = (await db.execute(`
    SELECT c.id, c.date, a.owner, a.name account, c.amount, c.note
    FROM contributions c JOIN accounts a ON a.id = c.account_id
    WHERE ${where} ORDER BY c.date DESC, c.id DESC LIMIT ${TX_PAGE} OFFSET ${(Math.max(1, page) - 1) * TX_PAGE}`)).rows.map((r) => ({ ...r })) as unknown as ContribRow[];
  return { rows, count };
}

export async function refreshQuotes() {
  const r = await refreshPrices();
  refresh();
  return r;
}
