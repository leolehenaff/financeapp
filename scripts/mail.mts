/**
 * Envoie le récap d'un skill (/mois, /trimestre) par mail via Resend. Corps en Markdown sur stdin, rendu en texte et HTML minimal.
 * Usage : npm run mail -- "Sujet" < recap.md
 * Env : RESEND_API_KEY, MAIL_FROM (domaine vérifié chez Resend, nom affiché « Remco - Le CGP de Julie & Léo » sauf si écrit « Nom <adresse> »), MAIL_TO (adresses séparées par des virgules).
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const subject = process.argv[2];
const text = (await new Promise<string>((r) => { let s = ""; process.stdin.on("data", (c) => (s += c)).on("end", () => r(s)); })).trim();
const { RESEND_API_KEY, MAIL_FROM, MAIL_TO } = process.env;
if (!subject || !text || !RESEND_API_KEY || !MAIL_FROM || !MAIL_TO) {
  console.error("Manque : sujet en argument, corps sur stdin, ou RESEND_API_KEY / MAIL_FROM / MAIL_TO dans .env.local");
  process.exit(1);
}

// ponytail: rendu Markdown minimal (titres, gras, tableaux, listes), un vrai convertisseur si le besoin dépasse ça.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const html = text.split(/\n{2,}/).map((block) => {
  const lines = block.split("\n");
  if (/^#+ /.test(block)) return `<h3>${esc(block.replace(/^#+ /, ""))}</h3>`;
  if (lines.every((l) => l.startsWith("|"))) {
    const rows = lines.filter((l) => !/^\|[\s:-]+\|$/.test(l)).map((l) => l.slice(1, -1).split("|").map((c) => esc(c.trim())));
    const tr = (r: string[], tag: string) => `<tr>${r.map((c) => `<${tag} style="padding:4px 8px;text-align:left;border-bottom:1px solid #ddd">${c}</${tag}>`).join("")}</tr>`;
    return `<table style="border-collapse:collapse">${tr(rows[0], "th")}${rows.slice(1).map((r) => tr(r, "td")).join("")}</table>`;
  }
  if (lines.every((l) => /^(\d+\.|-) /.test(l))) {
    const tag = lines[0].startsWith("-") ? "ul" : "ol";
    return `<${tag}>${lines.map((l) => `<li>${esc(l.replace(/^(\d+\.|-) /, ""))}</li>`).join("")}</${tag}>`;
  }
  return `<p>${esc(block).replace(/\n/g, "<br>")}</p>`;
}).join("\n");

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from: MAIL_FROM.includes("<") ? MAIL_FROM : `Remco - Le CGP de Julie & Léo <${MAIL_FROM}>`, to: MAIL_TO.split(",").map((s) => s.trim()), subject, text,
    html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;max-width:640px">${html}</div>`,
  }),
});
if (!res.ok) { console.error(`Resend ${res.status} : ${await res.text()}`); process.exit(1); }
console.log(`Mail envoyé à ${MAIL_TO} : ${subject}`);
