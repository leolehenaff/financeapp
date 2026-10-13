"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, KINDS, GEOS } from "./db";
import { createToken } from "./token";
import { today } from "./format";

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

export async function addTransaction(fd: FormData) {
  const type = str(fd, "type");
  if (!["buy", "sell", "dividend"].includes(type)) throw new Error("Type invalide");
  const quantity = type === "dividend" ? 0 : num(fd, "quantity");
  const amount = num(fd, "amount");
  if (amount < 0 || quantity < 0) throw new Error("Montants négatifs interdits");
  const date = str(fd, "date") || today(), account = num(fd, "account_id"), note = str(fd, "note") || null;
  await db.execute({
    sql: "INSERT INTO transactions (date, account_id, instrument_id, type, quantity, amount, note) VALUES (?,?,?,?,?,?,?)",
    args: [date, account, num(fd, "instrument_id"), type, quantity, amount, note],
  });
  // Argent frais : la part de l'achat qui vient de ta poche (vide = tout, 0 = réinvestissement pur).
  const fresh = str(fd, "fresh") === "" ? amount : num(fd, "fresh");
  if (type === "buy" && fresh > 0) await contribute(date, account, Math.min(fresh, amount), note);
  refresh();
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
  if (!title) throw new Error("Titre requis");
  await db.execute({
    sql: "INSERT INTO actions (section, title, due_date) VALUES (?,?,?)",
    args: [str(fd, "section") || "Points ouverts (à trancher)", title, str(fd, "due_date") || null],
  });
  refresh();
}

export async function addInstrument(fd: FormData) {
  const name = str(fd, "name"), ticker = str(fd, "ticker") || null, kind = str(fd, "kind"), geo = str(fd, "geo") || null;
  if (!name || !(KINDS as readonly string[]).includes(kind)) throw new Error("Instrument invalide");
  if (geo && !(GEOS as readonly string[]).includes(geo)) throw new Error("Géo invalide");
  await db.execute({
    sql: "INSERT INTO instruments (name, ticker, kind, geo, price_source) VALUES (?,?,?,?,?)",
    args: [name, ticker, kind, geo, ticker ? "yahoo" : "manual"],
  });
  refresh();
}
