/** Régénère docs/actions.md depuis la table actions. Usage : npm run export:actions */
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
config({ path: ".env.local" });
const { db } = await import("../lib/db");
const { dateFr } = await import("../lib/format");

type Row = { section: string; title: string; due_date: string | null; status: string; done_on: string | null };
const rows = (await db.execute(
  `SELECT a.section, a.title, a.due_date, a.status, a.done_on FROM actions a
   JOIN (SELECT section, MIN(id) o FROM actions GROUP BY 1) s ON s.section = a.section
   ORDER BY s.o, a.due_date IS NULL, a.due_date, a.id`)).rows as unknown as Row[];

let md = "# Actions\n\nGénéré depuis la table `actions` par `npm run export:actions`. Modifier la base (app ou SQL), puis régénérer. Les décisions et leur contexte sont dans [journal.md](journal.md).\n";
let section = "";
for (const r of rows) {
  if (r.section !== section) { section = r.section; md += `\n## ${section}\n\n`; }
  const due = r.due_date ? `**${dateFr(r.due_date)}** : ` : "";
  if (r.status === "todo") md += `- [ ] ${due}${r.title}\n`;
  else if (r.status === "done") md += `- [x] ${due}${r.title} (fait le ${dateFr(r.done_on)})\n`;
  else md += `- [x] ~~${r.title}~~ (abandonné)\n`;
}
writeFileSync("docs/actions.md", md);
console.log(`${rows.length} actions écrites dans docs/actions.md`);
